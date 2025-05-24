// This file is meant to be run in the browser, not directly on Node.js
// It configures Firebase to use the emulators in development mode

import { connectAuthEmulator } from "firebase/auth";
import { connectFirestoreEmulator } from "firebase/firestore";
import { connectStorageEmulator } from "firebase/storage";
import { connectFunctionsEmulator } from "firebase/functions";
import { auth, db, storage, functions } from "./firebase";

// Check if we're in development mode
if (import.meta.env.DEV) {
  console.log("Development mode detected! Connecting to Firebase emulators...");
  
  // Connect to Authentication emulator
  connectAuthEmulator(auth, "http://localhost:9098", { disableWarnings: true });
  
  // Connect to Firestore emulator
  connectFirestoreEmulator(db, "localhost", 8081);
  
  // Connect to Storage emulator
  connectStorageEmulator(storage, "localhost", 9198);
  
  // Connect to Functions emulator
  connectFunctionsEmulator(functions, "localhost", 5011);
  
  console.log("Connected to Firebase emulators!");
}

export default {};
