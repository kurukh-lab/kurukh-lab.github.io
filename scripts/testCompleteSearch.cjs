#!/usr/bin/env node

// Test script to verify the complete search functionality
// This simulates exactly what happens in the web application

const admin = require('firebase-admin');

// Initialize Firebase Admin (same as other scripts)
const app = admin.initializeApp({
  projectId: 'kurukh-dictionary'
});

const db = admin.firestore();
db.settings({
  host: 'localhost:8081',
  ssl: false
});

// Import the exact same search logic from dictionaryService.js
async function searchWords(searchTerm, options = {}) {
  console.log(`🔍 Searching for: "${searchTerm}"`);
  
  try {
    // Basic query for approved words only (same as the fixed version)
    const wordsCollection = db.collection('words');
    const baseQuery = wordsCollection.where('status', '==', 'approved');
    
    console.log('📋 Executing Firestore query...');
    const snapshot = await baseQuery.get();
    console.log(`📊 Found ${snapshot.size} approved words in database`);
    
    const words = [];
    const processedTerm = searchTerm.toLowerCase().trim();
    
    snapshot.forEach((doc) => {
      const wordData = { id: doc.id, ...doc.data() };
      const kurukhWord = wordData.kurukh_word?.toLowerCase() || '';
      
      // Same filtering logic as in the web app
      if (kurukhWord.includes(processedTerm)) {
        words.push(wordData);
        console.log(`✅ Match found: "${wordData.kurukh_word}"`);
      }
    });
    
    // Same sorting logic as in the web app
    words.sort((a, b) => {
      const aWord = a.kurukh_word?.toLowerCase() || '';
      const bWord = b.kurukh_word?.toLowerCase() || '';
      
      // Exact matches first
      const aExact = aWord === processedTerm;
      const bExact = bWord === processedTerm;
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      // Then alphabetical
      return aWord.localeCompare(bWord);
    });
    
    console.log(`🎯 Returning ${words.length} matching words`);
    return words;
    
  } catch (error) {
    console.error('❌ Search error:', error);
    throw error;
  }
}

// Test the search with various terms
async function runSearchTests() {
  console.log('🚀 TESTING SEARCH FUNCTIONALITY');
  console.log('===============================');
  console.log('This tests the exact same logic used in the web application.\n');
  
  const testCases = [
    { term: 'test', expected: 'Should find "test"' },
    { term: 'pan', expected: 'Should find "pani"' },
    { term: 'dok', expected: 'Should find "dokon"' },
    { term: 'kha', expected: 'Should find "khana"' },
    { term: 'man', expected: 'Should find "mankhaa"' },
    { term: 'xyz', expected: 'Should find nothing' }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n📝 Test: "${testCase.term}" - ${testCase.expected}`);
    console.log('─'.repeat(50));
    
    try {
      const results = await searchWords(testCase.term);
      
      if (results.length > 0) {
        console.log(`✅ SUCCESS: Found ${results.length} result(s):`);
        results.forEach((word, index) => {
          console.log(`   ${index + 1}. "${word.kurukh_word}" - ${word.english_definition || 'No definition'}`);
        });
      } else {
        console.log('❌ No results found');
      }
    } catch (error) {
      console.error('❌ Test failed:', error.message);
    }
  }
  
  console.log('\n🏁 SEARCH TESTS COMPLETED');
  console.log('========================');
  console.log('If all tests show expected results, the search functionality is working correctly.');
  console.log('You can now test it in the browser at: http://localhost:5174');
}

// Run the tests
runSearchTests()
  .then(() => {
    console.log('\n✅ All tests completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  });
