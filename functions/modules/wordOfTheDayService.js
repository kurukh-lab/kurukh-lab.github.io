/**
 * Word of the Day service module
 */

/**
 * Get word of the day
 * @param {Object} admin - Firebase admin instance
 * @param {Object} db - Firestore database instance
 * @returns {Promise<Object>} Word of the day data
 */
async function getWordOfTheDay(admin, db) {
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
      throw new Error("No approved words found");
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
    
    return { 
      success: true, 
      wordOfTheDay,
      date: today.toISOString().split('T')[0]
    };
  } catch (error) {
    console.error("Error getting word of the day:", error);
    throw new Error("Failed to retrieve word of the day");
  }
}

module.exports = {
  getWordOfTheDay
};
