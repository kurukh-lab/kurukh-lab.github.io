// Test the search functionality directly
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { searchWords } from '../src/services/dictionaryService.js';

const firebaseConfig = {
  projectId: 'kurukh-dictionary',
  authDomain: 'kurukh-dictionary.firebaseapp.com',
  apiKey: 'demo-key'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

try {
  connectFirestoreEmulator(db, '127.0.0.1', 8081);
} catch (error) {
  // Already connected
}

async function testSearch() {
  console.log('🔍 TESTING SEARCH FUNCTIONALITY');
  console.log('==============================');
  
  try {
    console.log('📋 Testing search for "test"...');
    const results = await searchWords('test');
    
    console.log(`📊 Search results: ${results.length} words found`);
    
    if (results.length > 0) {
      console.log('✅ SEARCH IS WORKING! Found words:');
      results.forEach((word, index) => {
        console.log(`  ${index + 1}. "${word.kurukh_word}" - ${word.english_definition}`);
        console.log(`     Status: ${word.status}`);
      });
    } else {
      console.log('❌ No results found');
    }
    
    // Test partial search
    console.log('\n📋 Testing partial search for "te"...');
    const partialResults = await searchWords('te');
    console.log(`📊 Partial search results: ${partialResults.length} words found`);
    
    if (partialResults.length > 0) {
      console.log('✅ Partial search working:');
      partialResults.forEach((word, index) => {
        console.log(`  ${index + 1}. "${word.kurukh_word}"`);
      });
    }
    
  } catch (error) {
    console.error('❌ Search test failed:', error);
  }
}

testSearch();
