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
  limit,
  updateDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Collection reference
const wordsCollection = collection(db, 'words');
const reportsCollection = collection(db, 'reports');

// Helper function to generate anonymous user ID for likes
const getAnonymousUserId = () => {
  let anonymousId = localStorage.getItem('kurukh_anonymous_id');
  if (!anonymousId) {
    anonymousId = 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('kurukh_anonymous_id', anonymousId);
  }
  return anonymousId;
};

/**
 * Like or unlike a word (supports anonymous likes)
 * @param {string} wordId - ID of the word to like/unlike
 * @param {string|null} userId - Authenticated user ID (null for anonymous)
 * @returns {Promise<Object>} Result of the operation
 */
export const toggleWordLike = async (wordId, userId = null) => {
  try {
    // Use anonymous ID if no authenticated user
    const effectiveUserId = userId || getAnonymousUserId();
    const wordRef = doc(db, 'words', wordId);
    
    // Get current word data
    const wordDoc = await getDoc(wordRef);
    if (!wordDoc.exists()) {
      throw new Error('Word not found');
    }
    
    const wordData = wordDoc.data();
    const currentLikes = wordData.likedBy || [];
    const currentLikesCount = wordData.likesCount || 0;
    
    // Check if user has already liked the word
    const hasLiked = currentLikes.includes(effectiveUserId);
    
    let updatedLikes;
    let updatedCount;
    
    if (hasLiked) {
      // Unlike: remove user from likedBy array
      updatedLikes = currentLikes.filter(id => id !== effectiveUserId);
      updatedCount = Math.max(0, currentLikesCount - 1);
    } else {
      // Like: add user to likedBy array
      updatedLikes = [...currentLikes, effectiveUserId];
      updatedCount = currentLikesCount + 1;
    }
    
    // Update the word document
    await updateDoc(wordRef, {
      likedBy: updatedLikes,
      likesCount: updatedCount,
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true,
      liked: !hasLiked,
      newCount: updatedCount
    };
  } catch (error) {
    console.error('Error toggling word like:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Check if current user has liked a word
 * @param {string} wordId - ID of the word
 * @param {string|null} userId - Authenticated user ID (null for anonymous)
 * @returns {Promise<boolean>} Whether the user has liked the word
 */
export const hasUserLikedWord = async (wordId, userId = null) => {
  try {
    const effectiveUserId = userId || getAnonymousUserId();
    const wordDoc = await getDoc(doc(db, 'words', wordId));
    
    if (!wordDoc.exists()) {
      return false;
    }
    
    const wordData = wordDoc.data();
    const likedBy = wordData.likedBy || [];
    
    return likedBy.includes(effectiveUserId);
  } catch (error) {
    console.error('Error checking like status:', error);
    return false;
  }
};

/**
 * Get like count for a word
 * @param {string} wordId - ID of the word
 * @returns {Promise<number>} Number of likes
 */
export const getWordLikeCount = async (wordId) => {
  try {
    const wordDoc = await getDoc(doc(db, 'words', wordId));
    
    if (!wordDoc.exists()) {
      return 0;
    }
    
    const wordData = wordDoc.data();
    return wordData.likesCount || 0;
  } catch (error) {
    console.error('Error getting like count:', error);
    return 0;
  }
};

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
    console.log('🔍 Searching for term:', processedTerm);

    // Create base query for approved words only
    const baseQuery = query(
      wordsCollection,
      where('status', '==', 'approved')
    );
    
    console.log('📋 Executing base query for approved words...');
    const querySnapshot = await getDocs(baseQuery);
    let words = [];
    
    console.log(`📊 Found ${querySnapshot.size} approved words total`);
    
    // Get all approved words and filter client-side
    querySnapshot.forEach((doc) => {
      const wordData = {
        id: doc.id,
        ...doc.data()
      };
      
      // Client-side search filtering
      const kurukhWord = wordData.kurukh_word?.toLowerCase() || '';
      
      // Check if the word starts with or contains the search term
      if (kurukhWord.includes(processedTerm)) {
        words.push(wordData);
      }
    });
    
    console.log(`🎯 Found ${words.length} words matching "${processedTerm}"`);
    
    // Sort results by relevance (exact matches first, then contains)
    words.sort((a, b) => {
      const aWord = a.kurukh_word?.toLowerCase() || '';
      const bWord = b.kurukh_word?.toLowerCase() || '';
      
      const aStartsWith = aWord.startsWith(processedTerm);
      const bStartsWith = bWord.startsWith(processedTerm);
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      return aWord.localeCompare(bWord);
    });
    
    // Apply client-side filtering for language and part of speech if specified
    if (options.language) {
      words = words.filter(word => 
        word.meanings && word.meanings.some(meaning => meaning.language === options.language)
      );
    }
    
    if (options.partOfSpeech) {
      words = words.filter(word => word.part_of_speech === options.partOfSpeech);
    }
    
    console.log(`✅ Final results after filtering: ${words.length} words`);
    return words;
  } catch (error) {
    console.error("❌ Error searching words:", error);
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
      status: 'community_review',
      community_votes_for: 0,
      community_votes_against: 0,
      reviewed_by: [],
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

/**
 * Submit a word correction for community review
 * @param {string} wordId - ID of the word being corrected
 * @param {string} userId - ID of the user submitting the correction
 * @param {Object} correctionData - Correction details
 * @param {string} correctionData.type - Type of correction (word_spelling, definition, etc.)
 * @param {string} correctionData.proposedChange - Proposed correction
 * @param {string} correctionData.explanation - Optional explanation for the correction
 * @param {string} correctionData.currentValue - Current value being corrected
 * @returns {Promise<Object>} Result of the operation
 */
export const submitCorrection = async (wordId, userId, correctionData) => {
  try {
    const correctionRecord = {
      word_id: wordId,
      user_id: userId,
      correction_type: correctionData.type,
      current_value: correctionData.currentValue,
      proposed_change: correctionData.proposedChange,
      explanation: correctionData.explanation || '',
      status: 'shallow_review', // Marks for community review
      review_level: 'community', // Can be reviewed by both admins and users
      votes_for: 0,
      votes_against: 0,
      reviewed_by: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'corrections'), correctionRecord);
    
    return {
      success: true,
      id: docRef.id
    };
  } catch (error) {
    console.error('Error submitting correction:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get corrections awaiting community review
 * @param {number} limit - Maximum number of corrections to return
 * @returns {Promise<Array>} Array of corrections for review
 */
export const getCorrectionsForReview = async (limit = 20) => {
  try {
    const q = query(
      collection(db, 'corrections'),
      where('status', '==', 'shallow_review'),
      orderBy('createdAt', 'desc'),
      limit ? limit(limit) : undefined
    );
    
    const querySnapshot = await getDocs(q);
    const corrections = [];
    
    // Get word details for each correction
    for (const docSnapshot of querySnapshot.docs) {
      const correctionData = {
        id: docSnapshot.id,
        ...docSnapshot.data()
      };
      
      // Fetch the word being corrected
      try {
        const wordDoc = await getDoc(doc(db, 'words', correctionData.word_id));
        if (wordDoc.exists()) {
          correctionData.word = {
            id: wordDoc.id,
            ...wordDoc.data()
          };
        }
      } catch (wordErr) {
        console.error('Error fetching word for correction:', wordErr);
      }
      
      corrections.push(correctionData);
    }
    
    return corrections;
  } catch (error) {
    console.error('Error getting corrections for review:', error);
    return [];
  }
};

/**
 * Vote on a correction (approve or reject)
 * @param {string} correctionId - ID of the correction
 * @param {string} userId - ID of the user voting
 * @param {string} vote - 'approve' or 'reject'
 * @param {string} comment - Optional comment explaining the vote
 * @returns {Promise<Object>} Result of the operation
 */
export const voteOnCorrection = async (correctionId, userId, vote, comment = '') => {
  try {
    const correctionRef = doc(db, 'corrections', correctionId);
    const correctionDoc = await getDoc(correctionRef);
    
    if (!correctionDoc.exists()) {
      throw new Error('Correction not found');
    }
    
    const correctionData = correctionDoc.data();
    const reviewedBy = correctionData.reviewed_by || [];
    
    // Check if user has already voted
    if (reviewedBy.some(review => review.user_id === userId)) {
      throw new Error('You have already voted on this correction');
    }
    
    // Add vote to the correction (use regular Date object for arrays instead of serverTimestamp)
    const newReview = {
      user_id: userId,
      vote: vote, // 'approve' or 'reject'
      comment: comment,
      timestamp: new Date() // Using JavaScript Date object instead of serverTimestamp for arrays
    };
    
    const updatedReviewedBy = [...reviewedBy, newReview];
    const votesFor = vote === 'approve' ? (correctionData.votes_for || 0) + 1 : (correctionData.votes_for || 0);
    const votesAgainst = vote === 'reject' ? (correctionData.votes_against || 0) + 1 : (correctionData.votes_against || 0);
    
    // Check if correction should be auto-approved (3+ approve votes) or rejected (3+ reject votes)
    let newStatus = correctionData.status;
    if (votesFor >= 3) {
      newStatus = 'approved';
    } else if (votesAgainst >= 3) {
      newStatus = 'rejected';
    }
    
    await updateDoc(correctionRef, {
      reviewed_by: updatedReviewedBy,
      votes_for: votesFor,
      votes_against: votesAgainst,
      status: newStatus,
      updatedAt: serverTimestamp() // This is fine as it's not inside an array
    });
    
    return {
      success: true,
      message: newStatus === 'approved' ? 'Correction approved!' : 
               newStatus === 'rejected' ? 'Correction rejected!' : 
               'Vote recorded successfully!'
    };
  } catch (error) {
    console.error('Error voting on correction:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Apply an approved correction to a word
 * @param {string} correctionId - ID of the correction to apply
 * @returns {Promise<Object>} Result of the operation
 */
export const applyCorrection = async (correctionId) => {
  try {
    // Get the correction details
    const correctionRef = doc(db, 'corrections', correctionId);
    const correctionDoc = await getDoc(correctionRef);
    
    if (!correctionDoc.exists()) {
      throw new Error('Correction not found');
    }
    
    const correction = correctionDoc.data();
    
    // Get the word to be updated
    const wordRef = doc(db, 'words', correction.word_id);
    const wordDoc = await getDoc(wordRef);
    
    if (!wordDoc.exists()) {
      throw new Error('Word not found');
    }
    
    const wordData = wordDoc.data();
    const updateData = {};
    
    // Apply the correction based on type
    switch (correction.correction_type) {
      case 'word_spelling':
        updateData.kurukh_word = correction.proposed_change;
        break;
        
      case 'definition':
        // Find and update the specific meaning
        if (wordData.meanings) {
          const updatedMeanings = wordData.meanings.map(meaning => {
            if (meaning.definition === correction.current_value) {
              return { ...meaning, definition: correction.proposed_change };
            }
            return meaning;
          });
          updateData.meanings = updatedMeanings;
        }
        break;
        
      case 'part_of_speech':
        updateData.part_of_speech = correction.proposed_change;
        break;
        
      case 'example_sentence':
        // Update example sentence in meanings
        if (wordData.meanings) {
          const updatedMeanings = wordData.meanings.map(meaning => {
            if (meaning.example_sentence_kurukh === correction.current_value) {
              return { ...meaning, example_sentence_kurukh: correction.proposed_change };
            }
            return meaning;
          });
          updateData.meanings = updatedMeanings;
        }
        break;
        
      case 'example_translation':
        // Update example translation in meanings
        if (wordData.meanings) {
          const updatedMeanings = wordData.meanings.map(meaning => {
            if (meaning.example_sentence_translation === correction.current_value) {
              return { ...meaning, example_sentence_translation: correction.proposed_change };
            }
            return meaning;
          });
          updateData.meanings = updatedMeanings;
        }
        break;
        
      case 'pronunciation':
        updateData.pronunciation_guide = correction.proposed_change;
        break;
        
      default:
        throw new Error('Unknown correction type: ' + correction.correction_type);
    }
    
    // Add metadata
    updateData.updatedAt = serverTimestamp();
    updateData.last_correction_applied = {
      correction_id: correctionId,
      applied_at: serverTimestamp(),
      correction_type: correction.correction_type
    };
    
    // Update the word
    await updateDoc(wordRef, updateData);
    
    // Mark the correction as applied
    await updateDoc(correctionRef, {
      status: 'applied',
      applied_at: serverTimestamp(),
      applied_to_word: true,
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true,
      message: 'Correction applied successfully to the word'
    };
  } catch (error) {
    console.error('Error applying correction:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get words awaiting community review
 * @param {number} limit - Maximum number of words to return
 * @returns {Promise<Array>} Array of words for review
 */
export const getWordsForCommunityReview = async (maxLimit = 20) => {
  try {
    const q = query(
      wordsCollection,
      where('status', '==', 'community_review'),
      orderBy('createdAt', 'desc'),
      maxLimit ? limit(maxLimit) : undefined
    );
    
    console.log('Fetching community review words with query:', JSON.stringify({
      collection: 'words',
      where: 'status == community_review',
      orderBy: 'createdAt desc',
      limit: maxLimit
    }));
    
    const querySnapshot = await getDocs(q);
    console.log(`Found ${querySnapshot.size} words for community review`);
    
    const words = [];
    
    querySnapshot.forEach((doc) => {
      words.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return words;
  } catch (error) {
    console.error('Error getting words for community review:', error);
    return [];
  }
};

/**
 * Vote on a word (approve or reject)
 * @param {string} wordId - ID of the word
 * @param {string} userId - ID of the user voting
 * @param {string} vote - 'approve' or 'reject'
 * @param {string} comment - Optional comment explaining the vote
 * @returns {Promise<Object>} Result of the operation
 */
export const voteOnWord = async (wordId, userId, vote, comment = '') => {
  try {
    const wordRef = doc(db, 'words', wordId);
    const wordDoc = await getDoc(wordRef);
    
    if (!wordDoc.exists()) {
      throw new Error('Word not found');
    }
    
    const wordData = wordDoc.data();
    const reviewedBy = wordData.reviewed_by || [];
    
    // Prevent voting on own contribution
    if (wordData.contributor_id === userId) {
      throw new Error('You cannot vote on your own contribution');
    }

    // Check if word is still in community review
    if (wordData.status !== 'community_review') {
      throw new Error('This word is no longer available for community review');
    }
    
    // Check if user has already voted
    if (reviewedBy.some(review => review.user_id === userId)) {
      throw new Error('You have already voted on this word');
    }
    
    // Add vote to the word (use regular Date object for arrays instead of serverTimestamp)
    const newReview = {
      user_id: userId,
      vote: vote, // 'approve' or 'reject'
      comment: comment,
      timestamp: new Date() // Using JavaScript Date object instead of serverTimestamp for arrays
    };
    
    const updatedReviewedBy = [...reviewedBy, newReview];
    const votesFor = vote === 'approve' ? (wordData.community_votes_for || 0) + 1 : (wordData.community_votes_for || 0);
    const votesAgainst = vote === 'reject' ? (wordData.community_votes_against || 0) + 1 : (wordData.community_votes_against || 0);
    
    // Check if the word should move to admin review (5+ approve votes) or be rejected (5+ reject votes)
    let newStatus = wordData.status;
    if (votesFor >= 5) {
      newStatus = 'pending_review'; // Move to admin review
    } else if (votesAgainst >= 5) {
      newStatus = 'community_rejected';
    }
    
    await updateDoc(wordRef, {
      reviewed_by: updatedReviewedBy,
      community_votes_for: votesFor,
      community_votes_against: votesAgainst,
      status: newStatus,
      updatedAt: serverTimestamp() // This is fine as it's not inside an array
    });
    
    return {
      success: true,
      message: newStatus === 'pending_review' ? 'Word approved for admin review!' : 
               newStatus === 'community_rejected' ? 'Word rejected by community!' : 
               'Vote recorded successfully!'
    };
  } catch (error) {
    console.error('Error voting on word:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
