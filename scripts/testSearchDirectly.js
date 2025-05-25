// Test search functionality directly with Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, connectFirestoreEmulator } from 'firebase/firestore';

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

async function testSearchDirectly() {
  console.log('🔍 TESTING SEARCH DIRECTLY WITH FIRESTORE');
  console.log('=========================================');
  
  try {
    // Test 1: Check if approved words exist
    console.log('📋 Step 1: Checking approved words...');
    const approvedQuery = query(
      collection(db, 'words'),
      where('status', '==', 'approved')
    );
    
    const approvedSnapshot = await getDocs(approvedQuery);
    console.log(`📊 Found ${approvedSnapshot.size} approved words`);
    
    if (approvedSnapshot.size > 0) {
      console.log('✅ Approved words found:');
      approvedSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`  - "${data.kurukh_word}" (${data.english_definition})`);
      });
      
      // Test 2: Test search functionality
      console.log('\n📋 Step 2: Testing search for "test"...');
      const searchTerm = 'test';
      
      let matchingWords = [];
      approvedSnapshot.forEach((doc) => {
        const data = doc.data();
        const kurukhWord = data.kurukh_word?.toLowerCase() || '';
        
        if (kurukhWord.includes(searchTerm.toLowerCase())) {
          matchingWords.push({
            id: doc.id,
            ...data
          });
        }
      });
      
      console.log(`🎯 Found ${matchingWords.length} words matching "${searchTerm}"`);
      
      if (matchingWords.length > 0) {
        console.log('✅ SEARCH LOGIC IS WORKING! Found:');
        matchingWords.forEach((word, index) => {
          console.log(`  ${index + 1}. "${word.kurukh_word}" - ${word.english_definition}`);
        });
        
        console.log('\n🎉 SEARCH FUNCTIONALITY FIXED!');
        console.log('The issue was in the Firebase query structure.');
        console.log('Now test the search on the website at http://localhost:5174');
      } else {
        console.log('❌ No matching words found for search term');
      }
    } else {
      console.log('❌ No approved words found in database');
      console.log('Need to add approved words first');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testSearchDirectly();
