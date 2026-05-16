import type { PipelineResult, PipelineSuccessResult, PipelineFailureResult, ScheduleSummary } from '../types/pipeline.types';
import type { IPipeline } from './IPipeline';
import type { IDateProvider } from '../utils/dateUtils';

export class DailyScheduleOrchestrator {
  constructor(
    private readonly pipelines: IPipeline[],
    private readonly dateProvider: IDateProvider
  ) { }

  async run(): Promise<ScheduleSummary> {
    const dateString = this.dateProvider.istDateString();
    console.log(
      `[dailySchedule] starting ${this.pipelines.length} pipelines for ${dateString} IST`
    );

    const settled = await Promise.allSettled(
      this.pipelines.map(async (pipeline): Promise<PipelineResult> => {
        const startedAt = Date.now();
        try {
          const result = await pipeline.run();
          return {
            name: pipeline.name,
            success: true,
            durationMs: Date.now() - startedAt,
            result,
          } satisfies PipelineSuccessResult;
        } catch (error) {
          console.error(`[dailySchedule] pipeline ${pipeline.name} failed:`, error);
          return {
            name: pipeline.name,
            success: false,
            durationMs: Date.now() - startedAt,
            error: error instanceof Error ? error.message : String(error),
          } satisfies PipelineFailureResult;
        }
      })
    );

    const results: PipelineResult[] = settled.map((s) =>
      s.status === 'fulfilled'
        ? s.value
        : ({ name: 'unknown', success: false, durationMs: 0, error: String(s.reason) } satisfies PipelineFailureResult)
    );

    const failed = results.filter((r) => !r.success);
    console.log(
      `[dailySchedule] finished ${results.length - failed.length}/${results.length} ok for ${dateString}`
    );

    return {
      success: failed.length === 0,
      date: dateString,
      pipelines: results,
      failedCount: failed.length,
    };
  }
}
