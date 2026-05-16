import { useEffect, useState } from 'react';
import { useWordReview } from '../hooks/useWordReview';
import {
  wordReviewService,
  type WordReviewMachineState,
  type WordReviewContext,
} from '../services/wordReviewService';

export interface WordReviewStatusProps {
  wordId: string;
  realTimeUpdates?: boolean;
}

const statusColors: Record<string, string> = {
  draft: 'badge-neutral',
  submitted: 'badge-info',
  pendingCommunityReview: 'badge-warning',
  inCommunityReview: 'badge-warning',
  communityApproved: 'badge-success',
  communityRejected: 'badge-error',
  pendingAdminReview: 'badge-primary',
  inAdminReview: 'badge-primary',
  approved: 'badge-success',
  rejected: 'badge-error',
};

const actionMap: Record<string, string> = {
  submitted: 'Word submitted',
  sent_to_admin_review: 'Sent for admin review',
  sent_to_community_review: 'Sent for community review',
  community_review_started: 'Community review started',
  admin_review_started: 'Admin review started',
  community_approve: 'Approved by community member',
  community_reject: 'Rejected by community member',
  community_approved: 'Approved by community',
  community_rejected: 'Rejected by community',
  admin_approved: 'Approved by admin',
  admin_rejected: 'Rejected by admin',
  admin_override: 'Admin intervention',
  sent_back_to_community: 'Sent back to community',
  report_submitted: 'Report submitted',
  report_resolved: 'Report resolved',
  correction_submitted: 'Correction submitted',
  correction_approved: 'Correction approved',
  correction_rejected: 'Correction rejected',
};

const formatEventAction = (action: string): string => actionMap[action] || action;

const WordReviewStatus = ({ wordId, realTimeUpdates = true }: WordReviewStatusProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialState, setInitialState] = useState<WordReviewMachineState>('submitted');
  const [initialContext, setInitialContext] = useState<Partial<WordReviewContext>>({});

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
        console.error('Failed to load word status:', err);
        setError("Could not load the word's review status");
      } finally {
        setIsLoading(false);
      }
    };
    fetchWordStatus();
  }, [wordId]);

  const wordReview = useWordReview({
    wordId,
    wordData: initialContext.wordData || null,
    useRealTimeUpdates: realTimeUpdates,
  });

  const currentState = (wordReview.state || initialState) as string;
  const statusColor = statusColors[currentState] || 'badge-neutral';
  const statusText = wordReview.getStatusText ? wordReview.getStatusText() : initialState;
  const context = wordReview.context || initialContext;
  const communityVotes = wordReview.getCommunityVotes
    ? wordReview.getCommunityVotes()
    : context.communityVotes || { for: 0, against: 0 };
  const history = (wordReview.getHistory ? wordReview.getHistory() : context.history || []) as Array<{
    timestamp?: { seconds?: number } | Date | null;
    action: string;
  }>;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <span className="loading loading-spinner loading-sm"></span>
        <span>Loading status...</span>
      </div>
    );
  }
  if (error) return <div className="text-error">{error}</div>;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="font-medium">Review Status:</h3>
        <div className={`badge ${statusColor}`}>{statusText}</div>
        {wordReview.isRealTimeActive && (
          <div className="badge badge-outline badge-sm">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
            Live Updates
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-2 items-center min-w-max py-3">
          {[
            { label: 'Draft', match: ['draft'] },
            { label: 'Submitted', match: ['submitted'] },
            { label: 'Community Review', match: ['pendingCommunityReview', 'inCommunityReview'] },
            { label: 'Community Decision', match: ['communityApproved', 'communityRejected'] },
            { label: 'Admin Review', match: ['pendingAdminReview', 'inAdminReview'] },
            { label: 'Final Decision', match: ['approved', 'rejected'] },
          ].map((step, i) => {
            const active = step.match.includes(currentState);
            return (
              <div key={step.label} className="flex items-center gap-2">
                <div className={`flex flex-col items-center ${active ? 'text-primary' : ''}`}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      active ? 'bg-primary text-white' : 'bg-base-200'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span className="text-xs mt-1">{step.label}</span>
                </div>
                {i < 5 && <div className="w-8 h-0.5 bg-base-200"></div>}
              </div>
            );
          })}
        </div>
      </div>

      {['inCommunityReview', 'communityApproved', 'communityRejected'].includes(currentState) && (
        <div className="mt-3">
          <h4 className="font-medium text-sm">Community Votes:</h4>
          <div className="flex items-center gap-4 text-sm">
            <span>👍 {communityVotes?.for || 0}</span>
            <span>👎 {communityVotes?.against || 0}</span>
          </div>
        </div>
      )}

      {history && history.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium text-sm mb-2">Review History:</h4>
          <ol className="timeline timeline-vertical timeline-compact">
            {history.map((event, index) => {
              const ts = event.timestamp;
              const dateStr =
                ts && typeof ts === 'object' && 'seconds' in ts && typeof ts.seconds === 'number'
                  ? new Date(ts.seconds * 1000).toLocaleString()
                  : ts instanceof Date
                    ? ts.toLocaleString()
                    : '';
              return (
                <li key={index} className="timeline-item">
                  <div className="timeline-middle">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                  </div>
                  <div className={`timeline-${index % 2 === 0 ? 'start' : 'end'} pr-4`}>
                    <div className="text-xs">{dateStr}</div>
                    <div className="text-sm">{formatEventAction(event.action)}</div>
                  </div>
                  <hr className={index === history.length - 1 ? 'hidden' : ''} />
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
};

export default WordReviewStatus;
