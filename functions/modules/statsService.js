/**
 * Statistics service module
 */

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

module.exports = {
  getDictionaryStats,
  updateDailyStats
};
