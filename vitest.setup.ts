import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// ─── react-i18next ──────────────────────────────────────────────────────
// Bypass i18n so components can render without an initialised i18n instance.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown> & { returnObjects?: boolean }) => {
      if (opts && opts.returnObjects) return [];
      if (opts && typeof opts === 'object') {
        return Object.entries(opts).reduce<string>(
          (str, [k, v]) =>
            str.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v)),
          key,
        );
      }
      return key;
    },
    i18n: { changeLanguage: vi.fn(), language: 'en' },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

// ─── Firebase config ────────────────────────────────────────────────────
// Stub the actual SDK initialisation. Concrete services are mocked below.
vi.mock('@/config/firebase', () => ({
  db: {},
  auth: {},
  storage: {},
  functions: {},
}));
vi.mock('./src/config/firebase', () => ({
  db: {},
  auth: {},
  storage: {},
  functions: {},
}));

// ─── Firebase modular SDK ───────────────────────────────────────────────
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(() =>
    Promise.resolve({ forEach: vi.fn(), docs: [], size: 0 }),
  ),
  doc: vi.fn(),
  getDoc: vi.fn(() => Promise.resolve({ exists: () => false, data: () => ({}) })),
  addDoc: vi.fn(() => Promise.resolve({ id: 'test-id' })),
  updateDoc: vi.fn(() => Promise.resolve()),
  deleteDoc: vi.fn(() => Promise.resolve()),
  limit: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn(),
  serverTimestamp: vi.fn(() => new Date()),
  increment: vi.fn((n: number) => n),
  arrayUnion: vi.fn((v: unknown) => v),
  arrayRemove: vi.fn((v: unknown) => v),
  setDoc: vi.fn(() => Promise.resolve()),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({
    currentUser: { uid: 'test-uid', email: 'test@example.com' },
  })),
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(() => Promise.resolve()),
  signOut: vi.fn(() => Promise.resolve()),
  createUserWithEmailAndPassword: vi.fn(() => Promise.resolve()),
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(() => Promise.resolve()),
}));

vi.mock('firebase/functions', () => ({
  getFunctions: vi.fn(() => ({})),
  httpsCallable: vi.fn(() => vi.fn(() => Promise.resolve({ data: {} }))),
  connectFunctionsEmulator: vi.fn(),
}));

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(() => ({})),
  connectStorageEmulator: vi.fn(),
  ref: vi.fn(),
  uploadBytes: vi.fn(() => Promise.resolve()),
  getDownloadURL: vi.fn(() => Promise.resolve('')),
}));

// ─── React Router ───────────────────────────────────────────────────────
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>(
    'react-router-dom',
  );
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({ wordId: '1' }),
  };
});

// ─── AuthContext ────────────────────────────────────────────────────────
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: { uid: 'test-uid', email: 'test@example.com' },
    isAdmin: false,
    userRoles: [],
    rolesLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    signup: vi.fn(),
    loading: false,
  }),
  AuthContext: {},
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  default: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock('./src/contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: { uid: 'test-uid', email: 'test@example.com' },
    isAdmin: false,
    userRoles: [],
    rolesLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    signup: vi.fn(),
    loading: false,
  }),
  AuthContext: {},
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  default: ({ children }: { children: React.ReactNode }) => children,
}));

// ─── Service-layer mocks ────────────────────────────────────────────────
vi.mock('@/services/dictionaryService', () => ({
  getDictionaryStats: vi.fn(() =>
    Promise.resolve({ totalWords: 100, totalContributors: 10, recentAdditions: 5 }),
  ),
  addWord: vi.fn(() => Promise.resolve({ success: true })),
  reportWord: vi.fn(() => Promise.resolve({ success: true })),
  getUserContributions: vi.fn(() => Promise.resolve([])),
  getWordById: vi.fn(() => Promise.resolve(null)),
  searchWords: vi.fn(() => Promise.resolve([])),
  toggleWordLike: vi.fn(() => Promise.resolve()),
  hasUserLikedWord: vi.fn(() => Promise.resolve(false)),
  getCorrectionsForReview: vi.fn(() => Promise.resolve([])),
  voteOnCorrection: vi.fn(() => Promise.resolve()),
  applyCorrection: vi.fn(() => Promise.resolve()),
}));
vi.mock('./src/services/dictionaryService', () => ({
  getDictionaryStats: vi.fn(() =>
    Promise.resolve({ totalWords: 100, totalContributors: 10, recentAdditions: 5 }),
  ),
  addWord: vi.fn(() => Promise.resolve({ success: true })),
  reportWord: vi.fn(() => Promise.resolve({ success: true })),
  getUserContributions: vi.fn(() => Promise.resolve([])),
  getWordById: vi.fn(() => Promise.resolve(null)),
  searchWords: vi.fn(() => Promise.resolve([])),
  toggleWordLike: vi.fn(() => Promise.resolve()),
  hasUserLikedWord: vi.fn(() => Promise.resolve(false)),
  getCorrectionsForReview: vi.fn(() => Promise.resolve([])),
  voteOnCorrection: vi.fn(() => Promise.resolve()),
  applyCorrection: vi.fn(() => Promise.resolve()),
}));

vi.mock('@/utils/wordUtils', () => ({
  getWordsByUser: vi.fn(() => Promise.resolve([])),
  searchWords: vi.fn(() => Promise.resolve([])),
  formatDate: vi.fn(() => 'January 1, 2024'),
  getWordOfTheDay: vi.fn(() => Promise.resolve(null)),
  getWordById: vi.fn(() =>
    Promise.resolve({
      id: '1',
      kurukh: 'test',
      english: 'test word',
      definition: 'test definition',
    }),
  ),
}));
vi.mock('./src/utils/wordUtils', () => ({
  getWordsByUser: vi.fn(() => Promise.resolve([])),
  searchWords: vi.fn(() => Promise.resolve([])),
  formatDate: vi.fn(() => 'January 1, 2024'),
  getWordOfTheDay: vi.fn(() => Promise.resolve(null)),
  getWordById: vi.fn(() =>
    Promise.resolve({
      id: '1',
      kurukh: 'test',
      english: 'test word',
      definition: 'test definition',
    }),
  ),
}));
