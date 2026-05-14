/**
 * WordCommunityReview — community voting on new word submissions.
 *
 * Behaviour preserved from the original: real-time word fetch, optimistic
 * filtering on successful votes, self-vote / repeat-vote guards. Only the
 * presentation is rebuilt to match the KD design (vote-tracker card,
 * five-slot approval avatars, sage/accent buttons, accent-edged example).
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { getWordsForCommunityReview, voteOnWord } from '../../services/dictionaryService';
import { formatDate } from '../../utils/wordUtils';
import StateFilter from '../StateFilter';
import CommentThread from '../CommentThread';
import StatusPill from '../kd/StatusPill';
import VoteTracker from '../kd/VoteTracker';
import CommentModal from '../kd/CommentModal';
import { IconSpeaker } from '../kd/icons';

const initialsOf = (name) =>
  (name || '')
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

const stateTone = (value) => {
  switch (value) {
    case 'community_review':
    case 'in_community_review':
      return 'accent';
    case 'pending_review':
      return 'violet';
    case 'community_approved':
      return 'sage';
    case 'community_rejected':
      return 'neutral';
    default:
      return 'neutral';
  }
};

const WordCommunityReview = () => {
  const { t } = useTranslation();
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
  const [openComments, setOpenComments] = useState({});

  const wordStates = [
    { value: 'community_review', label: t('review.stateLabels.community_review'), tone: 'accent' },
    { value: 'in_community_review', label: t('review.stateLabels.in_community_review'), tone: 'accent' },
    { value: 'pending_review', label: t('review.stateLabels.pending_review'), tone: 'violet' },
    { value: 'community_approved', label: t('review.stateLabels.community_approved'), tone: 'sage' },
    { value: 'community_rejected', label: t('review.stateLabels.community_rejected'), tone: 'neutral' },
  ];

  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;
    const fetchWords = async () => {
      try {
        setLoading(true);
        const wordsData = await getWordsForCommunityReview(
          20,
          selectedStates.length > 0 ? selectedStates : null,
        );
        if (!cancelled) setWords(wordsData);
      } catch (err) {
        console.error('Error fetching words:', err);
        if (!cancelled) setError('Failed to load words for review. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchWords();
    return () => {
      cancelled = true;
    };
  }, [currentUser, selectedStates]);

  const handleVote = async (wordId, vote, comment = '') => {
    if (!currentUser) return;
    setVotingInProgress((prev) => ({ ...prev, [wordId]: true }));
    setError(null);
    try {
      const result = await voteOnWord(wordId, currentUser.uid, vote, comment);
      if (result.success) {
        setSuccessMessage(result.message);
        // Remove from local list once a threshold is crossed
        if (result.message?.includes('approved') || result.message?.includes('rejected')) {
          setWords((prev) => prev.filter((w) => w.id !== wordId));
        }
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error voting:', err);
      setError('An error occurred while submitting your vote. Please try again.');
    } finally {
      setVotingInProgress((prev) => ({ ...prev, [wordId]: false }));
    }
  };

  const openVoteModal = (wordId, vote) => {
    setCurrentVote({ wordId, vote });
    setVoteComment('');
    setShowCommentModal(true);
  };

  const submitVote = async () => {
    if (!currentVote) return;
    await handleVote(currentVote.wordId, currentVote.vote, voteComment);
    setShowCommentModal(false);
    setCurrentVote(null);
    setVoteComment('');
  };

  const toggleComments = (wordId) => {
    setOpenComments((prev) => ({ ...prev, [wordId]: !prev[wordId] }));
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
        {t('review.intro')}
      </p>

      <div className="mb-6">
        <StateFilter
          states={wordStates}
          selectedStates={selectedStates}
          onSelectionChange={setSelectedStates}
          title={t('review.filterTitle')}
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
      ) : words.length === 0 ? (
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
          {words.map((word) => (
            <ReviewCard
              key={word.id}
              word={word}
              currentUser={currentUser}
              voting={!!votingInProgress[word.id]}
              onVote={(vote) => openVoteModal(word.id, vote)}
              commentsOpen={openComments[word.id] || false}
              onToggleComments={() => toggleComments(word.id)}
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
        submitting={!!votingInProgress[currentVote?.wordId]}
      />
    </div>
  );
};

// ─── Single review card ───
const ReviewCard = ({ word, currentUser, voting, onVote, commentsOpen, onToggleComments }) => {
  const { t } = useTranslation();
  const isOwn = word.contributor_id === currentUser.uid;
  const hasVoted = word.reviewed_by?.some((r) => r.user_id === currentUser.uid);
  const disabled = voting || isOwn || hasVoted;

  const approvals = word.community_votes_for || 0;
  const rejections = word.community_votes_against || 0;
  const reviewerNames = (word.reviewed_by || []).map((r) => r.displayName || r.username || r.email || '');
  const initials = reviewerNames.map(initialsOf);

  const contributorDisplay =
    word.contributorName || word.contributor_name || word.contributor_displayName || '';

  return (
    <article
      className="p-6 md:p-7 rounded-2xl"
      style={{ background: 'var(--kd-surface)', border: '1px solid var(--kd-line)' }}
    >
      <div className="grid gap-6 md:grid-cols-[1fr_220px]">
        {/* ─── Left: the word + meanings ─── */}
        <div className="min-w-0">
          <div className="flex items-baseline gap-3.5 flex-wrap">
            <span
              className="kd-font-serif"
              style={{
                fontWeight: 500,
                fontSize: 'clamp(34px, 4vw, 44px)',
                color: 'var(--kd-ink)',
                letterSpacing: '-0.025em',
                lineHeight: 1,
              }}
            >
              {word.kurukh_word}
            </span>
            {word.pronunciation && (
              <span className="kd-font-mono" style={{ fontSize: 14, color: 'var(--kd-ink-soft)' }}>
                /{word.pronunciation}/
              </span>
            )}
            {word.part_of_speech && (
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
                {word.part_of_speech}
              </span>
            )}
            <button
              type="button"
              aria-label="play pronunciation"
              className="inline-flex items-center justify-center"
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: '1px solid var(--kd-line)',
                background: 'var(--kd-bg)',
                color: 'var(--kd-ink)',
                cursor: 'pointer',
              }}
            >
              <IconSpeaker size={14} />
            </button>
          </div>

          {/* Meanings */}
          <div className="mt-4 flex flex-col gap-3">
            {(word.meanings || []).map((m, i) => (
              <div key={i}>
                <div
                  className="kd-eyebrow mb-1"
                  style={{ color: 'var(--kd-ink-mute)' }}
                >
                  {m.language === 'hi' ? t('word.hindi') : t('word.english')}
                </div>
                <p
                  className="kd-font-serif"
                  style={{ fontSize: 18, color: 'var(--kd-ink)', lineHeight: 1.5, margin: 0 }}
                >
                  {m.definition}
                </p>
                {m.example_sentence_kurukh && (
                  <div
                    className="mt-3 px-4 py-3 rounded-xl"
                    style={{
                      background: 'var(--kd-bg)',
                      border: '1px solid var(--kd-line)',
                      borderLeft: '3px solid var(--kd-accent)',
                    }}
                  >
                    <p
                      className="kd-font-serif italic"
                      style={{ fontSize: 16, color: 'var(--kd-ink)', margin: 0, lineHeight: 1.4 }}
                    >
                      “{m.example_sentence_kurukh}”
                    </p>
                    {m.example_sentence_translation && (
                      <p
                        className="kd-font-sans mt-1"
                        style={{ fontSize: 13, color: 'var(--kd-ink-soft)', margin: 0 }}
                      >
                        {m.example_sentence_translation}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contributor + submitted */}
          <div
            className="mt-4 flex items-center gap-2.5 flex-wrap kd-font-sans"
            style={{ fontSize: 12.5, color: 'var(--kd-ink-mute)' }}
          >
            <span
              className="kd-font-serif inline-flex items-center justify-center"
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: 'var(--kd-accent-soft)',
                color: '#FFF',
                fontWeight: 600,
                fontSize: 10,
              }}
            >
              {initialsOf(contributorDisplay) || '·'}
            </span>
            {contributorDisplay && (
              <span style={{ color: 'var(--kd-ink-soft)', fontWeight: 500 }}>{contributorDisplay}</span>
            )}
            {contributorDisplay && <span>·</span>}
            {word.createdAt && <span>{t('review.submittedOn', { date: formatDate(word.createdAt) })}</span>}
            {word.status && (
              <>
                <span>·</span>
                <StatusPill tone={stateTone(word.status)}>
                  {t(`review.stateLabels.${word.status}`, { defaultValue: word.status })}
                </StatusPill>
              </>
            )}
          </div>
        </div>

        {/* ─── Right: tracker + actions ─── */}
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

          {isOwn && (
            <p
              className="kd-font-sans"
              style={{ fontSize: 12, color: 'var(--kd-ink-mute)', lineHeight: 1.5, margin: 0 }}
            >
              {t('review.ownContribution')}
            </p>
          )}
          {!isOwn && hasVoted && (
            <p
              className="kd-font-sans"
              style={{ fontSize: 12, color: 'var(--kd-ink-mute)', lineHeight: 1.5, margin: 0 }}
            >
              {t('review.alreadyVoted')}
            </p>
          )}
        </div>
      </div>

      {/* Comment thread */}
      <CommentThread
        wordId={word.id}
        word={word}
        isOpen={commentsOpen}
        onToggle={onToggleComments}
      />
    </article>
  );
};

export default WordCommunityReview;
