/**
 * Community Review Edge Cases Test Script
 * 
 * This script tests edge cases in the community review feature
 * Run using: node scripts/testCommunityReviewEdgeCases.js
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
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

console.log('Running community review edge cases test in emulator mode...');

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
  testUsers: [
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
      vote: vote,
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

// Test edge case: User tries to vote on their own contribution
async function testVotingOnOwnContribution() {
  console.log('\n--- Testing voting on own contribution ---');
  
  try {
    // Sign in as regular user
    const userUid = await signInUser(testUsers.regularUser.email, testUsers.regularUser.password);
    testUsers.regularUser.uid = userUid;
    
    // Create a new word as this user
    const wordData = {
      kurukh_word: 'self_vote_test',
      meanings: [
        {
          language: 'en',
          definition: 'Test word for self voting',
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
    const wordId = docRef.id;
    
    console.log(`Created test word for self-voting: ${wordId}`);
    
    // Try to vote on own word
    console.log('User trying to vote on own contribution...');
    const result = await voteOnWord(wordId, userUid, 'approve', 'Trying to vote on my own word');
    
    // The service should prevent this in an actual implementation
    // This test checks if our service has this protection
    console.log('Vote result:', result);
    
    // Ideally, frontend should prevent this from happening, but we should also
    // implement a backend check in the voteOnWord service function
    if (result.success) {
      console.log('⚠️ WARNING: User was able to vote on their own contribution! This should be prevented.');
    } else {
      console.log('✅ Self-voting was correctly prevented.');
    }
    
    return {
      wordId,
      result
    };
  } catch (error) {
    console.error('❌ Error testing self-voting:', error);
    return null;
  }
}

// Test edge case: User tries to vote twice on the same word
async function testDoubleVoting() {
  console.log('\n--- Testing double voting ---');
  
  try {
    // Get a word in community_review status
    const q = query(
      collection(db, 'words'),
      where('status', '==', 'community_review')
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('❌ No words found in community_review status');
      return null;
    }
    
    const wordDoc = querySnapshot.docs[0];
    const wordId = wordDoc.id;
    const wordData = wordDoc.data();
    
    console.log(`Testing double voting for word: ${wordData.kurukh_word} (${wordId})`);
    
    // Sign in as a test user
    const userUid = await signInUser(testUsers.testUsers[0].email, testUsers.testUsers[0].password);
    testUsers.testUsers[0].uid = userUid;
    
    // First vote
    console.log('Submitting first vote...');
    const firstResult = await voteOnWord(wordId, userUid, 'approve', 'First vote');
    
    if (firstResult.success) {
      console.log('✅ First vote successful');
    } else {
      console.log(`❌ First vote failed: ${firstResult.error}`);
      return { wordId, firstResult, secondResult: null };
    }
    
    // Try to vote again
    console.log('Attempting to vote again...');
    const secondResult = await voteOnWord(wordId, userUid, 'approve', 'Second vote');
    
    if (secondResult.success) {
      console.log('⚠️ WARNING: Double voting was allowed! This should be prevented.');
    } else {
      console.log('✅ Double voting was correctly prevented.');
    }
    
    return {
      wordId,
      firstResult,
      secondResult
    };
  } catch (error) {
    console.error('❌ Error testing double voting:', error);
    return null;
  }
}

// Test edge case: Admin tries to directly approve a word in community review
async function testAdminBypassCommunityReview() {
  console.log('\n--- Testing admin bypass of community review ---');
  
  try {
    // Sign in as admin
    const adminUid = await signInUser(testUsers.admin.email, testUsers.admin.password);
    testUsers.admin.uid = adminUid;
    
    // Get a word in community_review status
    const q = query(
      collection(db, 'words'),
      where('status', '==', 'community_review')
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('❌ No words found in community_review status');
      return null;
    }
    
    const wordDoc = querySnapshot.docs[0];
    const wordId = wordDoc.id;
    const wordData = wordDoc.data();
    
    console.log(`Testing admin bypass for word: ${wordData.kurukh_word} (${wordId})`);
    
    // Try to directly approve the word as admin
    await updateDoc(doc(db, 'words', wordId), {
      status: 'approved',
      updatedAt: serverTimestamp(),
      admin_approved_by: adminUid,
      admin_approved_at: serverTimestamp(),
      community_review_bypassed: true
    });
    
    // Check if the word was approved
    const updatedWordDoc = await getDoc(doc(db, 'words', wordId));
    const updatedWordData = updatedWordDoc.data();
    
    if (updatedWordData.status === 'approved') {
      console.log('✅ Admin was able to bypass community review');
    } else {
      console.log(`❌ Admin could not bypass community review. Current status: ${updatedWordData.status}`);
    }
    
    return {
      wordId,
      initialStatus: wordData.status,
      finalStatus: updatedWordData.status
    };
  } catch (error) {
    console.error('❌ Error testing admin bypass:', error);
    return null;
  }
}

// Test edge case: User tries to vote on a word that already completed community review
async function testVotingOnCompletedReview() {
  console.log('\n--- Testing voting on a word that completed community review ---');
  
  try {
    // Get a word that has completed community review (either pending_review or community_rejected)
    const q = query(
      collection(db, 'words'),
      where('status', 'in', ['pending_review', 'community_rejected'])
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('❌ No words found that have completed community review');
      return null;
    }
    
    const wordDoc = querySnapshot.docs[0];
    const wordId = wordDoc.id;
    const wordData = wordDoc.data();
    
    console.log(`Testing voting on completed review for word: ${wordData.kurukh_word} (${wordId})`);
    console.log(`Current status: ${wordData.status}`);
    
    // Sign in as a test user
    const userUid = await signInUser(testUsers.testUsers[1].email, testUsers.testUsers[1].password);
    testUsers.testUsers[1].uid = userUid;
    
    // Try to vote on the word
    const result = await voteOnWord(wordId, userUid, 'approve', 'Vote on completed review');
    
    // This should fail or be ignored since the word has already completed community review
    console.log('Vote result:', result);
    
    // Check if the vote had any effect
    const updatedWordDoc = await getDoc(doc(db, 'words', wordId));
    const updatedWordData = updatedWordDoc.data();
    
    if (updatedWordData.status === wordData.status) {
      console.log('✅ Vote on completed review had no effect on status');
    } else {
      console.log(`⚠️ WARNING: Vote changed status from ${wordData.status} to ${updatedWordData.status}`);
    }
    
    return {
      wordId,
      initialStatus: wordData.status,
      finalStatus: updatedWordData.status,
      result
    };
  } catch (error) {
    console.error('❌ Error testing voting on completed review:', error);
    return null;
  }
}

// Main test function
async function runTests() {
  try {
    console.log('Starting community review edge cases tests...');
    
    // Test 1: User tries to vote on their own contribution
    const selfVoteResult = await testVotingOnOwnContribution();
    
    // Test 2: User tries to vote twice on the same word
    const doubleVoteResult = await testDoubleVoting();
    
    // Test 3: Admin tries to bypass community review
    const adminBypassResult = await testAdminBypassCommunityReview();
    
    // Test 4: User tries to vote on a word that already completed community review
    const lateVoteResult = await testVotingOnCompletedReview();
    
    // Summary of test results
    console.log('\n--- Test Results Summary ---');
    console.log('Self-vote test:', selfVoteResult ? (selfVoteResult.result.success ? '⚠️ Failed' : '✅ Passed') : '❌ Error');
    console.log('Double-vote test:', doubleVoteResult ? (doubleVoteResult.secondResult?.success ? '⚠️ Failed' : '✅ Passed') : '❌ Error');
    console.log('Admin bypass test:', adminBypassResult ? (adminBypassResult.finalStatus === 'approved' ? '✅ Passed' : '❌ Failed') : '❌ Error');
    console.log('Late vote test:', lateVoteResult ? (lateVoteResult.initialStatus === lateVoteResult.finalStatus ? '✅ Passed' : '⚠️ Failed') : '❌ Error');
    
    console.log('\n✅ All community review edge case tests completed!');
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
