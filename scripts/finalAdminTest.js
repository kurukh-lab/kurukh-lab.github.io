// Final test to verify the Admin component can access Word Reports data
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, collection, query, where, orderBy, getDocs, doc, getDoc, connectFirestoreEmulator } from 'firebase/firestore';

// Firebase configuration for emulator
const firebaseConfig = {
  projectId: 'kurukh-dictionary',
  authDomain: 'kurukh-dictionary.firebaseapp.com',
  apiKey: 'demo-key'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Connect to emulators
try {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099');
  connectFirestoreEmulator(db, '127.0.0.1', 8081);
} catch (error) {
  // Emulators already connected
}

async function testAdminAccess() {
  console.log('🧪 FINAL ADMIN TEST: Word Reports Access');
  console.log('=====================================');
  
  try {
    // Test 1: Admin login
    console.log('🔐 Step 1: Testing admin login...');
    const userCredential = await signInWithEmailAndPassword(auth, 'admin@kurukhdictionary.com', 'Admin123!');
    console.log('✅ Admin login successful:', userCredential.user.email);
    
    // Test 2: Simulate exact Admin.jsx query
    console.log('\n📋 Step 2: Testing reports query (same as Admin.jsx)...');
    const reportsQuery = query(
      collection(db, 'reports'),
      where('status', '==', 'open'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(reportsQuery);
    console.log('📄 Reports query snapshot size:', querySnapshot.size);
    
    const reports = [];
    
    // Test 3: Process reports with word details (same as Admin.jsx)
    console.log('\n📝 Step 3: Processing reports with word details...');
    for (const docSnapshot of querySnapshot.docs) {
      const reportData = {
        id: docSnapshot.id,
        ...docSnapshot.data()
      };
      
      console.log(`📝 Processing report ${reportData.id} for word ${reportData.word_id}`);
      
      // Get word details
      try {
        const wordDoc = await getDoc(doc(db, 'words', reportData.word_id));
        if (wordDoc.exists()) {
          reportData.word = {
            id: wordDoc.id,
            ...wordDoc.data()
          };
          console.log(`   ✅ Word loaded: "${reportData.word.kurukh_word}" (${reportData.word.english_definition})`);
        } else {
          console.log(`   ❌ Word not found for report: ${reportData.word_id}`);
        }
      } catch (wordErr) {
        console.log(`   ❌ Error fetching word: ${wordErr.message}`);
      }
      
      reports.push(reportData);
    }
    
    // Test 4: Display final results
    console.log('\n🎯 FINAL RESULTS:');
    console.log('=================');
    console.log(`📊 Total reports found: ${reports.length}`);
    
    if (reports.length > 0) {
      console.log('\n📋 Reports summary:');
      reports.forEach((report, index) => {
        console.log(`   ${index + 1}. Word: "${report.word?.kurukh_word || 'Unknown'}" - Reason: ${report.reason}`);
        if (report.details) {
          console.log(`      Details: ${report.details}`);
        }
      });
      
      console.log('\n✅ SUCCESS: Admin Dashboard should show these reports in the Word Reports tab!');
      console.log('\n📖 Next steps:');
      console.log('   1. Open http://localhost:5174/admin in browser');
      console.log('   2. Login with admin@kurukhdictionary.com / Admin123!');
      console.log('   3. Click "Word Reports" tab');
      console.log('   4. Verify the above reports are displayed');
    } else {
      console.log('\n❌ ISSUE: No reports found - Admin Dashboard will show empty list');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAdminAccess();
