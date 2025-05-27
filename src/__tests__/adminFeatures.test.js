import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Admin from '../pages/Admin';

// Mock the AuthContext
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: { uid: 'test-uid', email: 'test@example.com' },
    isAdmin: true,
  }),
}));

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(() => Promise.resolve({ docs: [] })),
  doc: jest.fn(),
  updateDoc: jest.fn(),
  orderBy: jest.fn(),
  getDoc: jest.fn(),
}));

// Test suite for Admin Features
describe('Admin Features', () => {
  test('Admin page renders without crashing', () => {
    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );
    
    // Just check if the component renders
    expect(screen.getByText(/Admin/i)).toBeInTheDocument();
  });
});
