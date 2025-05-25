// Check words in database to debug search issue
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, connectFirestoreEmulator } from 'firebase/firestore';

const app = initializeApp({
  projectId: 'kurukh-dictionary',
  authDomain: 'kurukh-dictionary.firebaseapp.com',
  apiKey: 'demo-key'
});

const db = getFirestore(app);
try {
  connectFirestoreEmulator(db, '127.0.0.1', 8081);
} catch (error) {
  // Already connected
}

async function checkWords() {
  console.log('🔍 DEBUGGING SEARCH ISSUE');
  console.log('========================');
  
  // Check total words
  console.log('\n📊 Checking words in database...');
  const allWordsQuery = query(collection(db, 'words'));
  const allWordsSnapshot = await getDocs(allWordsQuery);
  console.log('📊 Total words:', allWordsSnapshot.size);
  
  // Check approved words
  const approvedWordsQuery = query(collection(db, 'words'), where('status', '==', 'approved'));
  const approvedWordsSnapshot = await getDocs(approvedWordsQuery);
  console.log('✅ Approved words:', approvedWordsSnapshot.size);
  
  // Show all words with their status
  if (allWordsSnapshot.size > 0) {
    console.log('\n📝 All words with status:');
    allWordsSnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`  ${index + 1}. "${data.kurukh_word}" - Status: ${data.status}`);
    });
  }
  
  // Test a simple search query
  console.log('\n🔍 Testing search functionality...');
  
  if (approvedWordsSnapshot.size > 0) {
    // Get first approved word for testing
    const firstApprovedWord = approvedWordsSnapshot.docs[0].data();
    const searchTerm = firstApprovedWord.kurukh_word.substring(0, 2); // First 2 chars
    
    console.log(`🔍 Testing search for: "${searchTerm}"`);
    
    try {
      const searchQuery = query(
        collection(db, 'words'),
        where('status', '==', 'approved'),
        where('kurukh_word', '>=', searchTerm),
        where('kurukh_word', '<=', searchTerm + '\\uf8ff')
      );
      
      const searchSnapshot = await getDocs(searchQuery);
      console.log(`📋 Search results: ${searchSnapshot.size} words found`);
      
      searchSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`  - "${data.kurukh_word}"`);
      });
    } catch (error) {
      console.error('❌ Search query failed:', error.message);
    }
  } else {
    console.log('❌ No approved words found to test search');
  }
}

checkWords().catch(console.error);
