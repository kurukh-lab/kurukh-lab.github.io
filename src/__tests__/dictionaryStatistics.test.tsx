import { describe, test, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import DictionaryStats from '../components/dictionary/DictionaryStats';

vi.mock('../services/dictionaryService', () => ({
  getDictionaryStats: vi.fn(() =>
    Promise.resolve({
      totalWords: 100,
      totalContributors: 10,
      newWordsLastWeek: 5,
    }),
  ),
}));

describe('Dictionary Statistics', () => {
  test('Displays dictionary statistics', async () => {
    render(<DictionaryStats />);
    expect(screen.getByText('Loading stats...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Loading stats...')).not.toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });
  });
});
