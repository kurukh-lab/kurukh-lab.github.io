import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from '../components/common/SearchBar';

// Mock useSearch hook
jest.mock('../hooks/useSearch', () => ({
  __esModule: true,
  default: () => ({
    searchResults: [],
    searchTerm: '',
    setSearchTerm: jest.fn(),
    handleSearch: jest.fn(),
    loading: false,
    filters: {},
    updateFilters: jest.fn(),
  }),
}));

// Test suite for Word Search
describe('Word Search', () => {
  test('Search component renders without crashing', () => {
    const mockOnSearch = jest.fn();

    render(<SearchBar onSearch={mockOnSearch} />);

    expect(screen.getByPlaceholderText('Search for a word...')).toBeInTheDocument();
  });
});
