// Final comprehensive test to verify Word Reports functionality is working
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
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

async function verifyWordReportsFix() {
  try {
    console.log('🎯 FINAL VERIFICATION: Word Reports Fix');
    console.log('=====================================');
    
    console.log('🔐 Logging in as admin...');
    await signInWithEmailAndPassword(auth, 'admin@kurukhdictionary.com', 'Admin123!');
    console.log('✅ Admin login successful');
    
    // Verify we have the expected reports
    console.log('\n📋 Checking reports in database...');
    const reportsQuery = query(
      collection(db, 'reports'),
      where('status', '==', 'open'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(reportsQuery);
    console.log(`📄 Found ${querySnapshot.size} open reports`);
    
    if (querySnapshot.size === 0) {
      console.log('❌ No reports found! The Admin Dashboard will still show "No reports to display"');
      console.log('💡 You may need to run: node scripts/createSampleReports.js');
      return;
    }
    
    console.log('\n📝 Reports summary:');
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`   - ${data.reason}: ${data.details}`);
    });
    
    console.log('\n✅ VERIFICATION COMPLETE!');
    console.log('🎯 Expected behavior in Admin Dashboard:');
    console.log('=====================================');
    console.log('1. Navigate to http://localhost:5174/login');
    console.log('2. Login with: admin@kurukhdictionary.com / Admin123!');
    console.log('3. Navigate to http://localhost:5174/admin');
    console.log('4. Click on "Word Reports" tab');
    console.log('5. You should see:');
    console.log(`   - ${querySnapshot.size} reports listed`);
    console.log('   - Each report showing word name, reason, details, and reported date');
    console.log('   - "Mark as Resolved" button for each report');
    console.log('');
    console.log('✅ If you see the above, the Word Reports fix is SUCCESSFUL!');
    
  } catch (error) {
    console.error('❌ Error in verification:', error);
  }
}

verifyWordReportsFix();
