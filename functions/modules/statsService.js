/**
 * Statistics service module.
 *
 * Two responsibilities:
 *  * Historical: `updateDailyStats` writes a per-date doc to /statistics
 *    for trend analysis.
 *  * Snapshot: `statsPipeline` (run by the dailySchedule orchestrator at
 *    00:00 IST) writes a single rolling doc to /daily_reports/stats that
 *    drives the home-page hero numbers.
 */

const { FieldValue } = require("firebase-admin/firestore");
const { istDateString } = require("./dateUtils");

const DAILY_REPORTS_COLLECTION = "daily_reports";
const STATS_DOC = "stats";

/**
 * Get dictionary statistics
 * @param {Object} admin - Firebase admin instance
 * @param {Object} db - Firestore database instance
 * @returns {Promise<Object>} Statistics data
 */
async function getDictionaryStats(admin, db) {
  try {
    // Get counts of different document types
    const approvedWordsSnapshot = await db.collection('words')
      .where('status', '==', 'approved')
      .count()
      .get();
    
    const pendingWordsSnapshot = await db.collection('words')
      .where('status', '==', 'pending_review')
      .count()
      .get();
    
    const usersSnapshot = await db.collection('users')
      .count()
      .get();

    const stats = {
      totalApprovedWords: approvedWordsSnapshot.data().count,
      totalPendingWords: pendingWordsSnapshot.data().count,
      totalUsers: usersSnapshot.data().count,
      lastUpdated: new Date().toISOString()
    };

    return { success: true, stats };
  } catch (error) {
    console.error("Error getting dictionary stats:", error);
    throw new Error("Failed to retrieve dictionary statistics");
  }
}

/**
 * Update daily statistics
 * @param {Object} admin - Firebase admin instance
 * @param {Object} db - Firestore database instance
 * @returns {Promise<void>}
 */
async function updateDailyStats(admin, db) {
  try {
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateString = today.toISOString().split('T')[0];
    
    // Get user counts
    const usersSnapshot = await db.collection('users').count().get();
    const userCount = usersSnapshot.data().count;
    
    // Get word counts
    const approvedWordsSnapshot = await db.collection('words')
      .where('status', '==', 'approved')
      .count()
      .get();
    const approvedWordCount = approvedWordsSnapshot.data().count;
    
    // Get contribution counts for the day
    const startOfDay = new Date(today);
    const endOfDay = new Date(today);
    endOfDay.setDate(endOfDay.getDate() + 1);
    
    const dailyContributionsSnapshot = await db.collection('words')
      .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(startOfDay))
      .where('createdAt', '<', admin.firestore.Timestamp.fromDate(endOfDay))
      .count()
      .get();
    const dailyContributionCount = dailyContributionsSnapshot.data().count;
    
    // Store the statistics
    await db.collection('statistics').doc(dateString).set({
      date: dateString,
      userCount,
      approvedWordCount,
      dailyContributionCount,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`Statistics for ${dateString} updated successfully`);
    return { success: true, message: `Statistics for ${dateString} updated successfully` };
  } catch (error) {
    console.error("Error updating daily statistics:", error);
    throw new Error("Failed to update daily statistics");
  }
}

/**
 * Compute home-page hero stats and persist a single rolling snapshot to
 * /daily_reports/stats. Counts derive from approved-word docs (the only
 * data exposed to anonymous clients), so they line up with what users see.
 *
 * The `audio` and `regions` fields stay 0 until those columns exist on the
 * Word schema; once they're added (audio_url / dialect) the counts here
 * start flowing without any UI change.
 */
async function statsPipeline(admin, db) {
  const dateString = istDateString();
  console.log(`[stats] processing for ${dateString} IST`);

  const [approvedSnap, usersSnap] = await Promise.all([
    db.collection("words").where("status", "==", "approved").get(),
    db.collection("users").count().get(),
  ]);

  const approvedDocs = approvedSnap.docs.map((d) => d.data());

  const totalWords = approvedDocs.length;
  const totalUsers = usersSnap.data().count;

  const totalContributors = new Set(
    approvedDocs.map((d) => d.contributor_id).filter(Boolean),
  ).size;

  // Forward-looking: count any approved word that already carries an audio
  // URL on the doc or a per-meaning audio entry. Returns 0 today.
  const totalAudio = approvedDocs.filter((d) => {
    if (d.audio_url || d.pronunciation_audio_url) return true;
    return (d.meanings || []).some((m) => m && (m.audio_url || m.audio));
  }).length;

  // Forward-looking: dialect/region either on the doc or on meanings.
  const regionSet = new Set();
  for (const doc of approvedDocs) {
    if (doc.dialect) regionSet.add(doc.dialect);
    if (doc.region) regionSet.add(doc.region);
    for (const meaning of doc.meanings || []) {
      if (meaning?.dialect) regionSet.add(meaning.dialect);
      if (meaning?.region) regionSet.add(meaning.region);
    }
  }

  const stats = {
    totalWords,
    totalAudio,
    totalContributors,
    totalRegions: regionSet.size,
    totalUsers,
    date: dateString,
    generatedAt: FieldValue.serverTimestamp(),
    generatedAtUTC: new Date().toISOString(),
  };

  await db.collection(DAILY_REPORTS_COLLECTION).doc(STATS_DOC).set(stats);

  console.log(
    `[stats] wrote words=${totalWords} contributors=${totalContributors} audio=${totalAudio} regions=${regionSet.size} for ${dateString}`,
  );

  return { success: true, stats };
}

module.exports = {
  getDictionaryStats,
  updateDailyStats,
  statsPipeline,
  STATS_DOC,
};
