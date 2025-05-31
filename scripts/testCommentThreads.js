/**
 * Test script for the comment thread functionality
 * 
 * This script tests the Reddit-style threaded comment system for word reviews.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator, signInWithEmailAndPassword } from 'firebase/auth';
import { 
  addComment, 
  getCommentsForWord, 
  voteOnComment, 
  editComment, 
  deleteComment 
} from '../src/services/commentService.js';

// Firebase config (use your actual config)
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

// Connect to emulators if running locally
if (process.env.NODE_ENV !== 'production') {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099');
    console.log('Connected to Firebase emulators');
  } catch (error) {
    console.log('Emulators already connected or not available');
  }
}

// Test users
const testUsers = {
  user1: { email: 'user1@kurukhdictionary.com', password: 'User123!' },
  user2: { email: 'user2@kurukhdictionary.com', password: 'User123!' },
  user3: { email: 'user3@kurukhdictionary.com', password: 'User123!' }
};

// Test word ID (use an existing word ID from your database)
const TEST_WORD_ID = 'test-word-1';

async function signInUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log(`✅ Signed in as ${email}`);
    return userCredential.user.uid;
  } catch (error) {
    console.error(`❌ Failed to sign in as ${email}:`, error.message);
    throw error;
  }
}

async function testAddComments() {
  console.log('\n=== Testing Comment Addition ===');
  
  try {
    // Sign in as user1 and add a top-level comment
    await signInUser(testUsers.user1.email, testUsers.user1.password);
    
    const comment1Result = await addComment(
      TEST_WORD_ID, 
      auth.currentUser.uid, 
      'This word looks accurate to me. The definition matches what I know from my grandmother.'
    );
    
    if (comment1Result.success) {
      console.log('✅ Added first comment:', comment1Result.commentId);
    } else {
      console.log('❌ Failed to add first comment:', comment1Result.error);
      return;
    }

    // Sign in as user2 and add another top-level comment
    await signInUser(testUsers.user2.email, testUsers.user2.password);
    
    const comment2Result = await addComment(
      TEST_WORD_ID, 
      auth.currentUser.uid, 
      'I disagree with the pronunciation guide. In my village, we pronounce it differently.'
    );
    
    if (comment2Result.success) {
      console.log('✅ Added second comment:', comment2Result.commentId);
    } else {
      console.log('❌ Failed to add second comment:', comment2Result.error);
      return;
    }

    // Sign in as user3 and add a reply to the first comment
    await signInUser(testUsers.user3.email, testUsers.user3.password);
    
    const replyResult = await addComment(
      TEST_WORD_ID, 
      auth.currentUser.uid, 
      'I agree with your assessment. This matches the usage in our community as well.',
      comment1Result.commentId
    );
    
    if (replyResult.success) {
      console.log('✅ Added reply:', replyResult.commentId);
    } else {
      console.log('❌ Failed to add reply:', replyResult.error);
    }
    
    return {
      comment1Id: comment1Result.commentId,
      comment2Id: comment2Result.commentId,
      replyId: replyResult.commentId
    };
    
  } catch (error) {
    console.error('❌ Error in testAddComments:', error);
    throw error;
  }
}

async function testGetComments() {
  console.log('\n=== Testing Comment Retrieval ===');
  
  try {
    const result = await getCommentsForWord(TEST_WORD_ID);
    
    if (result.success) {
      console.log(`✅ Retrieved ${result.comments.length} comments`);
      
      result.comments.forEach((comment, index) => {
        console.log(`\nComment ${index + 1}:`);
        console.log(`- ID: ${comment.id}`);
        console.log(`- User: ${comment.userInfo?.displayName || 'Unknown'}`);
        console.log(`- Content: ${comment.content}`);
        console.log(`- Upvotes: ${comment.upvotes}, Downvotes: ${comment.downvotes}`);
        console.log(`- Replies: ${comment.replies?.length || 0}`);
        
        if (comment.replies && comment.replies.length > 0) {
          comment.replies.forEach((reply, replyIndex) => {
            console.log(`  Reply ${replyIndex + 1}:`);
            console.log(`  - ID: ${reply.id}`);
            console.log(`  - User: ${reply.userInfo?.displayName || 'Unknown'}`);
            console.log(`  - Content: ${reply.content}`);
          });
        }
      });
      
      return result.comments;
    } else {
      console.log('❌ Failed to retrieve comments:', result.error);
      return [];
    }
  } catch (error) {
    console.error('❌ Error in testGetComments:', error);
    throw error;
  }
}

async function testVoting(commentIds) {
  console.log('\n=== Testing Comment Voting ===');
  
  try {
    // Test upvoting a comment
    await signInUser(testUsers.user1.email, testUsers.user1.password);
    
    const upvoteResult = await voteOnComment(commentIds.comment2Id, auth.currentUser.uid, 'upvote');
    
    if (upvoteResult.success) {
      console.log('✅ Upvoted comment successfully');
    } else {
      console.log('❌ Failed to upvote comment:', upvoteResult.error);
    }

    // Test downvoting the same comment from different user
    await signInUser(testUsers.user2.email, testUsers.user2.password);
    
    const downvoteResult = await voteOnComment(commentIds.comment2Id, auth.currentUser.uid, 'downvote');
    
    if (downvoteResult.success) {
      console.log('✅ Downvoted comment successfully');
    } else {
      console.log('❌ Failed to downvote comment:', downvoteResult.error);
    }
    
  } catch (error) {
    console.error('❌ Error in testVoting:', error);
    throw error;
  }
}

async function testEditAndDelete(commentIds) {
  console.log('\n=== Testing Comment Edit and Delete ===');
  
  try {
    // Sign in as user who created the comment
    await signInUser(testUsers.user1.email, testUsers.user1.password);
    
    // Test editing
    const editResult = await editComment(
      commentIds.comment1Id, 
      auth.currentUser.uid, 
      'This word looks accurate to me. The definition matches what I know from my grandmother. [EDITED]'
    );
    
    if (editResult.success) {
      console.log('✅ Edited comment successfully');
    } else {
      console.log('❌ Failed to edit comment:', editResult.error);
    }
    
    // Test deleting a reply
    await signInUser(testUsers.user3.email, testUsers.user3.password);
    
    const deleteResult = await deleteComment(commentIds.replyId, auth.currentUser.uid);
    
    if (deleteResult.success) {
      console.log('✅ Deleted reply successfully');
    } else {
      console.log('❌ Failed to delete reply:', deleteResult.error);
    }
    
  } catch (error) {
    console.error('❌ Error in testEditAndDelete:', error);
    throw error;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Comment Thread Tests');
  console.log(`Testing with word ID: ${TEST_WORD_ID}`);
  
  try {
    // Test adding comments
    const commentIds = await testAddComments();
    
    // Wait a moment for data consistency
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test retrieving comments
    await testGetComments();
    
    // Test voting
    await testVoting(commentIds);
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test editing and deleting
    await testEditAndDelete(commentIds);
    
    // Final check - get comments again to see all changes
    console.log('\n=== Final State ===');
    await testGetComments();
    
    console.log('\n🎉 All comment thread tests completed!');
    
  } catch (error) {
    console.error('💥 Test suite failed:', error);
  } finally {
    process.exit(0);
  }
}

// Run the tests
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
}

export { runAllTests };
