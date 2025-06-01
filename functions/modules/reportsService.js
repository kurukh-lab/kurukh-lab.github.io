/**
 * Reports service module
 */

/**
 * Get reports for a specific word
 * @param {Object} db - Firestore database instance
 * @param {string} uid - User ID
 * @param {Object} data - Request data
 * @returns {Promise<Object>} Reports data
 */
async function getWordReports(db, uid, data) {
  try {
    const { wordId } = data;
    
    if (!wordId) {
      throw new Error("Word ID is required");
    }
    
    if (!uid) {
      throw new Error("Authentication required");
    }
    
    // Check if user is admin
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();
    const isAdmin = userData?.roles?.includes('admin');
    
    // Non-admins can only view their own reports
    let reportsQuery = db.collection('reports').where('word_id', '==', wordId);
    
    if (!isAdmin) {
      reportsQuery = reportsQuery.where('user_id', '==', uid);
    }
    
    const reportsSnapshot = await reportsQuery.get();
    const reports = [];
    
    reportsSnapshot.forEach(doc => {
      reports.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { reports };
  } catch (error) {
    console.error("Error getting word reports:", error);
    throw new Error(error.message);
  }
}

module.exports = {
  getWordReports
};
