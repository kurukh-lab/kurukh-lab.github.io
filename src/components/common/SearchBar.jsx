import React, { useState } from 'react';
import useSearch from '../../hooks/useSearch';

/**
 * Reusable search component
 * @param {object} props Component props
 * @param {function} [props.onSearchComplete] Callback function when search is complete
 * @param {string} [props.initialSearchTerm] Initial search term
 */
const SearchBar = ({ onSearchComplete, initialSearchTerm = '' }) => {
  const [showFilters, setShowFilters] = useState(false);
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
  React.useEffect(() => {
    if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm);
    }
  }, [initialSearchTerm, setSearchTerm]);

  // Call the onSearchComplete callback when search is complete
  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleSearch(e);
    if (onSearchComplete) {
      onSearchComplete(searchTerm);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="relative flex w-full gap-2">
          <div className="flex-grow relative">
            <input
              type="text"
              placeholder="Search for Kurukh words..."
              className="input input-bordered w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button 
              type="button" 
              className="btn btn-circle btn-ghost btn-xs absolute right-3 top-1/2 -translate-y-1/2"
              onClick={() => setShowFilters(!showFilters)}
              title={showFilters ? "Hide filters" : "Show filters"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2z"/>
              </svg>
            </button>
          </div>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading || !searchTerm.trim()}
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "Search"
            )}
          </button>
        </div>
        
        {showFilters && (
          <div className="bg-base-200 p-3 rounded-md mt-2 flex flex-wrap gap-3">
            <div className="form-control w-full max-w-xs">
              <label className="label">
                <span className="label-text">Language</span>
              </label>
              <select 
                className="select select-bordered select-sm"
                value={filters.language}
                onChange={(e) => updateFilters({ language: e.target.value })}
              >
                <option value="">All Languages</option>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
            
            <div className="form-control w-full max-w-xs">
              <label className="label">
                <span className="label-text">Part of Speech</span>
              </label>
              <select 
                className="select select-bordered select-sm"
                value={filters.partOfSpeech}
                onChange={(e) => updateFilters({ partOfSpeech: e.target.value })}
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
      </form>
    </div>
  );
};

export default SearchBar;
