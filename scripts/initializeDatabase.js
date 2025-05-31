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
connectAuthEmulator(auth, "http://127.0.0.1:9098", { disableWarnings: true });

console.log('Connecting to Firestore emulator on port 8081...');
connectFirestoreEmulator(db, '127.0.0.1', 8081);

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
  },
  {
    email: 'user1@kurukhdictionary.com',
    password: 'User123!', 
    username: 'user1'
  },
  {
    email: 'user2@kurukhdictionary.com',
    password: 'User123!', 
    username: 'user2'
  },
  {
    email: 'user3@kurukhdictionary.com',
    password: 'User123!', 
    username: 'user3'
  },
  {
    email: 'user4@kurukhdictionary.com',
    password: 'User123!', 
    username: 'user4'
  },
  {
    email: 'user5@kurukhdictionary.com',
    password: 'User123!', 
    username: 'user5'
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
 * Add community review test words to Firestore
 */
async function addCommunityReviewWords() {
  console.log('Adding community review test words...');
  
  // Sample words in various states of community review
  const communityReviewWords = [
    // Word with no votes yet
    {
      kurukh_word: 'kokro',
      meanings: [
        {
          language: 'en',
          definition: 'Hen, chicken',
          example_sentence_kurukh: 'Kokro uraa uraa.',
          example_sentence_translation: 'The hen is flying.'
        },
        {
          language: 'hi',
          definition: 'मुर्गी',
          example_sentence_kurukh: 'Kokro uraa uraa.',
          example_sentence_translation: 'मुर्गी उड़ रही है।'
        }
      ],
      part_of_speech: 'noun',
      pronunciation_guide: 'kokro',
      tags: ['animals'],
      status: 'community_review',
      community_votes_for: 0,
      community_votes_against: 0,
      reviewed_by: []
    },
    
    // Word with 2 approve votes
    {
      kurukh_word: 'mocha',
      meanings: [
        {
          language: 'en',
          definition: 'Mouth',
          example_sentence_kurukh: 'Nii mocha kholo.',
          example_sentence_translation: 'Open your mouth.'
        },
        {
          language: 'hi',
          definition: 'मुँह',
          example_sentence_kurukh: 'Nii mocha kholo.',
          example_sentence_translation: 'अपना मुँह खोलो।'
        }
      ],
      part_of_speech: 'noun',
      pronunciation_guide: 'motʃʌ',
      tags: ['body'],
      status: 'community_review',
      community_votes_for: 2,
      community_votes_against: 0,
      reviewed_by: [
        {
          user_id: 'user1_id',
          vote: 'approve',
          timestamp: new Date()
        },
        {
          user_id: 'user2_id',
          vote: 'approve',
          timestamp: new Date()
        }
      ]
    },
    
    // Word with 4 approve votes (one away from admin review)
    {
      kurukh_word: 'kurkuti',
      meanings: [
        {
          language: 'en',
          definition: 'Dog',
          example_sentence_kurukh: 'Kurkuti bhonkaa.',
          example_sentence_translation: 'The dog barks.'
        },
        {
          language: 'hi',
          definition: 'कुत्ता',
          example_sentence_kurukh: 'Kurkuti bhonkaa.',
          example_sentence_translation: 'कुत्ता भौंकता है।'
        }
      ],
      part_of_speech: 'noun',
      pronunciation_guide: 'kurkuʈɪ',
      tags: ['animals'],
      status: 'community_review',
      community_votes_for: 4,
      community_votes_against: 0,
      reviewed_by: [
        {
          user_id: 'user1_id',
          vote: 'approve',
          timestamp: new Date()
        },
        {
          user_id: 'user2_id',
          vote: 'approve',
          timestamp: new Date()
        },
        {
          user_id: 'user3_id',
          vote: 'approve',
          timestamp: new Date()
        },
        {
          user_id: 'user4_id',
          vote: 'approve',
          timestamp: new Date()
        }
      ]
    },
    
    // Word with 2 reject votes
    {
      kurukh_word: 'sadak',
      meanings: [
        {
          language: 'en',
          definition: 'Road, street',
          example_sentence_kurukh: 'Sadak chhota lagaa.',
          example_sentence_translation: 'The road seems narrow.'
        },
        {
          language: 'hi',
          definition: 'सड़क',
          example_sentence_kurukh: 'Sadak chhota lagaa.',
          example_sentence_translation: 'सड़क संकरी लगती है।'
        }
      ],
      part_of_speech: 'noun',
      pronunciation_guide: 'sʌɖʌk',
      tags: ['place'],
      status: 'community_review',
      community_votes_for: 0,
      community_votes_against: 2,
      reviewed_by: [
        {
          user_id: 'user1_id',
          vote: 'reject',
          timestamp: new Date()
        },
        {
          user_id: 'user2_id',
          vote: 'reject',
          timestamp: new Date()
        }
      ]
    },
    
    // Word that already passed community review, awaiting admin review
    {
      kurukh_word: 'pani',
      meanings: [
        {
          language: 'en',
          definition: 'Water',
          example_sentence_kurukh: 'Pani piyaa.',
          example_sentence_translation: 'Drink water.'
        },
        {
          language: 'hi',
          definition: 'पानी',
          example_sentence_kurukh: 'Pani piyaa.',
          example_sentence_translation: 'पानी पियो।'
        }
      ],
      part_of_speech: 'noun',
      pronunciation_guide: 'pʌnɪ',
      tags: ['nature', 'element'],
      status: 'pending_review',
      community_votes_for: 5,
      community_votes_against: 0,
      reviewed_by: [
        {
          user_id: 'user1_id',
          vote: 'approve',
          timestamp: new Date()
        },
        {
          user_id: 'user2_id',
          vote: 'approve',
          timestamp: new Date()
        },
        {
          user_id: 'user3_id',
          vote: 'approve',
          timestamp: new Date()
        },
        {
          user_id: 'user4_id',
          vote: 'approve',
          timestamp: new Date()
        },
        {
          user_id: 'user5_id',
          vote: 'approve',
          timestamp: new Date()
        }
      ]
    },
    
    // Word rejected by community
    {
      kurukh_word: 'invalid_word',
      meanings: [
        {
          language: 'en',
          definition: 'Invalid definition',
          example_sentence_kurukh: 'This is not a valid example',
          example_sentence_translation: 'This is not valid'
        }
      ],
      part_of_speech: 'noun',
      pronunciation_guide: 'ɪnvælɪd',
      tags: ['test'],
      status: 'community_rejected',
      community_votes_for: 0,
      community_votes_against: 5,
      reviewed_by: [
        {
          user_id: 'user1_id',
          vote: 'reject',
          timestamp: new Date()
        },
        {
          user_id: 'user2_id',
          vote: 'reject',
          timestamp: new Date()
        },
        {
          user_id: 'user3_id',
          vote: 'reject',
          timestamp: new Date()
        },
        {
          user_id: 'user4_id',
          vote: 'reject',
          timestamp: new Date()
        },
        {
          user_id: 'user5_id',
          vote: 'reject',
          timestamp: new Date()
        }
      ]
    }
  ];
  
  for (const word of communityReviewWords) {
    try {
      // Add timestamp and contributor ID
      const wordWithMetadata = {
        ...word,
        contributor_id: 'system',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Add the word to Firestore
      const docRef = await addDoc(collection(db, 'words'), wordWithMetadata);
      console.log(`Added community review word: ${word.kurukh_word} (${docRef.id})`);
    } catch (error) {
      console.error(`Error adding community review word ${word.kurukh_word}:`, error);
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
    await addCommunityReviewWords();
    
    console.log('Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Run the script
main();
