import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { getWordById, voteOnWord } from '../services/dictionaryService';
import { formatDate } from '../utils/wordUtils';
import StatusPill, { type PillTone } from '../components/kd/StatusPill';
import VoteTracker from '../components/kd/VoteTracker';
import CommentModal from '../components/kd/CommentModal';
import CommentThread from '../components/CommentThread';
import WordFlowDiagram from '../components/kd/WordFlowDiagram';
import { IconBack, IconSpeaker } from '../components/kd/icons';
import type { Word } from '../types';

type WordWithExtras = Word & {
  pronunciation?: string;
  contributorName?: string;
  contributor_name?: string;
  contributor_displayName?: string;
};

type Vote = 'approve' | 'reject';

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
    case 'in_admin_review':
      return 'violet';
    case 'community_approved':
    case 'approved':
      return 'sage';
    case 'community_rejected':
    case 'rejected':
      return 'neutral';
    default:
      return 'neutral';
  }
};

const VOTABLE_STATES = new Set(['community_review', 'in_community_review']);

const WordReview = () => {
  const { wordId } = useParams<{ wordId: string }>();
  const { t } = useTranslation();
  const { currentUser } = useAuth();

  const [word, setWord] = useState<WordWithExtras | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pendingVote, setPendingVote] = useState<Vote | null>(null);
  const [voteComment, setVoteComment] = useState('');

  useEffect(() => {
    if (!wordId) return;
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getWordById(wordId);
        if (!cancelled) {
          if (!result) {
            setError(t('review.notFound', { defaultValue: 'Word not found.' }) as string);
          } else {
            setWord(result as WordWithExtras);
          }
        }
      } catch (err) {
        console.error('Error loading word for review:', err);
        if (!cancelled) {
          setError(
            t('review.loadError', {
              defaultValue: 'Failed to load this word. Please try again.',
            }) as string,
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [wordId, t]);

  const submitVote = async () => {
    if (!currentUser || !word || !pendingVote) return;
    setVoting(true);
    setError(null);
    try {
      const result = await voteOnWord(word.id, currentUser.uid, pendingVote, voteComment);
      if (result.success) {
        setSuccessMessage(result.message ?? null);
        const refreshed = await getWordById(word.id);
        if (refreshed) setWord(refreshed as WordWithExtras);
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setError(result.error ?? null);
      }
    } catch (err) {
      console.error('Error submitting vote:', err);
      setError(
        t('review.voteError', {
          defaultValue: 'An error occurred while submitting your vote. Please try again.',
        }) as string,
      );
    } finally {
      setVoting(false);
      setPendingVote(null);
      setVoteComment('');
    }
  };

  return (
    <div style={{ background: 'var(--kd-bg)', color: 'var(--kd-ink)', minHeight: '100vh' }}>
      <section className="max-w-[1100px] mx-auto px-6 md:px-12 pt-10 pb-24">
        <Link
          to="/review"
          className="inline-flex items-center gap-1.5 kd-font-sans"
          style={{ color: 'var(--kd-ink-soft)', fontSize: 13, textDecoration: 'none' }}
        >
          <IconBack size={14} />
          {t('review.backToQueue', { defaultValue: 'Back to review queue' })}
        </Link>

        {loading ? (
          <div className="flex justify-center py-20">
            <span
              className="loading loading-spinner loading-lg"
              style={{ color: 'var(--kd-accent)' }}
            />
          </div>
        ) : error && !word ? (
          <div
            role="alert"
            className="mt-10 px-5 py-4 rounded-2xl kd-font-sans"
            style={{
              background: 'var(--kd-accent-tint)',
              color: 'var(--kd-accent)',
              border: '1px solid color-mix(in srgb, var(--kd-accent) 40%, transparent)',
            }}
          >
            {error}
          </div>
        ) : word ? (
          <ReviewBody
            word={word}
            currentUserId={currentUser?.uid}
            voting={voting}
            successMessage={successMessage}
            error={error}
            onVote={(vote) => {
              setPendingVote(vote);
              setVoteComment('');
            }}
          />
        ) : null}
      </section>

      <CommentModal
        open={pendingVote !== null}
        vote={pendingVote ?? 'approve'}
        comment={voteComment}
        onCommentChange={setVoteComment}
        onConfirm={submitVote}
        onCancel={() => {
          setPendingVote(null);
          setVoteComment('');
        }}
        submitting={voting}
      />
    </div>
  );
};

interface ReviewBodyProps {
  word: WordWithExtras;
  currentUserId: string | undefined;
  voting: boolean;
  successMessage: string | null;
  error: string | null;
  onVote: (vote: Vote) => void;
}

const ReviewBody = ({
  word,
  currentUserId,
  voting,
  successMessage,
  error,
  onVote,
}: ReviewBodyProps) => {
  const { t } = useTranslation();

  const contributorDisplay =
    word.contributorName || word.contributor_name || word.contributor_displayName || '';

  const approvals = word.community_votes_for || 0;
  const rejections = word.community_votes_against || 0;
  const reviewerInitials = (word.reviewed_by || [])
    .map((r) => {
      const rec = r as { displayName?: string; username?: string; email?: string };
      return initialsOf(rec.displayName || rec.username || rec.email || '');
    })
    .filter(Boolean);

  const isOwn = !!currentUserId && word.contributor_id === currentUserId;
  const hasVoted =
    !!currentUserId &&
    !!word.reviewed_by?.some((r) => r.user_id === currentUserId);
  const isVotable = !!word.status && VOTABLE_STATES.has(word.status);
  const canVote = !!currentUserId && isVotable && !isOwn && !hasVoted && !voting;

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="kd-eyebrow">
          {t('review.detailEyebrow', { defaultValue: 'Reviewing' })}
        </span>
        {word.status && (
          <StatusPill tone={stateTone(word.status)}>
            {t(`review.stateLabels.${word.status}`, { defaultValue: word.status })}
          </StatusPill>
        )}
      </div>

      <header className="mt-3 flex items-baseline gap-4 flex-wrap">
        <h1
          className="kd-font-serif"
          style={{
            fontWeight: 500,
            fontSize: 'clamp(44px, 7vw, 78px)',
            color: 'var(--kd-ink)',
            letterSpacing: '-0.025em',
            lineHeight: 1,
            margin: 0,
          }}
        >
          {word.kurukh_word}
        </h1>
        {word.pronunciation && (
          <span
            className="kd-font-mono"
            style={{ fontSize: 16, color: 'var(--kd-ink-soft)' }}
          >
            /{word.pronunciation}/
          </span>
        )}
        {word.part_of_speech && (
          <span
            className="kd-font-sans"
            style={{
              padding: '4px 12px',
              borderRadius: 999,
              fontSize: 12,
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
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: '1px solid var(--kd-line)',
            background: 'var(--kd-surface)',
            color: 'var(--kd-ink)',
            cursor: 'pointer',
          }}
        >
          <IconSpeaker size={16} />
        </button>
      </header>

      <div
        className="mt-4 flex items-center gap-2.5 flex-wrap kd-font-sans"
        style={{ fontSize: 13, color: 'var(--kd-ink-mute)' }}
      >
        <span
          className="kd-font-serif inline-flex items-center justify-center"
          style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: 'var(--kd-accent-soft)',
            color: '#FFF',
            fontWeight: 600,
            fontSize: 10.5,
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

      {successMessage && (
        <div
          role="status"
          className="mt-6 px-4 py-3 rounded-xl kd-font-sans"
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
          className="mt-6 px-4 py-3 rounded-xl kd-font-sans"
          style={{
            background: 'var(--kd-accent-tint)',
            color: 'var(--kd-accent)',
            border: '1px solid color-mix(in srgb, var(--kd-accent) 40%, transparent)',
          }}
        >
          {error}
        </div>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0 flex flex-col gap-6">
          {(word.meanings || []).map((m, i) => (
            <div key={i}>
              <div className="kd-eyebrow mb-2" style={{ color: 'var(--kd-ink-mute)' }}>
                {m.language === 'hi' ? t('word.hindi') : t('word.english')}
              </div>
              <p
                className="kd-font-serif"
                style={{
                  fontSize: 20,
                  color: 'var(--kd-ink)',
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                {m.definition}
              </p>
              {m.example_sentence_kurukh && (
                <div
                  className="mt-3 px-4 py-3 rounded-xl"
                  style={{
                    background: 'var(--kd-surface)',
                    border: '1px solid var(--kd-line)',
                    borderLeft: '3px solid var(--kd-accent)',
                  }}
                >
                  <p
                    className="kd-font-serif italic"
                    style={{
                      fontSize: 17,
                      color: 'var(--kd-ink)',
                      margin: 0,
                      lineHeight: 1.45,
                    }}
                  >
                    “{m.example_sentence_kurukh}”
                  </p>
                  {m.example_sentence_translation && (
                    <p
                      className="kd-font-sans mt-1"
                      style={{
                        fontSize: 13.5,
                        color: 'var(--kd-ink-soft)',
                        margin: 0,
                      }}
                    >
                      {m.example_sentence_translation}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <aside className="flex flex-col gap-4">
          <div
            className="p-5 rounded-2xl flex flex-col gap-3"
            style={{ background: 'var(--kd-surface)', border: '1px solid var(--kd-line)' }}
          >
            <VoteTracker
              approvals={approvals}
              voterInitials={reviewerInitials}
              label={t('review.card.approvalsLabel') as string}
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
                <span
                  style={{
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    fontSize: 10,
                  }}
                >
                  {t('review.votesAgainstLabel')}
                </span>
                <span style={{ fontWeight: 600 }}>{rejections}</span>
              </div>
            )}

            <div className="flex gap-1.5 mt-1">
              <button
                type="button"
                onClick={() => onVote('approve')}
                disabled={!canVote}
                className="flex-1 inline-flex items-center justify-center gap-1.5 kd-font-sans font-semibold py-2.5 rounded-[10px] disabled:opacity-50"
                style={{
                  background: 'var(--kd-sage)',
                  color: '#FBF7EE',
                  fontSize: 13,
                  cursor: canVote ? 'pointer' : 'not-allowed',
                }}
              >
                {voting ? '…' : t('review.card.approve')}
              </button>
              <button
                type="button"
                onClick={() => onVote('reject')}
                disabled={!canVote}
                className="flex-1 inline-flex items-center justify-center gap-1.5 kd-font-sans font-medium py-2.5 rounded-[10px] disabled:opacity-50"
                style={{
                  background: 'transparent',
                  color: 'var(--kd-ink)',
                  border: '1px solid var(--kd-line)',
                  fontSize: 13,
                  cursor: canVote ? 'pointer' : 'not-allowed',
                }}
              >
                {t('review.card.reject')}
              </button>
            </div>

            {!currentUserId && (
              <p
                className="kd-font-sans"
                style={{ fontSize: 12, color: 'var(--kd-ink-mute)', lineHeight: 1.5, margin: 0 }}
              >
                {t('review.loginRequired')}
              </p>
            )}
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
            {currentUserId && !isOwn && !hasVoted && !isVotable && (
              <p
                className="kd-font-sans"
                style={{ fontSize: 12, color: 'var(--kd-ink-mute)', lineHeight: 1.5, margin: 0 }}
              >
                {t('review.notVotable', {
                  defaultValue: 'This word is no longer open for community voting.',
                })}
              </p>
            )}
          </div>
        </aside>
      </div>

      <div className="mt-12">
        <div className="kd-eyebrow mb-3">
          {t('word.reviewStatus', { defaultValue: 'Review status' })}
        </div>
        <div
          className="p-5 rounded-2xl"
          style={{ background: 'var(--kd-surface)', border: '1px solid var(--kd-line)' }}
        >
          <WordFlowDiagram wordId={word.id} />
        </div>
      </div>

      <div className="mt-12">
        <CommentThread wordId={word.id} word={word} isOpen={true} onToggle={() => {}} />
      </div>
    </>
  );
};

export default WordReview;
