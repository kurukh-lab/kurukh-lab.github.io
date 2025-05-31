/**
 * Add Community Review Test Word Script
 * 
 * This script adds a test word with "community_review" status to the database.
 * Run this script to ensure there is at least one word available for
 * community review testing.
 * 
 * Run using: node scripts/addCommunityReviewTestWord.js
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc,
  query,
  where,
  getDocs, 
  serverTimestamp,
  connectFirestoreEmulator
} from 'firebase/firestore';
import { 
  getAuth,
  signInWithEmailAndPassword, 
  connectAuthEmulator 
} from 'firebase/auth';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env' : '.env.local'
});

console.log('Adding test word for community review...');

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

// Test word data
const testWord = {
  kurukh_word: 'community_test_word',
  meanings: [
    {
      language: 'en',
      definition: 'Test word for community review',
      example_sentence_kurukh: 'Naa community test word mankhaa',
      example_sentence_translation: 'This is a community test word'
    },
    {
      language: 'hi',
      definition: 'सामुदायिक समीक्षा के लिए परीक्षण शब्द',
      example_sentence_kurukh: 'Naa community test word mankhaa',
      example_sentence_translation: 'यह एक सामुदायिक परीक्षण शब्द है'
    }
  ],
  part_of_speech: 'noun',
  pronunciation_guide: 'kuh-myoo-ni-tee test werd',
  tags: ['test', 'community_review'],
  status: 'community_review',
  community_votes_for: 0,
  community_votes_against: 0,
  reviewed_by: [],
  contributor_id: 'test_script',
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
};

async function signInUser() {
  try {
    // Try to sign in as a regular user first
    await signInWithEmailAndPassword(auth, 'user@kurukhdictionary.com', 'User123!');
    return true;
  } catch (userError) {
    console.log('Failed to sign in as regular user, trying admin...');
    try {
      await signInWithEmailAndPassword(auth, 'admin@kurukhdictionary.com', 'Admin123!');
      return true;
    } catch (adminError) {
      console.error('Could not sign in:', adminError);
      return false;
    }
  }
}

async function addTestWord() {
  try {
    // First check if a test word already exists
    const wordsCollection = collection(db, 'words');
    const q = query(
      wordsCollection,
      where('kurukh_word', '==', 'community_test_word'),
      where('status', '==', 'community_review')
    );
    
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      console.log('Test word for community review already exists:');
      querySnapshot.forEach(doc => {
        console.log(`- ID: ${doc.id}, Word: ${doc.data().kurukh_word}`);
      });
      return true;
    }
    
    // If we get here, no test word exists, so add one
    const docRef = await addDoc(collection(db, 'words'), testWord);
    console.log(`Added test word for community review with ID: ${docRef.id}`);
    return true;
  } catch (error) {
    console.error('Error adding test word:', error);
    return false;
  }
}

async function run() {
  try {
    const signedIn = await signInUser();
    if (!signedIn) {
      console.error('Failed to sign in. Make sure you have run scripts/ensureTestUsers.js');
      process.exit(1);
    }
    
    const success = await addTestWord();
    if (success) {
      console.log('Operation completed successfully!');
      process.exit(0);
    } else {
      console.error('Operation failed.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

run();
