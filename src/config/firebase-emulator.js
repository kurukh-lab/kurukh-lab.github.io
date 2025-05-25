// This file is meant to be run in the browser, not directly on Node.js
// It configures Firebase to use the emulators in development mode

import { connectAuthEmulator } from "firebase/auth";
import { connectFirestoreEmulator } from "firebase/firestore";
import { connectStorageEmulator } from "firebase/storage";
import { connectFunctionsEmulator } from "firebase/functions";
import { auth, db, storage, functions } from "./firebase";

// Track if emulators are already connected
let emulatorsConnected = false;

// Check if we're in development mode
if (import.meta.env.DEV && !emulatorsConnected) {
  console.log("Development mode detected! Connecting to Firebase emulators...");
  
  try {
    // Connect to Authentication emulator
    connectAuthEmulator(auth, "http://127.0.0.1:9098", { disableWarnings: true });
    console.log("Connected to Auth emulator");
    
    // Connect to Firestore emulator
    connectFirestoreEmulator(db, "127.0.0.1", 8081);
    console.log("Connected to Firestore emulator");
    
    // Connect to Storage emulator
    connectStorageEmulator(storage, "127.0.0.1", 9198);
    console.log("Connected to Storage emulator");
    
    // Connect to Functions emulator
    connectFunctionsEmulator(functions, "127.0.0.1", 5011);
    console.log("Connected to Functions emulator");
    
    emulatorsConnected = true;
    console.log("All Firebase emulators connected successfully!");
  } catch (error) {
    console.warn("Firebase emulators may already be connected:", error.message);
  }
}

export default {};
