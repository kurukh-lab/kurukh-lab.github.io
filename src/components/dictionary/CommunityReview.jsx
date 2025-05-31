import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getCorrectionsForReview, voteOnCorrection } from '../../services/dictionaryService';
import { formatDate } from '../../utils/wordUtils';
import StateFilter from '../StateFilter';

const CommunityReview = () => {
  const { currentUser } = useAuth();
  const [corrections, setCorrections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [votingInProgress, setVotingInProgress] = useState({});
  const [successMessage, setSuccessMessage] = useState(null);
  const [selectedStates, setSelectedStates] = useState(['shallow_review']);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [currentVote, setCurrentVote] = useState(null);
  const [voteComment, setVoteComment] = useState('');

  // Define available states for correction filtering
  const correctionStates = [
    {
      value: 'shallow_review',
      label: 'Pending Review',
      badgeClass: 'badge-warning'
    },
    {
      value: 'approved',
      label: 'Approved',
      badgeClass: 'badge-success'
    },
    {
      value: 'rejected',
      label: 'Rejected',
      badgeClass: 'badge-error'
    },
    {
      value: 'applied',
      label: 'Applied',
      badgeClass: 'badge-info'
    }
  ];

  useEffect(() => {
    if (currentUser) {
      fetchCorrections();
    }
  }, [currentUser, selectedStates]);

  const fetchCorrections = async () => {
    try {
      setLoading(true);
      console.log("Fetching corrections with states:", selectedStates);
      const correctionsData = await getCorrectionsForReview(20, selectedStates.length > 0 ? selectedStates : null);
      setCorrections(correctionsData);
    } catch (err) {
      console.error('Error fetching corrections:', err);
      setError('Failed to load corrections for review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (correctionId, vote, comment = '') => {
    if (!currentUser) return;

    setVotingInProgress(prev => ({ ...prev, [correctionId]: true }));
    setError(null);

    try {
      const result = await voteOnCorrection(correctionId, currentUser.uid, vote, comment);

      if (result.success) {
        setSuccessMessage(result.message);
        // Remove the correction from the list if it was approved/rejected
        if (result.message.includes('approved') || result.message.includes('rejected')) {
          setCorrections(prev => prev.filter(c => c.id !== correctionId));
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
      setVotingInProgress(prev => ({ ...prev, [correctionId]: false }));
    }
  };

  const handleVoteWithComment = (correctionId, vote) => {
    setCurrentVote({ correctionId, vote });
    setShowCommentModal(true);
    setVoteComment('');
  };

  const submitVote = async () => {
    if (currentVote) {
      await handleVote(currentVote.correctionId, currentVote.vote, voteComment);
      setShowCommentModal(false);
      setCurrentVote(null);
      setVoteComment('');
    }
  };

  const getCorrectionTypeLabel = (type) => {
    const labels = {
      word_spelling: 'Word Spelling',
      definition: 'Definition/Meaning',
      part_of_speech: 'Part of Speech',
      example_sentence: 'Example Sentence',
      example_translation: 'Example Translation',
      pronunciation: 'Pronunciation',
      other: 'Other'
    };
    return labels[type] || type;
  };

  const handleStateFilterChange = (newSelectedStates) => {
    setSelectedStates(newSelectedStates);
  };

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="alert alert-warning">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>You must be logged in to review corrections.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <p className="text-gray-600">
          Help improve the Kurukh Dictionary by reviewing corrections suggested by the community.
          Your votes help determine which corrections get approved.
        </p>
      </div>

      {/* State Filter */}
      <div className="mb-6">
        <StateFilter
          states={correctionStates}
          selectedStates={selectedStates}
          onSelectionChange={handleStateFilterChange}
          title="Filter Corrections by Review State"
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
      ) : corrections.length === 0 ? (
        <div className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No corrections to review</h3>
          <p className="text-gray-500">All pending corrections have been reviewed. Check back later!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {corrections.map((correction) => (
            <div key={correction.id} className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="card-title text-xl mb-2">
                      {correction.word?.kurukh_word || 'Unknown Word'}
                    </h2>
                    <div className="badge badge-primary">{getCorrectionTypeLabel(correction.correction_type)}</div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Submitted {correction.createdAt && formatDate(correction.createdAt)}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-600">Current Value:</h4>
                    <div className="p-3 bg-red-50 border border-red-200 rounded">
                      <span className="text-red-800">{correction.current_value || 'No current value'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-600">Proposed Change:</h4>
                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                      <span className="text-green-800">{correction.proposed_change}</span>
                    </div>
                  </div>
                </div>

                {correction.explanation && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-sm text-gray-600 mb-2">Explanation:</h4>
                    <p className="text-sm text-gray-700 italic">{correction.explanation}</p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>👍 {correction.votes_for || 0}</span>
                    <span>👎 {correction.votes_against || 0}</span>
                    <span>Reviews: {correction.reviewed_by?.length || 0}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleVoteWithComment(correction.id, 'approve')}
                      disabled={votingInProgress[correction.id] || correction.reviewed_by?.some(r => r.user_id === currentUser.uid)}
                    >
                      {votingInProgress[correction.id] ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : (
                        '👍 Approve'
                      )}
                    </button>
                    <button
                      className="btn btn-error btn-sm"
                      onClick={() => handleVoteWithComment(correction.id, 'reject')}
                      disabled={votingInProgress[correction.id] || correction.reviewed_by?.some(r => r.user_id === currentUser.uid)}
                    >
                      {votingInProgress[correction.id] ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : (
                        '👎 Reject'
                      )}
                    </button>
                  </div>
                </div>

                {correction.reviewed_by?.some(r => r.user_id === currentUser.uid) && (
                  <div className="mt-2">
                    <div className="alert alert-info alert-sm">
                      <span>You have already voted on this correction.</span>
                    </div>
                  </div>
                )}
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
              You can add an optional comment to explain your {currentVote?.vote === 'approve' ? 'approval' : 'rejection'} of this correction.
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
                disabled={votingInProgress[currentVote?.correctionId]}
              >
                {votingInProgress[currentVote?.correctionId] ? (
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

export default CommunityReview;
