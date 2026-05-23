import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { getWordsForCommunityReview, voteOnWord } from '../../services/dictionaryService';
import { formatDate } from '../../utils/wordUtils';
import StateFilter from '../StateFilter';
import CommentThread from '../CommentThread';
import StatusPill, { type PillTone } from '../kd/StatusPill';
import VoteTracker from '../kd/VoteTracker';
import CommentModal from '../kd/CommentModal';
import WordCard from '../kd/WordCard';
import type { Word } from '../../types';
import type { AuthedUser } from '../../contexts/AuthContext';

type WordWithExtras = Word & {
  pronunciation?: string;
  contributorName?: string;
  contributor_name?: string;
  contributor_displayName?: string;
};

const initialsOf = (name: string): string =>
  (name || '')
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

const stateTone = (value?: string): PillTone => {
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

type Vote = 'approve' | 'reject';

const WordCommunityReview = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [words, setWords] = useState<WordWithExtras[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [votingInProgress, setVotingInProgress] = useState<Record<string, boolean>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedStates, setSelectedStates] = useState<string[]>([
    'community_review',
    'in_community_review',
  ]);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [currentVote, setCurrentVote] = useState<{ wordId: string; vote: Vote } | null>(null);
  const [voteComment, setVoteComment] = useState('');
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});

  const wordStates = [
    { value: 'community_review', label: t('review.stateLabels.community_review'), tone: 'accent' as PillTone },
    { value: 'in_community_review', label: t('review.stateLabels.in_community_review'), tone: 'accent' as PillTone },
    { value: 'pending_review', label: t('review.stateLabels.pending_review'), tone: 'violet' as PillTone },
    { value: 'community_approved', label: t('review.stateLabels.community_approved'), tone: 'sage' as PillTone },
    { value: 'community_rejected', label: t('review.stateLabels.community_rejected'), tone: 'neutral' as PillTone },
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
        if (!cancelled) setWords(wordsData as WordWithExtras[]);
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

  const handleVote = async (wordId: string, vote: Vote, comment = '') => {
    if (!currentUser) return;
    setVotingInProgress((prev) => ({ ...prev, [wordId]: true }));
    setError(null);
    try {
      const result = await voteOnWord(wordId, currentUser.uid, vote, comment);
      if (result.success) {
        setSuccessMessage(result.message ?? null);
        if (
          result.message?.includes('approved') ||
          result.message?.includes('rejected')
        ) {
          setWords((prev) => prev.filter((w) => w.id !== wordId));
        }
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(result.error ?? null);
      }
    } catch (err) {
      console.error('Error voting:', err);
      setError('An error occurred while submitting your vote. Please try again.');
    } finally {
      setVotingInProgress((prev) => ({ ...prev, [wordId]: false }));
    }
  };

  const openVoteModal = (wordId: string, vote: Vote) => {
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

  const toggleComments = (wordId: string) => {
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
          title={t('review.filterTitle') as string}
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
        vote={currentVote?.vote ?? 'approve'}
        comment={voteComment}
        onCommentChange={setVoteComment}
        onConfirm={submitVote}
        onCancel={() => {
          setShowCommentModal(false);
          setCurrentVote(null);
          setVoteComment('');
        }}
        submitting={!!(currentVote && votingInProgress[currentVote.wordId])}
      />
    </div>
  );
};

interface ReviewCardProps {
  word: WordWithExtras;
  currentUser: AuthedUser;
  voting: boolean;
  onVote: (vote: Vote) => void;
  commentsOpen: boolean;
  onToggleComments: () => void;
}

const ReviewCard = ({
  word,
  currentUser,
  voting,
  onVote,
  commentsOpen,
  onToggleComments,
}: ReviewCardProps) => {
  const { t } = useTranslation();
  const isOwn = word.contributor_id === currentUser.uid;
  const hasVoted = word.reviewed_by?.some((r) => r.user_id === currentUser.uid);
  const disabled = voting || isOwn || hasVoted;

  const approvals = word.community_votes_for || 0;
  const rejections = word.community_votes_against || 0;
  const reviewerNames = (word.reviewed_by || []).map((r) => {
    const rec = r as { displayName?: string; username?: string; email?: string };
    return rec.displayName || rec.username || rec.email || '';
  });
  const initials = reviewerNames.map(initialsOf);

  const contributorDisplay =
    word.contributorName || word.contributor_name || word.contributor_displayName || '';

  const metaLine = (
    <div className="flex items-center gap-2.5 flex-wrap">
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
        <span style={{ color: 'var(--kd-ink-soft)', fontWeight: 500 }}>
          {contributorDisplay}
        </span>
      )}
      {contributorDisplay && word.createdAt && <span>·</span>}
      {word.createdAt && (
        <span>{t('review.submittedOn', { date: formatDate(word.createdAt) })}</span>
      )}
    </div>
  );

  const statusPill = word.status ? (
    <StatusPill tone={stateTone(word.status)}>
      {t(`review.stateLabels.${word.status}`, { defaultValue: word.status })}
    </StatusPill>
  ) : null;

  return (
    <article
      className="p-6 md:p-7 rounded-2xl"
      style={{ background: 'var(--kd-surface)', border: '1px solid var(--kd-line)' }}
    >
      <div className="grid gap-6 md:grid-cols-[1fr_220px]">
        <WordCard
          word={word}
          variant="card"
          unstyled
          linkTo={`/review/${word.id}`}
          meta={metaLine}
          metaEnd={statusPill}
        />

        <div className="flex flex-col gap-2.5">
          <VoteTracker
            approvals={approvals}
            voterInitials={initials}
            label={t('review.card.approvalsLabel') as string}
          />

          {rejections > 0 && (
            <div
              className="kd-font-mono px-3 py-2 rounded-lg flex justify-between items-baseline"
              style={{ background: 'var(--kd-accent-tint)', color: 'var(--kd-accent)', fontSize: 12 }}
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
              style={{
                background: 'var(--kd-sage)',
                color: '#FBF7EE',
                fontSize: 13,
                cursor: disabled ? 'not-allowed' : 'pointer',
              }}
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
