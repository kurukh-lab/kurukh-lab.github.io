import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Get a random word from the database to display as "Word of the Day"
 * @returns {Promise<object|null>} A word object or null if no words are found
 */
export const getWordOfTheDay = async () => {
  try {
    // Create a query against the collection to get approved words
    const q = query(
      collection(db, 'words'),
      where('status', '==', 'approved'),
      // We'll use a dummy field that doesn't exist for the orderBy
      // This effectively gives us a random order in Firestore
      orderBy('wordOfTheDayPriority', 'desc'),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    // Get the first (and only) document
    const doc = querySnapshot.docs[0];
    
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error("Error fetching word of the day:", error);
    return null;
  }
};

/**
 * Format a timestamp to a readable date
 * @param {Timestamp} timestamp Firebase Timestamp object
 * @returns {string} Formatted date string
 */
// Helper function to format a date
const formatDateHelper = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

export const formatDate = (timestamp) => {
  try {
    if (!timestamp) {
      return 'Unknown date';
    } else if (timestamp.toDate) {
      return formatDateHelper(timestamp.toDate());
    } else {
      return formatDateHelper(timestamp);
    }
  } catch (error) {
    return 'Invalid date';
  }
};
