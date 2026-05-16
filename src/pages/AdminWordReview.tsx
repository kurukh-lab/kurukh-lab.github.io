import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { getWordById } from '../services/dictionaryService';
import { formatDate } from '../utils/wordUtils';
import { wordReviewService } from '../services/wordReviewService';
import StatusPill, { type PillTone } from '../components/kd/StatusPill';
import WordFlowDiagram from '../components/kd/WordFlowDiagram';
import { IconBack } from '../components/kd/icons';
import type {
  Correction,
  CorrectionType,
  Report,
  Word,
  WordVoteRecord,
} from '../types';

type AdminAction = 'approve' | 'reject' | 'send_back';

interface HistoryEntry {
  action: string;
  timestamp?: { seconds?: number } | Date | null;
  userId?: string;
  user_id?: string;
  comment?: string;
  reason?: string;
}

const ACTION_LABELS: Record<string, string> = {
  submitted: 'Word submitted',
  sent_to_admin_review: 'Sent for admin review',
  sent_to_community_review: 'Sent for community review',
  community_review_started: 'Community review started',
  admin_review_started: 'Admin review started',
  community_approve: 'Community vote: approve',
  community_reject: 'Community vote: reject',
  community_approved: 'Community approved',
  community_rejected: 'Community rejected',
  admin_approved: 'Admin approved',
  admin_rejected: 'Admin rejected',
  admin_override: 'Admin override',
  sent_back_to_community: 'Sent back to community',
  report_submitted: 'Report submitted',
  report_resolved: 'Report resolved',
  correction_submitted: 'Correction submitted',
  correction_handled: 'Correction handled',
};

const STATE_LABELS: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  community_review: 'In community review',
  pending_community_review: 'Pending community',
  in_community_review: 'In community review',
  community_approved: 'Community approved',
  community_rejected: 'Community rejected',
  pending_review: 'Pending admin',
  in_admin_review: 'In admin review',
  approved: 'Approved',
  rejected: 'Rejected',
};

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

const initialsOf = (name: string): string =>
  (name || '')
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

const formatTs = (ts: unknown): string => {
  if (!ts) return '';
  if (ts instanceof Date) return ts.toLocaleString();
  if (typeof ts === 'object' && 'seconds' in (ts as Record<string, unknown>)) {
    const sec = (ts as { seconds?: number }).seconds;
    if (typeof sec === 'number') return new Date(sec * 1000).toLocaleString();
  }
  return '';
};

const tsToMillis = (ts: unknown): number => {
  if (!ts) return 0;
  if (ts instanceof Date) return ts.getTime();
  if (typeof ts === 'object' && 'seconds' in (ts as Record<string, unknown>)) {
    const sec = (ts as { seconds?: number }).seconds;
    if (typeof sec === 'number') return sec * 1000;
  }
  return 0;
};

const correctionTypeLabel = (t: CorrectionType): string => {
  switch (t) {
    case 'word_spelling': return 'Word spelling';
    case 'definition': return 'Definition / meaning';
    case 'part_of_speech': return 'Part of speech';
    case 'example_sentence': return 'Example sentence';
    case 'example_translation': return 'Example translation';
    case 'pronunciation': return 'Pronunciation';
  }
};

const VOTABLE_AS_ADMIN = new Set([
  'submitted',
  'community_review',
  'in_community_review',
  'community_approved',
  'pending_review',
  'in_admin_review',
]);

