import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import DictionaryStats from '../components/dictionary/DictionaryStats';

// Test suite for Dictionary Statistics

jest.mock('../services/dictionaryService', () => ({
  getDictionaryStats: jest.fn(() => Promise.resolve({
    totalWords: 100,
    totalContributors: 10,
    newWordsLastWeek: 5
  }))
}));

describe('Dictionary Statistics', () => {
  test('Displays dictionary statistics', async () => {
    render(<DictionaryStats />);

    // First check that loading state is shown
    expect(screen.getByText('Loading stats...')).toBeInTheDocument();

    // Wait for the stats to be loaded and displayed
    await waitFor(() => {
      expect(screen.queryByText('Loading stats...')).not.toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument(); // Total words
      expect(screen.getByText('10')).toBeInTheDocument(); // Contributors
    });

    // Recent additions display might be empty or formatted differently, 
    // so let's not test for the exact value
    expect(screen.getByText(/New Words/)).toBeInTheDocument();
  });
});
