import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AuthProvider from '../contexts/AuthContext';

// Mock Firebase auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

// Test suite for Authentication
describe('Authentication', () => {
  test('AuthProvider renders children', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <div>Test Content</div>
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});
