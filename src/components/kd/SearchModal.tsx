import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaTimes, FaFilter, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import {
  IconSearch,
  IconSpeaker,
  IconClose,
  IconBookmark,
  IconHeart,
  IconShare,
  IconArrow,
} from './icons';
import StatusBadge from './StatusBadge';
import { useSearchUI, type SearchSort } from '../../contexts/SearchContext';
import { highlightMatch } from '../../utils/highlightUtils';
import type { Word } from '../../types';

type SortMode = SearchSort;

type WordWithExtras = Word & {
  pronunciation?: string;
  likes?: number;
  likes_count?: number;
};

const SearchModal = () => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const {
    open,
    closeSearch,
    searchTerm,
    setSearchTerm,
    searchResults,
    loading,
    filters,
    updateFilters,
    handleSearch,
    clearSearch,
    sort,
    setSort,
    selectedId,
    setSelectedId,
  } = useSearchUI();
  const onClose = closeSearch;

  const [showFilters, setShowFilters] = useState(false);

  // Focus the input each time the modal opens — the term itself persists
  // across opens because it lives in the SearchProvider above us.
  useEffect(() => {
    if (!open) return;
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => window.clearTimeout(focusTimer);
  }, [open]);

  // Live search — debounce is handled inside useSearch (350 ms).
  useEffect(() => {
    if (!open) return;
    if (!searchTerm.trim()) return;
    handleSearch();
    // handleSearch closes over searchTerm/filters; the hook debounces internally.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, searchTerm, filters.language, filters.partOfSpeech]);

  // Lock body scroll while the modal is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // ESC closes; arrow keys move selection through the result list.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      if (sortedResults.length === 0) return;
      const idx = sortedResults.findIndex((w) => w.id === selectedId);
      const nextIdx =
        e.key === 'ArrowDown'
          ? Math.min(sortedResults.length - 1, (idx < 0 ? -1 : idx) + 1)
          : Math.max(0, (idx < 0 ? 0 : idx) - 1);
      const next = sortedResults[nextIdx];
      if (next) {
        e.preventDefault();
        setSelectedId(next.id);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, selectedId, searchResults, sort]);

  // Filter cached results against the current input before showing them. The
  // server's searchResults reflect the *last submitted* query — when the user
  // is still typing, hide entries that no longer match so we never display a
  // stale row like "chicka" for the input "m".
  const filteredResults = useMemo(() => {
    const list = searchResults as WordWithExtras[];
    const needle = searchTerm.trim().toLowerCase();
    if (!needle) return list;
    return list.filter((word) => {
      if (word.kurukh_word?.toLowerCase().includes(needle)) return true;
      if (word.kurukh_word_ascii?.toLowerCase().includes(needle)) return true;
      return (word.meanings || []).some((m) =>
        m.definition?.toLowerCase().includes(needle),
      );
    });
  }, [searchResults, searchTerm]);

  const sortedResults = useMemo(() => {
    const list = filteredResults;
    if (sort === 'alpha') {
      return [...list].sort((a, b) =>
        (a.kurukh_word || '').localeCompare(b.kurukh_word || ''),
      );
    }
    if (sort === 'liked') {
      return [...list].sort(
        (a, b) =>
          (b.likesCount ?? b.likes ?? b.likes_count ?? 0) -
          (a.likesCount ?? a.likes ?? a.likes_count ?? 0),
      );
    }
    return list;
  }, [filteredResults, sort]);

  // Keep a selection in sync with what's on screen.
  useEffect(() => {
    if (sortedResults.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !sortedResults.some((w) => w.id === selectedId)) {
      setSelectedId(sortedResults[0].id);
    }
  }, [sortedResults, selectedId]);

  const selectedWord = useMemo(
    () => sortedResults.find((w) => w.id === selectedId) || null,
    [sortedResults, selectedId],
  );

  const handleSubmit = (e: FormEvent) => {
    handleSearch(e);
  };

  const handleClear = () => {
    clearSearch();
    setSelectedId(null);
    inputRef.current?.focus();
  };

  const handleOverlayClick = (e: ReactKeyboardEvent | { target: EventTarget }) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!open) return null;

  const trimmed = searchTerm.trim();
  const hasQuery = trimmed.length > 0;
  const hasResults = sortedResults.length > 0;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={t('search.modal.eyebrow') as string}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[80] flex items-start justify-center p-10 sm:px-8 sm:py-10 overflow-y-auto"
      style={{
        background: 'color-mix(in srgb, var(--kd-ink) 55%, transparent)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full h-full rounded-2xl flex flex-col overflow-hidden"
        style={{
          background: 'var(--kd-bg)',
          border: '1px solid var(--kd-line)',
          boxShadow: 'var(--kd-shadow-elev)',
          maxHeight: 'calc(100vh - 60px)',
        }}
      >
        {/* Search input row */}
        <div className="px-5 sm:px-7 pt-5 sm:pt-6">
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-3 w-full"
            style={{
              background: 'var(--kd-surface)',
              border: '1px solid var(--kd-line)',
              borderRadius: 14,
              padding: '14px 18px',
              boxShadow: 'var(--kd-shadow-card)',
            }}
          >
            <IconSearch size={20} color="var(--kd-ink-soft)" weight={1.6} />
            <input
              type="text"
              ref={inputRef}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('search.placeholder') as string}
              className="flex-1 bg-transparent border-none outline-none kd-font-sans"
              style={{ fontSize: 18, color: 'var(--kd-ink)' }}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClear}
                aria-label={t('search.clear') as string}
                className="inline-flex items-center justify-center w-7 h-7 rounded-full"
                style={{ color: 'var(--kd-ink-soft)' }}
              >
                <FaTimes />
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              aria-label={t('search.filters') as string}
              className="inline-flex items-center gap-1.5 px-2.5 h-8 rounded-md"
              style={{
                color: 'var(--kd-ink-soft)',
                border: '1px solid var(--kd-line)',
                background: 'var(--kd-surface-alt)',
              }}
            >
              <FaFilter size={11} />
              <span className="kd-font-sans" style={{ fontSize: 12 }}>
                {t('search.filters')}
              </span>
              {showFilters ? <FaChevronUp size={9} /> : <FaChevronDown size={9} />}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label={t('search.modal.close') as string}
              className="hidden sm:inline-flex kd-font-mono items-center gap-1 px-2 py-1 rounded-md"
              style={{
                fontSize: 11,
                color: 'var(--kd-ink-mute)',
                border: '1px solid var(--kd-line)',
                background: 'var(--kd-surface-alt)',
              }}
              title={t('search.modal.close') as string}
            >
              <IconClose size={12} />
              <span>ESC</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label={t('search.modal.close') as string}
              className="sm:hidden inline-flex items-center justify-center w-7 h-7 rounded-full"
              style={{ color: 'var(--kd-ink-soft)' }}
            >
              <IconClose size={16} />
            </button>
          </form>

          {showFilters && (
            <div
              className="mt-3 p-4 rounded-xl"
              style={{
                background: 'var(--kd-surface)',
                border: '1px solid var(--kd-line)',
              }}
            >
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="kd-eyebrow">{t('search.searchIn')}</span>
                  <select
                    value={filters.language || ''}
                    onChange={(e) => updateFilters({ language: e.target.value })}
                    className="select select-bordered w-full"
                    style={{
                      background: 'var(--kd-bg)',
                      color: 'var(--kd-ink)',
                      borderColor: 'var(--kd-line)',
                    }}
                  >
                    <option value="">{t('search.allLanguages')}</option>
                    <option value="en">{t('word.english')}</option>
                    <option value="hi">{t('word.hindi')}</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="kd-eyebrow">{t('search.partOfSpeech')}</span>
                  <select
                    value={filters.partOfSpeech || ''}
                    onChange={(e) => updateFilters({ partOfSpeech: e.target.value })}
                    className="select select-bordered w-full"
                    style={{
                      background: 'var(--kd-bg)',
                      color: 'var(--kd-ink)',
                      borderColor: 'var(--kd-line)',
                    }}
                  >
                    <option value="">{t('search.allTypes')}</option>
                    <option value="noun">Noun</option>
                    <option value="verb">Verb</option>
                    <option value="adjective">Adjective</option>
                    <option value="adverb">Adverb</option>
                    <option value="pronoun">Pronoun</option>
                    <option value="preposition">Preposition</option>
                    <option value="conjunction">Conjunction</option>
                    <option value="interjection">Interjection</option>
                  </select>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Eyebrow + sort tabs */}
        <div className="px-5 sm:px-7 pt-5 pb-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="kd-eyebrow">
            {hasQuery && hasResults
              ? `${t('search.modal.eyebrow')} · ${t('search.modal.matches', {
                  count: sortedResults.length,
                  term: trimmed,
                })}`
              : t('search.modal.eyebrow')}
          </div>
          <SortTabs sort={sort} onChange={setSort} />
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 px-5 sm:px-7 pb-6 overflow-hidden">
          {loading ? (
            <BodyMessage title={t('search.modal.loading') as string} />
          ) : !hasQuery ? (
            <BodyMessage
              title={t('search.modal.empty.title') as string}
              body={t('search.modal.empty.body') as string}
            />
          ) : !hasResults ? (
            <BodyMessage
              title={
                t('search.modal.noResults.title', { term: trimmed }) as string
              }
              body={t('search.modal.noResults.body') as string}
            />
          ) : (
            <SplitView
              results={sortedResults}
              selectedId={selectedId}
              onSelect={setSelectedId}
              selected={selectedWord}
              onCloseModal={onClose}
              searchTerm={trimmed}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const SortTabs = ({
  sort,
  onChange,
}: {
  sort: SortMode;
  onChange: (s: SortMode) => void;
}) => {
  const { t } = useTranslation();
  const tabs: { id: SortMode; label: string }[] = [
    { id: 'relevance', label: t('search.modal.sort.relevance') as string },
    { id: 'alpha', label: t('search.modal.sort.alpha') as string },
    { id: 'liked', label: t('search.modal.sort.liked') as string },
  ];
  return (
    <div
      className="inline-flex items-center p-1 rounded-full"
      style={{ background: 'var(--kd-surface-alt)' }}
    >
      {tabs.map((tab) => {
        const active = sort === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className="kd-font-sans px-3 py-1.5 rounded-full transition-colors"
            style={{
              fontSize: 12,
              fontWeight: 500,
              background: active ? 'var(--kd-accent)' : 'transparent',
              color: active ? '#FBF7EE' : 'var(--kd-ink-soft)',
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

const BodyMessage = ({ title, body }: { title: string; body?: string }) => (
  <div
    className="h-full flex flex-col items-center justify-center text-center py-16"
    style={{ color: 'var(--kd-ink-soft)' }}
  >
    <div
      className="kd-font-serif"
      style={{
        fontSize: 26,
        fontWeight: 500,
        color: 'var(--kd-ink)',
        letterSpacing: '-0.01em',
      }}
    >
      {title}
    </div>
    {body && (
      <p
        className="kd-font-sans mt-2"
        style={{ fontSize: 14, color: 'var(--kd-ink-mute)', maxWidth: 380 }}
      >
        {body}
      </p>
    )}
  </div>
);

const SplitView = ({
  results,
  selectedId,
  onSelect,
  selected,
  onCloseModal,
  searchTerm,
}: {
  results: WordWithExtras[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  selected: WordWithExtras | null;
  onCloseModal: () => void;
  searchTerm: string;
}) => {
  return (
    <div className="h-full grid gap-4 md:gap-5 md:grid-cols-[minmax(240px,300px)_1fr] min-h-0">
      <ResultsList
        results={results}
        selectedId={selectedId}
        onSelect={onSelect}
        searchTerm={searchTerm}
      />
      <DetailPane
        word={selected}
        onCloseModal={onCloseModal}
        searchTerm={searchTerm}
      />
    </div>
  );
};

const ResultsList = ({
  results,
  selectedId,
  onSelect,
  searchTerm,
}: {
  results: WordWithExtras[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  searchTerm: string;
}) => {
  return (
    <div
      className="rounded-2xl overflow-y-auto"
      style={{
        background: 'var(--kd-surface)',
        border: '1px solid var(--kd-line)',
        maxHeight: '100%',
      }}
    >
      <ul className="flex flex-col">
        {results.map((word) => {
          const active = word.id === selectedId;
          const gloss = word.meanings?.[0]?.definition;
          const pos = word.part_of_speech;
          return (
            <li key={word.id}>
              <button
                type="button"
                onClick={() => onSelect(word.id)}
                className="w-full text-left px-4 py-3 transition-colors"
                style={{
                  background: active ? 'var(--kd-surface-alt)' : 'transparent',
                  borderLeft: `3px solid ${
                    active ? 'var(--kd-accent)' : 'transparent'
                  }`,
                }}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span
                    className="kd-font-serif"
                    style={{
                      fontSize: 18,
                      fontWeight: 500,
                      color: 'var(--kd-ink)',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {highlightMatch(word.kurukh_word, searchTerm)}
                  </span>
                  {word.status && <StatusBadge status={word.status} />}
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  {pos && (
                    <span
                      className="kd-font-sans uppercase"
                      style={{
                        fontSize: 10,
                        letterSpacing: '0.1em',
                        color: 'var(--kd-ink-mute)',
                      }}
                    >
                      {pos}
                    </span>
                  )}
                  {gloss && (
                    <span
                      className={`${word.meanings?.[0]?.language === 'hi' ? 'kd-font-deva' : 'kd-font-serif'} italic line-clamp-1`}
                      style={{ fontSize: 13, color: 'var(--kd-ink-soft)' }}
                    >
                      {highlightMatch(gloss, searchTerm)}
                    </span>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const DetailPane = ({
  word,
  onCloseModal,
  searchTerm,
}: {
  word: WordWithExtras | null;
  onCloseModal: () => void;
  searchTerm: string;
}) => {
  const { t } = useTranslation();

  if (!word) return null;

  const meanings = word.meanings || [];
  const primary = meanings[0];
  const englishMeaning = meanings.find((m) => m.language === 'en') || primary;
  const hindiMeaning = meanings.find((m) => m.language === 'hi');
  const example =
    primary?.example_sentence_kurukh ||
    meanings.find((m) => m.example_sentence_kurukh)?.example_sentence_kurukh;
  const exampleTr =
    primary?.example_sentence_translation ||
    meanings.find((m) => m.example_sentence_translation)
      ?.example_sentence_translation;
  const likes = word.likesCount ?? word.likes ?? word.likes_count ?? 0;

  const handlePronounce = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word.kurukh_word);
    u.lang = 'en';
    window.speechSynthesis.speak(u);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/word/${word.id}`;
    if (navigator?.clipboard) navigator.clipboard.writeText(url).catch(() => {});
  };

  return (
    <div
      className="rounded-2xl overflow-y-auto p-6 sm:p-8 flex flex-col"
      style={{
        background: 'var(--kd-surface)',
        border: '1px solid var(--kd-line)',
        boxShadow: 'var(--kd-shadow-card)',
        maxHeight: '100%',
      }}
    >
      <div className="flex items-baseline gap-3 flex-wrap">
        <h2
          className="kd-font-serif"
          style={{
            fontWeight: 500,
            fontSize: 'clamp(40px, 5vw, 60px)',
            margin: 0,
            color: 'var(--kd-ink)',
            letterSpacing: '-0.025em',
            lineHeight: 1,
          }}
        >
          {highlightMatch(word.kurukh_word, searchTerm)}
        </h2>
        {word.pronunciation && (
          <span
            className="kd-font-mono"
            style={{ fontSize: 16, color: 'var(--kd-ink-soft)' }}
          >
            /{word.pronunciation}/
          </span>
        )}
        <button
          type="button"
          onClick={handlePronounce}
          className="inline-flex items-center justify-center w-9 h-9 rounded-full"
          style={{ background: 'var(--kd-surface-alt)', color: 'var(--kd-ink)' }}
          aria-label="play pronunciation"
        >
          <IconSpeaker size={16} weight={1.6} />
        </button>
        {word.part_of_speech && (
          <span
            className="kd-font-sans uppercase"
            style={{
              padding: '4px 10px',
              borderRadius: 999,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.08em',
              background: 'var(--kd-surface-alt)',
              color: 'var(--kd-ink-soft)',
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

      {englishMeaning?.definition && (
        <p
          className="kd-font-serif mt-7 mb-0"
          style={{
            fontSize: 'clamp(20px, 2.1vw, 26px)',
            color: 'var(--kd-ink)',
            lineHeight: 1.35,
            fontWeight: 400,
          }}
        >
          {highlightMatch(englishMeaning.definition, searchTerm)}
        </p>
      )}

      {hindiMeaning?.definition && (
        <p
          className="kd-font-deva mt-2 mb-0"
          style={{
            fontSize: 'clamp(18px, 1.8vw, 22px)',
            color: 'var(--kd-ink-soft)',
            lineHeight: 1.45,
            fontWeight: 400,
          }}
        >
          {highlightMatch(hindiMeaning.definition, searchTerm)}
        </p>
      )}

      {example && (
        <div
          className="mt-6 p-4 rounded-xl"
          style={{ background: 'var(--kd-surface-alt)' }}
        >
          <p
            className="kd-font-serif italic"
            style={{
              fontSize: 16,
              color: 'var(--kd-ink)',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            “{example}”
          </p>
          {exampleTr && (
            <p
              className="kd-font-sans mt-1.5"
              style={{
                fontSize: 13,
                color: 'var(--kd-ink-soft)',
                margin: 0,
              }}
            >
              {exampleTr}
            </p>
          )}
        </div>
      )}

      <div
        className="mt-auto pt-6 flex items-center justify-between gap-3 flex-wrap"
        style={{ borderTop: '1px solid var(--kd-line)', marginTop: 28 }}
      >
        <div className="flex items-center gap-2">
          <span
            className="kd-eyebrow"
            style={{ color: 'var(--kd-ink-mute)', letterSpacing: '0.18em' }}
          >
            {t('search.modal.shareLabel')}
          </span>
          <button
            type="button"
            onClick={handleCopyLink}
            aria-label="copy link"
            className="inline-flex items-center justify-center w-8 h-8 rounded-full"
            style={{ color: 'var(--kd-ink-soft)' }}
          >
            <IconShare size={15} />
          </button>
          <Link
            to={`/word/${word.id}`}
            onClick={onCloseModal}
            aria-label={t('search.modal.openWord') as string}
            className="inline-flex items-center justify-center w-8 h-8 rounded-full"
            style={{ color: 'var(--kd-ink-soft)' }}
          >
            <IconArrow size={15} />
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="inline-flex items-center gap-1.5 kd-font-mono"
            style={{ fontSize: 13, color: 'var(--kd-ink-soft)' }}
          >
            <IconHeart
              size={14}
              color="var(--kd-accent)"
              fill="var(--kd-accent)"
            />
            {likes}
          </span>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 kd-font-sans rounded-md"
            style={{
              fontSize: 13,
              color: 'var(--kd-ink)',
              border: '1px solid var(--kd-line)',
            }}
          >
            <IconBookmark size={13} />
            {t('search.modal.saveLabel')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
