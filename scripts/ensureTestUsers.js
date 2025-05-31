/**
 * Ensure Test Users Script
 * 
 * This script checks if all test users exist in the Firebase Auth emulator
 * and creates any missing users. This resolves authentication issues in test scripts.
 * 
 * Run using: node scripts/ensureTestUsers.js
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore,
  setDoc,
  doc,
  serverTimestamp,
  connectFirestoreEmulator
} from 'firebase/firestore';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  connectAuthEmulator 
} from 'firebase/auth';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env' : '.env.local'
});

console.log('Ensuring all test users exist in emulator...');

// Simple Firebase configuration for emulator
const firebaseConfig = {
  projectId: "kurukh-dictionary",
  apiKey: "fake-api-key-for-emulator"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Connect to emulators
console.log('Connecting to Auth emulator on port 9098...');
connectAuthEmulator(auth, "http://127.0.0.1:9098", { disableWarnings: true });

console.log('Connecting to Firestore emulator on port 8081...');
connectFirestoreEmulator(db, '127.0.0.1', 8081);

// Test users to ensure exist
const testUsers = [
  { 
    email: 'admin@kurukhdictionary.com', 
    password: 'Admin123!', 
    username: 'admin',
    roles: ['admin', 'editor']
  },
  { 
    email: 'user@kurukhdictionary.com', 
    password: 'User123!',
    username: 'regularuser',
    roles: ['user']
  },
  { 
    email: 'user1@kurukhdictionary.com', 
    password: 'User123!',
    username: 'user1',
    roles: ['user']
  },
  { 
    email: 'user2@kurukhdictionary.com', 
    password: 'User123!',
    username: 'user2',
    roles: ['user']
  },
  { 
    email: 'user3@kurukhdictionary.com', 
    password: 'User123!',
    username: 'user3',
    roles: ['user']
  },
  { 
    email: 'user4@kurukhdictionary.com', 
    password: 'User123!',
    username: 'user4',
    roles: ['user']
  },
  { 
    email: 'user5@kurukhdictionary.com', 
    password: 'User123!',
    username: 'user5',
    roles: ['user']
  },
];

/**
 * Helper to check if user exists by trying to sign in
 */
async function checkUserExists(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return true;
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return false;
    }
    console.error(`Error checking if user ${email} exists:`, error);
    throw error;
  }
}

/**
 * Create a user and add their data to Firestore
 */
async function createUser(user) {
  try {
    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
    const uid = userCredential.user.uid;
    
    // Add additional user data to Firestore
    await setDoc(doc(db, 'users', uid), {
      uid,
      username: user.username,
      email: user.email,
      roles: user.roles || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log(`Created user: ${user.email} (${uid})`);
    return uid;
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log(`User ${user.email} already exists, skipping...`);
      return null;
    } else {
      console.error(`Error creating user ${user.email}:`, error);
      throw error;
    }
  }
}

/**
 * Ensure all test users exist
 */
async function ensureUsers() {
  for (const user of testUsers) {
    try {
      const exists = await checkUserExists(user.email, user.password);
      
      if (!exists) {
        console.log(`User ${user.email} does not exist, creating...`);
        await createUser(user);
      } else {
        console.log(`User ${user.email} already exists, skipping.`);
      }
    } catch (error) {
      console.error(`Error processing user ${user.email}:`, error);
    }
  }
}

// Run the script
ensureUsers()
  .then(() => {
    console.log('All test users have been verified and created if necessary.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error ensuring test users:', error);
    process.exit(1);
  });
