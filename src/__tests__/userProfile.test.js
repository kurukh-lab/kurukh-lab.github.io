import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UserProfile from '../pages/UserProfile';

// Mock the AuthContext
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: {
      uid: 'test-uid',
      username: 'testuser',
      email: 'test@example.com',
      createdAt: '2025-01-01',
    },
  }),
}));

// Mock the service
jest.mock('../services/dictionaryService', () => ({
  getUserContributions: jest.fn(() => Promise.resolve([])),
}));

// Test suite for User Profile
describe('User Profile', () => {
  test('User profile renders without crashing', () => {
    render(
      <MemoryRouter>
        <UserProfile />
      </MemoryRouter>
    );

    expect(screen.getByText(/testuser/i)).toBeInTheDocument();
  });
});
