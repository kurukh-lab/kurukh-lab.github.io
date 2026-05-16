import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import WordDetails from '../pages/WordDetails';

vi.mock('../services/dictionaryService', () => ({
  getWordById: vi.fn(() =>
    Promise.resolve({
      id: '1',
      kurukh_word: 'bai',
      meanings: [{ language: 'en', definition: 'brother' }],
      part_of_speech: 'noun',
    }),
  ),
  // Downstream components in the tree (LikeButton, etc.) reach for these.
  // Vitest's vi.mock is strict about unknown exports, so we list them here.
  hasUserLikedWord: vi.fn(() => Promise.resolve(false)),
  toggleWordLike: vi.fn(() =>
    Promise.resolve({ success: true, liked: false, newCount: 0 }),
  ),
  getWordLikeCount: vi.fn(() => Promise.resolve(0)),
  reportWord: vi.fn(() => Promise.resolve({ success: true })),
  submitCorrection: vi.fn(() => Promise.resolve({ success: true })),
  voteOnWord: vi.fn(() => Promise.resolve({ success: true })),
  getCommentsForWord: vi.fn(() => Promise.resolve({ success: true, comments: [] })),
  getWordReports: vi.fn(() => Promise.resolve([])),
}));

describe('Word Details', () => {
  test('WordDetails component renders and loads data', async () => {
    render(
      <MemoryRouter initialEntries={['/word/1']}>
        <WordDetails />
      </MemoryRouter>,
    );
    // The spinner is rendered synchronously on first render; with the mock
    // resolving the word almost-immediately, awaiting findBy can race past
    // it. Assert synchronously.
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
