import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AuthProvider from '../contexts/AuthContext';

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
}));

describe('Authentication', () => {
  test('AuthProvider renders children', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <div>Test Content</div>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});
