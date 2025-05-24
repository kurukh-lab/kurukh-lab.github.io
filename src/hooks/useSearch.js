import { useState } from 'react';
import { searchWords } from '../services/dictionaryService';

/**
 * Custom hook for search functionality
 * @returns {Object} Search state and functions
 */
export const useSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    language: '',
    partOfSpeech: '',
  });

  /**
   * Update search filters
   * @param {Object} newFilters - New filter values
   */
  const updateFilters = (newFilters) => {
    setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
  };

  /**
   * Handle search submission
   * @param {Event} e - Form submit event
   * @returns {Promise<void>}
   */
  const handleSearch = async (e) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!searchTerm.trim()) {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Pass filters to searchWords function
      const results = await searchWords(searchTerm.trim(), {
        language: filters.language || undefined,
        partOfSpeech: filters.partOfSpeech || undefined,
      });
      
      setSearchResults(results);
      if (results.length === 0) {
        setError('No words found matching your search criteria.');
      }
    } catch (err) {
      console.error('Error searching words:', err);
      setError('An error occurred while searching. Please try again.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clear search results
   */
  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setError(null);
  };

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    loading,
    error,
    filters,
    updateFilters,
    handleSearch,
    clearSearch
  };
};

export default useSearch;
