// Add more approved words for comprehensive search testing
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

const additionalWords = [
  {
    kurukh_word: 'pani',
    english_definition: 'water',
    hindi_definition: 'पानी',
    status: 'approved',
    meanings: [
      {
        language: 'en',
        definition: 'water, liquid for drinking'
      },
      {
        language: 'hi',
        definition: 'पानी, पीने का तरल पदार्थ'
      }
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    kurukh_word: 'dokon',
    english_definition: 'house, home',
    hindi_definition: 'घर',
    status: 'approved',
    meanings: [
      {
        language: 'en',
        definition: 'house, home, dwelling place'
      },
      {
        language: 'hi',
        definition: 'घर, निवास स्थान'
      }
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    kurukh_word: 'khana',
    english_definition: 'food, to eat',
    hindi_definition: 'खाना',
    status: 'approved',
    meanings: [
      {
        language: 'en',
        definition: 'food, to eat, meal'
      },
      {
        language: 'hi',
        definition: 'खाना, भोजन'
      }
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

async function addMoreWords() {
  console.log('🔍 Adding more approved words for testing...');
  
  try {
    for (const word of additionalWords) {
      const docRef = await db.collection('words').add(word);
      console.log(`✅ Added "${word.kurukh_word}" with ID: ${docRef.id}`);
    }
    
    console.log('\n🎉 More approved words added successfully!');
    console.log('\n📋 Now you can test search with:');
    console.log('   - "test" → should find "test"');
    console.log('   - "pan" → should find "pani"');
    console.log('   - "dok" → should find "dokon"');
    console.log('   - "kha" → should find "khana"');
    console.log('   - "man" → should find "mankhaa"');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

addMoreWords();
