// Add like fields to existing words in the database
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

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

async function addLikeFieldsToWords() {
  try {
    console.log('🔍 Getting all words from database...');
    
    // Get all words
    const wordsCollection = collection(db, 'words');
    const snapshot = await getDocs(wordsCollection);
    
    console.log(`📊 Found ${snapshot.size} words in database`);
    
    if (snapshot.size === 0) {
      console.log('❌ No words found in database. Please run initializeDatabase.js first.');
      return;
    }
    
    let updateCount = 0;
    
    // Update each word with like fields
    for (const wordDoc of snapshot.docs) {
      const wordData = wordDoc.data();
      
      // Check if like fields already exist
      if (!wordData.hasOwnProperty('likesCount') || !wordData.hasOwnProperty('likedBy')) {
        console.log(`📝 Adding like fields to word: ${wordData.kurukh_word}`);
        
        const wordRef = doc(db, 'words', wordDoc.id);
        await updateDoc(wordRef, {
          likesCount: 0,
          likedBy: []
        });
        
        updateCount++;
      } else {
        console.log(`✅ Word "${wordData.kurukh_word}" already has like fields`);
      }
    }
    
    console.log(`\n🎉 Successfully updated ${updateCount} words with like fields!`);
    console.log('\n📋 Like functionality is now ready to test:');
    console.log('   1. Open the app at http://localhost:5173');
    console.log('   2. Navigate to any word card or word details');
    console.log('   3. Click the heart button to like/unlike words');
    console.log('   4. Like counts should persist in localStorage for anonymous users');
    
  } catch (error) {
    console.error('❌ Error updating words with like fields:', error);
  } finally {
    process.exit(0);
  }
}

addLikeFieldsToWords();
