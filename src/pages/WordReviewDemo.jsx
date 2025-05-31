import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWordReview } from '../hooks/useWordReview';
import WordReviewStatus from '../components/WordReviewStatus';
import WordReviewStateMachine from '../components/WordReviewStateMachine';
import { wordReviewService } from '../services/wordReviewService';
import { collection, query, orderBy, limit, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { formatDate } from '../utils/wordUtils';

// Demo page for viewing and testing the word review state machine
const WordReviewDemo = () => {
  const { currentUser, isAdmin } = useAuth();
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWordId, setSelectedWordId] = useState(null);
  const [canTransition, setCanTransition] = useState(false);

  // Load a sample of words from the database
  useEffect(() => {
    const fetchWords = async () => {
      try {
        setLoading(true);
        setError(null);

        let q;
        if (isAdmin) {
          // Admins can see all words
          q = query(
            collection(db, 'words'),
            orderBy('createdAt', 'desc'),
            limit(10)
          );
        } else {
          // Regular users can only see their own words or approved words
          q = query(
            collection(db, 'words'),
            where('status', 'in', ['approved', 'in_community_review', 'community_approved']),
            orderBy('createdAt', 'desc'),
            limit(10)
          );
        }

        const querySnapshot = await getDocs(q);
        const wordsData = [];

        querySnapshot.forEach((doc) => {
          wordsData.push({
            id: doc.id,
            ...doc.data()
          });
        });

        setWords(wordsData);

        // Select the first word by default
        if (wordsData.length > 0) {
          setSelectedWordId(wordsData[0].id);
        }
      } catch (err) {
        console.error("Error fetching words:", err);
        setError("Failed to load words. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchWords();
  }, [isAdmin, currentUser]);

  // Check if user can perform transitions on the selected word
  useEffect(() => {
    const checkTransitionPermissions = async () => {
      if (!selectedWordId || !currentUser) {
        setCanTransition(false);
        return;
      }

      try {
        const selectedWord = words.find(word => word.id === selectedWordId);

        // Admins can always transition words
        if (isAdmin) {
          setCanTransition(true);
          return;
        }

        // Word owners can transition their own words in certain states
        if (selectedWord?.created_by === currentUser.uid) {
          const allowedStates = ['draft', 'submitted'];
          setCanTransition(allowedStates.includes(selectedWord.status));
          return;
        }

        // Community members can vote on words in community review
        if (selectedWord?.status === 'in_community_review') {
          // Check if user hasn't voted yet
          const alreadyVoted = selectedWord.reviewed_by?.some(
            review => review.userId === currentUser.uid
          );
          setCanTransition(!alreadyVoted);
          return;
        }

        setCanTransition(false);
      } catch (err) {
        console.error("Error checking transition permissions:", err);
        setCanTransition(false);
      }
    };

    checkTransitionPermissions();
  }, [selectedWordId, currentUser, isAdmin, words]);

  // Handle word selection
  const handleSelectWord = (wordId) => {
    setSelectedWordId(wordId);
  };

  // Handle state transition
  const handleTransition = async (event) => {
    try {
      setLoading(true);

      const result = await wordReviewService.transitionWord(selectedWordId, event, {
        userId: currentUser.uid,
      });

      if (!result.success) {
        throw new Error(result.error || `Failed to transition word with event ${event}`);
      }

      // Refresh the word list after transition
      const updatedWords = await Promise.all(words.map(async (word) => {
        if (word.id === selectedWordId) {
          const { state, context } = await wordReviewService.loadWordStatus(word.id);
          return {
            ...word,
            status: state,
            ...context
          };
        }
        return word;
      }));

      setWords(updatedWords);
    } catch (err) {
      console.error(`Error transitioning word with event ${event}:`, err);
      setError(`Failed to transition word. Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Word Review System Demo</h1>

      {/* State machine visualization */}
      <div className="mb-8">
        <h2 className="text-xl font-medium mb-4">State Machine Visualization</h2>
        <div className="border rounded-lg overflow-hidden bg-white p-4">
          <img
            src="/word-review-machine.svg"
            alt="Word Review State Machine Diagram"
            className="mx-auto max-w-full"
            style={{ maxHeight: '450px' }}
          />
          <p className="text-center text-sm text-gray-500 mt-4">
            This diagram shows the states and transitions in the word review workflow.
          </p>
        </div>
      </div>

      {/* Detailed state transitions table */}
      {import.meta.env.DEV && <WordReviewStateMachine />}

      {error && (
        <div className="alert alert-error mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Word selection sidebar */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <h2 className="p-4 bg-gray-100 font-bold border-b">Select a Word</h2>

          {loading && words.length === 0 ? (
            <div className="flex justify-center items-center py-10">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : words.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No words available.</p>
            </div>
          ) : (
            <div className="divide-y max-h-96 overflow-y-auto">
              {words.map((word) => (
                <button
                  key={word.id}
                  onClick={() => handleSelectWord(word.id)}
                  className={`w-full text-left p-4 hover:bg-gray-50 ${selectedWordId === word.id ? 'bg-blue-50' : ''}`}
                >
                  <div className="mb-1 font-medium">{word.kurukh_word}</div>
                  <div className="text-sm text-gray-500">
                    <div>Status: {word.status}</div>
                    <div>Added: {formatDate(word.createdAt)}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Word review status and actions */}
        <div className="md:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
          <h2 className="p-4 bg-gray-100 font-bold border-b">Word Review Status</h2>

          {!selectedWordId ? (
            <div className="p-8 text-center text-gray-500">
              <p>Select a word to view its review status.</p>
            </div>
          ) : (
            <div className="p-6">
              {/* Word Review Status Component */}
              <WordReviewStatus wordId={selectedWordId} />

              {/* Available actions based on user role and word state */}
              {canTransition && (
                <div className="mt-8 border-t pt-6">
                  <h3 className="font-medium mb-3">Available Actions:</h3>

                  <div className="flex flex-wrap gap-3">
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => handleTransition('ADMIN_APPROVE')}
                          className="btn btn-sm btn-success"
                          disabled={loading}
                        >
                          {loading ? <span className="loading loading-spinner loading-xs"></span> : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleTransition('ADMIN_REJECT')}
                          className="btn btn-sm btn-error"
                          disabled={loading}
                        >
                          {loading ? <span className="loading loading-spinner loading-xs"></span> : 'Reject'}
                        </button>
                        <button
                          onClick={() => handleTransition('SEND_TO_COMMUNITY_REVIEW')}
                          className="btn btn-sm btn-info"
                          disabled={loading}
                        >
                          {loading ? <span className="loading loading-spinner loading-xs"></span> : 'Send to Community'}
                        </button>
                      </>
                    )}

                    {/* User actions for community review */}
                    {!isAdmin && (
                      <>
                        <button
                          onClick={() => handleTransition('COMMUNITY_APPROVE')}
                          className="btn btn-sm btn-outline btn-success"
                          disabled={loading}
                        >
                          {loading ? <span className="loading loading-spinner loading-xs"></span> : 'Vote Approve'}
                        </button>
                        <button
                          onClick={() => handleTransition('COMMUNITY_REJECT')}
                          className="btn btn-sm btn-outline btn-error"
                          disabled={loading}
                        >
                          {loading ? <span className="loading loading-spinner loading-xs"></span> : 'Vote Reject'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WordReviewDemo;
