import { useState, useEffect, type ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getWordById } from '../services/dictionaryService';
import { formatDate } from '../utils/wordUtils';
import ReportWordModal from '../components/dictionary/ReportWordModal';
import SuggestCorrectionModal from '../components/dictionary/SuggestCorrectionModal';
import ShareWordButtons from '../components/dictionary/ShareWordButtons';
import LikeButton from '../components/dictionary/LikeButton';
import WordReviewStatus from '../components/WordReviewStatus';
import WordFlowDiagram from '../components/kd/WordFlowDiagram';
import { useAuth } from '../contexts/AuthContext';
import SectionLabel from '../components/kd/SectionLabel';
import AudioPlayer, { type AudioTrack } from '../components/kd/AudioPlayer';
import StatusBadge from '../components/kd/StatusBadge';
import { IconBack, IconBookmark } from '../components/kd/icons';
import type { Word } from '../types';

type WordWithExtras = Word & {
  pronunciation?: string;
  created_by?: string;
  audio_tracks?: AudioTrack[];
};

const WordDetails = () => {
  const { wordId } = useParams<{ wordId: string }>();
  const { t } = useTranslation();
  const { isAdmin, currentUser } = useAuth();
  const [word, setWord] = useState<WordWithExtras | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [showReviewDetails, setShowReviewDetails] = useState(false);
  const [reviewView, setReviewView] = useState<'steps' | 'diagram'>('steps');

  useEffect(() => {
    const fetchWordDetails = async () => {
      if (!wordId) return;
      setLoading(true);
      setError(null);
      try {
        const wordData = await getWordById(wordId);
        if (wordData) setWord(wordData as WordWithExtras);
        else setError(t('word.notFound') as string);
      } catch (err) {
        console.error('Error fetching word details:', err);
        setError(t('errors.loadWord') as string);
      } finally {
        setLoading(false);
      }
    };
    fetchWordDetails();
  }, [wordId, t]);

  if (loading) {
    return (
      <div className="max-w-[1100px] mx-auto py-16 px-6 md:px-14 flex justify-center">
        <span
          data-testid="loading-spinner"
          className="loading loading-spinner loading-lg"
          style={{ color: 'var(--kd-accent)' }}
        />
      </div>
    );
  }

  if (error || !word) {
    return (
      <div className="max-w-[1100px] mx-auto py-16 px-6 md:px-14">
        <div
          className="kd-font-sans px-5 py-4 rounded-xl"
          style={{
            background: 'var(--kd-accent-tint)',
            color: 'var(--kd-accent)',
            border: '1px solid var(--kd-accent)',
          }}
        >
          {error || t('word.notFound')}
        </div>
        <div className="flex justify-center mt-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] kd-font-sans text-[14px] font-medium"
            style={{ background: 'var(--kd-ink)', color: 'var(--kd-bg)' }}
          >
            <IconBack size={14} color="currentColor" />
            {t('word.returnHome')}
          </Link>
        </div>
      </div>
    );
  }

  const allMeanings = word.meanings || [];
  const ownerOrAdmin = isAdmin || (currentUser && word.created_by === currentUser.uid);

  return (
    <div style={{ background: 'var(--kd-bg)' }}>
      <div
        className="max-w-[1100px] mx-auto pt-8 px-6 md:px-14 kd-font-mono"
        style={{
          fontSize: 12,
          color: 'var(--kd-ink-mute)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        <Link to="/" className="hover:opacity-80">
          {t('word.breadcrumb')}
        </Link>
        {' / '}
        <span style={{ color: 'var(--kd-ink)' }}>{word.kurukh_word}</span>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 md:px-14 pt-6 pb-8">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <h1
              className="kd-font-serif"
              style={{
                fontWeight: 500,
                fontSize: 'clamp(72px, 12vw, 140px)',
                margin: 0,
                color: 'var(--kd-ink)',
                letterSpacing: '-0.04em',
                lineHeight: 0.95,
              }}
            >
              {word.kurukh_word}
            </h1>
            <div className="mt-4 flex items-center gap-4 flex-wrap">
              {word.pronunciation && (
                <span className="kd-font-mono" style={{ fontSize: 17, color: 'var(--kd-ink-soft)' }}>
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
              {word.status && (
                <StatusBadge
                  status={word.status}
                  showDot={word.status === 'approved'}
                />
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] kd-font-sans text-[14px] font-medium transition-colors"
              style={{
                background: 'transparent',
                color: 'var(--kd-ink)',
                border: '1px solid var(--kd-line)',
              }}
            >
              <IconBookmark size={16} />
              {t('word.save')}
            </button>
            <div
              className="inline-flex items-center gap-2 px-3 py-2 rounded-[10px]"
              style={{ border: '1px solid var(--kd-line)' }}
            >
              <ShareWordButtons
                word={word.kurukh_word}
                url={typeof window !== 'undefined' ? window.location.href : ''}
                description={allMeanings?.[0]?.definition}
              />
            </div>
          </div>
        </div>

        <div className="mt-8">
          <AudioPlayer
            tracks={word.audio_tracks}
            src={word.audio_url}
            ariaLabel={`Pronunciation of ${word.kurukh_word}`}
          />
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 md:px-14 pb-24 grid gap-14 md:gap-16 md:grid-cols-[1.6fr_1fr]">
        <div>
          <SectionLabel eyebrow={t('word.meanings')} title={t('word.definitions')} />
          {allMeanings.length === 0 && (
            <p className="kd-font-sans" style={{ color: 'var(--kd-ink-mute)' }}>
              {t('home.noWords')}
            </p>
          )}
          {allMeanings.map((meaning, n) => (
            <div
              key={n}
              className="mb-9 pb-9"
              style={{
                borderBottom: n === allMeanings.length - 1 ? 'none' : '1px solid var(--kd-line)',
              }}
            >
              <div className="flex gap-5">
                <div
                  className="kd-font-serif"
                  style={{
                    fontWeight: 500,
                    fontSize: 28,
                    color: 'var(--kd-accent)',
                    letterSpacing: '-0.02em',
                    lineHeight: 1,
                    marginTop: 4,
                  }}
                >
                  {n + 1}.
                </div>
                <div className="flex-1 min-w-0">
                  <div className="kd-eyebrow mb-2">
                    {meaning.language === 'hi' ? t('word.hindi') : t('word.english')}
                  </div>
                  <p
                    className={meaning.language === 'hi' ? 'kd-font-deva' : 'kd-font-serif'}
                    style={{
                      fontSize: 22,
                      color: 'var(--kd-ink)',
                      lineHeight: 1.4,
                      margin: 0,
                      fontWeight: 400,
                    }}
                  >
                    {meaning.definition}
                  </p>
                  {meaning.example_sentence_kurukh && (
                    <div
                      className="mt-4 px-5 py-4 rounded-xl"
                      style={{
                        background: 'var(--kd-surface)',
                        border: '1px solid var(--kd-line)',
                        borderLeft: '3px solid var(--kd-accent)',
                      }}
                    >
                      <p
                        className="kd-font-serif"
                        style={{
                          fontSize: 19,
                          fontStyle: 'italic',
                          color: 'var(--kd-ink)',
                          margin: 0,
                          lineHeight: 1.4,
                        }}
                      >
                        {meaning.example_sentence_kurukh}
                      </p>
                      {meaning.example_sentence_translation && (
                        <p
                          className="kd-font-sans mt-1.5"
                          style={{ fontSize: 14, color: 'var(--kd-ink-soft)', margin: 0 }}
                        >
                          {meaning.example_sentence_translation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {ownerOrAdmin && (
            <div className="mt-2 mb-10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="kd-eyebrow">{t('word.reviewStatus')}</h3>
                <button
                  onClick={() => setShowReviewDetails(!showReviewDetails)}
                  className="kd-font-sans text-[12px] underline"
                  style={{ color: 'var(--kd-ink-soft)' }}
                >
                  {showReviewDetails ? t('word.hideDetails') : t('word.showDetails')}
                </button>
              </div>
              {showReviewDetails && wordId && (
                <div
                  className="p-4 rounded-xl flex flex-col gap-4"
                  style={{ background: 'var(--kd-surface)', border: '1px solid var(--kd-line)' }}
                >
                  <div
                    role="tablist"
                    aria-label="Review view"
                    className="inline-flex self-start rounded-full p-0.5"
                    style={{
                      background: 'var(--kd-bg)',
                      border: '1px solid var(--kd-line)',
                    }}
                  >
                    {(['steps', 'diagram'] as const).map((view) => {
                      const isActive = reviewView === view;
                      return (
                        <button
                          key={view}
                          type="button"
                          role="tab"
                          aria-selected={isActive}
                          onClick={() => setReviewView(view)}
                          className="kd-font-mono rounded-full"
                          style={{
                            fontSize: 10.5,
                            letterSpacing: '0.14em',
                            textTransform: 'uppercase',
                            padding: '5px 12px',
                            background: isActive ? 'var(--kd-ink)' : 'transparent',
                            color: isActive ? '#FBF7EE' : 'var(--kd-ink-soft)',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          {view === 'steps' ? 'Steps' : 'Diagram'}
                        </button>
                      );
                    })}
                  </div>
                  {reviewView === 'steps' ? (
                    <WordReviewStatus wordId={wordId} />
                  ) : (
                    <WordFlowDiagram wordId={wordId} />
                  )}
                </div>
              )}
            </div>
          )}

          <div
            className="pt-6 mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            style={{ borderTop: '1px solid var(--kd-line)' }}
          >
            <div className="kd-font-sans" style={{ fontSize: 13, color: 'var(--kd-ink-mute)' }}>
              {word.createdAt ? (
                <>
                  {t('word.addedOn')}: {formatDate(word.createdAt)}
                </>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <LikeButton word={word} size="lg" />
              <button
                type="button"
                onClick={() => setShowCorrectionModal(true)}
                className="kd-font-sans text-[13px] underline"
                style={{ color: 'var(--kd-ink-soft)' }}
              >
                {t('word.suggestCorrection')}
              </button>
              <button
                type="button"
                onClick={() => setShowReportModal(true)}
                className="kd-font-sans text-[13px] underline"
                style={{ color: 'var(--kd-accent)' }}
              >
                {t('word.reportIssue')}
              </button>
            </div>
          </div>
        </div>

        <aside className="flex flex-col gap-5">
          {word.linguistics && Object.values(word.linguistics).some(Boolean) && (
            <SidebarCard title="Grammar">
              <dl className="flex flex-col gap-2.5">
                {word.linguistics.grammatical_tag && (
                  <MetaRow label="Tag" value={word.linguistics.grammatical_tag} />
                )}
                {word.linguistics.verb_class && (
                  <MetaRow label="Verb class" value={word.linguistics.verb_class} />
                )}
                {word.linguistics.transitivity && (
                  <MetaRow
                    label="Transitivity"
                    value={word.linguistics.transitivity === 'tr' ? 'Transitive' : 'Intransitive'}
                  />
                )}
                {word.linguistics.gender && (
                  <MetaRow
                    label="Gender"
                    value={word.linguistics.gender === 'm' ? 'Masculine' : 'Feminine'}
                  />
                )}
                {word.linguistics.loanword_from && (
                  <MetaRow label="Borrowed from" value={word.linguistics.loanword_from} />
                )}
              </dl>
            </SidebarCard>
          )}

          {(word.variant_of || (word.variants && word.variants.length > 0)) && (
            <SidebarCard title="Variants">
              {word.variant_of && (
                <div className="mb-3">
                  <div className="kd-eyebrow mb-1.5" style={{ color: 'var(--kd-ink-mute)' }}>
                    Canonical form
                  </div>
                  <span
                    className="kd-font-serif"
                    style={{ fontSize: 17, color: 'var(--kd-ink)' }}
                  >
                    {word.variant_of}
                  </span>
                </div>
              )}
              {word.variants && word.variants.length > 0 && (
                <div>
                  <div className="kd-eyebrow mb-2" style={{ color: 'var(--kd-ink-mute)' }}>
                    Also written as
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {word.variants.map((v) => (
                      <span
                        key={v}
                        className="kd-font-serif"
                        style={{
                          padding: '4px 11px',
                          borderRadius: 999,
                          fontSize: 14,
                          color: 'var(--kd-ink)',
                          background: 'var(--kd-surface-alt)',
                          border: '1px solid var(--kd-line)',
                        }}
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </SidebarCard>
          )}

          {word.notes && (
            <SidebarCard title="Notes">
              <p
                className="kd-font-sans"
                style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--kd-ink-soft)', margin: 0 }}
              >
                {word.notes}
              </p>
            </SidebarCard>
          )}

          {word.example_phrase && (
            <SidebarCard title="Example phrase">
              <p
                className="kd-font-serif italic"
                style={{ fontSize: 15, lineHeight: 1.55, color: 'var(--kd-ink)', margin: 0 }}
              >
                {word.example_phrase}
              </p>
            </SidebarCard>
          )}

          {Array.isArray(word.tags) && word.tags.length > 0 && (
            <SidebarCard title="Tags">
              <div className="flex flex-wrap gap-2">
                {word.tags.map((tag) => (
                  <span
                    key={tag}
                    className="kd-font-sans"
                    style={{
                      padding: '5px 12px',
                      borderRadius: 999,
                      fontSize: 13,
                      color: 'var(--kd-ink)',
                      background: 'var(--kd-surface-alt)',
                      border: '1px solid var(--kd-line)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </SidebarCard>
          )}

          {word.book_source && (
            <SidebarCard title="Source">
              <dl className="flex flex-col gap-2">
                <MetaRow label="Book" value={word.book_source.book} />
                {word.book_source.page_label && (
                  <MetaRow label="Page" value={word.book_source.page_label} />
                )}
                {word.book_source.hindi_source && (
                  <MetaRow
                    label="Hindi"
                    value={
                      word.book_source.hindi_source === 'model-translated'
                        ? 'AI-translated'
                        : word.book_source.hindi_source
                    }
                  />
                )}
              </dl>
            </SidebarCard>
          )}
        </aside>
      </div>

      {wordId && (
        <>
          <ReportWordModal
            isOpen={showReportModal}
            onClose={() => setShowReportModal(false)}
            wordId={wordId}
            wordText={word.kurukh_word}
          />
          <SuggestCorrectionModal
            isOpen={showCorrectionModal}
            onClose={() => setShowCorrectionModal(false)}
            wordId={wordId}
            wordText={word.kurukh_word}
            currentWord={word}
          />
        </>
      )}
    </div>
  );
};

const SidebarCard = ({ title, children }: { title: string; children: ReactNode }) => (
  <div
    className="p-6 rounded-2xl"
    style={{ background: 'var(--kd-surface)', border: '1px solid var(--kd-line)' }}
  >
    <div className="kd-eyebrow mb-4">{title}</div>
    {children}
  </div>
);

const MetaRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex gap-3 items-baseline">
    <dt
      className="kd-font-mono shrink-0"
      style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--kd-ink-mute)', width: 80 }}
    >
      {label}
    </dt>
    <dd className="kd-font-sans m-0" style={{ fontSize: 13, color: 'var(--kd-ink)', lineHeight: 1.5 }}>
      {value}
    </dd>
  </div>
);

export default WordDetails;
