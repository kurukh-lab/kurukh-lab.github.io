import { doc, updateDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Service to manage word review state in Firestore
 * This service maps the XState machine states to Firestore document fields
 */
export const wordReviewService = {
  /**
   * Update the word status in Firestore based on current machine state
   * 
   * @param {string} wordId - ID of the word document
   * @param {string} state - Current state from the state machine
   * @param {Object} context - Context from the state machine
   * @returns {Promise} - Promise from Firestore update
   */
  updateWordStatus: async (wordId, state, context = {}) => {
    // Map machine states to Firestore status values
    const stateToStatusMap = {
      'draft': 'draft',
      'submitted': 'submitted',
      'pendingCommunityReview': 'pending_community_review',
      'inCommunityReview': 'in_community_review',
      'communityApproved': 'community_approved',
      'communityRejected': 'community_rejected',
      'pendingAdminReview': 'pending_review', // Maps to existing 'pending_review' status
      'inAdminReview': 'in_admin_review', 
      'approved': 'approved',
      'rejected': 'rejected'
    };
    
    const status = stateToStatusMap[state] || 'submitted'; // Default to submitted if state is not recognized

    const wordRef = doc(db, 'words', wordId);
    
    // Prepare the update data
    const updateData = {
      status,
      updatedAt: new Date()
    };
    
    // Add vote counts if in community review stages
    if (['inCommunityReview', 'communityApproved', 'communityRejected'].includes(state)) {
      if (context.communityVotes) {
        updateData.votes_for = context.communityVotes.for;
        updateData.votes_against = context.communityVotes.against;
      }
    }
    
    // Add reviewers if present
    if (context.reviewedBy && context.reviewedBy.length > 0) {
      updateData.reviewed_by = context.reviewedBy;
    }
    
    return updateDoc(wordRef, updateData);
  },
  
  /**
   * Load word status from Firestore and return the appropriate machine state
   * 
   * @param {string} wordId - ID of the word document
   * @returns {Promise<Object>} - Promise resolving to { state, context }
   */
  loadWordStatus: async (wordId) => {
    const wordRef = doc(db, 'words', wordId);
    const wordSnap = await getDoc(wordRef);
    
    if (!wordSnap.exists()) {
      throw new Error(`Word with ID ${wordId} not found`);
    }
    
    const wordData = {
      id: wordSnap.id,
      ...wordSnap.data()
    };
    
    // Map Firestore status to machine state
    const statusToStateMap = {
      'draft': 'draft',
      'submitted': 'submitted',
      'pending_community_review': 'pendingCommunityReview',
      'in_community_review': 'inCommunityReview',
      'community_approved': 'communityApproved',
      'community_rejected': 'communityRejected',
      'pending_review': 'pendingAdminReview',
      'in_admin_review': 'inAdminReview',
      'approved': 'approved',
      'rejected': 'rejected'
    };
    
    // Get state from map or default to 'submitted'
    const state = statusToStateMap[wordData.status] || 'submitted';
    
    // Create context from word data
    const context = {
      wordId,
      wordData,
      communityVotes: {
        for: wordData.votes_for || 0,
        against: wordData.votes_against || 0
      },
      reviewedBy: wordData.reviewed_by || [],
      history: wordData.status_history || []
    };
    
    return { state, context };
  },
  
  /**
   * Transition a word to a new state
   * 
   * @param {string} wordId - ID of the word document
   * @param {string} event - Event to send to the machine
   * @param {Object} payload - Additional data for the event
   * @param {Object} currentContext - Current context from the machine
   * @returns {Promise<Object>} - Promise resolving to { success, error }
   */
  transitionWord: async (wordId, event, payload = {}, currentContext = {}) => {
    try {
      // First we need to get the current word status
      const { state, context } = await wordReviewService.loadWordStatus(wordId);
      
      // Then we determine what the new state would be based on the event
      // This is a simplified simulation of the machine transition
      // In a real implementation, you'd use the actual machine to calculate this
      
      // Map of events to next states (simplified)
      const eventToStateMap = {
        'SUBMIT': 'submitted',
        'SEND_TO_ADMIN_REVIEW': 'pendingAdminReview',
        'SEND_TO_COMMUNITY_REVIEW': 'pendingCommunityReview',
        'START_COMMUNITY_REVIEW': 'inCommunityReview',
        'COMMUNITY_APPROVED': 'communityApproved',
        'COMMUNITY_REJECTED': 'communityRejected',
        'ADMIN_APPROVE': 'approved',
        'ADMIN_REJECT': 'rejected',
        'START_ADMIN_REVIEW': 'inAdminReview',
        'SEND_BACK_TO_COMMUNITY': 'pendingCommunityReview'
      };
      
      // Get the new state or stay in current state if event not recognized
      const newState = eventToStateMap[event] || state;
      
      // Update history with this event
      const newHistory = [
        ...(context.history || []),
        {
          action: event.toLowerCase(),
          timestamp: new Date(),
          ...payload
        }
      ];
      
      // Update the context with the new data
      const newContext = {
        ...context,
        ...currentContext,
        history: newHistory
      };
      
      // Update the word in Firestore
      await wordReviewService.updateWordStatus(wordId, newState, newContext);
      
      return {
        success: true,
        state: newState,
        context: newContext
      };
    } catch (error) {
      console.error('Error transitioning word state:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * Setup a real-time listener for a word's review status changes
   * 
   * @param {string} wordId - ID of the word to listen for changes
   * @param {function} callback - Callback function that receives updated state and context
   * @returns {function} - Unsubscribe function to stop listening
   */
  subscribeToWordStatus: (wordId, callback) => {
    if (!wordId) {
      console.error("Word ID is required to subscribe to status changes");
      return () => {}; // Return empty unsubscribe function
    }
    
    const wordRef = doc(db, 'words', wordId);
    
    // Set up the real-time listener
    const unsubscribe = onSnapshot(wordRef, 
      // Success handler
      (docSnapshot) => {
        if (!docSnapshot.exists()) {
          console.error(`Word with ID ${wordId} not found in Firestore`);
          return;
        }
        
        const wordData = {
          id: docSnapshot.id,
          ...docSnapshot.data()
        };
        
        // Map Firestore status to machine state
        const statusToStateMap = {
          'draft': 'draft',
          'submitted': 'submitted',
          'pending_community_review': 'pendingCommunityReview',
          'in_community_review': 'inCommunityReview',
          'community_approved': 'communityApproved',
          'community_rejected': 'communityRejected',
          'pending_review': 'pendingAdminReview', 
          'in_admin_review': 'inAdminReview',
          'approved': 'approved',
          'rejected': 'rejected',
          // Aliases for existing statuses in the database
          'community_review': 'inCommunityReview',
        };
        
        // Get state from map or default to 'submitted'
        const state = statusToStateMap[wordData.status] || 'submitted';
        
        // Create context from word data
        const context = {
          wordId,
          wordData,
          communityVotes: {
            for: wordData.community_votes_for || wordData.votes_for || 0,
            against: wordData.community_votes_against || wordData.votes_against || 0
          },
          reviewedBy: wordData.reviewed_by || [],
          history: wordData.status_history || []
        };
        
        // Send the updated state through the callback
        callback({ state, context });
      },
      // Error handler
      (error) => {
        console.error(`Error listening to word status changes for ${wordId}:`, error);
      }
    );
    
    // Return the unsubscribe function
    return unsubscribe;
  },
};

export default wordReviewService;
