/**
 * Debug Community Review Words Script
 * 
 * This script checks for words with "community_review" status in the database
 * and prints them to the console. It helps diagnose issues with the 
 * community review feature in the UI.
 *
 * Run using: node scripts/debugCommunityReview.js
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc,
  orderBy,
  serverTimestamp,
  connectFirestoreEmulator
} from 'firebase/firestore';
import { 
  getAuth, 
  connectAuthEmulator 
} from 'firebase/auth';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env' : '.env.local'
});

console.log('Debugging community review words...');

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

// Create a word with community_review status if none exist
async function createTestWordForCommunityReview() {
  console.log('\n--- Creating a test word with community_review status ---');
  
  try {
    const wordsCollection = collection(db, 'words');
    
    const wordData = {
      kurukh_word: 'debug_test_word',
      meanings: [
        {
          language: 'en',
          definition: 'Test word for debugging community review',
          example_sentence_kurukh: 'Debug test example',
          example_sentence_translation: 'Debug test translation'
        }
      ],
      part_of_speech: 'noun',
      pronunciation_guide: 'debug',
      tags: ['test'],
      contributor_id: 'debug_script',
      status: 'community_review',
      community_votes_for: 0,
      community_votes_against: 0,
      reviewed_by: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Check if we already have a test word
    const q = query(
      wordsCollection,
      where('kurukh_word', '==', 'debug_test_word')
    );
    
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      console.log('Test word already exists, skipping creation');
      return;
    }
    
    // Add the word
    const docRef = await addDoc(wordsCollection, wordData);
    console.log(`Created test word: debug_test_word (${docRef.id})`);
  } catch (error) {
    console.error('Error creating test word:', error);
  }
}

// Check for words with community_review status
async function checkCommunityReviewWords() {
  try {
    const wordsCollection = collection(db, 'words');
    
    // Query for words with community_review status
    const q = query(
      wordsCollection,
      where('status', '==', 'community_review'),
      orderBy('createdAt', 'desc')
    );
    
    console.log('\n--- Checking for words with community_review status ---');
    console.log('Executing query:', JSON.stringify({
      collection: 'words',
      where: 'status == community_review',
      orderBy: 'createdAt desc'
    }));
    
    const querySnapshot = await getDocs(q);
    
    console.log(`Found ${querySnapshot.size} words with community_review status`);
    
    if (querySnapshot.empty) {
      console.log('No words found with community_review status');
      console.log('The UI is showing no words because none exist in the database.');
      await createTestWordForCommunityReview();
    } else {
      console.log('\nWords with community_review status:');
      querySnapshot.forEach((doc) => {
        const word = doc.data();
        console.log(`- ${doc.id}: "${word.kurukh_word}" (${word.status})`);
        console.log(`  Contributor: ${word.contributor_id}`);
        console.log(`  Votes: For=${word.community_votes_for || 0}, Against=${word.community_votes_against || 0}`);
        console.log(`  Created: ${word.createdAt ? new Date(word.createdAt.toDate()).toISOString() : 'unknown'}`);
        console.log('');
      });
      
      console.log('\nIf these words exist but are not showing in the UI, there may be an issue with:');
      console.log('1. The getWordsForCommunityReview function in dictionaryService.js');
      console.log('2. The WordCommunityReview component not properly using the data');
      console.log('3. Authentication issues in the UI');
    }
  } catch (error) {
    console.error('Error checking community review words:', error);
  }
}

// Check for user authentication issues
async function checkUserAuthentication() {
  console.log('\n--- Checking for potential user authentication issues ---');
  
  try {
    const usersCollection = collection(db, 'users');
    const querySnapshot = await getDocs(usersCollection);
    
    console.log(`Found ${querySnapshot.size} users in the database`);
    
    if (querySnapshot.size === 0) {
      console.log('Warning: No users found in the database!');
      console.log('This may cause authentication issues in the UI.');
      console.log('Consider running the ensureTestUsers.js script.');
    } else {
      console.log('Users found in the database, authentication should be possible.');
      console.log('To debug authentication issues:');
      console.log('1. Check browser console for auth errors.');
      console.log('2. Ensure you are running the Firebase auth emulator correctly.');
      console.log('3. Try running the ensureTestUsers.js script to guarantee test users exist.');
    }
  } catch (error) {
    console.error('Error checking user authentication:', error);
  }
}

// Run the checks
async function runDebugChecks() {
  try {
    await checkCommunityReviewWords();
    await checkUserAuthentication();
    
    console.log('\n--- Debug Summary ---');
    console.log('If words with community_review status exist but are not showing in the UI:');
    console.log('1. Check the browser console for errors when loading the Community Review page');
    console.log('2. Verify user authentication is working properly');
    console.log('3. Verify the getWordsForCommunityReview function in dictionaryService.js is correctly implemented');
    console.log('4. Ensure the limit parameter in getWordsForCommunityReview is being handled correctly');
    
    process.exit(0);
  } catch (error) {
    console.error('Error in debug checks:', error);
    process.exit(1);
  }
}

runDebugChecks();
