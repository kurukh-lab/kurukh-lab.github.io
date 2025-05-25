// Add approved words to test search functionality
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, collection, addDoc, connectFirestoreEmulator, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  projectId: 'kurukh-dictionary',
  authDomain: 'kurukh-dictionary.firebaseapp.com',
  apiKey: 'demo-key'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

try {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099');
  connectFirestoreEmulator(db, '127.0.0.1', 8081);
} catch (error) {
  // Already connected
}

const sampleWords = [
  {
    kurukh_word: 'mankhaa',
    english_definition: 'to see, to look',
    hindi_definition: 'देखना',
    part_of_speech: 'verb',
    meanings: [
      {
        language: 'en',
        definition: 'to see, to look at something',
        example_sentence_kurukh: 'Aen uku mankhaato.',
        example_sentence_translation: 'I am looking at him.'
      },
      {
        language: 'hi', 
        definition: 'देखना, किसी चीज़ को देखना',
        example_sentence_kurukh: 'Aen uku mankhaato.',
        example_sentence_translation: 'मैं उसे देख रहा हूँ।'
      }
    ],
    status: 'approved',
    contributor_id: 'admin',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    kurukh_word: 'pani',
    english_definition: 'water',
    hindi_definition: 'पानी',
    part_of_speech: 'noun',
    meanings: [
      {
        language: 'en',
        definition: 'water, liquid for drinking',
        example_sentence_kurukh: 'Pani pee.',
        example_sentence_translation: 'Drink water.'
      },
      {
        language: 'hi',
        definition: 'पानी, पीने का तरल पदार्थ',
        example_sentence_kurukh: 'Pani pee.',
        example_sentence_translation: 'पानी पियो।'
      }
    ],
    status: 'approved',
    contributor_id: 'admin',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    kurukh_word: 'bhat',
    english_definition: 'rice, food',
    hindi_definition: 'चावल, भोजन',
    part_of_speech: 'noun',
    meanings: [
      {
        language: 'en',
        definition: 'rice, cooked rice, food in general',
        example_sentence_kurukh: 'Bhat khan.',
        example_sentence_translation: 'Eat rice.'
      },
      {
        language: 'hi',
        definition: 'चावल, पका हुआ चावल, सामान्य भोजन',
        example_sentence_kurukh: 'Bhat khan.',
        example_sentence_translation: 'चावल खाओ।'
      }
    ],
    status: 'approved',
    contributor_id: 'admin',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    kurukh_word: 'dokon',
    english_definition: 'house, home',
    hindi_definition: 'घर',
    part_of_speech: 'noun',
    meanings: [
      {
        language: 'en',
        definition: 'house, home, dwelling place',
        example_sentence_kurukh: 'Aen dokon jhaato.',
        example_sentence_translation: 'I am going home.'
      },
      {
        language: 'hi',
        definition: 'घर, निवास स्थान',
        example_sentence_kurukh: 'Aen dokon jhaato.',
        example_sentence_translation: 'मैं घर जा रहा हूँ।'
      }
    ],
    status: 'approved', 
    contributor_id: 'admin',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
];

async function addApprovedWords() {
  console.log('🔍 ADDING APPROVED WORDS FOR SEARCH TESTING');
  console.log('==========================================');
  
  try {
    // Login as admin first
    console.log('🔐 Logging in as admin...');
    await signInWithEmailAndPassword(auth, 'admin@kurukhdictionary.com', 'Admin123!');
    console.log('✅ Admin login successful');
    
    // Add each sample word
    console.log(`\n📝 Adding ${sampleWords.length} approved words...`);
    
    for (const word of sampleWords) {
      try {
        const docRef = await addDoc(collection(db, 'words'), word);
        console.log(`✅ Added word "${word.kurukh_word}" with ID: ${docRef.id}`);
      } catch (error) {
        console.error(`❌ Failed to add word "${word.kurukh_word}":`, error.message);
      }
    }
    
    console.log('\n🎉 APPROVED WORDS ADDED SUCCESSFULLY!');
    console.log('\n📋 Now you can test search functionality:');
    console.log('   1. Go to http://localhost:5174');
    console.log('   2. Try searching for:');
    console.log('      - "man" (should find "mankhaa")');
    console.log('      - "pan" (should find "pani")');
    console.log('      - "bha" (should find "bhat")');
    console.log('      - "dok" (should find "dokon")');
    console.log('\n✅ Search should now work properly!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addApprovedWords();
