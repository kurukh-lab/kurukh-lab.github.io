const { onRequest, onCall } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });
const { updateHomePageData } = require("./modules/homePageDataService");

// Set global options for functions
setGlobalOptions({ maxInstances: 10 });

// Initialize Firebase admin
admin.initializeApp();

// Firestore reference
const db = admin.firestore();

// Basic Hello World function to test that everything is working
exports.helloWorld = onRequest((req, res) => {
  cors(req, res, () => {
    res.json({ message: "Hello from Kurukh Dictionary API!" });
  });
});

// Get dictionary statistics
exports.getDictionaryStats = onRequest((req, res) => {
  cors(req, res, async () => {
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

      res.json({ success: true, stats });
    } catch (error) {
      console.error("Error getting dictionary stats:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to retrieve dictionary statistics" 
      });
    }
  });
});

// Get word of the day
exports.getWordOfTheDay = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      // Get today's date at midnight UTC for consistent results throughout the day
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      
      // Use the date as a seed for pseudo-randomness
      const dateString = today.toISOString().split('T')[0];
      const seed = Array.from(dateString).reduce((sum, char) => sum + char.charCodeAt(0), 0);
      
      // Get all approved words
      const approvedWordsSnapshot = await db.collection('words')
        .where('status', '==', 'approved')
        .get();
      
      if (approvedWordsSnapshot.empty) {
        return res.json({ 
          success: false, 
          error: "No approved words found" 
        });
      }
      
      const approvedWords = [];
      approvedWordsSnapshot.forEach(doc => {
        approvedWords.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Select a "random" word using the date seed
      const randomIndex = seed % approvedWords.length;
      const wordOfTheDay = approvedWords[randomIndex];
      
      res.json({ 
        success: true, 
        wordOfTheDay,
        date: today.toISOString().split('T')[0]
      });
    } catch (error) {
      console.error("Error getting word of the day:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to retrieve word of the day" 
      });
    }
  });
});

// Admin function to approve or reject a word submission
exports.reviewWord = onCall({ enforceAppCheck: false }, async (request) => {
  try {
    // Verify that the user is an admin
    const uid = request.auth?.uid;
    if (!uid) {
      throw new Error("Authentication required");
    }
    
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();
    
    if (!userData || !userData.roles || !userData.roles.includes('admin')) {
      throw new Error("Admin access required");
    }
    
    const { wordId, isApproved, rejectionReason } = request.data;
    
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
});

// Admin function to resolve a reported issue
exports.resolveReport = onCall({ enforceAppCheck: false }, async (request) => {
  try {
    // Verify that the user is an admin
    const uid = request.auth?.uid;
    if (!uid) {
      throw new Error("Authentication required");
    }
    
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();
    
    if (!userData || !userData.roles || !userData.roles.includes('admin')) {
      throw new Error("Admin access required");
    }
    
    const { reportId, resolution, actionTaken } = request.data;
    
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
});

// Get reports for a specific word
exports.getWordReports = onCall({ enforceAppCheck: false }, async (request) => {
  try {
    const { wordId } = request.data;
    const uid = request.auth?.uid;
    
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
});

// Scheduled function to update daily statistics (runs once per day)
// Note: This would normally be configured as a scheduled function using:
// exports.updateDailyStats = functions.pubsub.schedule('every 24 hours').onRun(...)
// But for v2 we'll use an HTTP function for demonstration
exports.updateDailyStats = onRequest((req, res) => {
  cors(req, res, async () => {
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
      
      res.json({ 
        success: true, 
        message: `Statistics for ${dateString} updated successfully` 
      });
    } catch (error) {
      console.error("Error updating daily statistics:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to update daily statistics" 
      });
    }
  });
});

// Scheduled function to update home page data daily
exports.updateHomePageData = onSchedule('0 0 * * *', async (event) => {
  try {
    const result = await updateHomePageData(admin, db);
    console.log('Scheduled home page data update completed:', result.data);
    return null;
  } catch (error) {
    console.error('Scheduled home page data update failed:', error);
    throw new Error(error.error || error.message);
  }
});

// Manual trigger to update home page data (useful for testing and initialization)
exports.triggerHomePageUpdate = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      console.log('Manual trigger for home page data update...');
      const result = await updateHomePageData(admin, db);
      res.json(result);
    } catch (error) {
      console.error('Error in manual trigger:', error);
      res.status(500).json(error);
    }
  });
});
