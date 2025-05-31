/**
 * Community Review Feature Test Script
 * 
 * This script tests various aspects of the community review feature
 * Run using: node scripts/testCommunityReview.js
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  setDoc, 
  doc, 
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
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

console.log('Running community review test in emulator mode...');

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

// Test users
const testUsers = {
  admin: { email: 'admin@kurukhdictionary.com', password: 'Admin123!', uid: null },
  regularUser: { email: 'user@kurukhdictionary.com', password: 'User123!', uid: null },
  users: [
    { email: 'user1@kurukhdictionary.com', password: 'User123!', uid: null },
    { email: 'user2@kurukhdictionary.com', password: 'User123!', uid: null },
    { email: 'user3@kurukhdictionary.com', password: 'User123!', uid: null },
    { email: 'user4@kurukhdictionary.com', password: 'User123!', uid: null },
    { email: 'user5@kurukhdictionary.com', password: 'User123!', uid: null },
  ]
};

// Helper to sign in a user and get their UID
async function signInUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user.uid;
  } catch (error) {
    console.error(`Error signing in user ${email}:`, error);
    throw error;
  }
}

// Get all community review words
async function getCommunityReviewWords() {
  try {
    const q = query(
      collection(db, 'words'),
      where('status', '==', 'community_review')
    );
    
    const querySnapshot = await getDocs(q);
    const words = [];
    
    querySnapshot.forEach((doc) => {
      words.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return words;
  } catch (error) {
    console.error('Error getting community review words:', error);
    return [];
  }
}

// Vote on a word
async function voteOnWord(wordId, userId, vote, comment = '') {
  try {
    const wordRef = doc(db, 'words', wordId);
    const wordDoc = await getDoc(wordRef);
    
    if (!wordDoc.exists()) {
      throw new Error('Word not found');
    }
    
    const wordData = wordDoc.data();
    const reviewedBy = wordData.reviewed_by || [];
    
    // Check if user has already voted
    if (reviewedBy.some(review => review.user_id === userId)) {
      throw new Error('You have already voted on this word');
    }
    
    // Add vote to the word
    const newReview = {
      user_id: userId,
      vote: vote, // 'approve' or 'reject'
      comment: comment,
      timestamp: serverTimestamp()
    };
    
    const updatedReviewedBy = [...reviewedBy, newReview];
    const votesFor = vote === 'approve' ? (wordData.community_votes_for || 0) + 1 : (wordData.community_votes_for || 0);
    const votesAgainst = vote === 'reject' ? (wordData.community_votes_against || 0) + 1 : (wordData.community_votes_against || 0);
    
    // Check if the word should move to admin review (5+ approve votes) or be rejected (5+ reject votes)
    let newStatus = wordData.status;
    if (votesFor >= 5) {
      newStatus = 'pending_review'; // Move to admin review
    } else if (votesAgainst >= 5) {
      newStatus = 'community_rejected';
    }
    
    await updateDoc(wordRef, {
      reviewed_by: updatedReviewedBy,
      community_votes_for: votesFor,
      community_votes_against: votesAgainst,
      status: newStatus
    });
    
    return {
      success: true,
      message: newStatus === 'pending_review' ? 'Word approved for admin review!' : 
               newStatus === 'community_rejected' ? 'Word rejected by community!' : 
               'Vote recorded successfully!',
      status: newStatus
    };
  } catch (error) {
    console.error('Error voting on word:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Test adding a new word that goes into community review
async function testAddWordToCommunityReview() {
  console.log('\n--- Testing adding a new word to community review ---');
  try {
    const userUid = await signInUser(testUsers.regularUser.email, testUsers.regularUser.password);
    testUsers.regularUser.uid = userUid;
    
    const wordData = {
      kurukh_word: 'test_community_word',
      meanings: [
        {
          language: 'en',
          definition: 'Test word for community review',
          example_sentence_kurukh: 'Test example sentence',
          example_sentence_translation: 'Test translation'
        }
      ],
      part_of_speech: 'noun',
      pronunciation_guide: 'test'
    };
    
    const wordWithMeta = {
      ...wordData,
      contributor_id: userUid,
      status: 'community_review',
      community_votes_for: 0,
      community_votes_against: 0,
      reviewed_by: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'words'), wordWithMeta);
    console.log(`✅ Successfully added test word with ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error adding test word:', error);
    return null;
  }
}

// Test the progression of a word through community voting
async function testCommunityVotingProgression(wordId) {
  console.log('\n--- Testing community voting progression ---');
  
  try {
    // Get initial word status
    const initialWord = await getDoc(doc(db, 'words', wordId));
    console.log(`Initial word status: ${initialWord.data().status}`);
    console.log(`Initial votes - For: ${initialWord.data().community_votes_for}, Against: ${initialWord.data().community_votes_against}`);
    
    // Sign in test users
    for (let i = 0; i < testUsers.users.length; i++) {
      const user = testUsers.users[i];
      user.uid = await signInUser(user.email, user.password);
      
      // Add approve votes from first 5 users
      if (i < 5) {
        console.log(`User ${i + 1} voting 'approve'...`);
        const result = await voteOnWord(wordId, user.uid, 'approve', `Test approval ${i + 1}`);
        
        if (result.success) {
          console.log(`✅ Vote successful: ${result.message}`);
        } else {
          console.error(`❌ Vote failed: ${result.error}`);
        }
      }
      
      // Check word status after each vote
      const updatedWord = await getDoc(doc(db, 'words', wordId));
      const wordData = updatedWord.data();
      console.log(`Updated word status: ${wordData.status}`);
      console.log(`Updated votes - For: ${wordData.community_votes_for}, Against: ${wordData.community_votes_against}`);
      
      // If word has moved to admin review, we're done
      if (wordData.status === 'pending_review') {
        console.log('✅ Word successfully moved to admin review after 5 approval votes!');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('❌ Error testing voting progression:', error);
    return false;
  }
}

// Test admin approval of a community-approved word
async function testAdminApproval() {
  console.log('\n--- Testing admin approval of a community-approved word ---');
  
  try {
    // Sign in as admin
    const adminUid = await signInUser(testUsers.admin.email, testUsers.admin.password);
    testUsers.admin.uid = adminUid;
    
    // Get a word that's in pending_review status
    const q = query(
      collection(db, 'words'),
      where('status', '==', 'pending_review')
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('❌ No words found in pending_review status for admin approval');
      return false;
    }
    
    // Get the first word
    const wordDoc = querySnapshot.docs[0];
    const wordId = wordDoc.id;
    const wordData = wordDoc.data();
    
    console.log(`Testing admin approval for word: ${wordData.kurukh_word} (${wordId})`);
    console.log(`Current status: ${wordData.status}`);
    console.log(`Community votes - For: ${wordData.community_votes_for}, Against: ${wordData.community_votes_against}`);
    
    // Admin approves the word
    await updateDoc(doc(db, 'words', wordId), {
      status: 'approved',
      updatedAt: serverTimestamp(),
      admin_approved_by: adminUid,
      admin_approved_at: serverTimestamp()
    });
    
    // Verify the word is now approved
    const updatedWord = await getDoc(doc(db, 'words', wordId));
    const updatedData = updatedWord.data();
    
    console.log(`Updated status: ${updatedData.status}`);
    
    if (updatedData.status === 'approved') {
      console.log('✅ Word successfully approved by admin!');
      return true;
    } else {
      console.log('❌ Word approval failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing admin approval:', error);
    return false;
  }
}

// Test rejection scenarios
async function testRejectionScenarios() {
  console.log('\n--- Testing rejection scenarios ---');
  
  try {
    // Create a word to be rejected
    const userUid = await signInUser(testUsers.regularUser.email, testUsers.regularUser.password);
    
    const wordData = {
      kurukh_word: 'rejection_test_word',
      meanings: [
        {
          language: 'en',
          definition: 'Test word for rejection',
          example_sentence_kurukh: 'Test example sentence',
          example_sentence_translation: 'Test translation'
        }
      ],
      part_of_speech: 'noun',
      pronunciation_guide: 'test',
      contributor_id: userUid,
      status: 'community_review',
      community_votes_for: 0,
      community_votes_against: 0,
      reviewed_by: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'words'), wordData);
    const rejectionTestWordId = docRef.id;
    
    console.log(`Created test word for rejection: ${rejectionTestWordId}`);
    
    // Add 5 reject votes
    for (let i = 0; i < 5; i++) {
      const user = testUsers.users[i];
      
      console.log(`User ${i + 1} voting 'reject'...`);
      const result = await voteOnWord(rejectionTestWordId, user.uid, 'reject', `Test rejection ${i + 1}`);
      
      if (result.success) {
        console.log(`✅ Vote successful: ${result.message}`);
      } else {
        console.error(`❌ Vote failed: ${result.error}`);
      }
      
      // Check word status after each vote
      const updatedWord = await getDoc(doc(db, 'words', rejectionTestWordId));
      const wordData = updatedWord.data();
      console.log(`Updated word status: ${wordData.status}`);
      console.log(`Updated votes - For: ${wordData.community_votes_for}, Against: ${wordData.community_votes_against}`);
      
      // If word has been rejected, we're done
      if (wordData.status === 'community_rejected') {
        console.log('✅ Word successfully rejected after 5 rejection votes!');
        return true;
      }
    }
    
    // Check final status
    const finalWord = await getDoc(doc(db, 'words', rejectionTestWordId));
    if (finalWord.data().status === 'community_rejected') {
      console.log('✅ Word successfully rejected by community!');
      return true;
    } else {
      console.log(`❌ Word was not rejected. Current status: ${finalWord.data().status}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing rejection scenarios:', error);
    return false;
  }
}

// Test mixed voting scenarios
async function testMixedVotingScenarios() {
  console.log('\n--- Testing mixed voting scenarios ---');
  
  try {
    // Create a word for mixed voting
    const userUid = await signInUser(testUsers.regularUser.email, testUsers.regularUser.password);
    
    const wordData = {
      kurukh_word: 'mixed_voting_test_word',
      meanings: [
        {
          language: 'en',
          definition: 'Test word for mixed voting',
          example_sentence_kurukh: 'Test example sentence',
          example_sentence_translation: 'Test translation'
        }
      ],
      part_of_speech: 'noun',
      pronunciation_guide: 'test',
      contributor_id: userUid,
      status: 'community_review',
      community_votes_for: 0,
      community_votes_against: 0,
      reviewed_by: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'words'), wordData);
    const mixedVotingWordId = docRef.id;
    
    console.log(`Created test word for mixed voting: ${mixedVotingWordId}`);
    
    // Add mixed votes: 3 approvals, 2 rejections
    for (let i = 0; i < 5; i++) {
      const user = testUsers.users[i];
      const vote = i < 3 ? 'approve' : 'reject';
      
      console.log(`User ${i + 1} voting '${vote}'...`);
      const result = await voteOnWord(mixedVotingWordId, user.uid, vote, `Test ${vote} ${i + 1}`);
      
      if (result.success) {
        console.log(`✅ Vote successful: ${result.message}`);
      } else {
        console.error(`❌ Vote failed: ${result.error}`);
      }
      
      // Check word status after each vote
      const updatedWord = await getDoc(doc(db, 'words', mixedVotingWordId));
      const wordData = updatedWord.data();
      console.log(`Updated word status: ${wordData.status}`);
      console.log(`Updated votes - For: ${wordData.community_votes_for}, Against: ${wordData.community_votes_against}`);
    }
    
    // Check final status - should still be in community review as neither threshold was met
    const finalWord = await getDoc(doc(db, 'words', mixedVotingWordId));
    if (finalWord.data().status === 'community_review') {
      console.log('✅ Word correctly remained in community review with mixed votes!');
      return true;
    } else {
      console.log(`❌ Word status changed unexpectedly. Current status: ${finalWord.data().status}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing mixed voting scenarios:', error);
    return false;
  }
}

// Main test function
async function runTests() {
  try {
    console.log('Starting community review feature tests...');
    
    // Test 1: Add a new word to community review
    const newWordId = await testAddWordToCommunityReview();
    
    // Test 2: Test voting progression
    if (newWordId) {
      await testCommunityVotingProgression(newWordId);
    }
    
    // Test 3: Admin approval of community-approved word
    await testAdminApproval();
    
    // Test 4: Rejection scenarios
    await testRejectionScenarios();
    
    // Test 5: Mixed voting scenarios
    await testMixedVotingScenarios();
    
    console.log('\n✅ All community review tests completed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test execution failed:', error);
    process.exit(1);
  }
}

/**
 * Note on Firebase Emulator Permissions:
 * 
 * If you encounter permission denied errors while running these tests, it's likely due to
 * Firebase security rules in the emulator. To resolve this:
 * 
 * 1. Ensure your firestore.rules file allows read/write for authenticated users in test mode
 * 2. Or temporarily modify firestore.rules for testing with:
 *    ```
 *    rules_version = '2';
 *    service cloud.firestore {
 *      match /databases/{database}/documents {
 *        match /{document=**} {
 *          allow read, write: if true;
 *        }
 *      }
 *    }
 *    ```
 * 3. Run `firebase deploy --only firestore:rules` before testing
 */

// Run all tests
runTests();
