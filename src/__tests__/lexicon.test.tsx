import { describe, test, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Lexicon from '../pages/Lexicon';
import { getWordsByLetter } from '../services/dictionaryService';

// Override the react-router-dom mock from vitest.setup.ts to provide our parameter
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({ letter: 'A' }),
  };
});

vi.mock('../services/dictionaryService', () => ({
  getWordsByLetter: vi.fn(() =>
    Promise.resolve([
      {
        id: 'w1',
        kurukh_word: 'Ajjā',
        kurukh_word_ascii: 'ajja',
        meanings: [{ language: 'en', definition: 'grandfather' }],
        part_of_speech: 'noun',
        status: 'approved',
      },
    ]),
  ),
  getDictionaryStats: vi.fn(() =>
    Promise.resolve({ totalWords: 100, totalContributors: 10, recentAdditions: 5 }),
  ),
}));

describe('Browse Lexicon Feature', () => {
  test('Lexicon page renders and displays words starting with the letter', async () => {
    render(
      <MemoryRouter initialEntries={['/lexicon/A']}>
        <Lexicon />
      </MemoryRouter>,
    );

    // Wait for the mock data to load and render
    expect(await screen.findByText('Ajjā')).toBeInTheDocument();
    expect(screen.getByText('grandfather')).toBeInTheDocument();

    // Verify the service was called with the correct letter 'A'
    expect(getWordsByLetter).toHaveBeenCalledWith('A');
  });
});
