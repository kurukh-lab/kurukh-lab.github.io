const { onRequest, onCall } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

// Import service modules
const { updateHomePageData } = require("./modules/homePageDataService");
const { getDictionaryStats, updateDailyStats } = require("./modules/statsService");
const { getWordOfTheDay } = require("./modules/wordOfTheDayService");
const { reviewWord, resolveReport } = require("./modules/adminService");
const { getWordReports } = require("./modules/reportsService");

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
      const result = await getDictionaryStats(admin, db);
      res.json(result);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  });
});

// Get word of the day
exports.getWordOfTheDay = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const result = await getWordOfTheDay(admin, db);
      res.json(result);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  });
});

// Admin function to approve or reject a word submission
exports.reviewWord = onCall({ enforceAppCheck: false }, async (request) => {
  try {
    const uid = request.auth?.uid;
    const result = await reviewWord(admin, db, uid, request.data);
    return result;
  } catch (error) {
    console.error("Error reviewing word:", error);
    throw new Error(error.message);
  }
});

// Admin function to resolve a reported issue
exports.resolveReport = onCall({ enforceAppCheck: false }, async (request) => {
  try {
    const uid = request.auth?.uid;
    const result = await resolveReport(admin, db, uid, request.data);
    return result;
  } catch (error) {
    console.error("Error resolving report:", error);
    throw new Error(error.message);
  }
});

// Get reports for a specific word
exports.getWordReports = onCall({ enforceAppCheck: false }, async (request) => {
  try {
    const uid = request.auth?.uid;
    const result = await getWordReports(db, uid, request.data);
    return result;
  } catch (error) {
    console.error("Error getting word reports:", error);
    throw new Error(error.message);
  }
});

// Scheduled function to update daily statistics (runs once per day)
exports.updateDailyStats = onSchedule('0 0 * * *', async (event) => {
  try {
    await updateDailyStats(admin, db);
    console.log('Scheduled daily stats update completed');
    return null;
  } catch (error) {
    console.error("Error updating daily statistics:", error);
    throw new Error("Failed to update daily statistics");
  }
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
