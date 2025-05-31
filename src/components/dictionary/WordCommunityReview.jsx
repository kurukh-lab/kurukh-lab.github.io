/**
 * WordCommunityReview Component
 * 
 * This component handles the display and voting functionality for words in community review.
 * It fetches words with 'community_review' status and allows authenticated users to vote
 * (approve or reject) on these words.
 * 
 * Key features:
 * - Displays words with their meanings and examples
 * - Shows current vote count and status
 * - Prevents users from voting on their own contributions
 * - Prevents users from voting multiple times on the same word
 * - Updates words status when voting thresholds are reached (5 approvals/rejections)
 * 
 * @component
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getWordsForCommunityReview, voteOnWord } from '../../services/dictionaryService';
import { formatDate } from '../../utils/wordUtils';
import StateFilter from '../StateFilter';
import CommentThread from '../CommentThread';

const WordCommunityReview = () => {
  const { currentUser } = useAuth();
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [votingInProgress, setVotingInProgress] = useState({});
  const [successMessage, setSuccessMessage] = useState(null);
  const [selectedStates, setSelectedStates] = useState(['community_review', 'in_community_review']);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [currentVote, setCurrentVote] = useState(null);
  const [voteComment, setVoteComment] = useState('');
  const [openComments, setOpenComments] = useState({}); // Track which comment threads are open

  // Define available states for word filtering
  const wordStates = [
    {
      value: 'community_review',
      label: 'Community Review',
      badgeClass: 'badge-warning'
    },
    {
      value: 'in_community_review',
      label: 'In Community Review',
      badgeClass: 'badge-info'
    },
    {
      value: 'pending_review',
      label: 'Pending Admin Review',
      badgeClass: 'badge-primary'
    },
    {
      value: 'community_approved',
      label: 'Community Approved',
      badgeClass: 'badge-success'
    },
    {
      value: 'community_rejected',
      label: 'Community Rejected',
      badgeClass: 'badge-error'
    }
  ];

  useEffect(() => {
    if (currentUser) {
      console.log("Current user authenticated, fetching review words...", currentUser.uid);
      fetchWords();
    } else {
      console.log("No authenticated user, cannot fetch review words");
    }
  }, [currentUser, selectedStates]); // Re-fetch when states change

  const fetchWords = async () => {
    try {
      setLoading(true);
      console.log("Fetching words for community review with states:", selectedStates);
      const wordsData = await getWordsForCommunityReview(20, selectedStates.length > 0 ? selectedStates : null);
      console.log(`Received ${wordsData.length} words for community review`);
      setWords(wordsData);
    } catch (err) {
      console.error('Error fetching words:', err);
      setError('Failed to load words for review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (wordId, vote, comment = '') => {
    if (!currentUser) return;

    setVotingInProgress(prev => ({ ...prev, [wordId]: true }));
    setError(null);

    try {
      const result = await voteOnWord(wordId, currentUser.uid, vote, comment);

      if (result.success) {
        setSuccessMessage(result.message);

        // Remove the word from the list if it was approved or rejected by community
        if (result.message.includes('approved') || result.message.includes('rejected')) {
          setWords(prev => prev.filter(w => w.id !== wordId));
        }

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error voting:', err);
      setError('An error occurred while submitting your vote. Please try again.');
    } finally {
      setVotingInProgress(prev => ({ ...prev, [wordId]: false }));
    }
  };

  const handleVoteWithComment = (wordId, vote) => {
    setCurrentVote({ wordId, vote });
    setShowCommentModal(true);
    setVoteComment('');
  };

  const submitVote = async () => {
    if (currentVote) {
      await handleVote(currentVote.wordId, currentVote.vote, voteComment);
      setShowCommentModal(false);
      setCurrentVote(null);
      setVoteComment('');
    }
  };

  const handleStateFilterChange = (newSelectedStates) => {
    setSelectedStates(newSelectedStates);
  };

  const toggleComments = (wordId) => {
    setOpenComments(prev => ({
      ...prev,
      [wordId]: !prev[wordId]
    }));
  };

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="alert alert-warning">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>You must be logged in to review new words.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <p className="text-gray-600">
          Help improve the Kurukh Dictionary by reviewing new word submissions.
          Words that receive 5 approval votes will be sent to administrators for final review.
        </p>
      </div>

      {/* State Filter */}
      <div className="mb-6">
        <StateFilter
          states={wordStates}
          selectedStates={selectedStates}
          onSelectionChange={handleStateFilterChange}
          title="Filter Words by Review State"
          multiSelect={true}
          disabled={loading}
        />
      </div>

      {successMessage && (
        <div className="alert alert-success mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : words.length === 0 ? (
        <div className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No words to review</h3>
          <p className="text-gray-500">All pending words have been reviewed. Check back later!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {words.map((word) => (
            <div key={word.id} className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="card-title text-xl mb-2">
                      {word.kurukh_word}
                    </h2>
                    <div className="badge badge-primary">{word.part_of_speech || 'No part of speech'}</div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Submitted {word.createdAt && formatDate(word.createdAt)}
                  </div>
                </div>

                <div className="mb-6">
                  {word.meanings && word.meanings.map((meaning, index) => (
                    <div key={index} className="mb-4">
                      <h4 className="font-semibold mb-2">
                        {meaning.language === 'en' ? 'English' : 'Hindi'} Definition:
                      </h4>
                      <p>{meaning.definition}</p>

                      {meaning.example_sentence_kurukh && (
                        <div className="mt-2 pl-4 border-l-2 border-gray-200">
                          <p className="text-sm italic">{meaning.example_sentence_kurukh}</p>
                          <p className="text-sm text-gray-600">{meaning.example_sentence_translation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>👍 {word.community_votes_for || 0}</span>
                    <span>👎 {word.community_votes_against || 0}</span>
                    <span>Reviews: {word.reviewed_by?.length || 0}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleVoteWithComment(word.id, 'approve')}
                      disabled={votingInProgress[word.id] ||
                        word.reviewed_by?.some(r => r.user_id === currentUser.uid) ||
                        word.contributor_id === currentUser.uid}
                      title={word.contributor_id === currentUser.uid ?
                        "You cannot vote on your own contribution" :
                        word.reviewed_by?.some(r => r.user_id === currentUser.uid) ?
                          "You have already voted on this word" : "Approve this word"}
                    >
                      {votingInProgress[word.id] ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : (
                        '👍 Approve'
                      )}
                    </button>
                    <button
                      className="btn btn-error btn-sm"
                      onClick={() => handleVoteWithComment(word.id, 'reject')}
                      disabled={votingInProgress[word.id] ||
                        word.reviewed_by?.some(r => r.user_id === currentUser.uid) ||
                        word.contributor_id === currentUser.uid}
                      title={word.contributor_id === currentUser.uid ?
                        "You cannot vote on your own contribution" :
                        word.reviewed_by?.some(r => r.user_id === currentUser.uid) ?
                          "You have already voted on this word" : "Reject this word"}
                    >
                      {votingInProgress[word.id] ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : (
                        '👎 Reject'
                      )}
                    </button>
                  </div>
                </div>

                {word.contributor_id === currentUser.uid && (
                  <div className="mt-2">
                    <div className="alert alert-warning alert-sm">
                      <span>This is your contribution. You cannot vote on your own words.</span>
                    </div>
                  </div>
                )}

                {word.contributor_id !== currentUser.uid && word.reviewed_by?.some(r => r.user_id === currentUser.uid) && (
                  <div className="mt-2">
                    <div className="alert alert-info alert-sm">
                      <span>You have already voted on this word.</span>
                    </div>
                  </div>
                )}

                {/* Comment Thread */}
                <CommentThread
                  wordId={word.id}
                  word={word}
                  isOpen={openComments[word.id] || false}
                  onToggle={() => toggleComments(word.id)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              Add Comment (Optional)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              You can add an optional comment to explain your {currentVote?.vote === 'approve' ? 'approval' : 'rejection'}.
            </p>

            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Comment</span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full"
                placeholder="Add your comment here (optional)..."
                value={voteComment}
                onChange={(e) => setVoteComment(e.target.value)}
                rows="3"
              />
            </div>

            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setShowCommentModal(false);
                  setCurrentVote(null);
                  setVoteComment('');
                }}
              >
                Cancel
              </button>
              <button
                className={`btn ${currentVote?.vote === 'approve' ? 'btn-success' : 'btn-error'}`}
                onClick={submitVote}
                disabled={votingInProgress[currentVote?.wordId]}
              >
                {votingInProgress[currentVote?.wordId] ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  `${currentVote?.vote === 'approve' ? 'Approve' : 'Reject'}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordCommunityReview;
