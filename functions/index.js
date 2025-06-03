const { onRequest, onCall } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const { FieldValue } = require("firebase-admin/firestore");
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

// Secure user registration function
exports.createUser = onCall(async (request) => {
  try {
    const { email, password, username } = request.data;

    // Validate input
    if (!email || !password || !username) {
      throw new Error('Email, password, and username are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Validate password strength
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Validate username
    if (username.length < 2 || username.length > 50) {
      throw new Error('Username must be between 2 and 50 characters');
    }

    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: username,
    });

    // Create user document in Firestore with secure role assignment
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      username: username,
      email: email,
      roles: ['user'], // Always default to 'user' role - secure server-side assignment
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });

    return {
      success: true,
      uid: userRecord.uid,
      message: 'User created successfully'
    };

  } catch (error) {
    console.error('Error creating user:', error);
    
    // Handle specific Firebase Auth errors
    if (error.code === 'auth/email-already-exists') {
      throw new Error('An account with this email already exists');
    }
    
    if (error.code === 'auth/weak-password') {
      throw new Error('Password is too weak');
    }

    if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address');
    }

    // Re-throw validation errors as-is
    if (error.message.includes('required') || 
        error.message.includes('Invalid') || 
        error.message.includes('must be')) {
      throw error;
    }

    throw new Error('Failed to create user account');
  }
});

// Secure Google user creation function
exports.createGoogleUser = onCall(async (request) => {
  try {
    // Verify the user is authenticated
    if (!request.auth) {
      throw new Error('User must be authenticated');
    }

    const { uid, email, name } = request.auth.token;
    const { username } = request.data;

    // Use provided username or fallback to display name or email prefix
    const finalUsername = username || name || email.split('@')[0];

    // Validate username
    if (!finalUsername || finalUsername.length < 2 || finalUsername.length > 50) {
      throw new Error('Username must be between 2 and 50 characters');
    }

    // Check if user document already exists
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      // Create user document with secure role assignment
      await db.collection('users').doc(uid).set({
        uid: uid,
        username: finalUsername,
        email: email,
        roles: ['user'], // Secure server-side role assignment
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });

      return { 
        success: true, 
        message: 'User document created successfully',
        isNewUser: true 
      };
    }

    // User already exists - this is fine, just return success
    return { 
      success: true, 
      message: 'Welcome back! Redirecting to home page.',
      isNewUser: false 
    };
  } catch (error) {
    console.error('Error creating Google user:', error);
    
    // Re-throw validation errors as-is
    if (error.message.includes('must be') || 
        error.message.includes('authenticated')) {
      throw error;
    }
    
    throw new Error('Failed to create user document');
  }
});
