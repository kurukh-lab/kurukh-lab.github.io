import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import {
  getFirestore,
  connectFirestoreEmulator,
  type Firestore,
} from 'firebase/firestore';
import {
  getStorage,
  connectStorageEmulator,
  type FirebaseStorage,
} from 'firebase/storage';
import {
  getFunctions,
  connectFunctionsEmulator,
  type Functions,
} from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app: FirebaseApp = initializeApp(firebaseConfig);

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
export const functions: Functions = getFunctions(app);

if (import.meta.env.DEV) {
  console.log('🔥 Development mode detected! Connecting to Firebase emulators...');
  try {
    connectAuthEmulator(auth, 'http://127.0.0.1:9098', { disableWarnings: true });
    connectFirestoreEmulator(db, '127.0.0.1', 8081);
    connectStorageEmulator(storage, '127.0.0.1', 9198);
    connectFunctionsEmulator(functions, '127.0.0.1', 5011);
    console.log('🚀 All Firebase emulators connected successfully!');
  } catch (error) {
    console.warn(
      '⚠️ Firebase emulators may already be connected:',
      (error as Error).message,
    );
  }
}

export default app;
