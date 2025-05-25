// Test the report resolution functionality
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, collection, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
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

async function testReportResolution() {
  try {
    console.log('🔐 Logging in as admin...');
    await signInWithEmailAndPassword(auth, 'admin@kurukhdictionary.com', 'Admin123!');
    console.log('✅ Admin login successful');
    
    // Get the first open report
    console.log('📋 Finding first open report to test resolution...');
    const reportsQuery = query(
      collection(db, 'reports'),
      where('status', '==', 'open'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(reportsQuery);
    
    if (querySnapshot.size === 0) {
      console.log('❌ No open reports found to test resolution');
      return;
    }
    
    const firstReport = querySnapshot.docs[0];
    const reportData = firstReport.data();
    
    console.log(`📝 Testing resolution of report: ${firstReport.id}`);
    console.log(`   - Word ID: ${reportData.word_id}`);
    console.log(`   - Reason: ${reportData.reason}`);
    console.log(`   - Current Status: ${reportData.status}`);
    
    // Test the handleResolveReport functionality (simulate Admin.jsx logic)
    console.log('\n🔧 Simulating report resolution...');
    
    const reportRef = doc(db, 'reports', firstReport.id);
    await updateDoc(reportRef, {
      status: 'resolved',
      resolvedAt: new Date(),
      resolvedBy: auth.currentUser.uid
    });
    
    console.log('✅ Report marked as resolved successfully!');
    
    // Verify the resolution
    console.log('\n🔍 Verifying resolution...');
    const openReportsAfter = query(
      collection(db, 'reports'),
      where('status', '==', 'open')
    );
    
    const openAfterSnapshot = await getDocs(openReportsAfter);
    console.log(`📊 Open reports after resolution: ${openAfterSnapshot.size}`);
    
    const resolvedReports = query(
      collection(db, 'reports'),
      where('status', '==', 'resolved')
    );
    
    const resolvedSnapshot = await getDocs(resolvedReports);
    console.log(`📊 Resolved reports: ${resolvedSnapshot.size}`);
    
    console.log('\n✅ Report resolution test completed successfully!');
    console.log('💡 In the Admin Dashboard, this report should now be removed from the list.');
    
  } catch (error) {
    console.error('❌ Error testing report resolution:', error);
  }
}

testReportResolution();
