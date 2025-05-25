/**
 * Database initialization script
 * 
 * This script populates the Firestore database with initial data for testing
 * Run using: node scripts/initializeDatabase.js
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  setDoc, 
  doc, 
  serverTimestamp,
  connectFirestoreEmulator
} from 'firebase/firestore';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  connectAuthEmulator 
} from 'firebase/auth';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env' : '.env.local'
});

console.log('Initializing database in emulator mode...');

// Simple Firebase configuration for emulator
const firebaseConfig = {
  projectId: "kurukh-dictionary",
  apiKey: "fake-api-key-for-emulator"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Connect to emulators
console.log('Connecting to Auth emulator on port 9098...');
connectAuthEmulator(auth, "http://localhost:9098", { disableWarnings: true });

console.log('Connecting to Firestore emulator on port 8081...');
connectFirestoreEmulator(db, 'localhost', 8081);

// Sample data
const sampleWords = [
  {
    kurukh_word: 'bai',
    meanings: [
      {
        language: 'en',
        definition: 'Mother',
        example_sentence_kurukh: 'Nin bai enaa engaa?',
        example_sentence_translation: 'Where is your mother?'
      },
      {
        language: 'hi',
        definition: 'माता',
        example_sentence_kurukh: 'Nin bai enaa engaa?',
        example_sentence_translation: 'तुम्हारी माँ कहाँ है?'
      }
    ],
    part_of_speech: 'noun',
    pronunciation_guide: 'bʌɪ',
    tags: ['family', 'relationship'],
    status: 'approved'
  },
  {
    kurukh_word: 'abba',
    meanings: [
      {
        language: 'en',
        definition: 'Father',
        example_sentence_kurukh: 'Nin abba endraa.',
        example_sentence_translation: 'Your father has come.'
      },
      {
        language: 'hi',
        definition: 'पिता',
        example_sentence_kurukh: 'Nin abba endraa.',
        example_sentence_translation: 'तुम्हारे पिता आ गए हैं।'
      }
    ],
    part_of_speech: 'noun',
    pronunciation_guide: 'ʌbːʌ',
    tags: ['family', 'relationship'],
    status: 'approved'
  },
  {
    kurukh_word: 'mankhaa',
    meanings: [
      {
        language: 'en',
        definition: 'Person, Human being',
        example_sentence_kurukh: 'Ond mankhaa ondraar.',
        example_sentence_translation: 'A person is coming.'
      },
      {
        language: 'hi',
        definition: 'व्यक्ति, इंसान',
        example_sentence_kurukh: 'Ond mankhaa ondraar.',
        example_sentence_translation: 'एक व्यक्ति आ रहा है।'
      }
    ],
    part_of_speech: 'noun',
    pronunciation_guide: 'mʌnkʰaː',
    tags: ['general'],
    status: 'approved'
  },
  {
    kurukh_word: 'chicka',
    meanings: [
      {
        language: 'en',
        definition: 'Small, little',
        example_sentence_kurukh: 'Nii chicka koa.',
        example_sentence_translation: 'Your little child.'
      },
      {
        language: 'hi',
        definition: 'छोटा',
        example_sentence_kurukh: 'Nii chicka koa.',
        example_sentence_translation: 'तुम्हारा छोटा बच्चा।'
      }
    ],
    part_of_speech: 'adjective',
    pronunciation_guide: 'tʃɪkʌ',
    tags: ['size', 'description'],
    status: 'approved'
  },
  {
    kurukh_word: 'dokon',
    meanings: [
      {
        language: 'en',
        definition: 'Shop, store',
        example_sentence_kurukh: 'Aan dokon-ge menjkan.',
        example_sentence_translation: 'I am going to the shop.'
      },
      {
        language: 'hi',
        definition: 'दुकान',
        example_sentence_kurukh: 'Aan dokon-ge menjkan.',
        example_sentence_translation: 'मैं दुकान पर जा रहा हूँ।'
      }
    ],
    part_of_speech: 'noun',
    pronunciation_guide: 'dokən',
    tags: ['place', 'commerce'],
    status: 'pending_review'
  }
];

// Sample users
const sampleUsers = [
  {
    email: 'admin@kurukhdictionary.com',
    password: 'Admin123!',
    username: 'admin',
    roles: ['admin']
  },
  {
    email: 'user@kurukhdictionary.com',
    password: 'User123!', 
    username: 'regularuser'
  }
];

/**
 * Create users and add their data to Firestore
 */
async function createUsers() {
  console.log('Creating users...');
  
  for (const user of sampleUsers) {
    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
      const uid = userCredential.user.uid;
      
      // Add additional user data to Firestore
      await setDoc(doc(db, 'users', uid), {
        uid,
        username: user.username,
        email: user.email,
        roles: user.roles || [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log(`Created user: ${user.email} (${uid})`);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`User ${user.email} already exists, skipping...`);
      } else {
        console.error(`Error creating user ${user.email}:`, error);
      }
    }
  }
}

/**
 * Add sample words to Firestore
 */
async function addSampleWords() {
  console.log('Adding sample words...');
  
  for (const word of sampleWords) {
    try {
      // Get admin user to set as contributor
      const userEmail = 'admin@kurukhdictionary.com';
      const usersRef = collection(db, 'users');
      
      // Add timestamp and contributor ID
      const wordWithMetadata = {
        ...word,
        contributor_id: 'system',  // Will be updated if we find the admin user
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Add the word to Firestore
      const docRef = await addDoc(collection(db, 'words'), wordWithMetadata);
      console.log(`Added word: ${word.kurukh_word} (${docRef.id})`);
    } catch (error) {
      console.error(`Error adding word ${word.kurukh_word}:`, error);
    }
  }
}

/**
 * Main function to run the script
 */
async function main() {
  try {
    console.log('Initializing database...');
    
    await createUsers();
    await addSampleWords();
    
    console.log('Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Run the script
main();
