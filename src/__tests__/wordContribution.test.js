import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Contribute from '../pages/Contribute';

// Mock the AuthContext
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: { uid: 'test-uid', email: 'test@example.com' },
    isAdmin: false,
  }),
}));

// Test suite for Word Contribution
describe('Word Contribution', () => {
  test('Contribute page renders without crashing', () => {
    render(
      <MemoryRouter>
        <Contribute />
      </MemoryRouter>
    );

    expect(screen.getByText(/Contribute/i)).toBeInTheDocument();
  });
});
