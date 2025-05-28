import admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'kurukh-dictionary'
  });
}

const db = admin.firestore();

// Connect to emulator
db.settings({
  host: 'localhost:8081',
  ssl: false
});

async function addTestWords() {
  console.log('📝 Adding test words for highlighting demo...');
  
  const testWords = [
    {
      kurukh_word: 'mankhaa',
      english_definition: 'man, person, human being',
      meanings: [
        {
          language: 'en',
          definition: 'man, person, human being'
        }
      ],
      part_of_speech: 'noun',
      status: 'approved',
      createdAt: admin.firestore.Timestamp.now()
    },
    {
      kurukh_word: 'pani',
      english_definition: 'water',
      meanings: [
        {
          language: 'en',
          definition: 'water'
        }
      ],
      part_of_speech: 'noun',
      status: 'approved',
      createdAt: admin.firestore.Timestamp.now()
    },
    {
      kurukh_word: 'khana',
      english_definition: 'food, meal',
      meanings: [
        {
          language: 'en',
          definition: 'food, meal'
        }
      ],
      part_of_speech: 'noun',
      status: 'approved',
      createdAt: admin.firestore.Timestamp.now()
    },
    {
      kurukh_word: 'dokon',
      english_definition: 'tree, wood',
      meanings: [
        {
          language: 'en',
          definition: 'tree, wood'
        }
      ],
      part_of_speech: 'noun',
      status: 'approved',
      createdAt: admin.firestore.Timestamp.now()
    },
    {
      kurukh_word: 'bhat',
      english_definition: 'rice',
      meanings: [
        {
          language: 'en',
          definition: 'rice'
        }
      ],
      part_of_speech: 'noun',
      status: 'approved',
      createdAt: admin.firestore.Timestamp.now()
    }
  ];

  try {
    const batch = db.batch();
    
    testWords.forEach((word) => {
      const docRef = db.collection('words').doc();
      batch.set(docRef, word);
    });
    
    await batch.commit();
    console.log('✅ Successfully added test words!');
    console.log(`📊 Added ${testWords.length} words to database`);
    console.log('\n🔍 Now you can test search highlighting with:');
    testWords.forEach(word => {
      console.log(`   - "${word.kurukh_word}" (${word.english_definition})`);
    });
    
  } catch (error) {
    console.error('❌ Error adding words:', error);
  }
}

addTestWords().catch(console.error);
