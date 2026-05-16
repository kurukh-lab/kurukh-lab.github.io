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

type Tone = 'neutral' | 'info' | 'progress' | 'sage' | 'accent';

const statusTone: Record<string, Tone> = {
  draft: 'neutral',
  submitted: 'info',
  pendingCommunityReview: 'progress',
  inCommunityReview: 'progress',
  communityApproved: 'sage',
  communityRejected: 'accent',
  pendingAdminReview: 'info',
  inAdminReview: 'info',
  approved: 'sage',
  rejected: 'accent',
};

const toneStyle = (tone: Tone): React.CSSProperties => {
  switch (tone) {
    case 'sage':
      return {
        background: 'color-mix(in srgb, var(--kd-sage) 14%, transparent)',
        color: 'var(--kd-sage)',
      };
    case 'accent':
      return {
        background: 'var(--kd-accent-tint)',
        color: 'var(--kd-accent)',
      };
    case 'progress':
      return {
        background: 'color-mix(in srgb, #FEBC2E 22%, transparent)',
        color: 'var(--kd-ink)',
      };
    case 'info':
      return {
        background: 'var(--kd-surface-alt)',
        color: 'var(--kd-ink)',
      };
    default:
      return {
        background: 'var(--kd-surface-alt)',
        color: 'var(--kd-ink-soft)',
      };
  }
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

const STEPS: { label: string; match: string[] }[] = [
  { label: 'Draft', match: ['draft'] },
  { label: 'Submitted', match: ['submitted'] },
  { label: 'Community review', match: ['pendingCommunityReview', 'inCommunityReview'] },
  {
    label: 'Community decision',
    match: ['communityApproved', 'communityRejected'],
  },
  { label: 'Admin review', match: ['pendingAdminReview', 'inAdminReview'] },
  { label: 'Final decision', match: ['approved', 'rejected'] },
];

const REJECTED_STATES = new Set(['communityRejected', 'rejected']);

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
  const tone = statusTone[currentState] || 'neutral';
  const statusText = wordReview.getStatusText ? wordReview.getStatusText() : initialState;
  const context = wordReview.context || initialContext;
  const communityVotes = wordReview.getCommunityVotes
    ? wordReview.getCommunityVotes()
    : context.communityVotes || { for: 0, against: 0 };
  const history = (wordReview.getHistory ? wordReview.getHistory() : context.history || []) as Array<{
    timestamp?: { seconds?: number } | Date | null;
    action: string;
  }>;

  const activeStepIndex = STEPS.findIndex((s) => s.match.includes(currentState));
  const isRejected = REJECTED_STATES.has(currentState);

  if (isLoading) {
    return (
      <div
        className="kd-font-mono"
        style={{
          fontSize: 11,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--kd-ink-mute)',
        }}
      >
        Loading status…
      </div>
    );
  }
  if (error)
    return (
      <div
        className="kd-font-sans"
        style={{ color: 'var(--kd-accent)', fontSize: 14 }}
      >
        {error}
      </div>
    );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <span
          className="kd-font-mono"
          style={{
            fontSize: 11,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            padding: '4px 10px',
            borderRadius: 999,
            ...toneStyle(tone),
          }}
        >
          {statusText}
        </span>
        {wordReview.isRealTimeActive && (
          <span
            className="kd-font-mono inline-flex items-center gap-1.5"
            style={{
              fontSize: 10.5,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              padding: '3px 8px',
              borderRadius: 999,
              border: '1px solid var(--kd-line)',
              color: 'var(--kd-ink-soft)',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--kd-sage)',
              }}
            />
            Live
          </span>
        )}
      </div>

      <div className="overflow-x-auto -mx-1 px-1 pb-1">
        <div className="flex items-start gap-0 min-w-max">
          {STEPS.map((step, i) => {
            const isActive = i === activeStepIndex;
            const isDone = activeStepIndex >= 0 && i < activeStepIndex;
            const isFinalRejected = isActive && isRejected;
            let dotBg = 'var(--kd-surface-alt)';
            let dotColor = 'var(--kd-ink-mute)';
            let dotBorder = '1px solid var(--kd-line)';
            if (isActive) {
              dotBg = isFinalRejected ? 'var(--kd-accent)' : 'var(--kd-ink)';
              dotColor = '#FBF7EE';
              dotBorder = 'none';
            } else if (isDone) {
              dotBg = 'var(--kd-sage)';
              dotColor = '#FBF7EE';
              dotBorder = 'none';
            }
            return (
              <div
                key={step.label}
                className="flex items-start"
                style={{ flex: '0 0 auto' }}
              >
                <div className="flex flex-col items-center" style={{ width: 96 }}>
                  <div
                    className="kd-font-mono"
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: dotBg,
                      color: dotColor,
                      border: dotBorder,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {i + 1}
                  </div>
                  <span
                    className="kd-font-sans text-center mt-2 px-1"
                    style={{
                      fontSize: 11,
                      lineHeight: 1.3,
                      color: isActive ? 'var(--kd-ink)' : 'var(--kd-ink-soft)',
                      fontWeight: isActive ? 600 : 400,
                    }}
                  >
                    {step.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    aria-hidden="true"
                    style={{
                      height: 1,
                      width: 24,
                      marginTop: 13,
                      background: isDone ? 'var(--kd-sage)' : 'var(--kd-line)',
                      flex: '0 0 auto',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {['inCommunityReview', 'communityApproved', 'communityRejected'].includes(currentState) && (
        <div
          className="grid grid-cols-2 gap-3 rounded-xl p-4"
          style={{ background: 'var(--kd-bg)', border: '1px solid var(--kd-line)' }}
        >
          <div>
            <div
              className="kd-font-serif"
              style={{
                fontSize: 26,
                lineHeight: 1,
                color: 'var(--kd-sage)',
              }}
            >
              {communityVotes?.for || 0}
            </div>
            <div
              className="kd-font-mono mt-1.5"
              style={{
                fontSize: 10.5,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--kd-ink-mute)',
              }}
            >
              Approvals
            </div>
          </div>
          <div>
            <div
              className="kd-font-serif"
              style={{
                fontSize: 26,
                lineHeight: 1,
                color: 'var(--kd-accent)',
              }}
            >
              {communityVotes?.against || 0}
            </div>
            <div
              className="kd-font-mono mt-1.5"
              style={{
                fontSize: 10.5,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--kd-ink-mute)',
              }}
            >
              Flags
            </div>
          </div>
        </div>
      )}

      {history && history.length > 0 && (
        <div>
          <div className="kd-eyebrow mb-3">Review history</div>
          <ol className="flex flex-col gap-3">
            {history.map((event, index) => {
              const ts = event.timestamp;
              const dateStr =
                ts && typeof ts === 'object' && 'seconds' in ts && typeof ts.seconds === 'number'
                  ? new Date(ts.seconds * 1000).toLocaleString()
                  : ts instanceof Date
                    ? ts.toLocaleString()
                    : '';
              const isReject =
                event.action.includes('reject') || event.action.includes('Reject');
              return (
                <li key={index} className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      marginTop: 6,
                      background: isReject ? 'var(--kd-accent)' : 'var(--kd-sage)',
                      flex: '0 0 auto',
                    }}
                  />
                  <div className="min-w-0">
                    <div
                      className="kd-font-sans"
                      style={{ color: 'var(--kd-ink)', fontSize: 14 }}
                    >
                      {formatEventAction(event.action)}
                    </div>
                    {dateStr && (
                      <div
                        className="kd-font-mono mt-0.5"
                        style={{
                          fontSize: 11,
                          letterSpacing: '0.04em',
                          color: 'var(--kd-ink-mute)',
                        }}
                      >
                        {dateStr}
                      </div>
                    )}
                  </div>
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
