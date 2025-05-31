import { useActor } from '@xstate/react';
import { createActor } from 'xstate';
import { wordReviewMachine } from '../state/wordReviewMachine';
import { useEffect, useState, useRef } from 'react';
import { wordReviewService } from '../services/wordReviewService';

/**
 * React hook for using the word review state machine
 * This hook provides a convenient way to integrate the word review state machine
 * with React components
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.wordId - ID of the word to manage (optional)
 * @param {Object} options.wordData - Initial word data (optional)
 * @param {boolean} options.useRealTimeUpdates - Whether to use real-time updates (default: false)
 * @returns {Object} - Machine service and helper functions
 */
export const useWordReview = ({ 
  wordId = null, 
  wordData = null,
  useRealTimeUpdates = false
} = {}) => {
  // Internal state to track if real-time updates are active
  const [isListening, setIsListening] = useState(false);

  // Create a ref for the actor to persist across renders
  const actorRef = useRef(null);
  
  // Initialize the actor if it hasn't been created yet
  if (!actorRef.current) {
    actorRef.current = createActor(wordReviewMachine, {
      input: {
        wordId,
        wordData,
      }
    }).start();
  }
  
  // Use the actor with the useActor hook
  const [snapshot, send] = useActor(actorRef.current);
  
  // Set up real-time listener when enabled and wordId is available
  useEffect(() => {
    let unsubscribe = () => {};
    
    const setupRealTimeUpdates = async () => {
      if (useRealTimeUpdates && wordId && !isListening) {
        setIsListening(true);
        
        // Subscribe to real-time updates
        unsubscribe = wordReviewService.subscribeToWordStatus(wordId, ({ state: firebaseState, context }) => {
          // Update the machine state and context when Firestore data changes
          send({
            type: 'SYNC_STATE',
            state: firebaseState,
            context
          });
        });
      }
    };
    
    setupRealTimeUpdates();
    
    // Clean up subscription when component unmounts or wordId changes
    return () => {
      if (unsubscribe) {
        unsubscribe();
        setIsListening(false);
      }
    };
  }, [wordId, useRealTimeUpdates, isListening, send]);

  // Extract values from the snapshot
  const currentState = snapshot.value;
  const context = snapshot.context;
  
  /**
   * Get the current status text based on state
   */
  const getStatusText = () => {
    const stateMap = {
      'draft': 'Draft',
      'submitted': 'Submitted',
      'pendingCommunityReview': 'Pending Community Review',
      'inCommunityReview': 'In Community Review',
      'communityApproved': 'Community Approved',
      'communityRejected': 'Community Rejected',
      'pendingAdminReview': 'Pending Admin Review',
      'inAdminReview': 'In Admin Review',
      'approved': 'Approved',
      'rejected': 'Rejected'
    };
    
    return stateMap[currentState] || 'Unknown';
  };
  
  /**
   * Check if the word is in a specific state
   * @param {string|string[]} checkState - State(s) to check
   * @returns {boolean} - Whether the word is in the specified state
   */
  const isInState = (checkState) => {
    if (Array.isArray(checkState)) {
      return checkState.includes(currentState);
    }
    return currentState === checkState;
  };
  
  /**
   * Update the word data in context
   * @param {Object} newData - New word data to merge with existing data
   */
  const updateWordData = (newData) => {
    send({
      type: 'UPDATE_WORD_DATA',
      data: newData
    });
  };
  
  // Helper function to determine if the word can be edited
  const canBeEdited = () => {
    return isInState(['draft', 'submitted']);
  };
  
  // Helper function to determine if the word is in any final state
  const isInFinalState = () => {
    return isInState(['approved', 'rejected', 'communityRejected']);
  };
  
  // Helper function to check if the word is in any community review state
  const isInCommunityReview = () => {
    return isInState(['pendingCommunityReview', 'inCommunityReview', 'communityApproved', 'communityRejected']);
  };
  
  // Helper function to check if the word is in any admin review state
  const isInAdminReview = () => {
    return isInState(['pendingAdminReview', 'inAdminReview']);
  };
  
  // Get community vote counts
  const getCommunityVotes = () => {
    return context.communityVotes;
  };
  
  // Get review history
  const getHistory = () => {
    return context.history;
  };
  
  return {
    actor: actorRef.current,
    state: currentState,
    context,
    send,
    getStatusText,
    isInState,
    updateWordData,
    canBeEdited,
    isInFinalState,
    isInCommunityReview,
    isInAdminReview,
    getCommunityVotes,
    getHistory,
    isRealTimeActive: isListening
  };
};

export default useWordReview;
