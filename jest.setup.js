import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill for TextEncoder/TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock Firebase functions
jest.mock('./src/config/firebase', () => ({
  db: {},
  auth: {},
}));

// Mock Firebase/Firestore
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(() => Promise.resolve({
    forEach: jest.fn(),
    docs: [],
    size: 0
  })),
  doc: jest.fn(),
  getDoc: jest.fn(() => Promise.resolve({
    exists: () => false,
    data: () => ({})
  })),
  addDoc: jest.fn(() => Promise.resolve({ id: 'test-id' })),
  updateDoc: jest.fn(() => Promise.resolve()),
  deleteDoc: jest.fn(() => Promise.resolve()),
  limit: jest.fn(),
  orderBy: jest.fn(),
  onSnapshot: jest.fn(),
  serverTimestamp: jest.fn(() => new Date()),
}));

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: { uid: 'test-uid', email: 'test@example.com' }
  })),
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve()),
  signOut: jest.fn(() => Promise.resolve()),
  createUserWithEmailAndPassword: jest.fn(() => Promise.resolve()),
}));

// Mock React Router
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useParams: () => ({ wordId: '1' }),
}));

// Mock AuthContext
jest.mock('./src/contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: { uid: 'test-uid', email: 'test@example.com' },
    login: jest.fn(),
    logout: jest.fn(),
    signup: jest.fn(),
    loading: false,
  }),
  __esModule: true,
  default: ({ children }) => children,
}));

// Mock dictionary service
jest.mock('./src/services/dictionaryService', () => ({
  getDictionaryStats: jest.fn(() => Promise.resolve({
    totalWords: 100,
    totalContributors: 10,
    recentAdditions: 5
  })),
  addWord: jest.fn(() => Promise.resolve()),
  reportWord: jest.fn(() => Promise.resolve()),
}));

// Mock word utils
jest.mock('./src/utils/wordUtils', () => ({
  getWordsByUser: jest.fn(() => Promise.resolve([])),
  searchWords: jest.fn(() => Promise.resolve([])),
  formatDate: jest.fn((date) => 'January 1, 2024'),
  getWordById: jest.fn(() => Promise.resolve({
    id: '1',
    kurukh: 'test',
    english: 'test word',
    definition: 'test definition'
  })),
}));
