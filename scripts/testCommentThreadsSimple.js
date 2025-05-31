/**
 * Simple test script for the comment thread functionality
 * Tests the comment system using Firebase emulator
 */

import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator, signInWithEmailAndPassword } from 'firebase/auth';

// Load environment variables
dotenv.config();

// Firebase config for emulator
const firebaseConfig = {
  apiKey: "demo-project",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "demo-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Connect to emulators
try {
  connectFirestoreEmulator(db, 'localhost', 8081);
  connectAuthEmulator(auth, 'http://localhost:9098');
  console.log('✅ Connected to Firebase emulators');
} catch (error) {
  console.log('⚠️ Emulators already connected or not available');
}

// Test users
const testUsers = {
  user1: { email: 'user1@kurukhdictionary.com', password: 'User123!' },
  user2: { email: 'user2@kurukhdictionary.com', password: 'User123!' },
  user3: { email: 'user3@kurukhdictionary.com', password: 'User123!' }
};

// Test word ID
const testWordId = 'test-word-1';

async function runTests() {
  console.log('🧪 Starting Comment Thread Tests...\n');

  try {
    // Test 1: Sign in as user1
    console.log('📋 Test 1: User Authentication');
    await signInWithEmailAndPassword(auth, testUsers.user1.email, testUsers.user1.password);
    console.log(`✅ Signed in as ${testUsers.user1.email}`);
    console.log(`   User ID: ${auth.currentUser.uid}\n`);

    // Test 2: Check if comment service can be imported
    console.log('📋 Test 2: Comment Service Import');
    try {
      const commentService = await import('../src/services/commentService.js');
      console.log('✅ Comment service imported successfully');
      console.log(`   Available methods: ${Object.keys(commentService).join(', ')}\n`);
    } catch (error) {
      console.log('❌ Failed to import comment service:', error.message);
      return;
    }

    // Test 3: Basic functionality check
    console.log('📋 Test 3: Basic Comment Operations');
    const { addComment, getCommentsForWord, voteOnComment } = await import('../src/services/commentService.js');
    
    // Add a test comment
    const commentData = {
      content: 'This is a test comment for the word.',
      wordId: testWordId
    };
    
    try {
      const commentId = await addComment(commentData);
      console.log('✅ Comment added successfully');
      console.log(`   Comment ID: ${commentId}`);
      
      // Get comments for the word
      const comments = await getCommentsForWord(testWordId);
      console.log(`✅ Retrieved ${comments.length} comments for word ${testWordId}`);
      
      if (comments.length > 0) {
        console.log(`   Latest comment: "${comments[0].content}"`);
      }
    } catch (error) {
      console.log('❌ Comment operations failed:', error.message);
    }

    console.log('\n🎉 Comment Thread Tests Completed!');
    console.log('\n📖 To test the UI:');
    console.log('1. Open http://localhost:5173 in your browser');
    console.log('2. Sign in with one of the test users');
    console.log('3. Navigate to Community Review section');
    console.log('4. Look for the test word and try commenting');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the tests
runTests().catch(console.error);
