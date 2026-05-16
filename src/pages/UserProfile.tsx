import { useState, useEffect, useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { getUserContributions } from '../services/dictionaryService';
import { formatDate } from '../utils/wordUtils';
import SubHead from '../components/kd/SubHead';
import StatusPill, { type PillTone } from '../components/kd/StatusPill';
import { IconPlus, IconArrow, IconHeart } from '../components/kd/icons';
import type { Word } from '../types';

type WordWithLikes = Word & { likes_count?: number; likes?: number };

const STATUS_TONE: Record<string, PillTone> = {
  approved: 'sage',
  community_approved: 'sage',
  pending_review: 'violet',
  community_review: 'accent',
  in_community_review: 'accent',
  draft: 'neutral',
  rejected: 'neutral',
  community_rejected: 'neutral',
};

const formatStatusLabel = (
  t: (key: string, opts?: Record<string, unknown>) => string,
  word: Word,
): string => {
  switch (word.status) {
    case 'approved':
      return t('profile.status.approved');
    case 'community_approved':
      return t('profile.status.communityApproved');
    case 'pending_review':
      return t('profile.status.pending');
    case 'community_review':
    case 'in_community_review':
      return t('profile.status.community', { count: word.community_votes_for ?? 0 });
    case 'draft':
      return t('profile.status.draft');
    case 'rejected':
    case 'community_rejected':
      return t('profile.status.rejected');
    default:
      return word.status || t('profile.status.draft');
  }
};

const UserProfile = () => {
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const [contributions, setContributions] = useState<WordWithLikes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'review'>('all');

  useEffect(() => {
    const run = async () => {
      if (!currentUser) return;
      setLoading(true);
      setError(null);
      try {
        const list = await getUserContributions(currentUser.uid);
        setContributions((list as WordWithLikes[]) || []);
      } catch (err) {
        console.error('Error fetching user contributions:', err);
        setError(t('profile.loadError') as string);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [currentUser, t]);

  const stats = useMemo(() => {
    const total = contributions.length;
    const approved = contributions.filter(
      (w) => w.status === 'approved' || w.status === 'community_approved',
    ).length;
    const awaiting = contributions.filter((w) =>
      ['pending_review', 'community_review', 'in_community_review'].includes(w.status),
    ).length;
    return { total, approved, awaiting };
  }, [contributions]);

  const filtered = useMemo(() => {
    if (statusFilter === 'approved')
      return contributions.filter(
        (w) => w.status === 'approved' || w.status === 'community_approved',
      );
    if (statusFilter === 'review')
      return contributions.filter((w) =>
        ['pending_review', 'community_review', 'in_community_review'].includes(w.status),
      );
    return contributions;
  }, [contributions, statusFilter]);

  if (!currentUser) return <Navigate to="/login" replace />;

  const userExt = currentUser as typeof currentUser & {
    displayName?: string | null;
    username?: string;
    createdAt?: unknown;
  };
  const name =
    userExt.displayName ||
    userExt.username ||
    currentUser.email?.split('@')[0] ||
    'User';
  const initials = name
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div style={{ background: 'var(--kd-bg)', color: 'var(--kd-ink)' }}>
      <section className="max-w-[1200px] mx-auto px-6 md:px-14 pt-14 pb-8">
        <div className="grid items-center gap-8 md:grid-cols-[auto_1fr_auto]">
          <div
            className="kd-font-serif"
            style={{
              width: 112,
              height: 112,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--kd-accent-soft), var(--kd-accent))',
              color: '#FBF7EE',
              fontWeight: 600,
              fontSize: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              letterSpacing: '-0.02em',
            }}
          >
            {initials || 'KD'}
          </div>

          <div className="min-w-0">
            <div className="kd-eyebrow mb-1.5">{t('profile.eyebrow')}</div>
            <h1
              className="kd-font-serif"
              style={{
                fontWeight: 500,
                fontSize: 'clamp(36px, 5vw, 56px)',
                lineHeight: 1.05,
                margin: 0,
                color: 'var(--kd-ink)',
                letterSpacing: '-0.025em',
                wordBreak: 'break-word',
              }}
            >
              {name}
            </h1>
            <p
              className="kd-font-sans mt-2"
              style={{ fontSize: 14, color: 'var(--kd-ink-soft)', margin: 0, marginTop: 8 }}
            >
              {currentUser.email}
              {userExt.createdAt ? (
                <>
                  {' · '}
                  {t('profile.memberSince', {
                    date: formatDate(userExt.createdAt as Parameters<typeof formatDate>[0]),
                  })}
                </>
              ) : null}
            </p>
          </div>

          <div className="flex gap-2.5 flex-wrap">
            <button
              type="button"
              className="kd-font-sans inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-[13.5px] font-medium"
              style={{
                background: 'transparent',
                color: 'var(--kd-ink)',
                border: '1px solid var(--kd-line)',
              }}
            >
              {t('profile.editProfile')}
            </button>
            <Link
              to="/contribute"
              className="kd-font-sans inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-[13.5px] font-medium"
              style={{ background: 'var(--kd-ink)', color: 'var(--kd-bg)' }}
            >
              <IconPlus size={13} weight={2.2} />
              {t('profile.addWord')}
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-6 md:px-14">
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          {[
            { value: stats.total, label: t('profile.stats.contributed') },
            { value: stats.approved, label: t('profile.stats.approved') },
            { value: stats.awaiting, label: t('profile.stats.awaiting') },
            { value: '—', label: t('profile.stats.reviews') },
          ].map((s) => (
            <div
              key={String(s.label)}
              className="p-5 rounded-2xl"
              style={{ background: 'var(--kd-surface)', border: '1px solid var(--kd-line)' }}
            >
              <div
                className="kd-font-serif"
                style={{
                  fontSize: 38,
                  fontWeight: 500,
                  color: 'var(--kd-ink)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                }}
              >
                {s.value}
              </div>
              <div
                className="kd-font-sans uppercase mt-2"
                style={{ fontSize: 12.5, color: 'var(--kd-ink-soft)', letterSpacing: '0.08em' }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-6 md:px-14 pt-10 pb-24 grid gap-10 md:grid-cols-[1fr_1.6fr]">
        <aside>
          <SubHead eyebrow={t('profile.aboutEyebrow')} title={t('profile.aboutTitle')} />
        </aside>

        <div className="min-w-0">
          <div className="flex flex-wrap justify-between items-end gap-3 mb-5">
            <SubHead eyebrow={t('profile.contribsEyebrow')} title={t('profile.contribsTitle')} noBottom />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'approved' | 'review')}
              className="kd-font-sans outline-none appearance-none"
              style={{
                background: 'var(--kd-bg)',
                color: 'var(--kd-ink)',
                border: '1px solid var(--kd-line)',
                borderRadius: 10,
                padding: '8px 36px 8px 12px',
                fontSize: 13,
              }}
            >
              <option value="all">{t('profile.filterAll')}</option>
              <option value="approved">{t('profile.filterApproved')}</option>
              <option value="review">{t('profile.filterInReview')}</option>
            </select>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center">
              <span className="loading loading-spinner loading-lg" style={{ color: 'var(--kd-accent)' }} />
            </div>
          ) : error ? (
            <div role="alert" className="kd-font-sans px-4 py-3 rounded-xl">
              {error}
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="p-10 rounded-2xl text-center"
              style={{ background: 'var(--kd-surface)', border: '1px solid var(--kd-line)' }}
            >
              <p className="kd-font-serif italic" style={{ fontSize: 16, color: 'var(--kd-ink-soft)' }}>
                {t('profile.emptyContribs')}
              </p>
            </div>
          ) : (
            filtered.map((word) => (
              <ContribRow
                key={word.id}
                word={word}
                label={formatStatusLabel(t, word)}
                tone={STATUS_TONE[word.status] || 'neutral'}
                addedLabel={t('profile.addedOn', { date: formatDate(word.createdAt) }) as string}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
};

interface ContribRowProps {
  word: WordWithLikes;
  label: string;
  tone: PillTone;
  addedLabel: string;
}

const ContribRow = ({ word, label, tone, addedLabel }: ContribRowProps) => {
  const gloss = word.meanings?.[0]?.definition;
  const likes = word.likes_count ?? word.likes ?? 0;
  return (
    <Link
      to={`/word/${word.id}`}
      className="grid items-center gap-4 p-5 mb-2 rounded-2xl transition-colors"
      style={{
        background: 'var(--kd-surface)',
        border: '1px solid var(--kd-line)',
        gridTemplateColumns: 'minmax(0, 1fr) auto auto',
      }}
    >
      <div className="min-w-0">
        <div className="flex items-baseline gap-3.5 flex-wrap">
          <span
            className="kd-font-serif"
            style={{ fontWeight: 500, fontSize: 24, color: 'var(--kd-ink)', letterSpacing: '-0.01em' }}
          >
            {word.kurukh_word}
          </span>
          {gloss && (
            <span
              className="kd-font-serif italic truncate"
              style={{ fontSize: 16, color: 'var(--kd-ink-soft)' }}
            >
              {gloss.length > 80 ? `${gloss.slice(0, 80)}…` : gloss}
            </span>
          )}
        </div>
        <div className="kd-font-sans mt-1" style={{ fontSize: 12, color: 'var(--kd-ink-mute)' }}>
          {addedLabel}
        </div>
      </div>

      <StatusPill tone={tone}>{label}</StatusPill>

      {likes > 0 ? (
        <span
          className="kd-font-mono inline-flex items-center gap-1.5"
          style={{ fontSize: 13, color: 'var(--kd-ink-mute)' }}
        >
          <IconHeart size={13} color="var(--kd-accent)" fill="var(--kd-accent)" />
          {likes}
        </span>
      ) : (
        <IconArrow size={14} color="var(--kd-ink-mute)" />
      )}
    </Link>
  );
};

export default UserProfile;
