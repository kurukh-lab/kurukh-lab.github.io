import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy,
  doc,
  getDoc,
  serverTimestamp,
  limit
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Collection reference
const wordsCollection = collection(db, 'words');
const reportsCollection = collection(db, 'reports');

/**
 * Search for words with enhanced filtering options
 * @param {string} term - The search term
 * @param {Object} options - Search options
 * @param {string} [options.language] - Filter by language (en, hi, etc.)
 * @param {string} [options.partOfSpeech] - Filter by part of speech
 * @returns {Promise<Array>} Array of matching words
 */
export const searchWords = async (term, options = {}) => {
  try {
    // Process the search term
    const processedTerm = term.toLowerCase().trim();
    console.log('Searching for processedTerm:', processedTerm); // <-- ADD THIS

    // Start with base query conditions
    const conditions = [
      where('kurukh_word', '>=', processedTerm),
      where('kurukh_word', '<=', processedTerm + '\\uf8ff'),
      orderBy('kurukh_word'),
      // Only get words with 'approved' status
      where('status', '==', 'approved')
    ];
    console.log('Query conditions:', JSON.stringify(conditions)); // <-- ADD THIS
    
    // Create a query against the collection
    const q = query(wordsCollection, ...conditions);
    
    const querySnapshot = await getDocs(q);
    let words = [];
    
    querySnapshot.forEach((doc) => {
      words.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Apply client-side filtering for language and part of speech if specified
    // Note: Firebase doesn't support array filtering in queries, so we do it client-side
    if (options.language) {
      words = words.filter(word => 
        word.meanings && word.meanings.some(meaning => meaning.language === options.language)
      );
    }
    
    if (options.partOfSpeech) {
      words = words.filter(word => word.part_of_speech === options.partOfSpeech);
    }
    
    return words;
  } catch (error) {
    console.error("Error searching words:", error);
    throw error;
  }
};

// Get word by ID
export const getWordById = async (id) => {
  try {
    const wordDoc = await getDoc(doc(db, 'words', id));
    if (wordDoc.exists()) {
      return {
        id: wordDoc.id,
        ...wordDoc.data()
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting word:", error);
    throw error;
  }
};

// Add a new word
export const addWord = async (wordData, userId) => {
  try {
    const wordWithMeta = {
      ...wordData,
      contributor_id: userId,
      status: 'pending_review',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(wordsCollection, wordWithMeta);
    return {
      success: true,
      id: docRef.id,
      ...wordWithMeta
    };
  } catch (error) {
    console.error("Error adding word:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get user's contributions
export const getUserContributions = async (userId) => {
  try {
    const q = query(
      wordsCollection,
      where('contributor_id', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const contributions = [];
    
    querySnapshot.forEach((doc) => {
      contributions.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return contributions;
  } catch (error) {
    console.error("Error getting user contributions:", error);
    throw error;
  }
};

/**
 * Get recent approved words
 * @param {number} count - Number of words to return
 * @returns {Promise<Array>} Array of recent approved words
 */
export const getRecentWords = async (count = 5) => {
  try {
    const q = query(
      wordsCollection,
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc'),
      limit(count)
    );
    
    const querySnapshot = await getDocs(q);
    const words = [];
    
    querySnapshot.forEach((doc) => {
      words.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return words;
  } catch (error) {
    console.error("Error getting recent words:", error);
    return [];
  }
};

/**
 * Report an issue with a word
 * @param {string} wordId - ID of the word being reported
 * @param {string} userId - ID of the user submitting the report
 * @param {string} reason - Reason for the report
 * @param {string} details - Additional details about the issue
 * @returns {Promise<Object>} Result of the operation
 */
export const reportWord = async (wordId, userId, reason, details) => {
  try {
    const reportData = {
      word_id: wordId,
      user_id: userId,
      reason,
      details,
      status: 'open',
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(reportsCollection, reportData);
    
    return {
      success: true,
      id: docRef.id
    };
  } catch (error) {
    console.error('Error reporting word:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get dictionary statistics from Firebase Function
 * @returns {Promise<Object>} Statistics object with counts and last updated date
 */
export const getDictionaryStats = async () => {
  try {
    // Check if we're in development mode with emulators
    const baseUrl = import.meta.env.DEV 
      ? 'http://localhost:5011/kurukh-dictionary/us-central1/getDictionaryStats'
      : 'https://us-central1-kurukh-dictionary.cloudfunctions.net/getDictionaryStats';
    
    const response = await fetch(baseUrl);
    const data = await response.json();
    
    if (data.success) {
      return data.stats;
    } else {
      console.error("Error getting dictionary stats:", data.error);
      return {
        totalApprovedWords: 0,
        totalPendingWords: 0,
        totalUsers: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  } catch (error) {
    console.error("Error fetching dictionary stats:", error);
    return {
      totalApprovedWords: 0,
      totalPendingWords: 0,
      totalUsers: 0,
      lastUpdated: new Date().toISOString()
    };
  }
};

/**
 * Get word of the day from Firebase Function
 * @returns {Promise<Object>} Word of the day object
 */
export const getWordOfTheDay = async () => {
  try {
    // Check if we're in development mode with emulators
    const baseUrl = import.meta.env.DEV 
      ? 'http://localhost:5011/kurukh-dictionary/us-central1/getWordOfTheDay'
      : 'https://us-central1-kurukh-dictionary.cloudfunctions.net/getWordOfTheDay';
    
    const response = await fetch(baseUrl);
    const data = await response.json();
    
    if (data.success) {
      return data.wordOfTheDay;
    } else {
      console.error("Error getting word of the day:", data.error);
      return null;
    }
  } catch (error) {
    console.error("Error fetching word of the day:", error);
    return null;
  }
};

/**
 * Get all reports for a specific word (admin only)
 * @param {string} wordId - ID of the word
 * @returns {Promise<Array>} Array of reports
 */
export const getWordReports = async (wordId) => {
  try {
    // Import httpsCallable dynamically to avoid issues with SSR
    const { httpsCallable } = await import('firebase/functions');
    const { getFunctions } = await import('firebase/functions');
    const functions = getFunctions();
    
    const getWordReportsFunction = httpsCallable(functions, 'getWordReports');
    const result = await getWordReportsFunction({ wordId });
    
    return result.data.reports;
  } catch (error) {
    console.error("Error getting word reports:", error);
    throw error;
  }
};

/**
 * Review a word submission (approve or reject) - Admin only
 * @param {string} wordId - ID of the word to review
 * @param {boolean} isApproved - Whether the word is approved
 * @param {string} rejectionReason - Reason for rejection if not approved
 * @returns {Promise<Object>} Result of the operation
 */
export const reviewWord = async (wordId, isApproved, rejectionReason = null) => {
  try {
    // Import httpsCallable dynamically to avoid issues with SSR
    const { httpsCallable } = await import('firebase/functions');
    const { getFunctions } = await import('firebase/functions');
    const functions = getFunctions();
    
    const reviewWordFunction = httpsCallable(functions, 'reviewWord');
    const result = await reviewWordFunction({ 
      wordId, 
      isApproved,
      rejectionReason 
    });
    
    return { success: true, message: result.data.message };
  } catch (error) {
    console.error("Error reviewing word:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Resolve a report - Admin only
 * @param {string} reportId - ID of the report to resolve
 * @param {string} resolution - Resolution message
 * @param {string} actionTaken - Action taken (e.g., "word_updated", "no_action")
 * @returns {Promise<Object>} Result of the operation
 */
export const resolveReport = async (reportId, resolution, actionTaken) => {
  try {
    // Import httpsCallable dynamically to avoid issues with SSR
    const { httpsCallable } = await import('firebase/functions');
    const { getFunctions } = await import('firebase/functions');
    const functions = getFunctions();
    
    const resolveReportFunction = httpsCallable(functions, 'resolveReport');
    const result = await resolveReportFunction({ 
      reportId, 
      resolution,
      actionTaken 
    });
    
    return { success: true, message: result.data.message };
  } catch (error) {
    console.error("Error resolving report:", error);
    return { success: false, error: error.message };
  }
};
