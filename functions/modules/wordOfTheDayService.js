/**
 * Word of the Day pipeline.
 *
 * Invoked by the dailySchedule orchestrator at 00:00 IST. Picks a
 * deterministic word for the IST date and writes it to
 * `daily_reports/word_of_the_day` so the client can fetch a single doc
 * instead of running its own selection logic.
 */

const { FieldValue } = require("firebase-admin/firestore");
const { istDateString, IST_TIMEZONE } = require("./dateUtils");

const DAILY_REPORTS_COLLECTION = "daily_reports";
const WORD_OF_THE_DAY_DOC = "word_of_the_day";

/**
 * Compute a stable numeric seed from a date string so the same IST date maps
 * to the same word for the entire day.
 */
function seedFromDate(dateString) {
  let total = 0;
  for (let i = 0; i < dateString.length; i++) {
    total += dateString.charCodeAt(i);
  }
  return total;
}

/**
 * Select the word for `dateString` from the supplied approved-words array.
 * Returns `null` when there are no candidates.
 */
function selectWordForDate(approvedWords, dateString) {
  if (!approvedWords || approvedWords.length === 0) return null;
  const seed = seedFromDate(dateString);
  return approvedWords[seed % approvedWords.length];
}

/**
 * Snapshot the chosen word for today and persist it to
 * `daily_reports/word_of_the_day`. Designed to be called from the
 * dailySchedule orchestrator and from the manual trigger.
 */
async function wordOfTheDayPipeline(admin, db) {
  const dateString = istDateString();
  console.log(`[wordOfTheDay] processing for ${dateString} IST`);

  const approvedSnapshot = await db
    .collection("words")
    .where("status", "==", "approved")
    .get();

  if (approvedSnapshot.empty) {
    console.warn("[wordOfTheDay] no approved words; writing empty snapshot");
    await db
      .collection(DAILY_REPORTS_COLLECTION)
      .doc(WORD_OF_THE_DAY_DOC)
      .set({
        word: null,
        date: dateString,
        generatedAt: FieldValue.serverTimestamp(),
        generatedAtUTC: new Date().toISOString(),
      });
    return { success: true, word: null, date: dateString };
  }

  const approvedWords = approvedSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  const word = selectWordForDate(approvedWords, dateString);

  await db
    .collection(DAILY_REPORTS_COLLECTION)
    .doc(WORD_OF_THE_DAY_DOC)
    .set({
      word,
      date: dateString,
      generatedAt: FieldValue.serverTimestamp(),
      generatedAtUTC: new Date().toISOString(),
    });

  console.log(`[wordOfTheDay] wrote ${word?.kurukh_word} for ${dateString}`);
  return {
    success: true,
    word,
    date: dateString,
  };
}

/**
 * Read the latest snapshot. Falls back to an on-the-fly selection if the
 * snapshot doc doesn't exist yet (first-run, before the scheduler has fired).
 */
async function getWordOfTheDay(admin, db) {
  const snapshotRef = db
    .collection(DAILY_REPORTS_COLLECTION)
    .doc(WORD_OF_THE_DAY_DOC);
  const snapshot = await snapshotRef.get();

  if (snapshot.exists) {
    const data = snapshot.data();
    return {
      success: true,
      wordOfTheDay: data.word,
      date: data.date,
    };
  }

  // First-run fallback: compute and persist now so subsequent reads are O(1).
  console.warn(
    "[wordOfTheDay] snapshot missing; computing on-demand and persisting",
  );
  const result = await wordOfTheDayPipeline(admin, db);
  return {
    success: true,
    wordOfTheDay: result.word,
    date: result.date,
  };
}

module.exports = {
  wordOfTheDayPipeline,
  // Back-compat alias; older callers / scripts may still import this name.
  processWordOfTheDay: wordOfTheDayPipeline,
  getWordOfTheDay,
  DAILY_REPORTS_COLLECTION,
  WORD_OF_THE_DAY_DOC,
  IST_TIMEZONE,
};