const AdminWordReview = () => {
  const { wordId } = useParams<{ wordId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [word, setWord] = useState<Word | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [corrections, setCorrections] = useState<Correction[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [actionComment, setActionComment] = useState('');
  const [pendingAction, setPendingAction] = useState<AdminAction | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    if (!wordId) return;
    try {
      setLoading(true);
      setError(null);
      const [wordResult, reportsSnap, correctionsSnap] = await Promise.all([
        getWordById(wordId),
        getDocs(
          query(
            collection(db, 'reports'),
            where('word_id', '==', wordId),
            orderBy('createdAt', 'desc'),
          ),
        ),
        getDocs(
          query(
            collection(db, 'corrections'),
            where('word_id', '==', wordId),
            orderBy('createdAt', 'desc'),
          ),
        ),
      ]);

      if (!wordResult) {
        setError('Word not found.');
        return;
      }
      setWord(wordResult);

      const rawHistory =
        ((wordResult as Word & { status_history?: HistoryEntry[] })
          .status_history) || [];
      setHistory([...rawHistory].sort((a, b) => tsToMillis(b.timestamp) - tsToMillis(a.timestamp)));

      setReports(reportsSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Report));
      setCorrections(
        correctionsSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Correction),
      );
    } catch (err) {
      console.error('Error loading admin word review:', err);
      setError('Failed to load this word. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [wordId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const submitAdminAction = async () => {
    if (!word || !currentUser || !pendingAction) return;
    setActionInProgress(true);
    try {
      const eventByAction: Record<AdminAction, string> = {
        approve: 'ADMIN_APPROVE',
        reject: 'ADMIN_REJECT',
        send_back: 'SEND_BACK_TO_COMMUNITY',
      };
      const result = await wordReviewService.transitionWord(
        word.id,
        eventByAction[pendingAction],
        {
          userId: currentUser.uid,
          comment: actionComment.trim(),
        },
      );
      if (!result.success) throw new Error(result.error || `Failed to ${pendingAction} word`);
      setSuccessMessage(`Word ${pendingAction === 'send_back' ? 'sent back' : pendingAction + 'd'} successfully.`);
      setActionComment('');
      setPendingAction(null);
      await loadAll();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Admin action failed:', err);
      setError((err as Error).message);
      setTimeout(() => setError(null), 4000);
    } finally {
      setActionInProgress(false);
    }
  };

  const resolveReport = async (reportId: string) => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, 'reports', reportId), {
        status: 'resolved',
        resolvedAt: new Date(),
        resolvedBy: currentUser.uid,
      });
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      setSuccessMessage('Report marked as resolved.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to resolve report:', err);
      setError('Failed to resolve report.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const decideCorrection = async (correctionId: string, decision: 'approved' | 'rejected') => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, 'corrections', correctionId), {
        status: decision,
        updatedAt: new Date(),
        handled_by: currentUser.uid,
        handled_at: new Date(),
      });
      setCorrections((prev) =>
        prev.map((c) => (c.id === correctionId ? { ...c, status: decision } : c)),
      );
      setSuccessMessage(`Correction ${decision}.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to update correction:', err);
      setError('Failed to update correction.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const approvers = useMemo<WordVoteRecord[]>(
    () => (word?.reviewed_by || []).filter((r) => r.vote === 'approve'),
    [word],
  );
  const rejectors = useMemo<WordVoteRecord[]>(
    () => (word?.reviewed_by || []).filter((r) => r.vote === 'reject'),
    [word],
  );

  const openReports = reports.filter((r) => r.status !== 'resolved');
  const pendingCorrections = corrections.filter(
    (c) => c.status === 'shallow_review' || c.status === 'approved',
  );

  const canAct = !!word && !!word.status && VOTABLE_AS_ADMIN.has(word.status);

  return (
    <div style={{ background: 'var(--kd-bg)', color: 'var(--kd-ink)', minHeight: '100vh' }}>
      <section className="max-w-[1200px] mx-auto px-6 md:px-12 pt-10 pb-24">
        <button
          type="button"
          onClick={() => navigate('/admin')}
          className="inline-flex items-center gap-1.5 kd-font-sans"
          style={{
            color: 'var(--kd-ink-soft)',
            fontSize: 13,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <IconBack size={14} />
          Back to admin
        </button>

        {loading ? (
          <div className="flex justify-center py-20">
            <span className="loading loading-spinner loading-lg" style={{ color: 'var(--kd-accent)' }} />
          </div>
        ) : error && !word ? (
          <Notice tone="error" className="mt-10">{error}</Notice>
        ) : word ? (
          <>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="kd-eyebrow">Admin · Word review</span>
              {word.status && (
                <StatusPill tone={stateTone(word.status)}>
                  {STATE_LABELS[word.status] || word.status}
                </StatusPill>
              )}
            </div>

            <header className="mt-3 flex items-baseline gap-4 flex-wrap">
              <h1
                className="kd-font-serif"
                style={{
                  fontWeight: 500,
                  fontSize: 'clamp(44px, 7vw, 78px)',
                  letterSpacing: '-0.025em',
                  lineHeight: 1,
                  margin: 0,
                }}
              >
                {word.kurukh_word}
              </h1>
              {word.pronunciation_guide && (
                <span className="kd-font-mono" style={{ fontSize: 16, color: 'var(--kd-ink-soft)' }}>
                  /{word.pronunciation_guide}/
                </span>
              )}
              {word.part_of_speech && (
                <span
                  className="kd-font-mono"
                  style={{
                    fontSize: 10.5,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--kd-accent)',
                    background: 'var(--kd-accent-tint)',
                    padding: '3px 10px',
                    borderRadius: 999,
                  }}
                >
                  {word.part_of_speech}
                </span>
              )}
            </header>

            <div
              className="mt-3 kd-font-sans"
              style={{ fontSize: 13, color: 'var(--kd-ink-mute)' }}
            >
              Contributor <code style={{ color: 'var(--kd-ink-soft)' }}>{word.contributor_id || '—'}</code>
              {word.createdAt && <> · Submitted {formatDate(word.createdAt)}</>}
              {word.updatedAt && <> · Updated {formatDate(word.updatedAt)}</>}
            </div>

            {successMessage && <Notice tone="success" className="mt-6">{successMessage}</Notice>}
            {error && <Notice tone="error" className="mt-6">{error}</Notice>}

            <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
              <div className="min-w-0 flex flex-col gap-10">
                <MeaningsCard word={word} />

                <Section title="Lifecycle">
                  <div
                    className="p-5 rounded-2xl"
                    style={{ background: 'var(--kd-surface)', border: '1px solid var(--kd-line)' }}
                  >
                    <WordFlowDiagram wordId={word.id} />
                  </div>
                </Section>

                <Section title={`Review history (${history.length})`}>
                  <HistoryTimeline history={history} />
                </Section>

                <Section title={`Community decisions · ${approvers.length} approve · ${rejectors.length} reject`}>
                  <VoteListing approvers={approvers} rejectors={rejectors} />
                </Section>

                <Section title={`Open reports (${openReports.length})`}>
                  {openReports.length === 0 ? (
                    <EmptyHint>No open reports.</EmptyHint>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {openReports.map((r) => (
                        <ReportItem key={r.id} report={r} onResolve={() => resolveReport(r.id)} />
                      ))}
                    </div>
                  )}
                </Section>

                <Section title={`Pending corrections (${pendingCorrections.length})`}>
                  {pendingCorrections.length === 0 ? (
                    <EmptyHint>No pending corrections.</EmptyHint>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {pendingCorrections.map((c) => (
                        <CorrectionItem
                          key={c.id}
                          correction={c}
                          onDecide={(decision) => decideCorrection(c.id, decision)}
                        />
                      ))}
                    </div>
                  )}
                </Section>
              </div>

              <aside className="flex flex-col gap-4">
                <ActionPanel
                  canAct={canAct}
                  actionInProgress={actionInProgress}
                  pendingAction={pendingAction}
                  actionComment={actionComment}
                  onCommentChange={setActionComment}
                  onChoose={(a) => setPendingAction(a)}
                  onSubmit={submitAdminAction}
                  onCancel={() => {
                    setPendingAction(null);
                    setActionComment('');
                  }}
                />

                <SidebarMeta word={word} />
                <Link
                  to={`/word/${word.id}`}
                  className="kd-font-mono rounded-full px-4 py-2 text-center"
                  style={{
                    fontSize: 11,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'var(--kd-ink-soft)',
                    border: '1px solid var(--kd-line)',
                    textDecoration: 'none',
                  }}
                >
                  View public page →
                </Link>
              </aside>
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
};

// ─── Subcomponents ────────────────────────────────────────────────────────

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="kd-eyebrow mb-3">{title}</div>
    {children}
  </div>
);

const EmptyHint = ({ children }: { children: React.ReactNode }) => (
  <div
    className="kd-font-serif italic px-4 py-5 rounded-xl text-center"
    style={{
      background: 'var(--kd-surface)',
      border: '1px solid var(--kd-line)',
      color: 'var(--kd-ink-mute)',
      fontSize: 14,
    }}
  >
    {children}
  </div>
);

const MeaningsCard = ({ word }: { word: Word }) => (
  <div className="flex flex-col gap-5">
    {(word.meanings || []).map((m, i) => (
      <div key={i}>
        <div className="kd-eyebrow mb-2" style={{ color: 'var(--kd-ink-mute)' }}>
          {m.language === 'hi' ? 'Hindi' : m.language === 'en' ? 'English' : m.language}
        </div>
        <p className="kd-font-serif" style={{ fontSize: 20, lineHeight: 1.5, margin: 0 }}>
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
              style={{ fontSize: 16.5, color: 'var(--kd-ink)', margin: 0, lineHeight: 1.45 }}
            >
              “{m.example_sentence_kurukh}”
            </p>
            {m.example_sentence_translation && (
              <p
                className="kd-font-sans mt-1"
                style={{ fontSize: 13.5, color: 'var(--kd-ink-soft)', margin: 0 }}
              >
                {m.example_sentence_translation}
              </p>
            )}
          </div>
        )}
      </div>
    ))}
  </div>
);

const HistoryTimeline = ({ history }: { history: HistoryEntry[] }) => {
  if (history.length === 0) {
    return <EmptyHint>No history recorded yet.</EmptyHint>;
  }
  return (
    <ol className="flex flex-col gap-3">
      {history.map((entry, idx) => {
        const isReject =
          entry.action.includes('reject') || entry.action.includes('Reject');
        return (
          <li
            key={idx}
            className="flex items-start gap-3 px-4 py-3 rounded-xl"
            style={{ background: 'var(--kd-surface)', border: '1px solid var(--kd-line)' }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                marginTop: 8,
                background: isReject ? 'var(--kd-accent)' : 'var(--kd-sage)',
                flex: '0 0 auto',
              }}
            />
            <div className="min-w-0 flex-1">
              <div className="kd-font-sans" style={{ fontSize: 14, color: 'var(--kd-ink)' }}>
                {ACTION_LABELS[entry.action] || entry.action}
              </div>
              <div
                className="kd-font-mono mt-0.5"
                style={{ fontSize: 11, letterSpacing: '0.04em', color: 'var(--kd-ink-mute)' }}
              >
                {formatTs(entry.timestamp) || '—'}
                {(entry.userId || entry.user_id) && (
                  <>
                    {' · '}
                    <code>{entry.userId || entry.user_id}</code>
                  </>
                )}
              </div>
              {(entry.comment || entry.reason) && (
                <p
                  className="kd-font-serif italic mt-1.5"
                  style={{
                    fontSize: 13.5,
                    color: 'var(--kd-ink-soft)',
                    margin: 0,
                    lineHeight: 1.45,
                  }}
                >
                  “{entry.comment || entry.reason}”
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
};

interface VoteListingProps {
  approvers: WordVoteRecord[];
  rejectors: WordVoteRecord[];
}

const VoteListing = ({ approvers, rejectors }: VoteListingProps) => (
  <div className="grid gap-3 md:grid-cols-2">
    <VoteColumn label="Approvers" tone="sage" votes={approvers} />
    <VoteColumn label="Rejectors" tone="accent" votes={rejectors} />
  </div>
);

interface VoteColumnProps {
  label: string;
  tone: 'sage' | 'accent';
  votes: WordVoteRecord[];
}

const VoteColumn = ({ label, tone, votes }: VoteColumnProps) => {
  const color = tone === 'sage' ? 'var(--kd-sage)' : 'var(--kd-accent)';
  return (
    <div
      className="p-4 rounded-xl"
      style={{ background: 'var(--kd-surface)', border: '1px solid var(--kd-line)' }}
    >
      <div className="flex items-baseline justify-between mb-3">
        <div className="kd-eyebrow" style={{ color }}>{label}</div>
        <div className="kd-font-serif" style={{ fontSize: 24, lineHeight: 1, color }}>
          {votes.length}
        </div>
      </div>
      {votes.length === 0 ? (
        <p
          className="kd-font-serif italic"
          style={{ fontSize: 13, color: 'var(--kd-ink-mute)', margin: 0 }}
        >
          No votes recorded.
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {votes.map((v, i) => (
            <li key={i} className="flex gap-2.5 items-start">
              <span
                className="kd-font-serif inline-flex items-center justify-center"
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: color,
                  color: '#FBF7EE',
                  fontWeight: 600,
                  fontSize: 10,
                  flex: '0 0 auto',
                }}
              >
                {initialsOf(v.user_id) || '·'}
              </span>
              <div className="min-w-0 flex-1">
                <div
                  className="kd-font-mono"
                  style={{ fontSize: 11, color: 'var(--kd-ink-soft)' }}
                >
                  <code>{v.user_id}</code>
                </div>
                <div
                  className="kd-font-mono"
                  style={{ fontSize: 10.5, color: 'var(--kd-ink-mute)' }}
                >
                  {formatTs(v.timestamp) || ''}
                </div>
                {v.comment && (
                  <p
                    className="kd-font-serif italic mt-1"
                    style={{ fontSize: 13, color: 'var(--kd-ink)', margin: 0, lineHeight: 1.4 }}
                  >
                    “{v.comment}”
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const ReportItem = ({ report, onResolve }: { report: Report; onResolve: () => void }) => (
  <div
    className="p-4 rounded-xl"
    style={{ background: 'var(--kd-surface)', border: '1px solid var(--kd-line)' }}
  >
    <div className="flex items-baseline justify-between gap-3 flex-wrap">
      <div className="kd-font-sans font-semibold" style={{ fontSize: 14 }}>
        {report.reason || '—'}
      </div>
      <button
        type="button"
        onClick={onResolve}
        className="kd-font-mono rounded-full px-3 py-1"
        style={{
          fontSize: 10.5,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          background: 'var(--kd-sage)',
          color: '#FBF7EE',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Resolve
      </button>
    </div>
    {report.details && (
      <p
        className="kd-font-serif italic mt-2"
        style={{ fontSize: 14, color: 'var(--kd-ink-soft)', margin: 0, lineHeight: 1.45 }}
      >
        “{report.details}”
      </p>
    )}
    <div
      className="kd-font-mono mt-2"
      style={{ fontSize: 10.5, color: 'var(--kd-ink-mute)' }}
    >
      <code>{report.user_id}</code> · {formatTs(report.createdAt)}
    </div>
  </div>
);

const CorrectionItem = ({
  correction,
  onDecide,
}: {
  correction: Correction;
  onDecide: (decision: 'approved' | 'rejected') => void;
}) => (
  <div
    className="p-4 rounded-xl"
    style={{ background: 'var(--kd-surface)', border: '1px solid var(--kd-line)' }}
  >
    <div className="flex items-baseline justify-between gap-3 flex-wrap">
      <div className="kd-font-sans font-semibold" style={{ fontSize: 14 }}>
        {correctionTypeLabel(correction.correction_type)}
      </div>
      <span
        className="kd-font-mono"
        style={{
          fontSize: 10,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--kd-ink-mute)',
        }}
      >
        {correction.status}
      </span>
    </div>

    <div className="grid gap-2 md:grid-cols-2 mt-3">
      <div
        className="p-3 rounded-lg"
        style={{
          background: 'color-mix(in srgb, #C7522A 8%, var(--kd-bg))',
          border: '1px solid var(--kd-line)',
        }}
      >
        <div
          className="kd-font-mono mb-1"
          style={{
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--kd-ink-mute)',
          }}
        >
          Current
        </div>
        <div className="kd-font-serif" style={{ fontSize: 14.5, color: 'var(--kd-ink)' }}>
          {correction.current_value || '—'}
        </div>
      </div>
      <div
        className="p-3 rounded-lg"
        style={{
          background: 'color-mix(in srgb, var(--kd-sage) 12%, var(--kd-bg))',
          border: '1px solid var(--kd-line)',
        }}
      >
        <div
          className="kd-font-mono mb-1"
          style={{
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--kd-ink-mute)',
          }}
        >
          Proposed
        </div>
        <div className="kd-font-serif" style={{ fontSize: 14.5, color: 'var(--kd-ink)' }}>
          {correction.proposed_change || '—'}
        </div>
      </div>
    </div>

    {correction.explanation && (
      <p
        className="kd-font-serif italic mt-2"
        style={{ fontSize: 13.5, color: 'var(--kd-ink-soft)', margin: 0, lineHeight: 1.45 }}
      >
        “{correction.explanation}”
      </p>
    )}

    <div
      className="kd-font-mono mt-2"
      style={{ fontSize: 10.5, color: 'var(--kd-ink-mute)' }}
    >
      <code>{correction.user_id}</code> · {formatTs(correction.createdAt)}
    </div>

    <div className="flex gap-2 mt-3">
      <button
        type="button"
        onClick={() => onDecide('approved')}
        className="flex-1 kd-font-sans font-semibold py-2 rounded-lg"
        style={{
          background: 'var(--kd-sage)',
          color: '#FBF7EE',
          border: 'none',
          fontSize: 13,
          cursor: 'pointer',
        }}
      >
        Approve
      </button>
      <button
        type="button"
        onClick={() => onDecide('rejected')}
        className="flex-1 kd-font-sans py-2 rounded-lg"
        style={{
          background: 'transparent',
          border: '1px solid var(--kd-line)',
          color: 'var(--kd-ink)',
          fontSize: 13,
          cursor: 'pointer',
        }}
      >
        Reject
      </button>
    </div>
  </div>
);

interface ActionPanelProps {
  canAct: boolean;
  actionInProgress: boolean;
  pendingAction: AdminAction | null;
  actionComment: string;
  onCommentChange: (v: string) => void;
  onChoose: (a: AdminAction) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const ActionPanel = ({
  canAct,
  actionInProgress,
  pendingAction,
  actionComment,
  onCommentChange,
  onChoose,
  onSubmit,
  onCancel,
}: ActionPanelProps) => (
  <div
    className="p-5 rounded-2xl flex flex-col gap-3"
    style={{ background: 'var(--kd-surface)', border: '1px solid var(--kd-line)' }}
  >
    <div className="kd-eyebrow">Admin action</div>
    {!canAct && (
      <p
        className="kd-font-sans"
        style={{ fontSize: 12.5, color: 'var(--kd-ink-mute)', lineHeight: 1.5, margin: 0 }}
      >
        This word is in a final state — no admin transitions available.
      </p>
    )}
    {canAct && pendingAction === null && (
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => onChoose('approve')}
          className="kd-font-sans font-semibold py-2.5 rounded-[10px]"
          style={{ background: 'var(--kd-sage)', color: '#FBF7EE', border: 'none', fontSize: 13, cursor: 'pointer' }}
        >
          Approve
        </button>
        <button
          type="button"
          onClick={() => onChoose('reject')}
          className="kd-font-sans font-medium py-2.5 rounded-[10px]"
          style={{
            background: 'transparent',
            border: '1px solid var(--kd-accent)',
            color: 'var(--kd-accent)',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Reject
        </button>
        <button
          type="button"
          onClick={() => onChoose('send_back')}
          className="kd-font-sans py-2.5 rounded-[10px]"
          style={{
            background: 'transparent',
            border: '1px solid var(--kd-line)',
            color: 'var(--kd-ink-soft)',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Send back to community
        </button>
      </div>
    )}
    {canAct && pendingAction && (
      <div className="flex flex-col gap-2">
        <div
          className="kd-font-mono"
          style={{
            fontSize: 10.5,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--kd-ink-soft)',
          }}
        >
          Confirm: {pendingAction === 'send_back' ? 'Send back to community' : pendingAction}
        </div>
        <textarea
          value={actionComment}
          onChange={(e) => onCommentChange(e.target.value)}
          rows={3}
          placeholder="Reason / comment (optional but encouraged)…"
          className="kd-font-sans"
          style={{
            background: 'var(--kd-bg)',
            border: '1px solid var(--kd-line)',
            borderRadius: 10,
            padding: '8px 10px',
            fontSize: 13,
            color: 'var(--kd-ink)',
            resize: 'vertical',
          }}
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSubmit}
            disabled={actionInProgress}
            className="flex-1 kd-font-sans font-semibold py-2 rounded-[10px] disabled:opacity-50"
            style={{
              background:
                pendingAction === 'approve'
                  ? 'var(--kd-sage)'
                  : pendingAction === 'reject'
                  ? 'var(--kd-accent)'
                  : 'var(--kd-ink)',
              color: '#FBF7EE',
              border: 'none',
              fontSize: 13,
              cursor: actionInProgress ? 'not-allowed' : 'pointer',
            }}
          >
            {actionInProgress ? '…' : 'Confirm'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={actionInProgress}
            className="kd-font-sans py-2 px-3 rounded-[10px]"
            style={{
              background: 'transparent',
              border: '1px solid var(--kd-line)',
              color: 'var(--kd-ink-soft)',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    )}
  </div>
);

const SidebarMeta = ({ word }: { word: Word }) => (
  <div
    className="p-4 rounded-2xl flex flex-col gap-2"
    style={{ background: 'var(--kd-surface)', border: '1px solid var(--kd-line)' }}
  >
    <div className="kd-eyebrow">Stats</div>
    <MetaRow label="Likes" value={String(word.likesCount ?? 0)} />
    <MetaRow label="Approvals" value={String(word.community_votes_for ?? 0)} />
    <MetaRow label="Rejections" value={String(word.community_votes_against ?? 0)} />
    <MetaRow label="Comments" value={String(word.commentsCount ?? 0)} />
  </div>
);

const MetaRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-baseline justify-between">
    <span
      className="kd-font-mono"
      style={{ fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--kd-ink-soft)' }}
    >
      {label}
    </span>
    <span className="kd-font-serif" style={{ fontSize: 16, color: 'var(--kd-ink)' }}>
      {value}
    </span>
  </div>
);

interface NoticeProps {
  tone: 'success' | 'error' | 'warn';
  className?: string;
  children: React.ReactNode;
}

const Notice = ({ tone, className, children }: NoticeProps) => {
  const palette: Record<NoticeProps['tone'], { bg: string; fg: string; border: string }> = {
    success: {
      bg: 'color-mix(in srgb, var(--kd-sage) 15%, transparent)',
      fg: 'var(--kd-sage)',
      border: 'color-mix(in srgb, var(--kd-sage) 40%, transparent)',
    },
    error: {
      bg: 'var(--kd-accent-tint)',
      fg: 'var(--kd-accent)',
      border: 'color-mix(in srgb, var(--kd-accent) 40%, transparent)',
    },
    warn: {
      bg: 'color-mix(in srgb, #FEBC2E 22%, var(--kd-surface))',
      fg: 'var(--kd-ink)',
      border: 'var(--kd-line)',
    },
  };
  const { bg, fg, border } = palette[tone];
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`${className || ''} px-4 py-3 rounded-xl kd-font-sans`}
      style={{ background: bg, color: fg, border: `1px solid ${border}` }}
    >
      {children}
    </div>
  );
};

export default AdminWordReview;
