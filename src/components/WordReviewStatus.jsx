import React, { useEffect, useState } from 'react';
import { useWordReview } from '../hooks/useWordReview';
import { wordReviewService } from '../services/wordReviewService';

/**
 * Component to display the current review status of a word
 * Shows the state machine visualization and current state
 * 
 * @param {Object} props - Component props
 * @param {string} props.wordId - ID of the word to display status for
 * @param {boolean} props.realTimeUpdates - Whether to use real-time updates (default: true)
 */
const WordReviewStatus = ({ wordId, realTimeUpdates = true }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialState, setInitialState] = useState('submitted');
  const [initialContext, setInitialContext] = useState({});

  // Load the word's current state from Firestore
  useEffect(() => {
    const fetchWordStatus = async () => {
      if (!wordId) return;

      try {
        setIsLoading(true);
        setError(null);

        const result = await wordReviewService.loadWordStatus(wordId);
        setInitialState(result.state);
        setInitialContext(result.context);
      } catch (err) {
        console.error("Failed to load word status:", err);
        setError("Could not load the word's review status");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWordStatus();
  }, [wordId]);

  // Initialize the state machine with the loaded state and enable real-time updates if requested
  const wordReview = useWordReview({
    wordId,
    wordData: initialContext.wordData || null,
    useRealTimeUpdates: realTimeUpdates
  });

  // Helper function to get appropriate badge color for status
  const getStatusColor = (status) => {
    const statusColors = {
      'draft': 'badge-neutral',
      'submitted': 'badge-info',
      'pendingCommunityReview': 'badge-warning',
      'inCommunityReview': 'badge-warning',
      'communityApproved': 'badge-success',
      'communityRejected': 'badge-error',
      'pendingAdminReview': 'badge-primary',
      'inAdminReview': 'badge-primary',
      'approved': 'badge-success',
      'rejected': 'badge-error'
    };

    return statusColors[status] || 'badge-neutral';
  };

  // Use the status from the state machine if available, otherwise use the initially loaded state
  const currentState = wordReview.state || initialState;
  const statusColor = getStatusColor(currentState);
  const statusText = wordReview.getStatusText ? wordReview.getStatusText() : initialState;

  // Use context from the state machine if available, otherwise use the initially loaded context
  const context = wordReview.context || initialContext;
  const communityVotes = wordReview.getCommunityVotes ? wordReview.getCommunityVotes() : context.communityVotes || {};
  const history = wordReview.getHistory ? wordReview.getHistory() : context.history || [];

  if (isLoading) {
    return <div className="flex items-center gap-2">
      <span className="loading loading-spinner loading-sm"></span>
      <span>Loading status...</span>
    </div>;
  }

  if (error) {
    return <div className="text-error">{error}</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="font-medium">Review Status:</h3>
        <div className={`badge ${statusColor}`}>
          {statusText}
        </div>
        {wordReview.isRealTimeActive && (
          <div className="badge badge-outline badge-sm">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
            Live Updates
          </div>
        )}
      </div>

      {/* Visualization of the workflow */}
      <div className="overflow-x-auto">
        <div className="flex gap-2 items-center min-w-max py-3">
          <div className={`flex flex-col items-center ${currentState === 'draft' ? 'text-primary' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentState === 'draft' ? 'bg-primary text-white' : 'bg-base-200'}`}>1</div>
            <span className="text-xs mt-1">Draft</span>
          </div>

          <div className="w-8 h-0.5 bg-base-200"></div>

          <div className={`flex flex-col items-center ${currentState === 'submitted' ? 'text-primary' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentState === 'submitted' ? 'bg-primary text-white' : 'bg-base-200'}`}>2</div>
            <span className="text-xs mt-1">Submitted</span>
          </div>

          <div className="w-8 h-0.5 bg-base-200"></div>

          <div className={`flex flex-col items-center ${['pendingCommunityReview', 'inCommunityReview'].includes(currentState) ? 'text-primary' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${['pendingCommunityReview', 'inCommunityReview'].includes(currentState) ? 'bg-primary text-white' : 'bg-base-200'}`}>3</div>
            <span className="text-xs mt-1">Community Review</span>
          </div>

          <div className="w-8 h-0.5 bg-base-200"></div>

          <div className={`flex flex-col items-center ${['communityApproved', 'communityRejected'].includes(currentState) ? 'text-primary' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${['communityApproved', 'communityRejected'].includes(currentState) ? 'bg-primary text-white' : 'bg-base-200'}`}>4</div>
            <span className="text-xs mt-1">Community Decision</span>
          </div>

          <div className="w-8 h-0.5 bg-base-200"></div>

          <div className={`flex flex-col items-center ${['pendingAdminReview', 'inAdminReview'].includes(currentState) ? 'text-primary' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${['pendingAdminReview', 'inAdminReview'].includes(currentState) ? 'bg-primary text-white' : 'bg-base-200'}`}>5</div>
            <span className="text-xs mt-1">Admin Review</span>
          </div>

          <div className="w-8 h-0.5 bg-base-200"></div>

          <div className={`flex flex-col items-center ${['approved', 'rejected'].includes(currentState) ? 'text-primary' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${['approved', 'rejected'].includes(currentState) ? 'bg-primary text-white' : 'bg-base-200'}`}>6</div>
            <span className="text-xs mt-1">Final Decision</span>
          </div>
        </div>
      </div>

      {/* Show community votes if applicable */}
      {['inCommunityReview', 'communityApproved', 'communityRejected'].includes(currentState) && (
        <div className="mt-3">
          <h4 className="font-medium text-sm">Community Votes:</h4>
          <div className="flex items-center gap-4 text-sm">
            <span>👍 {communityVotes?.for || 0}</span>
            <span>👎 {communityVotes?.against || 0}</span>
          </div>
        </div>
      )}

      {/* History log */}
      {history && history.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium text-sm mb-2">Review History:</h4>
          <ol className="timeline timeline-vertical timeline-compact">
            {history.map((event, index) => (
              <li key={index} className="timeline-item">
                <div className="timeline-middle">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
                <div className={`timeline-${index % 2 === 0 ? 'start' : 'end'} pr-4`}>
                  <div className="text-xs">{new Date(event.timestamp.seconds * 1000).toLocaleString()}</div>
                  <div className="text-sm">{formatEventAction(event.action)}</div>
                </div>
                <hr className={index === history.length - 1 ? 'hidden' : ''} />
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

// Helper to format the event action for display
const formatEventAction = (action) => {
  const actionMap = {
    'submitted': 'Word submitted',
    'sent_to_admin_review': 'Sent for admin review',
    'sent_to_community_review': 'Sent for community review',
    'community_review_started': 'Community review started',
    'admin_review_started': 'Admin review started',
    'community_approve': 'Approved by community member',
    'community_reject': 'Rejected by community member',
    'community_approved': 'Approved by community',
    'community_rejected': 'Rejected by community',
    'admin_approved': 'Approved by admin',
    'admin_rejected': 'Rejected by admin',
    'admin_override': 'Admin intervention',
    'sent_back_to_community': 'Sent back to community',
    'report_submitted': 'Report submitted',
    'report_resolved': 'Report resolved',
    'correction_submitted': 'Correction submitted',
    'correction_approved': 'Correction approved',
    'correction_rejected': 'Correction rejected'
  };

  return actionMap[action] || action;
};

export default WordReviewStatus;
