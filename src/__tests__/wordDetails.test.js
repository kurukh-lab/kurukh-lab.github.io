import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import WordDetails from '../pages/WordDetails';

// Mock the getWordById service
jest.mock('../services/dictionaryService', () => ({
  getWordById: jest.fn(() => Promise.resolve({
    id: '1',
    kurukh_word: 'bai',
    meanings: [{ language: 'en', definition: 'brother' }],
    part_of_speech: 'noun',
  })),
}));

// Test suite for Word Details
describe('Word Details', () => {
  test('WordDetails component renders and loads data', async () => {
    render(
      <MemoryRouter initialEntries={['/word/1']}>
        <WordDetails />
      </MemoryRouter>
    );

    // Check for loading spinner initially
    expect(await screen.findByTestId('loading-spinner')).toBeInTheDocument();

    // Wait for the word details to be loaded and loading spinner to disappear
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    // Wait for and verify the word details are displayed
    await waitFor(() => {
      expect(screen.getByText('bai')).toBeInTheDocument();
      expect(screen.getByText('brother')).toBeInTheDocument();
      expect(screen.getByText('noun')).toBeInTheDocument();
    });
  });
});
