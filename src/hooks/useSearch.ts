import { useState, useRef, useEffect, type FormEvent } from 'react';
import { searchWordsTypesense } from '../services/typesenseService';
import { searchWords as searchWordsFirestore } from '../services/dictionaryService';
import type { SearchOptions, Word } from '../types';

const DEBOUNCE_MS = 350;

export interface UseSearchReturn {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchResults: Word[];
  loading: boolean;
  error: string | null;
  filters: SearchOptions;
  updateFilters: (newFilters: Partial<SearchOptions>) => void;
  handleSearch: (e?: FormEvent) => void;
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
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const updateFilters = (newFilters: Partial<SearchOptions>): void => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleSearch = (e?: FormEvent): void => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
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
    }, DEBOUNCE_MS);
  };

  const clearSearch = (): void => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSearchTerm('');
    setSearchResults([]);
    setError(null);
    setLoading(false);
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
