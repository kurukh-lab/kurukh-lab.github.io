import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

// Polyfill for TextEncoder/TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock react-i18next so components using useTranslation render without i18n setup
jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key, opts) => {
            if (opts && opts.returnObjects) return [];
            if (opts && typeof opts === "object") {
                return Object.entries(opts).reduce(
                    (str, [k, v]) =>
                        str.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), v),
                    key,
                );
            }
            return key;
        },
        i18n: { changeLanguage: jest.fn(), language: "en" },
    }),
    Trans: ({ children }) => children,
    initReactI18next: { type: "3rdParty", init: jest.fn() },
}));

// Mock Firebase config
jest.mock("./src/config/firebase", () => ({
    db: {},
    auth: {},
    storage: {},
    functions: {},
}));

// Mock Firebase/Firestore
jest.mock("firebase/firestore", () => ({
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    getDocs: jest.fn(() =>
        Promise.resolve({
            forEach: jest.fn(),
            docs: [],
            size: 0,
        }),
    ),
    doc: jest.fn(),
    getDoc: jest.fn(() =>
        Promise.resolve({
            exists: () => false,
            data: () => ({}),
        }),
    ),
    addDoc: jest.fn(() => Promise.resolve({ id: "test-id" })),
    updateDoc: jest.fn(() => Promise.resolve()),
    deleteDoc: jest.fn(() => Promise.resolve()),
    limit: jest.fn(),
    orderBy: jest.fn(),
    onSnapshot: jest.fn(),
    serverTimestamp: jest.fn(() => new Date()),
}));

// Mock Firebase Auth
jest.mock("firebase/auth", () => ({
    getAuth: jest.fn(() => ({
        currentUser: { uid: "test-uid", email: "test@example.com" },
    })),
    onAuthStateChanged: jest.fn(),
    signInWithEmailAndPassword: jest.fn(() => Promise.resolve()),
    signOut: jest.fn(() => Promise.resolve()),
    createUserWithEmailAndPassword: jest.fn(() => Promise.resolve()),
    GoogleAuthProvider: jest.fn(),
    signInWithPopup: jest.fn(() => Promise.resolve()),
}));

// Mock Firebase Functions
jest.mock("firebase/functions", () => ({
    getFunctions: jest.fn(() => ({})),
    httpsCallable: jest.fn(() => jest.fn(() => Promise.resolve({ data: {} }))),
    connectFunctionsEmulator: jest.fn(),
}));

// Mock Firebase Storage
jest.mock("firebase/storage", () => ({
    getStorage: jest.fn(() => ({})),
    connectStorageEmulator: jest.fn(),
    ref: jest.fn(),
    uploadBytes: jest.fn(() => Promise.resolve()),
    getDownloadURL: jest.fn(() => Promise.resolve("")),
}));

// Mock React Router
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => jest.fn(),
    useParams: () => ({ wordId: "1" }),
}));

// Mock AuthContext
jest.mock("./src/contexts/AuthContext", () => ({
    useAuth: () => ({
        currentUser: { uid: "test-uid", email: "test@example.com" },
        isAdmin: false,
        userRoles: [],
        rolesLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
        signup: jest.fn(),
        loading: false,
    }),
    AuthContext: {},
    AuthProvider: ({ children }) => children,
    __esModule: true,
    default: ({ children }) => children,
}));

// Mock dictionary service
jest.mock("./src/services/dictionaryService", () => ({
    getDictionaryStats: jest.fn(() =>
        Promise.resolve({
            totalWords: 100,
            totalContributors: 10,
            recentAdditions: 5,
        }),
    ),
    addWord: jest.fn(() => Promise.resolve({ success: true })),
    reportWord: jest.fn(() => Promise.resolve({ success: true })),
    getUserContributions: jest.fn(() => Promise.resolve([])),
    getWordById: jest.fn(() => Promise.resolve(null)),
    searchWords: jest.fn(() => Promise.resolve([])),
    toggleWordLike: jest.fn(() => Promise.resolve()),
    hasUserLikedWord: jest.fn(() => Promise.resolve(false)),
    getCorrectionsForReview: jest.fn(() => Promise.resolve([])),
    voteOnCorrection: jest.fn(() => Promise.resolve()),
    applyCorrection: jest.fn(() => Promise.resolve()),
}));

// Mock word utils
jest.mock("./src/utils/wordUtils", () => ({
    getWordsByUser: jest.fn(() => Promise.resolve([])),
    searchWords: jest.fn(() => Promise.resolve([])),
    formatDate: jest.fn(() => "January 1, 2024"),
    getWordOfTheDay: jest.fn(() => Promise.resolve(null)),
    getWordById: jest.fn(() =>
        Promise.resolve({
            id: "1",
            kurukh: "test",
            english: "test word",
            definition: "test definition",
        }),
    ),
}));



