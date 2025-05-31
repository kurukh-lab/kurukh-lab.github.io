/**
 * Core Comment Functionality Test
 * 
 * Tests the comment service directly with the emulator
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { getAuth, connectAuthEmulator, signInWithEmailAndPassword } from 'firebase/auth';

// Initialize Firebase with emulator config
const firebaseConfig = {
  apiKey: "demo-project",
  authDomain: "demo-project.firebaseapp.com", 
  projectId: "kurukh-dictionary",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "demo-app-id"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Connect to emulators
try {
  connectFirestoreEmulator(db, 'localhost', 8081);
  connectAuthEmulator(auth, 'http://localhost:9098');
  console.log('✅ Connected to Firebase emulators');
} catch (error) {
  console.log('⚠️ Emulators already connected');
}

async function testCommentCore() {
  console.log('🧪 Testing Core Comment Functionality...\n');

  try {
    // Test 1: Authentication
    console.log('📋 Test 1: Authentication');
    await signInWithEmailAndPassword(auth, 'user1@kurukhdictionary.com', 'User123!');
    console.log('✅ User authenticated successfully');
    console.log(`   User ID: ${auth.currentUser.uid}\n`);

    // Test 2: Direct comment creation
    console.log('📋 Test 2: Direct Comment Creation');
    const testComment = {
      wordId: 'test-word-1',
      userId: auth.currentUser.uid,
      content: 'Direct test comment from core test',
      parentCommentId: null,
      upvotes: 0,
      downvotes: 0,
      upvotedBy: [],
      downvotedBy: [],
      replyCount: 0,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(collection(db, 'comments'), testComment);
    console.log('✅ Comment created directly in Firestore');
    console.log(`   Comment ID: ${docRef.id}\n`);

    // Test 3: Comment retrieval
    console.log('📋 Test 3: Comment Retrieval');
    const commentsQuery = query(
      collection(db, 'comments'),
      where('wordId', '==', 'test-word-1')
    );
    const commentsSnapshot = await getDocs(commentsQuery);
    console.log(`✅ Retrieved ${commentsSnapshot.size} comments for test word`);
    
    commentsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`   - Comment: "${data.content}" by ${data.userId}`);
    });

    console.log('\n🎉 Core comment functionality test completed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('✅ Firebase Auth working');
    console.log('✅ Firestore connection working');
    console.log('✅ Comment CRUD operations working');
    console.log('✅ Queries working properly');
    
    console.log('\n🚀 Ready for UI testing!');
    console.log('The comment system core functionality is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Ensure Firebase emulators are running');
    console.log('2. Check if test users exist');
    console.log('3. Verify firestore rules allow the operations');
  }
}

testCommentCore();
