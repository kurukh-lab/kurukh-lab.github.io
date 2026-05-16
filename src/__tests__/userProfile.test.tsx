import { describe, test, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UserProfile from '../pages/UserProfile';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: {
      uid: 'test-uid',
      username: 'testuser',
      email: 'test@example.com',
      createdAt: '2025-01-01',
    },
  }),
}));

vi.mock('../services/dictionaryService', () => ({
  getUserContributions: vi.fn(() => Promise.resolve([])),
}));

describe('User Profile', () => {
  test('User profile renders without crashing', () => {
    render(
      <MemoryRouter>
        <UserProfile />
      </MemoryRouter>,
    );
    expect(document.body).toBeInTheDocument();
  });
});
