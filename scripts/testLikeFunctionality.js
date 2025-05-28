// Test like functionality in development
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, collection, getDocs, doc, getDoc } from 'firebase/firestore';

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

async function testLikeFunctionality() {
  try {
    console.log('🔍 Testing like functionality...');
    
    // Get all words
    const wordsCollection = collection(db, 'words');
    const snapshot = await getDocs(wordsCollection);
    
    console.log(`📊 Found ${snapshot.size} words in database`);
    
    // Check first word structure
    if (snapshot.size > 0) {
      const firstDoc = snapshot.docs[0];
      const wordData = firstDoc.data();
      
      console.log('\n📋 First word structure:');
      console.log(`   Word: ${wordData.kurukh_word}`);
      console.log(`   Status: ${wordData.status}`);
      console.log(`   Likes Count: ${wordData.likesCount}`);
      console.log(`   Liked By: ${JSON.stringify(wordData.likedBy)}`);
      console.log(`   Has likes fields: ${wordData.hasOwnProperty('likesCount') && wordData.hasOwnProperty('likedBy')}`);
    }
    
    // List all words with their like status
    console.log('\n📋 All words in database:');
    snapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`   ${index + 1}. ${data.kurukh_word} (${data.status}) - Likes: ${data.likesCount || 0}`);
    });
    
    console.log('\n✅ Like functionality test completed!');
    
  } catch (error) {
    console.error('❌ Error testing like functionality:', error);
  } finally {
    process.exit(0);
  }
}

testLikeFunctionality();
