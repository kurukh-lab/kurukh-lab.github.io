/**
 * Admin service module
 */

/**
 * Verify if user is admin
 * @param {Object} db - Firestore database instance
 * @param {string} uid - User ID
 * @returns {Promise<boolean>} Whether user is admin
 */
async function verifyAdminUser(db, uid) {
  if (!uid) {
    throw new Error("Authentication required");
  }
  
  const userDoc = await db.collection('users').doc(uid).get();
  const userData = userDoc.data();
  
  if (!userData || !userData.roles || !userData.roles.includes('admin')) {
    throw new Error("Admin access required");
  }
  
  return true;
}

/**
 * Review a word submission (approve or reject)
 * @param {Object} admin - Firebase admin instance
 * @param {Object} db - Firestore database instance
 * @param {string} uid - Admin user ID
 * @param {Object} data - Review data
 * @returns {Promise<Object>} Review result
 */
async function reviewWord(admin, db, uid, data) {
  try {
    await verifyAdminUser(db, uid);
    
    const { wordId, isApproved, rejectionReason } = data;
    
    if (!wordId) {
      throw new Error("Word ID is required");
    }
    
    const wordRef = db.collection('words').doc(wordId);
    const wordDoc = await wordRef.get();
    
    if (!wordDoc.exists) {
      throw new Error("Word not found");
    }
    
    const status = isApproved ? 'approved' : 'rejected';
    
    await wordRef.update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      reviewed_by: uid,
      rejection_reason: isApproved ? null : rejectionReason || "No reason provided"
    });
    
    return { 
      success: true, 
      message: `Word ${wordId} has been ${status}` 
    };
  } catch (error) {
    console.error("Error reviewing word:", error);
    throw new Error(error.message);
  }
}

/**
 * Resolve a reported issue
 * @param {Object} admin - Firebase admin instance
 * @param {Object} db - Firestore database instance
 * @param {string} uid - Admin user ID
 * @param {Object} data - Resolution data
 * @returns {Promise<Object>} Resolution result
 */
async function resolveReport(admin, db, uid, data) {
  try {
    await verifyAdminUser(db, uid);
    
    const { reportId, resolution, actionTaken } = data;
    
    if (!reportId) {
      throw new Error("Report ID is required");
    }
    
    const reportRef = db.collection('reports').doc(reportId);
    const reportDoc = await reportRef.get();
    
    if (!reportDoc.exists) {
      throw new Error("Report not found");
    }
    
    // Update the report
    await reportRef.update({
      status: 'resolved',
      resolution,
      action_taken: actionTaken,
      resolved_by: uid,
      resolved_at: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { 
      success: true, 
      message: `Report ${reportId} has been resolved` 
    };
  } catch (error) {
    console.error("Error resolving report:", error);
    throw new Error(error.message);
  }
}

module.exports = {
  verifyAdminUser,
  reviewWord,
  resolveReport
};
