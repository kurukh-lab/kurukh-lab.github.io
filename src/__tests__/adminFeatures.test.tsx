import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Admin from '../pages/Admin';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: { uid: 'test-uid', email: 'test@example.com' },
    isAdmin: true,
  }),
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(() => Promise.resolve({ docs: [], forEach: vi.fn(), size: 0 })),
  doc: vi.fn(),
  updateDoc: vi.fn(),
  orderBy: vi.fn(),
  getDoc: vi.fn(),
}));

describe('Admin Features', () => {
  test('Admin page renders without crashing', () => {
    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>,
    );
    expect(document.body).toBeInTheDocument();
  });
});
