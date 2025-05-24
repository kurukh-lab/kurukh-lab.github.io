import React, { useState, useRef, useEffect } from 'react';
import useSearch from '../../hooks/useSearch';
import useKeyboardShortcut from '../../hooks/useKeyboardShortcut';
import { Input, Button, Select, Collapse } from 'react-daisyui';
import SearchButton from './SearchButton';
import VoiceSearchButton from './VoiceSearchButton';

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
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="relative flex w-full gap-2">
          <div className="flex-grow relative shadow-md rounded-full overflow-hidden">
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search for Kurukh words..."
              className="input w-full pl-5 pr-24 py-3 rounded-full border-2 border-primary/20 focus:border-primary transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              color="ghost"
              size="lg"
            />
            <VoiceSearchButton onResult={handleVoiceResult} />
            <Button
              type="button" 
              className="btn btn-ghost btn-circle absolute right-3 top-1/2 -translate-y-1/2"
              onClick={() => setShowFilters(!showFilters)}
              title={showFilters ? "Hide filters" : "Show filters"}
              size="sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2z"/>
              </svg>
            </Button>
          </div>
          <SearchButton loading={loading} disabled={!searchTerm.trim()} />
        </div>
        
        <Collapse open={showFilters} className="mt-2">
          <div className="bg-base-200 p-4 rounded-lg shadow-inner flex flex-wrap gap-4">
            <div className="form-control w-full max-w-xs">
              <label className="label">
                <span className="label-text font-medium">Language</span>
              </label>
              <Select 
                className="select select-bordered"
                value={filters.language}
                onChange={(e) => updateFilters({ language: e.target.value })}
                bordered
                color="ghost"
              >
                <Select.Option value="">All Languages</Select.Option>
                <Select.Option value="en">English</Select.Option>
                <Select.Option value="hi">Hindi</Select.Option>
              </Select>
            </div>
            
            <div className="form-control w-full max-w-xs">
              <label className="label">
                <span className="label-text font-medium">Part of Speech</span>
              </label>
              <Select
                className="select select-bordered"
                value={filters.partOfSpeech}
                onChange={(e) => updateFilters({ partOfSpeech: e.target.value })}
                bordered
                color="ghost"
              >
                <Select.Option value="">All Types</Select.Option>
                <Select.Option value="noun">Noun</Select.Option>
                <Select.Option value="verb">Verb</Select.Option>
                <Select.Option value="adjective">Adjective</Select.Option>
                <Select.Option value="adverb">Adverb</Select.Option>
                <Select.Option value="pronoun">Pronoun</Select.Option>
                <Select.Option value="preposition">Preposition</Select.Option>
                <Select.Option value="conjunction">Conjunction</Select.Option>
                <Select.Option value="interjection">Interjection</Select.Option>
              </Select>
            </div>
          </div>
        </Collapse>
        
        {error && <p className="text-error text-sm mt-1">{error}</p>}
      </form>
    </div>
  );
};

export default SearchBar;
