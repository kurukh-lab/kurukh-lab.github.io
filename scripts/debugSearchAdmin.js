// Check words in database with admin authentication
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, connectFirestoreEmulator } from 'firebase/firestore';

const app = initializeApp({
  projectId: 'kurukh-dictionary',
  authDomain: 'kurukh-dictionary.firebaseapp.com',
  apiKey: 'demo-key'
});

const auth = getAuth(app);
const db = getFirestore(app);

try {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099');
  connectFirestoreEmulator(db, '127.0.0.1', 8081);
} catch (error) {
  // Already connected
}

async function checkWordsAsAdmin() {
  console.log('🔍 DEBUGGING SEARCH ISSUE (Admin View)');
  console.log('=====================================');
  
  try {
    // Login as admin first
    console.log('🔐 Logging in as admin...');
    await signInWithEmailAndPassword(auth, 'admin@kurukhdictionary.com', 'Admin123!');
    console.log('✅ Admin login successful');
    
    // Check total words
    console.log('\n📊 Checking words in database...');
    const allWordsQuery = query(collection(db, 'words'));
    const allWordsSnapshot = await getDocs(allWordsQuery);
    console.log('📊 Total words:', allWordsSnapshot.size);
    
    // Check approved words
    const approvedWordsQuery = query(collection(db, 'words'), where('status', '==', 'approved'));
    const approvedWordsSnapshot = await getDocs(approvedWordsQuery);
    console.log('✅ Approved words:', approvedWordsSnapshot.size);
    
    // Check pending words
    const pendingWordsQuery = query(collection(db, 'words'), where('status', '==', 'pending_review'));
    const pendingWordsSnapshot = await getDocs(pendingWordsQuery);
    console.log('⏳ Pending words:', pendingWordsSnapshot.size);
    
    // Show all words with their status
    if (allWordsSnapshot.size > 0) {
      console.log('\n📝 All words with status:');
      allWordsSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`  ${index + 1}. "${data.kurukh_word}" - Status: ${data.status}`);
      });
    }
    
    // If no approved words, let's approve one for testing
    if (approvedWordsSnapshot.size === 0 && pendingWordsSnapshot.size > 0) {
      console.log('\n🔧 No approved words found. Need to approve at least one for search testing.');
      console.log('💡 Suggestion: Go to Admin Dashboard and approve a word, then test search again.');
    }
    
    // Test search on approved words
    if (approvedWordsSnapshot.size > 0) {
      console.log('\n🔍 Testing search functionality...');
      const firstApprovedWord = approvedWordsSnapshot.docs[0].data();
      const searchTerm = firstApprovedWord.kurukh_word.substring(0, 2).toLowerCase();
      
      console.log(`🔍 Testing search for: "${searchTerm}"`);
      
      try {
        // Test the exact query from dictionaryService
        const searchQuery = query(
          collection(db, 'words'),
          where('kurukh_word', '>=', searchTerm),
          where('kurukh_word', '<=', searchTerm + '\\uf8ff'),
          where('status', '==', 'approved')
        );
        
        const searchSnapshot = await getDocs(searchQuery);
        console.log(`📋 Search results: ${searchSnapshot.size} words found`);
        
        if (searchSnapshot.size > 0) {
          console.log('✅ Search is working! Found words:');
          searchSnapshot.forEach((doc) => {
            const data = doc.data();
            console.log(`  - "${data.kurukh_word}"`);
          });
        } else {
          console.log('❌ Search returned no results, but approved words exist.');
          console.log('🔍 This suggests an issue with the search query logic.');
        }
      } catch (error) {
        console.error('❌ Search query failed:', error.message);
        console.log('🔧 Firestore query issue detected.');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkWordsAsAdmin().catch(console.error);
