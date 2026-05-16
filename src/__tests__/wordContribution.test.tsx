import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Contribute from '../pages/Contribute';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: { uid: 'test-uid', email: 'test@example.com' },
    isAdmin: false,
  }),
}));

describe('Word Contribution', () => {
  test('Contribute page renders without crashing', () => {
    render(
      <MemoryRouter>
        <Contribute />
      </MemoryRouter>,
    );

    expect(
      screen.getAllByRole('heading', { name: /contribute/i })[0],
    ).toBeInTheDocument();
  });
});
