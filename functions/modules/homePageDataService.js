/**
 * Updates the home page data by fetching recent words and word of the day
 * and storing them in the static_data collection
 * @param {Object} admin - Firebase admin instance
 * @param {Object} db - Firestore database instance
 * @returns {Promise<Object>} - Returns an object with success status and data
 */
async function updateHomePageData(admin, db) {
  try {
    console.log('Starting home page data update...');
    
    // Get today's date at midnight UTC for consistent word of the day selection
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const dateString = today.toISOString().split('T')[0];
    const seed = Array.from(dateString).reduce((sum, char) => sum + char.charCodeAt(0), 0);

    // Execute both queries in parallel for better performance
    console.log('Fetching recent words and all approved words...');
    const [recentWordsSnapshot, approvedWordsSnapshot] = await Promise.all([
      // Query 1: Get recent words (last 6 approved words)
      db.collection('words')
        .where('status', '==', 'approved')
        .orderBy('createdAt', 'desc')
        .limit(6)
        .get(),
      
      // Query 2: Get all approved words for word of the day selection
      db.collection('words')
        .where('status', '==', 'approved')
        .get()
    ]);

    // Process recent words
    const recentWords = [];
    recentWordsSnapshot.forEach(doc => {
      recentWords.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log(`Found ${recentWords.length} recent words`);

    // Process word of the day using deterministic random selection
    console.log('Selecting word of the day...');
    let wordOfTheDay = null;
    if (!approvedWordsSnapshot.empty) {
      const approvedWords = [];
      approvedWordsSnapshot.forEach(doc => {
        approvedWords.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Select a "random" word using the date seed (consistent for the same day)
      const randomIndex = seed % approvedWords.length;
      wordOfTheDay = approvedWords[randomIndex];
    }

    console.log('Word of the day selected:', wordOfTheDay?.kurukh_word);

    // Prepare the data to store
    const homePageData = {
      recentWords,
      wordOfTheDay,
      lastUpdated: new Date(),
      generatedAt: new Date().toISOString(),
      date: dateString
    };

    // Store in static_data collection
    console.log('Storing data in static_data collection...');
    await db.collection('static_data').doc('home-page').set(homePageData);

    console.log('Home page data update completed successfully');

    return {
      success: true,
      message: 'Home page data updated successfully',
      data: {
        recentWordsCount: recentWords.length,
        wordOfTheDay: wordOfTheDay?.kurukh_word,
        wordOfTheDayId: wordOfTheDay?.id,
        date: dateString,
        timestamp: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('Error updating home page data:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred'
    };
  }
}

module.exports = {
  updateHomePageData
};