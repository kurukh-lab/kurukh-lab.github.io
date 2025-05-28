// Manual test of like functionality
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';

// Firebase config for emulator
const firebaseConfig = {
  apiKey: "demo-key",
  authDomain: "kurukh-dictionary.firebaseapp.com",
  projectId: "kurukh-dictionary",
  storageBucket: "kurukh-dictionary.appspot.com",
  messagingSenderId: "123456789",
  appId: "demo-app-id"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Connect to emulators
try {
  connectFirestoreEmulator(db, '127.0.0.1', 8081);
  console.log('✅ Connected to Firestore emulator');
} catch (error) {
  console.warn('⚠️ Emulator may already be connected:', error.message);
}

// Helper function to generate anonymous user ID for likes
const getAnonymousUserId = () => {
  return 'anon_test_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Test like functionality
async function testToggleLike() {
  try {
    console.log('🔍 Testing manual like toggle...');
    
    // Get first approved word
    const wordsCollection = collection(db, 'words');
    const snapshot = await getDocs(wordsCollection);
    
    let testWord = null;
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.status === 'approved' && !testWord) {
        testWord = { id: doc.id, ...data };
      }
    });
    
    if (!testWord) {
      console.log('❌ No approved words found for testing');
      return;
    }
    
    console.log(`📋 Testing with word: ${testWord.kurukh_word}`);
    console.log(`   Current likes: ${testWord.likesCount || 0}`);
    console.log(`   Liked by: ${JSON.stringify(testWord.likedBy || [])}`);
    
    // Simulate anonymous user
    const userId = getAnonymousUserId();
    console.log(`👤 Anonymous user ID: ${userId}`);
    
    // Get current state
    const currentLikedBy = testWord.likedBy || [];
    const hasLiked = currentLikedBy.includes(userId);
    const currentCount = testWord.likesCount || 0;
    
    // Toggle like
    let newLikedBy, newCount;
    if (hasLiked) {
      // Unlike
      newLikedBy = currentLikedBy.filter(id => id !== userId);
      newCount = Math.max(0, currentCount - 1);
      console.log('💔 Unliking word...');
    } else {
      // Like
      newLikedBy = [...currentLikedBy, userId];
      newCount = currentCount + 1;
      console.log('💖 Liking word...');
    }
    
    // Update document
    const wordRef = doc(db, 'words', testWord.id);
    await updateDoc(wordRef, {
      likesCount: newCount,
      likedBy: newLikedBy
    });
    
    console.log(`✅ Update successful!`);
    console.log(`   New likes count: ${newCount}`);
    console.log(`   New liked by: ${JSON.stringify(newLikedBy)}`);
    
    // Verify the update
    const updatedDoc = await getDoc(wordRef);
    const updatedData = updatedDoc.data();
    console.log('\n🔍 Verification:');
    console.log(`   Database likes count: ${updatedData.likesCount}`);
    console.log(`   Database liked by: ${JSON.stringify(updatedData.likedBy)}`);
    
  } catch (error) {
    console.error('❌ Error testing like toggle:', error);
  } finally {
    process.exit(0);
  }
}

testToggleLike();
