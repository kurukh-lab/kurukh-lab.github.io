import {
  useState,
  useEffect,
  useRef,
  type FormEvent,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { useTranslation } from 'react-i18next';
import { FaTimes, FaFilter, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import SearchButton from './SearchButton';
import { IconSearch } from '../kd/icons';
import useSearch from '../../hooks/useSearch';
import useKeyboardShortcut from '../../hooks/useKeyboardShortcut';

export interface SearchBarProps {
  onSearchComplete?: (term: string) => void;
  initialSearchTerm?: string;
  searchTerm?: string;
  onSearchTermChange?: Dispatch<SetStateAction<string>> | ((value: string) => void);
  onSearch?: (event?: FormEvent) => void | Promise<void>;
  loading?: boolean;
  large?: boolean;
  /** When true the bar acts purely as a visual trigger — focusing or clicking
   * it (and the cmd+K / "/" shortcuts) call `onActivate` instead of editing
   * the input. Used by the home page to open the search modal. */
  asTrigger?: boolean;
  onActivate?: () => void;
  autoFocus?: boolean;
}

const SearchBar = ({
  onSearchComplete,
  initialSearchTerm = '',
  searchTerm: controlledSearchTerm,
  onSearchTermChange,
  onSearch,
  loading: externalLoading,
  large = false,
  asTrigger = false,
  onActivate,
  autoFocus = false,
}: SearchBarProps) => {
  const { t } = useTranslation();
  const [showFilters, setShowFilters] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(initialSearchTerm);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    searchTerm: hookSearchTerm,
    setSearchTerm: hookSetSearchTerm,
    loading: hookLoading,
    error,
    filters,
    updateFilters,
    handleSearch: hookHandleSearch,
  } = useSearch();

  const searchTerm =
    controlledSearchTerm !== undefined
      ? controlledSearchTerm
      : hookSearchTerm || localSearchTerm;
  const setSearchTerm =
    onSearchTermChange ||
    hookSetSearchTerm ||
    (setLocalSearchTerm as (value: string) => void);
  const handleSearch = onSearch || hookHandleSearch;
  const loading = externalLoading !== undefined ? externalLoading : hookLoading;

  useEffect(() => {
    if (initialSearchTerm) setSearchTerm(initialSearchTerm);
  }, [initialSearchTerm, setSearchTerm]);

  const focusOrActivate = () => {
    if (asTrigger) onActivate?.();
    else searchInputRef.current?.focus();
  };

  useKeyboardShortcut({
    k: focusOrActivate,
    'ctrl+k': focusOrActivate,
    'cmd+k': focusOrActivate,
    '/': focusOrActivate,
  });

  useEffect(() => {
    if (autoFocus && !asTrigger) searchInputRef.current?.focus();
  }, [autoFocus, asTrigger]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (asTrigger) {
      onActivate?.();
      return;
    }
    await handleSearch(e);
    if (onSearchComplete) onSearchComplete(searchTerm);
  };

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        onClick={asTrigger ? () => onActivate?.() : undefined}
        role={asTrigger ? 'button' : undefined}
        tabIndex={asTrigger ? 0 : undefined}
        onKeyDown={
          asTrigger
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onActivate?.();
                }
              }
            : undefined
        }
        className={`flex items-center gap-3 w-full ${
          asTrigger ? 'cursor-text' : ''
        }`}
        style={{
          background: 'var(--kd-surface)',
          border: '1px solid var(--kd-line)',
          borderRadius: 14,
          padding: large ? '18px 22px' : '12px 18px',
          boxShadow: 'var(--kd-shadow-card)',
        }}
      >
        <IconSearch size={large ? 22 : 18} color="var(--kd-ink-soft)" weight={1.6} />
        <input
          type="text"
          ref={searchInputRef}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={asTrigger ? () => onActivate?.() : undefined}
          readOnly={asTrigger}
          tabIndex={asTrigger ? -1 : undefined}
          placeholder={t('search.placeholder') as string}
          className={`flex-1 bg-transparent border-none outline-none kd-font-sans ${
            asTrigger ? 'cursor-text' : ''
          }`}
          style={{
            fontSize: large ? 19 : 15,
            color: 'var(--kd-ink)',
            pointerEvents: asTrigger ? 'none' : undefined,
          }}
          aria-label={t('search.placeholder') as string}
        />
        {searchTerm && !asTrigger && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            aria-label={t('search.clear') as string}
            className="inline-flex items-center justify-center w-7 h-7 rounded-full transition-colors"
            style={{ color: 'var(--kd-ink-soft)' }}
          >
            <FaTimes />
          </button>
        )}
        {!asTrigger && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowFilters(!showFilters);
            }}
            aria-label={t('search.filters') as string}
            className="inline-flex items-center gap-1 px-2 h-8 rounded-md transition-colors"
            style={{ color: 'var(--kd-ink-soft)' }}
          >
            <FaFilter size={12} />
            {showFilters ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
          </button>
        )}
        <span
          className="hidden sm:inline-flex kd-font-mono items-center px-2 py-1 rounded-md"
          style={{
            fontSize: 11,
            color: 'var(--kd-ink-mute)',
            border: '1px solid var(--kd-line)',
            background: 'var(--kd-surface-alt)',
          }}
        >
          {t('search.shortcut')}
        </span>
        {!asTrigger && (
          <SearchButton
            onClick={handleSubmit}
            disabled={loading || !searchTerm.trim()}
            loading={loading}
          />
        )}
      </form>

      {showFilters && filters && updateFilters && (
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

      {error && <p className="text-error text-sm mt-1">{error}</p>}
    </div>
  );
};

export default SearchBar;
