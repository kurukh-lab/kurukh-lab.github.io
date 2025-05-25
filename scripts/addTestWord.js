// Quick script to add one approved word for search testing
const admin = require('firebase-admin');

// Initialize Firebase Admin (for emulator)
const app = admin.initializeApp({
  projectId: 'kurukh-dictionary'
});

// Connect to Firestore emulator
const db = admin.firestore();
db.settings({
  host: 'localhost:8081',
  ssl: false
});

async function addTestWord() {
  console.log('🔍 Adding test approved word...');
  
  try {
    const testWord = {
      kurukh_word: 'test',
      english_definition: 'a test word',
      status: 'approved',
      meanings: [
        {
          language: 'en',
          definition: 'a test word for search functionality'
        }
      ],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection('words').add(testWord);
    console.log('✅ Added test word with ID:', docRef.id);
    
    // Verify it was added
    const doc = await docRef.get();
    if (doc.exists) {
      console.log('✅ Verified word exists:', doc.data());
    }
    
    console.log('✅ Test word added successfully!');
    console.log('Now try searching for "test" on the home page.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

addTestWord();
