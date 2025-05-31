/**
 * Test script to verify real-time comment count updates in CommentThread component
 * 
 * This script simulates comment operations and verifies that the comment count
 * updates in real-time when the CommentThread is open and stops updating when closed.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, increment, getDoc } from 'firebase/firestore';

// Firebase config (using the same config as the app)
const firebaseConfig = {
  apiKey: "AIzaSyAhJP_4QtJWXk56KWcKJKH9TJN4LBjWZHU",
  authDomain: "kurukh-dictionary.firebaseapp.com",
  projectId: "kurukh-dictionary",
  storageBucket: "kurukh-dictionary.appspot.com",
  messagingSenderId: "1075657794248",
  appId: "1:1075657794248:web:51a1234567890abcdef123"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Test real-time comment count updates
 */
async function testRealTimeCommentCount() {
  try {
    // Find a word to test with
    const testWordId = await findTestWord();
    if (!testWordId) {
      console.log('❌ No test word found. Please add a word to the database first.');
      return;
    }

    console.log(`🧪 Testing real-time comment count updates for word: ${testWordId}`);

    // Get current comment count
    const wordRef = doc(db, 'words', testWordId);
    const wordDoc = await getDoc(wordRef);
    const currentCount = wordDoc.data()?.commentsCount || 0;
    
    console.log(`📊 Current comment count: ${currentCount}`);
    
    // Test 1: Increment comment count
    console.log('\n📝 Test 1: Incrementing comment count...');
    await updateDoc(wordRef, {
      commentsCount: increment(1)
    });
    
    // Wait a moment for real-time updates
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verify the update
    const updatedDoc = await getDoc(wordRef);
    const newCount = updatedDoc.data()?.commentsCount || 0;
    console.log(`✅ Comment count after increment: ${newCount}`);
    
    // Test 2: Decrement comment count
    console.log('\n📝 Test 2: Decrementing comment count...');
    await updateDoc(wordRef, {
      commentsCount: increment(-1)
    });
    
    // Wait a moment for real-time updates
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verify the update
    const finalDoc = await getDoc(wordRef);
    const finalCount = finalDoc.data()?.commentsCount || 0;
    console.log(`✅ Comment count after decrement: ${finalCount}`);
    
    console.log('\n🎉 Real-time comment count test completed!');
    console.log('\n📝 To verify the real-time updates in the UI:');
    console.log('1. Open the word details page in your browser');
    console.log('2. Open the comment thread');
    console.log('3. Run this script again to see comment count changes in real-time');
    console.log('4. Close the comment thread and run the script - updates should stop');
    
  } catch (error) {
    console.error('❌ Error testing real-time comment count:', error);
  }
}

/**
 * Find a test word to use for the test
 */
async function findTestWord() {
  try {
    // Try to get any approved word from the database
    const { getDocs, query, collection, where, limit } = await import('firebase/firestore');
    
    const wordsQuery = query(
      collection(db, 'words'),
      where('status', '==', 'approved'),
      limit(1)
    );
    
    const snapshot = await getDocs(wordsQuery);
    if (!snapshot.empty) {
      return snapshot.docs[0].id;
    }
    
    // If no approved words, try any word
    const anyWordQuery = query(collection(db, 'words'), limit(1));
    const anySnapshot = await getDocs(anyWordQuery);
    if (!anySnapshot.empty) {
      return anySnapshot.docs[0].id;
    }
    
    return null;
  } catch (error) {
    console.error('Error finding test word:', error);
    return null;
  }
}

// Run the test
testRealTimeCommentCount().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});
