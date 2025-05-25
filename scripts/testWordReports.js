// Test the Word Reports functionality in the Admin dashboard
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
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

// Simulate the exact query that Admin.jsx makes for word reports
async function testWordReportsQuery() {
  try {
    console.log('🔐 Logging in as admin...');
    await signInWithEmailAndPassword(auth, 'admin@kurukhdictionary.com', 'Admin123!');
    console.log('✅ Admin login successful');
    
    console.log('🔍 Testing Word Reports query (simulating Admin.jsx)...');
    
    // This is the exact query from Admin.jsx line 99-103
    const reportsQuery = query(
      collection(db, 'reports'),
      where('status', '==', 'open'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(reportsQuery);
    console.log('📄 Reports query result:', querySnapshot.size, 'documents');
    
    if (querySnapshot.size === 0) {
      console.log('❌ No open reports found - Admin Dashboard will show "No reports to display"');
      return;
    }
    
    const reports = [];
    
    // Process each report (simulate Admin.jsx logic)
    for (const docSnapshot of querySnapshot.docs) {
      const reportData = {
        id: docSnapshot.id,
        ...docSnapshot.data()
      };
      
      console.log(`📝 Processing report ${reportData.id}:`);
      console.log(`   - Word ID: ${reportData.word_id}`);
      console.log(`   - Reason: ${reportData.reason}`);
      console.log(`   - Status: ${reportData.status}`);
      console.log(`   - Details: ${reportData.details}`);
      
      // Get word details for each report (simulate Admin.jsx line 112-120)
      try {
        const wordDocRef = doc(db, 'words', reportData.word_id);
        const wordDoc = await getDoc(wordDocRef);
        if (wordDoc.exists()) {
          reportData.word = {
            id: wordDoc.id,
            ...wordDoc.data()
          };
          console.log(`   - Word: ${reportData.word.kurukh_word}`);
        } else {
          console.log(`   - Word: NOT FOUND (ID: ${reportData.word_id})`);
        }
      } catch (wordErr) {
        console.error('   - Error fetching word:', wordErr);
      }
      
      reports.push(reportData);
    }
    
    console.log(`✅ Word Reports query completed successfully!`);
    console.log(`📊 Found ${reports.length} open reports with word details`);
    console.log('💡 The Admin Dashboard should now display these reports in the Word Reports tab.');
    
    // Show summary of what admin would see
    console.log('\n📋 Summary of reports for Admin Dashboard:');
    reports.forEach((report, index) => {
      console.log(`${index + 1}. "${report.word?.kurukh_word || 'Unknown Word'}" - ${report.reason}`);
      console.log(`   Details: ${report.details}`);
    });
    
  } catch (error) {
    console.error('❌ Error testing word reports query:', error);
  }
}

testWordReportsQuery();
