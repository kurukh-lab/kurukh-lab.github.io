import React, { useState, useEffect, useRef } from 'react';
import SearchButton from './SearchButton';
import VoiceSearchButton from './VoiceSearchButton';
import { FaTimes, FaFilter, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import useSearch from '../../hooks/useSearch';
import useKeyboardShortcut from '../../hooks/useKeyboardShortcut';

/**
 * Reusable search component styled like a search engine
 * @param {object} props Component props
 * @param {function} [props.onSearchComplete] Callback function when search is complete
 * @param {string} [props.initialSearchTerm] Initial search term
 */
const SearchBar = ({ onSearchComplete, initialSearchTerm = '' }) => {
  const [showFilters, setShowFilters] = useState(false);
  const searchInputRef = useRef(null);
  const {
    searchTerm,
    setSearchTerm,
    loading,
    error,
    filters,
    updateFilters,
    handleSearch
  } = useSearch();

  // Set initial search term if provided
  useEffect(() => {
    if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm);
    }
  }, [initialSearchTerm, setSearchTerm]);

  // Focus search input with keyboard shortcut
  useKeyboardShortcut({
    'k': () => searchInputRef.current?.focus(),
    'ctrl+k': () => searchInputRef.current?.focus(),
    'cmd+k': () => searchInputRef.current?.focus(),
    '/': () => searchInputRef.current?.focus(),
  });

  // Call the onSearchComplete callback when search is complete
  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleSearch(e);
    if (onSearchComplete) {
      onSearchComplete(searchTerm);
    }
  };

  // Handle voice search results
  const handleVoiceResult = (transcript) => {
    setSearchTerm(transcript);
    searchInputRef.current?.focus();
    // Auto-search after a short delay
    setTimeout(() => {
      handleSubmit({ preventDefault: () => {} });
    }, 300);
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="join w-full">
        <input
          type="text"
          ref={searchInputRef}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for a word..."
          className="input input-bordered join-item flex-grow focus:ring-2 focus:ring-primary"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="btn btn-ghost join-item"
            aria-label="Clear search"
          >
            <FaTimes />
          </button>
        )}
        <SearchButton onClick={handleSubmit} disabled={loading || !searchTerm.trim()} loading={loading} />
        <button 
          type="button" 
          onClick={() => setShowFilters(!showFilters)} 
          className="btn btn-ghost join-item"
          aria-label="Toggle search filters"
        >
          <FaFilter />
          {showFilters ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </form>

      {showFilters && (
        <div className="mt-2 p-4 bg-base-200 rounded-md shadow">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Search In:</span>
            </label>
            <select 
              value={filters.language} 
              onChange={(e) => updateFilters({ language: e.target.value })}
              className="select select-bordered w-full"
            >
              <option value="">All Languages</option>
              <option value="en">English</option>
              <option value="hi">Hindi</option>
            </select>
          </div>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text">Part of Speech:</span>
            </label>
            <select
              value={filters.partOfSpeech}
              onChange={(e) => updateFilters({ partOfSpeech: e.target.value })}
              className="select select-bordered w-full"
            >
              <option value="">All Types</option>
              <option value="noun">Noun</option>
              <option value="verb">Verb</option>
              <option value="adjective">Adjective</option>
              <option value="adverb">Adverb</option>
              <option value="pronoun">Pronoun</option>
              <option value="preposition">Preposition</option>
              <option value="conjunction">Conjunction</option>
              <option value="interjection">Interjection</option>
            </select>
          </div>
        </div>
      )}

      {error && <p className="text-error text-sm mt-1">{error}</p>}
    </div>
  );
};

export default SearchBar;
