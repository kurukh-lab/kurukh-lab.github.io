import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SearchBar from '../components/common/SearchBar';

vi.mock('../hooks/useSearch', () => ({
  default: () => ({
    searchResults: [],
    searchTerm: '',
    setSearchTerm: vi.fn(),
    handleSearch: vi.fn(),
    loading: false,
    filters: {},
    updateFilters: vi.fn(),
  }),
}));

describe('Word Search', () => {
  test('Search component renders without crashing', () => {
    render(
      <SearchBar
        onSearch={vi.fn()}
        onSearchComplete={vi.fn()}
        searchTerm=""
        onSearchTermChange={vi.fn()}
        loading={false}
      />,
    );
    expect(screen.getByPlaceholderText('search.placeholder')).toBeInTheDocument();
  });
});
