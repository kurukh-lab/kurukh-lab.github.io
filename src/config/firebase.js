// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Connect to emulators in development mode
if (import.meta.env.DEV) {
  console.log("🔥 Development mode detected! Connecting to Firebase emulators...");
  
  try {
    // Connect to Authentication emulator
    connectAuthEmulator(auth, "http://127.0.0.1:9098", { disableWarnings: true });
    console.log("✅ Connected to Auth emulator");
    
    // Connect to Firestore emulator
    connectFirestoreEmulator(db, "127.0.0.1", 8081);
    console.log("✅ Connected to Firestore emulator");
    
    // Connect to Storage emulator
    connectStorageEmulator(storage, "127.0.0.1", 9198);
    console.log("✅ Connected to Storage emulator");
    
    // Connect to Functions emulator
    connectFunctionsEmulator(functions, "127.0.0.1", 5011);
    console.log("✅ Connected to Functions emulator");
    
    console.log("🚀 All Firebase emulators connected successfully!");
  } catch (error) {
    console.warn("⚠️ Firebase emulators may already be connected:", error.message);
  }
}

export default app;
