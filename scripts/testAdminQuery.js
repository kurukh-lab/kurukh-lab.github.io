/**
 * Test script to verify admin can query pending words
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  query,
  where,
  getDocs,
  orderBy,
  connectFirestoreEmulator
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  connectAuthEmulator 
} from 'firebase/auth';

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
connectAuthEmulator(auth, "http://localhost:9098", { disableWarnings: true });

console.log('Connecting to Firestore emulator on port 8081...');
connectFirestoreEmulator(db, 'localhost', 8081);

async function testAdminQuery() {
  try {
    console.log('🔐 Logging in as admin...');
    await signInWithEmailAndPassword(auth, 'admin@kurukhdictionary.com', 'Admin123!');
    console.log('✅ Admin login successful');

    console.log('🔍 Querying all words...');
    const allWordsQuery = query(collection(db, 'words'));
    const allWordsSnapshot = await getDocs(allWordsQuery);
    
    console.log('📄 Total words in database:', allWordsSnapshot.size);
    
    allWordsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`📝 Word: ${data.kurukh_word} - Status: ${data.status}`);
    });

    console.log('\n🔍 Querying pending words specifically...');
    const pendingQuery = query(
      collection(db, 'words'),
      where('status', '==', 'pending_review')
    );
    
    const pendingSnapshot = await getDocs(pendingQuery);
    console.log('📄 Pending words found:', pendingSnapshot.size);
    
    pendingSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`📝 Pending word: ${data.kurukh_word}`);
    });

    console.log('\n🔍 Querying pending words with order...');
    const pendingOrderedQuery = query(
      collection(db, 'words'),
      where('status', '==', 'pending_review'),
      orderBy('createdAt', 'desc')
    );
    
    const pendingOrderedSnapshot = await getDocs(pendingOrderedQuery);
    console.log('📄 Pending words with order found:', pendingOrderedSnapshot.size);
    
    pendingOrderedSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`📝 Pending ordered word: ${data.kurukh_word}`);
    });

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAdminQuery();
