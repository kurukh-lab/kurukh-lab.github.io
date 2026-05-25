import { useState, type FormEvent } from 'react';
import { searchWordsTypesense } from '../services/typesenseService';
import { searchWords as searchWordsFirestore } from '../services/dictionaryService';
import type { SearchOptions, Word } from '../types';

export interface UseSearchReturn {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchResults: Word[];
  loading: boolean;
  error: string | null;
  filters: SearchOptions;
  updateFilters: (newFilters: Partial<SearchOptions>) => void;
  handleSearch: (e?: FormEvent) => Promise<void>;
  clearSearch: () => void;
}

export const useSearch = (): UseSearchReturn => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Word[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchOptions>({
    language: '',
    partOfSpeech: '',
  });

  const updateFilters = (newFilters: Partial<SearchOptions>): void => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleSearch = async (e?: FormEvent): Promise<void> => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const searchOptions: SearchOptions = {
        language: filters.language || undefined,
        partOfSpeech: filters.partOfSpeech || undefined,
      };

      let results: Word[];
      try {
        results = await searchWordsTypesense(searchTerm.trim(), searchOptions);
      } catch {
        // Typesense unavailable — fall back to Firestore
        results = await searchWordsFirestore(searchTerm.trim(), searchOptions);
      }

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

  const clearSearch = (): void => {
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
    clearSearch,
  };
};

export default useSearch;
