// Create sample reports for testing Word Reports functionality
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { getAuth, connectAuthEmulator, signInWithEmailAndPassword } from 'firebase/auth';

// Firebase config for emulator
const firebaseConfig = {
  apiKey: "demo-key",
  authDomain: "kurukh-dictionary.firebaseapp.com",
  projectId: "kurukh-dictionary",
  storageBucket: "kurukh-dictionary.appspot.com",
  messagingSenderId: "123456789",
  appId: "demo-app-id"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Connect to emulators with correct settings 
try {
  connectAuthEmulator(auth, 'http://127.0.0.1:9098', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8081);
  console.log('✅ Connected to Firebase emulators');
} catch (error) {
  console.warn('⚠️ Emulators may already be connected:', error.message);
}

async function createSampleReports() {
  try {
    console.log('🔐 Logging in as admin...');
    await signInWithEmailAndPassword(auth, 'admin@kurukhdictionary.com', 'Admin123!');
    console.log('✅ Admin login successful');
    
    // First, get some approved words to create reports for
    console.log('📋 Getting approved words to create reports for...');
    const wordsQuery = query(
      collection(db, 'words'),
      where('status', '==', 'approved')
    );
    const wordsSnapshot = await getDocs(wordsQuery);
    
    if (wordsSnapshot.empty) {
      console.log('❌ No approved words found. Cannot create reports.');
      return;
    }
    
    const words = [];
    wordsSnapshot.forEach(doc => {
      words.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`📄 Found ${words.length} approved words`);
    
    // Sample reports to create
    const sampleReports = [
      {
        word_id: words[0].id,
        user_id: 'user123', // Sample user ID
        reason: 'incorrect_definition',
        details: 'The definition provided does not match the actual meaning of this word.',
        status: 'open',
        createdAt: serverTimestamp()
      },
      {
        word_id: words.length > 1 ? words[1].id : words[0].id,
        user_id: 'user456', // Another sample user ID
        reason: 'incorrect_spelling',
        details: 'There seems to be a typo in the word spelling.',
        status: 'open',
        createdAt: serverTimestamp()
      },
      {
        word_id: words.length > 2 ? words[2].id : words[0].id,
        user_id: 'user789', // Another sample user ID
        reason: 'inappropriate_content',
        details: 'This word contains inappropriate content that should be reviewed.',
        status: 'open',
        createdAt: serverTimestamp()
      }
    ];
    
    console.log('📝 Creating sample reports...');
    
    for (let i = 0; i < sampleReports.length; i++) {
      const report = sampleReports[i];
      console.log(`📄 Creating report ${i + 1}/${sampleReports.length} for word: ${words[i % words.length].kurukh_word}`);
      
      const docRef = await addDoc(collection(db, 'reports'), report);
      console.log(`✅ Created report with ID: ${docRef.id}`);
    }
    
    console.log('🎉 Sample reports created successfully!');
    
    // Verify the reports were created
    console.log('🔍 Verifying reports...');
    const allReportsQuery = query(collection(db, 'reports'));
    const allReportsSnapshot = await getDocs(allReportsQuery);
    console.log(`📊 Total reports in database: ${allReportsSnapshot.size}`);
    
    const openReportsQuery = query(
      collection(db, 'reports'),
      where('status', '==', 'open')
    );
    const openReportsSnapshot = await getDocs(openReportsQuery);
    console.log(`📋 Open reports in database: ${openReportsSnapshot.size}`);
    
    console.log('✅ Sample reports creation completed!');
    console.log('💡 Now the Admin Dashboard should show Word Reports data.');
    
  } catch (error) {
    console.error('❌ Error creating sample reports:', error);
  }
}

createSampleReports();
