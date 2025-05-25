// Check word status and test search functionality
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, orderBy, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  projectId: 'kurukh-dictionary',
  authDomain: 'kurukh-dictionary.firebaseapp.com',
  apiKey: 'demo-key'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Connect to emulators
try {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099');
  connectFirestoreEmulator(db, '127.0.0.1', 8081);
} catch (error) {
  // Already connected
}

async function checkSearchIssue() {
  console.log('🔍 SEARCH DEBUGGING SESSION');
  console.log('===========================');
  
  try {
    // Step 1: Login as admin
    console.log('🔐 Step 1: Logging in as admin...');
    const userCredential = await signInWithEmailAndPassword(auth, 'admin@kurukhdictionary.com', 'Admin123!');
    console.log('✅ Admin login successful:', userCredential.user.email);
    
    // Step 2: Check all words
    console.log('\n📊 Step 2: Checking all words in database...');
    const allWordsQuery = query(collection(db, 'words'));
    const allWordsSnapshot = await getDocs(allWordsQuery);
    console.log(`📊 Total words in database: ${allWordsSnapshot.size}`);
    
    // Step 3: Show word details
    const allWords = [];
    allWordsSnapshot.forEach((doc) => {
      const data = doc.data();
      allWords.push({
        id: doc.id,
        kurukh_word: data.kurukh_word,
        status: data.status,
        english_definition: data.english_definition || 'No definition'
      });
    });
    
    console.log('\n📝 All words in database:');
    allWords.forEach((word, index) => {
      console.log(`  ${index + 1}. "${word.kurukh_word}" - Status: ${word.status}`);
    });
    
    // Step 4: Check approved words specifically
    console.log('\n✅ Step 4: Checking approved words...');
    const approvedWords = allWords.filter(word => word.status === 'approved');
    console.log(`📊 Approved words count: ${approvedWords.length}`);
    
    if (approvedWords.length === 0) {
      console.log('\n❌ PROBLEM IDENTIFIED: No approved words in database!');
      console.log('🔧 SOLUTION: Need to approve at least one word for search to work.');
      
      // Check if there are pending words to approve
      const pendingWords = allWords.filter(word => word.status === 'pending_review');
      if (pendingWords.length > 0) {
        console.log(`\n💡 Found ${pendingWords.length} pending words that can be approved:`);
        pendingWords.forEach((word, index) => {
          console.log(`  ${index + 1}. "${word.kurukh_word}"`);
        });
        console.log('\n📝 To fix search:');
        console.log('   1. Go to http://localhost:5174/admin');
        console.log('   2. Login as admin');
        console.log('   3. Click "Pending Words" tab');
        console.log('   4. Approve at least one word');
        console.log('   5. Then test search on Home page');
      } else {
        console.log('\n❌ No pending words found either. Database seems empty.');
        console.log('💡 You may need to add some sample words first.');
      }
    } else {
      console.log('\n✅ Found approved words! Testing search functionality...');
      
      // Step 5: Test search functionality with first approved word
      const testWord = approvedWords[0];
      const searchTerm = testWord.kurukh_word.substring(0, 2).toLowerCase();
      
      console.log(`\n🔍 Step 5: Testing search for "${searchTerm}"...`);
      
      try {
        // Test exact query from dictionaryService.js
        const searchQuery = query(
          collection(db, 'words'),
          where('kurukh_word', '>=', searchTerm),
          where('kurukh_word', '<=', searchTerm + '\\uf8ff'),
          orderBy('kurukh_word'),
          where('status', '==', 'approved')
        );
        
        const searchSnapshot = await getDocs(searchQuery);
        console.log(`📋 Search query returned: ${searchSnapshot.size} results`);
        
        if (searchSnapshot.size > 0) {
          console.log('✅ Search is working correctly! Found:');
          searchSnapshot.forEach((doc) => {
            const data = doc.data();
            console.log(`  - "${data.kurukh_word}"`);
          });
        } else {
          console.log('❌ Search returned no results despite approved words existing.');
          console.log('🔍 This indicates a query structure problem.');
        }
        
      } catch (queryError) {
        console.log('❌ Search query failed:', queryError.message);
        console.log('🔧 Firestore query structure issue detected.');
        
        // Try a simpler query to test
        console.log('\n🔍 Testing simpler query...');
        try {
          const simpleQuery = query(
            collection(db, 'words'),
            where('status', '==', 'approved')
          );
          const simpleSnapshot = await getDocs(simpleQuery);
          console.log(`📋 Simple approved words query: ${simpleSnapshot.size} results`);
        } catch (simpleError) {
          console.log('❌ Even simple query failed:', simpleError.message);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error during debugging:', error);
  }
}

checkSearchIssue();
