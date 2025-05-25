// Check reports in the database
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, collection, query, getDocs, where, orderBy } from 'firebase/firestore';
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

async function checkReports() {
  try {
    console.log('🔐 Logging in as admin...');
    await signInWithEmailAndPassword(auth, 'admin@kurukhdictionary.com', 'Admin123!');
    console.log('✅ Admin login successful');
    
    console.log('📋 Checking reports collection...');
    
    // Check all reports
    const allReportsQuery = query(collection(db, 'reports'));
    const allSnapshot = await getDocs(allReportsQuery);
    console.log('📄 Total reports found:', allSnapshot.size);
    
    if (allSnapshot.size === 0) {
      console.log('❌ No reports found in database');
      console.log('💡 This is likely why the Admin Dashboard shows no reports!');
      return;
    }
    
    // Check open reports specifically (what admin dashboard queries)
    try {
      const openReportsQuery = query(
        collection(db, 'reports'),
        where('status', '==', 'open'),
        orderBy('createdAt', 'desc')
      );
      const openSnapshot = await getDocs(openReportsQuery);
      console.log('📄 Open reports found:', openSnapshot.size);
      
      openSnapshot.forEach(doc => {
        const data = doc.data();
        console.log('📝 Open Report:', doc.id, 'Word ID:', data.word_id, 'Reason:', data.reason);
      });
    } catch (error) {
      console.error('❌ Error querying open reports:', error);
    }
    
    // List all reports with details
    allSnapshot.forEach(doc => {
      const data = doc.data();
      console.log('📝 Report Details:', {
        id: doc.id,
        status: data.status,
        word_id: data.word_id,
        reason: data.reason,
        createdAt: data.createdAt?.toDate?.() || data.createdAt
      });
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkReports();
