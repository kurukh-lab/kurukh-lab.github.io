/**
 * Daily schedule orchestrator.
 *
 * Owns a single scheduled tick at 00:00 IST and runs each registered
 * pipeline. Each pipeline is responsible for writing its own document
 * under /daily_reports/<docId> using the Admin SDK.
 *
 * Pipelines run in parallel via Promise.allSettled so one slow or failing
 * pipeline can't starve the others. Per-pipeline errors are logged but do
 * not abort the orchestrator — the caller gets back a structured summary
 * and decides whether to surface a non-zero exit.
 *
 * Registering a new pipeline:
 *   1. Implement an async `myPipeline(admin, db)` returning a JSON-friendly
 *      object (or throwing on hard failure).
 *   2. Add `{ name: 'my_pipeline', run: myPipeline }` to the PIPELINES list.
 */

const { istDateString } = require("./dateUtils");
const { wordOfTheDayPipeline } = require("./wordOfTheDayService");
const { statsPipeline } = require("./statsService");

const PIPELINES = [
  { name: "word_of_the_day", run: wordOfTheDayPipeline },
  { name: "stats", run: statsPipeline },
];

async function runDailySchedule(admin, db) {
  const dateString = istDateString();
  console.log(
    `[dailySchedule] starting ${PIPELINES.length} pipelines for ${dateString} IST`,
  );

  const settled = await Promise.allSettled(
    PIPELINES.map(async (pipeline) => {
      const startedAt = Date.now();
      try {
        const result = await pipeline.run(admin, db);
        return {
          name: pipeline.name,
          success: true,
          durationMs: Date.now() - startedAt,
          result,
        };
      } catch (error) {
        console.error(`[dailySchedule] pipeline ${pipeline.name} failed:`, error);
        return {
          name: pipeline.name,
          success: false,
          durationMs: Date.now() - startedAt,
          error: error.message || String(error),
        };
      }
    }),
  );

  // Promise.allSettled fulfils for every input because our mapper never
  // rejects — we still pull `.value` defensively in case that changes.
  const results = settled.map((s) =>
    s.status === "fulfilled" ? s.value : { success: false, error: String(s.reason) },
  );

  const failed = results.filter((r) => !r.success);
  console.log(
    `[dailySchedule] finished ${results.length - failed.length}/${results.length} ok for ${dateString}`,
  );

  return {
    success: failed.length === 0,
    date: dateString,
    pipelines: results,
    failedCount: failed.length,
  };
}

module.exports = {
  runDailySchedule,
  PIPELINES,
};
