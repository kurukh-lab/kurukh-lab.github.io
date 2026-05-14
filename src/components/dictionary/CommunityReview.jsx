/**
 * CommunityReview — community voting on suggested corrections to existing words.
 * Behaviour preserved from the original: fetch corrections by state, optimistic
 * filtering on threshold votes, repeat-vote guard. Presentation rebuilt to KD theme:
 * paired "current → proposed" diff cards with sage/accent backgrounds, vote tracker
 * with five-slot approval avatars, sage Approve / ghost Reject actions.
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { getCorrectionsForReview, voteOnCorrection } from '../../services/dictionaryService';
import { formatDate } from '../../utils/wordUtils';
import StateFilter from '../StateFilter';
import StatusPill from '../kd/StatusPill';
import VoteTracker from '../kd/VoteTracker';
import CommentModal from '../kd/CommentModal';

const initialsOf = (name) =>
  (name || '')
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

const correctionStateTone = (value) => {
  switch (value) {
    case 'approved':
    case 'applied':
      return 'sage';
    case 'rejected':
      return 'neutral';
    case 'shallow_review':
    default:
      return 'accent';
  }
};

const CommunityReview = () => {
  const { t } = useTranslation();
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

  const correctionStates = [
    { value: 'shallow_review', label: t('review.corrections.stateLabels.shallow_review'), tone: 'accent' },
    { value: 'approved', label: t('review.corrections.stateLabels.approved'), tone: 'sage' },
    { value: 'rejected', label: t('review.corrections.stateLabels.rejected'), tone: 'neutral' },
    { value: 'applied', label: t('review.corrections.stateLabels.applied'), tone: 'sage' },
  ];

  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;
    const run = async () => {
      try {
        setLoading(true);
        const data = await getCorrectionsForReview(20, selectedStates.length > 0 ? selectedStates : null);
        if (!cancelled) setCorrections(data);
      } catch (err) {
        console.error('Error fetching corrections:', err);
        if (!cancelled) setError('Failed to load corrections for review. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [currentUser, selectedStates]);

  const handleVote = async (correctionId, vote, comment = '') => {
    if (!currentUser) return;
    setVotingInProgress((prev) => ({ ...prev, [correctionId]: true }));
    setError(null);
    try {
      const result = await voteOnCorrection(correctionId, currentUser.uid, vote, comment);
      if (result.success) {
        setSuccessMessage(result.message);
        if (result.message?.includes('approved') || result.message?.includes('rejected')) {
          setCorrections((prev) => prev.filter((c) => c.id !== correctionId));
        }
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error voting:', err);
      setError('An error occurred while submitting your vote. Please try again.');
    } finally {
      setVotingInProgress((prev) => ({ ...prev, [correctionId]: false }));
    }
  };

  const openVoteModal = (correctionId, vote) => {
    setCurrentVote({ correctionId, vote });
    setVoteComment('');
    setShowCommentModal(true);
  };

  const submitVote = async () => {
    if (!currentVote) return;
    await handleVote(currentVote.correctionId, currentVote.vote, voteComment);
    setShowCommentModal(false);
    setCurrentVote(null);
    setVoteComment('');
  };

  if (!currentUser) {
    return (
      <div
        role="alert"
        className="kd-font-sans px-4 py-3 rounded-xl"
        style={{
          background: 'var(--kd-accent-tint)',
          color: 'var(--kd-accent)',
          border: '1px solid color-mix(in srgb, var(--kd-accent) 40%, transparent)',
        }}
      >
        {t('review.loginRequired')}
      </div>
    );
  }

  return (
    <div>
      <p
        className="kd-font-serif mb-6"
        style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--kd-ink-soft)' }}
      >
        {t('review.introCorrections')}
      </p>

      <div className="mb-6">
        <StateFilter
          states={correctionStates}
          selectedStates={selectedStates}
          onSelectionChange={setSelectedStates}
          title={t('review.filterTitleCorrections')}
          multiSelect
          disabled={loading}
        />
      </div>

      {successMessage && (
        <div
          role="status"
          className="kd-font-sans mb-5 px-4 py-3 rounded-xl"
          style={{
            background: 'color-mix(in srgb, var(--kd-sage) 15%, transparent)',
            color: 'var(--kd-sage)',
            border: '1px solid color-mix(in srgb, var(--kd-sage) 40%, transparent)',
          }}
        >
          {successMessage}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="kd-font-sans mb-5 px-4 py-3 rounded-xl"
          style={{
            background: 'var(--kd-accent-tint)',
            color: 'var(--kd-accent)',
            border: '1px solid color-mix(in srgb, var(--kd-accent) 40%, transparent)',
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg" style={{ color: 'var(--kd-accent)' }} />
        </div>
      ) : corrections.length === 0 ? (
        <div
          className="p-10 rounded-2xl text-center"
          style={{ background: 'var(--kd-surface)', border: '1px solid var(--kd-line)' }}
        >
          <p
            className="kd-font-serif italic"
            style={{ fontSize: 17, color: 'var(--kd-ink-soft)', margin: 0 }}
          >
            {t('review.empty')}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {corrections.map((correction) => (
            <CorrectionCard
              key={correction.id}
              correction={correction}
              currentUser={currentUser}
              voting={!!votingInProgress[correction.id]}
              onVote={(vote) => openVoteModal(correction.id, vote)}
            />
          ))}
        </div>
      )}

      <CommentModal
        open={showCommentModal}
        vote={currentVote?.vote}
        comment={voteComment}
        onCommentChange={setVoteComment}
        onConfirm={submitVote}
        onCancel={() => {
          setShowCommentModal(false);
          setCurrentVote(null);
          setVoteComment('');
        }}
        submitting={!!votingInProgress[currentVote?.correctionId]}
      />
    </div>
  );
};

// ─── Single correction card ───
const CorrectionCard = ({ correction, currentUser, voting, onVote }) => {
  const { t } = useTranslation();
  const hasVoted = correction.reviewed_by?.some((r) => r.user_id === currentUser.uid);
  const disabled = voting || hasVoted;
  const approvals = correction.votes_for || 0;
  const rejections = correction.votes_against || 0;
  const initials = (correction.reviewed_by || []).map((r) =>
    initialsOf(r.displayName || r.username || r.email || ''),
  );

  return (
    <article
      className="p-6 md:p-7 rounded-2xl"
      style={{ background: 'var(--kd-surface)', border: '1px solid var(--kd-line)' }}
    >
      <div className="grid gap-6 md:grid-cols-[1fr_220px]">
        <div className="min-w-0">
          <div className="flex items-baseline gap-3.5 flex-wrap">
            <span
              className="kd-font-serif"
              style={{
                fontWeight: 500,
                fontSize: 'clamp(28px, 3vw, 36px)',
                color: 'var(--kd-ink)',
                letterSpacing: '-0.025em',
                lineHeight: 1,
              }}
            >
              {correction.word?.kurukh_word || '—'}
            </span>
            <span
              className="kd-font-sans"
              style={{
                padding: '3px 10px',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: '0.04em',
                background: 'var(--kd-accent-tint)',
                color: 'var(--kd-accent)',
              }}
            >
              {t(`review.corrections.types.${correction.correction_type}`, {
                defaultValue: correction.correction_type,
              })}
            </span>
          </div>

          {/* Current → Proposed diff */}
          <div className="grid md:grid-cols-2 gap-3 mt-5">
            <DiffBlock
              eyebrow={t('review.corrections.currentValue')}
              value={correction.current_value || t('review.corrections.noCurrent')}
              tone="muted"
            />
            <DiffBlock
              eyebrow={t('review.corrections.proposedChange')}
              value={correction.proposed_change}
              tone="accent"
            />
          </div>

          {correction.explanation && (
            <div className="mt-4">
              <div
                className="kd-eyebrow mb-1.5"
                style={{ color: 'var(--kd-ink-mute)' }}
              >
                {t('review.corrections.explanation')}
              </div>
              <p
                className="kd-font-serif italic"
                style={{ fontSize: 16, lineHeight: 1.5, color: 'var(--kd-ink-soft)', margin: 0 }}
              >
                {correction.explanation}
              </p>
            </div>
          )}

          {/* Submitted + status */}
          <div
            className="mt-4 flex items-center gap-2.5 flex-wrap kd-font-sans"
            style={{ fontSize: 12.5, color: 'var(--kd-ink-mute)' }}
          >
            {correction.createdAt && (
              <span>{t('review.submittedOn', { date: formatDate(correction.createdAt) })}</span>
            )}
            {correction.status && (
              <>
                <span>·</span>
                <StatusPill tone={correctionStateTone(correction.status)}>
                  {t(`review.corrections.stateLabels.${correction.status}`, {
                    defaultValue: correction.status,
                  })}
                </StatusPill>
              </>
            )}
          </div>
        </div>

        {/* Tracker + actions */}
        <div className="flex flex-col gap-2.5">
          <VoteTracker
            approvals={approvals}
            voterInitials={initials}
            label={t('review.card.approvalsLabel')}
          />
          {rejections > 0 && (
            <div
              className="kd-font-mono px-3 py-2 rounded-lg flex justify-between items-baseline"
              style={{
                background: 'var(--kd-accent-tint)',
                color: 'var(--kd-accent)',
                fontSize: 12,
              }}
            >
              <span style={{ letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: 10 }}>
                {t('review.votesAgainstLabel')}
              </span>
              <span style={{ fontWeight: 600 }}>{rejections}</span>
            </div>
          )}

          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => onVote('approve')}
              disabled={disabled}
              className="flex-1 inline-flex items-center justify-center gap-1.5 kd-font-sans font-semibold py-2.5 rounded-[10px] disabled:opacity-50"
              style={{ background: 'var(--kd-sage)', color: '#FBF7EE', fontSize: 13, cursor: disabled ? 'not-allowed' : 'pointer' }}
            >
              {voting ? '…' : t('review.card.approve')}
            </button>
            <button
              type="button"
              onClick={() => onVote('reject')}
              disabled={disabled}
              className="flex-1 inline-flex items-center justify-center gap-1.5 kd-font-sans font-medium py-2.5 rounded-[10px] disabled:opacity-50"
              style={{
                background: 'transparent',
                color: 'var(--kd-ink)',
                border: '1px solid var(--kd-line)',
                fontSize: 13,
                cursor: disabled ? 'not-allowed' : 'pointer',
              }}
            >
              {t('review.card.reject')}
            </button>
          </div>

          {hasVoted && (
            <p
              className="kd-font-sans"
              style={{ fontSize: 12, color: 'var(--kd-ink-mute)', lineHeight: 1.5, margin: 0 }}
            >
              {t('review.alreadyVotedCorrection')}
            </p>
          )}
        </div>
      </div>
    </article>
  );
};

const DiffBlock = ({ eyebrow, value, tone }) => {
  const styles =
    tone === 'accent'
      ? {
          background: 'color-mix(in srgb, var(--kd-sage) 12%, transparent)',
          color: 'var(--kd-ink)',
          border: '1px solid color-mix(in srgb, var(--kd-sage) 25%, transparent)',
        }
      : {
          background: 'var(--kd-surface-alt)',
          color: 'var(--kd-ink-soft)',
          border: '1px solid var(--kd-line)',
        };
  return (
    <div>
      <div className="kd-eyebrow mb-1.5" style={{ color: 'var(--kd-ink-mute)' }}>
        {eyebrow}
      </div>
      <div
        className="kd-font-serif rounded-xl px-4 py-3"
        style={{ ...styles, fontSize: 16, lineHeight: 1.5 }}
      >
        {value}
      </div>
    </div>
  );
};

export default CommunityReview;
