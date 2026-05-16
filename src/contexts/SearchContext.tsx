import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import useSearch, { type UseSearchReturn } from '../hooks/useSearch';

export type SearchSort = 'relevance' | 'alpha' | 'liked';

export interface SearchContextValue extends UseSearchReturn {
  open: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  sort: SearchSort;
  setSort: (sort: SearchSort) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const search = useSearch();
  const [open, setOpen] = useState(false);
  const [sort, setSort] = useState<SearchSort>('relevance');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const openSearch = useCallback(() => setOpen(true), []);
  const closeSearch = useCallback(() => setOpen(false), []);

  const value = useMemo<SearchContextValue>(
    () => ({
      ...search,
      open,
      openSearch,
      closeSearch,
      sort,
      setSort,
      selectedId,
      setSelectedId,
    }),
    [search, open, openSearch, closeSearch, sort, selectedId],
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
};

export const useSearchUI = (): SearchContextValue => {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearchUI must be used within SearchProvider');
  return ctx;
};

export default SearchContext;
