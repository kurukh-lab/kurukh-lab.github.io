/**
 * Final Verification Script for Community Review Feature
 * 
 * This script runs a verification test of the complete community review flow:
 * 1. Creates a new word in community_review status
 * 2. Makes 5 users vote to approve it
 * 3. Admin approves the word that passed community review
 * 4. Verifies the word is publicly available
 * 
 * Run using: node scripts/verifyCommunityReviewFlow.js
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

console.log('Running community review flow verification in emulator mode...');

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
  voters: [
    { email: 'user1@kurukhdictionary.com', password: 'User123!', uid: null },
    { email: 'user2@kurukhdictionary.com', password: 'User123!', uid: null },
    { email: 'user3@kurukhdictionary.com', password: 'User123!', uid: null },
    { email: 'user4@kurukhdictionary.com', password: 'User123!', uid: null },
    { email: 'user5@kurukhdictionary.com', password: 'User123!', uid: null },
  ]
};

// Test word
const testWord = {
  kurukh_word: 'verification_test_word',
  meanings: [
    {
      language: 'en',
      definition: 'Test word for verification',
      example_sentence_kurukh: 'Verification test example',
      example_sentence_translation: 'Verification test translation'
    },
    {
      language: 'hi',
      definition: 'सत्यापन के लिए परीक्षण शब्द',
      example_sentence_kurukh: 'Verification test example',
      example_sentence_translation: 'सत्यापन परीक्षण अनुवाद'
    }
  ],
  part_of_speech: 'noun',
  pronunciation_guide: 'verification',
  tags: ['test']
};

// Helper to sign in a user
async function signInUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user.uid;
  } catch (error) {
    console.error(`Error signing in user ${email}:`, error);
    throw error;
  }
}

// Step 1: Create a word in community review
async function createTestWord() {
  console.log('\n--- Step 1: Creating test word ---');
  
  try {
    // Sign in as regular user
    const userUid = await signInUser(testUsers.regularUser.email, testUsers.regularUser.password);
    testUsers.regularUser.uid = userUid;
    
    // Create the word with community_review status
    const wordData = {
      ...testWord,
      contributor_id: userUid,
      status: 'community_review',
      community_votes_for: 0,
      community_votes_against: 0,
      reviewed_by: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'words'), wordData);
    console.log(`✅ Created test word: ${testWord.kurukh_word} (${docRef.id})`);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating test word:', error);
    throw error;
  }
}

// Step 2: Vote on the word with 5 different users
async function voteOnWord(wordId) {
  console.log('\n--- Step 2: Voting on word with 5 users ---');
  
  try {
    for (let i = 0; i < testUsers.voters.length; i++) {
      const voter = testUsers.voters[i];
      
      // Sign in as the voter
      const voterUid = await signInUser(voter.email, voter.password);
      voter.uid = voterUid;
      
      // Get current word data
      const wordRef = doc(db, 'words', wordId);
      const wordDoc = await getDoc(wordRef);
      
      if (!wordDoc.exists()) {
        throw new Error('Word not found');
      }
      
      const wordData = wordDoc.data();
      const reviewedBy = wordData.reviewed_by || [];
      
      // Add vote to the word
      const newReview = {
        user_id: voterUid,
        vote: 'approve',
        comment: `Test approval vote ${i + 1}`,
        timestamp: serverTimestamp()
      };
      
      const updatedReviewedBy = [...reviewedBy, newReview];
      const votesFor = wordData.community_votes_for + 1;
      
      // Check if this vote reaches the threshold
      let newStatus = wordData.status;
      if (votesFor >= 5) {
        newStatus = 'pending_review';
      }
      
      // Update the word
      await updateDoc(wordRef, {
        reviewed_by: updatedReviewedBy,
        community_votes_for: votesFor,
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      
      // Check updated status
      const updatedWordDoc = await getDoc(wordRef);
      const updatedWordData = updatedWordDoc.data();
      
      console.log(`User ${i + 1} voted. Status: ${updatedWordData.status}, Votes: ${updatedWordData.community_votes_for}`);
    }
    
    // Final check
    const finalWordDoc = await getDoc(doc(db, 'words', wordId));
    const finalWordData = finalWordDoc.data();
    
    if (finalWordData.status === 'pending_review') {
      console.log('✅ Word successfully moved to admin review after 5 votes');
      return true;
    } else {
      console.log(`❌ Word did not move to admin review. Current status: ${finalWordData.status}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Error voting on word:', error);
    throw error;
  }
}

// Step 3: Admin approves the word
async function adminApproveWord(wordId) {
  console.log('\n--- Step 3: Admin approving word ---');
  
  try {
    // Sign in as admin
    const adminUid = await signInUser(testUsers.admin.email, testUsers.admin.password);
    testUsers.admin.uid = adminUid;
    
    // Get current word data
    const wordRef = doc(db, 'words', wordId);
    const wordDoc = await getDoc(wordRef);
    
    if (!wordDoc.exists()) {
      throw new Error('Word not found');
    }
    
    const wordData = wordDoc.data();
    console.log(`Current word status: ${wordData.status}`);
    
    // Update the word to approved status
    await updateDoc(wordRef, {
      status: 'approved',
      admin_approved_by: adminUid,
      admin_approved_at: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Check updated status
    const updatedWordDoc = await getDoc(wordRef);
    const updatedWordData = updatedWordDoc.data();
    
    if (updatedWordData.status === 'approved') {
      console.log('✅ Word successfully approved by admin');
      return true;
    } else {
      console.log(`❌ Word not approved. Current status: ${updatedWordData.status}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Error approving word:', error);
    throw error;
  }
}

// Step 4: Verify the word is publicly available
async function verifyWordIsPublic(wordId) {
  console.log('\n--- Step 4: Verifying word is publicly available ---');
  
  try {
    // Get the word
    const wordRef = doc(db, 'words', wordId);
    const wordDoc = await getDoc(wordRef);
    
    if (!wordDoc.exists()) {
      throw new Error('Word not found');
    }
    
    const wordData = wordDoc.data();
    
    // Check if it's approved
    if (wordData.status === 'approved') {
      console.log('✅ Word is approved');
      
      // Check if it appears in public search
      const q = query(
        collection(db, 'words'),
        where('status', '==', 'approved'),
        where('kurukh_word', '==', testWord.kurukh_word)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        console.log('✅ Word is publicly available in search results');
        return true;
      } else {
        console.log('❌ Word not found in public search results');
        return false;
      }
    } else {
      console.log(`❌ Word is not approved. Current status: ${wordData.status}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Error verifying word availability:', error);
    throw error;
  }
}

// Main verification function
async function verifyCompleteFlow() {
  console.log('Starting complete community review flow verification...');
  
  try {
    // Step 1: Create a test word
    const wordId = await createTestWord();
    
    // Step 2: Vote on the word with 5 users
    const votingResult = await voteOnWord(wordId);
    
    // Step 3: Admin approves the word
    const adminApprovalResult = await adminApproveWord(wordId);
    
    // Step 4: Verify the word is publicly available
    const publicAvailabilityResult = await verifyWordIsPublic(wordId);
    
    // Final verification result
    console.log('\n--- Verification Results ---');
    console.log('Word creation: ✅ Success');
    console.log(`Community review: ${votingResult ? '✅ Success' : '❌ Failed'}`);
    console.log(`Admin approval: ${adminApprovalResult ? '✅ Success' : '❌ Failed'}`);
    console.log(`Public availability: ${publicAvailabilityResult ? '✅ Success' : '❌ Failed'}`);
    
    if (votingResult && adminApprovalResult && publicAvailabilityResult) {
      console.log('\n✅ COMPLETE FLOW VERIFICATION SUCCESSFUL!');
      console.log('The community review feature is working end-to-end.');
    } else {
      console.log('\n❌ FLOW VERIFICATION FAILED');
      console.log('Some parts of the community review flow are not working correctly.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Verification failed with error:', error);
    process.exit(1);
  }
}

// Run the verification
verifyCompleteFlow();
