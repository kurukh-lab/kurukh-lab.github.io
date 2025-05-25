// Comprehensive end-to-end test of the Word Reports functionality
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

// Simulate the complete Admin.jsx fetchWordReports flow
async function testCompleteWordReportsFlow() {
  try {
    console.log('🔐 Logging in as admin...');
    await signInWithEmailAndPassword(auth, 'admin@kurukhdictionary.com', 'Admin123!');
    console.log('✅ Admin login successful');
    
    // Simulate the exact authentication flow from Admin.jsx
    console.log('\n🔍 Step 1: Checking authentication state...');
    const currentUser = auth.currentUser;
    console.log('👤 Current user:', currentUser?.uid);
    
    // Simulate roles loading (this would be done by AuthContext)
    console.log('\n🔍 Step 2: Loading user roles...');
    const userDocRef = doc(db, "users", currentUser.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.log('❌ User document not found');
      return;
    }
    
    const userData = userDoc.data();
    const userRoles = userData.roles || [];
    const isAdmin = userRoles.includes('admin');
    const rolesLoading = false; // Simulating roles loaded
    
    console.log('📄 User roles:', userRoles);
    console.log('🔑 Is admin:', isAdmin);
    console.log('⏳ Roles loading:', rolesLoading);
    
    // Simulate the fetchWordReports conditions from Admin.jsx
    console.log('\n🔍 Step 3: Checking fetchWordReports conditions...');
    
    if (!currentUser) {
      console.log('❌ No current user, would skip fetch');
      return;
    }
    
    if (rolesLoading) {
      console.log('❌ User roles still loading, would skip fetch');
      return;
    }
    
    if (!isAdmin) {
      console.log('❌ Not admin after roles loaded, would skip fetch');
      return;
    }
    
    const activeTab = 'reports'; // Simulating user clicking on Reports tab
    if (activeTab !== 'reports') {
      console.log('❌ Not on reports tab, would skip fetch');
      return;
    }
    
    console.log('✅ All conditions met, proceeding with reports fetch...');
    
    // Simulate the exact query from Admin.jsx
    console.log('\n🔍 Step 4: Executing reports query...');
    const reportsQuery = query(
      collection(db, 'reports'),
      where('status', '==', 'open'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(reportsQuery);
    console.log('📄 Reports query snapshot size:', querySnapshot.size);
    
    if (querySnapshot.size === 0) {
      console.log('❌ No reports found - Admin Dashboard would show "No reports to display"');
      return;
    }
    
    const reports = [];
    
    console.log('\n🔍 Step 5: Processing each report...');
    for (const docSnapshot of querySnapshot.docs) {
      const reportData = {
        id: docSnapshot.id,
        ...docSnapshot.data()
      };
      
      console.log(`📝 Processing report ${reportData.id}:`);
      console.log(`   - Word ID: ${reportData.word_id}`);
      console.log(`   - Reason: ${reportData.reason}`);
      console.log(`   - Status: ${reportData.status}`);
      
      // Get word details for each report (exact Admin.jsx logic)
      try {
        const wordDoc = await getDoc(doc(db, 'words', reportData.word_id));
        if (wordDoc.exists()) {
          reportData.word = {
            id: wordDoc.id,
            ...wordDoc.data()
          };
          console.log(`   ✅ Word details loaded: ${reportData.word.kurukh_word}`);
        } else {
          console.log(`   ❌ Word not found for report: ${reportData.word_id}`);
        }
      } catch (wordErr) {
        console.error('   ❌ Error fetching word for report:', wordErr);
      }
      
      reports.push(reportData);
    }
    
    console.log(`\n📊 Reports processing completed!`);
    console.log(`📋 Total reports loaded: ${reports.length}`);
    
    // Simulate what the Admin UI would display
    console.log('\n🎯 Step 6: What Admin Dashboard would show:');
    console.log('=====================================');
    
    if (reports.length === 0) {
      console.log('📝 UI would display: "No reports to display."');
    } else {
      console.log(`📝 UI would display ${reports.length} reports in the Word Reports section:`);
      reports.forEach((report, index) => {
        console.log(`\n${index + 1}. Report ID: ${report.id}`);
        console.log(`   Word: "${report.word?.kurukh_word || 'Unknown Word'}"`);
        console.log(`   Reason: ${report.reason}`);
        console.log(`   Details: ${report.details}`);
        console.log(`   Reported on: ${report.createdAt?.toDate?.() || report.createdAt}`);
      });
    }
    
    console.log('\n✅ Word Reports functionality test completed successfully!');
    console.log('💡 The Admin Dashboard should now show the Word Reports correctly.');
    
  } catch (error) {
    console.error('❌ Error in complete word reports flow test:', error);
  }
}

testCompleteWordReportsFlow();
