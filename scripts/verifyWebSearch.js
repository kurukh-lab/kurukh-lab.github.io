// Verify search works in the web context by simulating the exact same flow
// This script mimics what happens when someone searches in the web app

import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { searchWords } from '../src/services/dictionaryService.js';

// Initialize Firebase (same as in web app)
const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "kurukh-dictionary.firebaseapp.com",
  projectId: "kurukh-dictionary",
  storageBucket: "kurukh-dictionary.appspot.com",
  messagingSenderId: "123456789",
  appId: "demo-app-id"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Connect to emulator (same as in web app)
connectFirestoreEmulator(db, 'localhost', 8081);

async function testWebSearch() {
  console.log('🌐 TESTING WEB SEARCH FUNCTIONALITY');
  console.log('===================================');
  
  const testTerms = ['test', 'pan', 'dok', 'kha', 'man'];
  
  for (const term of testTerms) {
    console.log(`\n🔍 Testing search for: "${term}"`);
    try {
      const results = await searchWords(term);
      console.log(`✅ Found ${results.length} result(s):`);
      results.forEach((word, index) => {
        console.log(`  ${index + 1}. "${word.kurukh_word}" - ${word.english_definition || 'No definition'}`);
      });
    } catch (error) {
      console.error(`❌ Search failed for "${term}":`, error.message);
    }
  }
  
  console.log('\n🎉 Web search test completed!');
}

testWebSearch().catch(console.error);
