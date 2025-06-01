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
    
    // Get recent words (last 6 approved words)
    console.log('Fetching recent words...');
    const recentWordsSnapshot = await db.collection('words')
      .where('status', '==', 'approved')
      .orderBy('createdAt', 'desc')
      .limit(6)
      .get();

    const recentWords = [];
    recentWordsSnapshot.forEach(doc => {
      const data = doc.data();
      recentWords.push({
        id: doc.id,
        kurukh: data.kurukh_word,
        english: (data.meanings.find(h => h.language === 'en') || {}).definition,
        hindi: (data.meanings.find(h => h.language === 'hi') || {}).definition,
        partOfSpeech: data.part_of_speech,
        createdAt: data.createdAt
      });
    });

    console.log(`Found ${recentWords.length} recent words`);

    // Get word of the day using deterministic random selection based on date
    console.log('Fetching word of the day...');
    
    // Get today's date at midnight UTC for consistent results throughout the day
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    
    // Use the date as a seed for pseudo-randomness
    const dateString = today.toISOString().split('T')[0];
    const seed = Array.from(dateString).reduce((sum, char) => sum + char.charCodeAt(0), 0);
    
    // Get all approved words for word of the day selection
    const approvedWordsSnapshot = await db.collection('words')
      .where('status', '==', 'approved')
      .get();
    
    let wordOfTheDay = null;
    if (!approvedWordsSnapshot.empty) {
      const approvedWords = [];
      approvedWordsSnapshot.forEach(doc => {
        const data = doc.data();
        approvedWords.push({
          id: doc.id,
          kurukh: data.kurukh_word,
          english: (data.meanings.find(h => h.language === 'en') || {}).definition,
          hindi: (data.meanings.find(h => h.language === 'hi') || {}).definition,
          partOfSpeech: data.part_of_speech,
          etymology: data.etymology,
          examples: data.examples || [],
          createdAt: data.createdAt
        });
      });
      
      // Select a "random" word using the date seed (consistent for the same day)
      const randomIndex = seed % approvedWords.length;
      wordOfTheDay = approvedWords[randomIndex];
    }

    console.log('Word of the day selected:', wordOfTheDay?.kurukh);

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
        wordOfTheDay: wordOfTheDay?.kurukh,
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