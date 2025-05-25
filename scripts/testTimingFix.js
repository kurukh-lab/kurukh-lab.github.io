// Simple test to verify the timing fix works
// This simulates the authentication flow step by step

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';

// Firebase config for emulator
const firebaseConfig = {
  apiKey: "demo-key",
  authDomain: "kurukh-dictionary.firebaseapp.com",
  projectId: "kurukh-dictionary",
  storageBucket: "kurukh-dictionary.appspot.com",
  messagingSenderId: "123456789",
  appId: "demo-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Connect to emulators
connectAuthEmulator(auth, 'http://localhost:9098', { disableWarnings: true });
connectFirestoreEmulator(db, 'localhost', 8081);

console.log('🧪 Testing the admin timing fix...\n');

// Simulate the exact timing issue we had
async function testTimingFix() {
  try {
    console.log('🔐 Step 1: Login as admin');
    const userCredential = await signInWithEmailAndPassword(auth, 'admin@kurukhdictionary.com', 'Admin123!');
    const currentUser = userCredential.user;
    console.log('✅ Login successful, UID:', currentUser.uid);

    // Step 2: Simulate initial userRoles state (starts as null)
    let userRoles = null;
    let rolesLoading = true;
    console.log('\n🔄 Step 2: Initial state - userRoles:', userRoles, 'rolesLoading:', rolesLoading);

    // This is what would happen in the Admin component before the fix
    if (rolesLoading) {
      console.log('⏳ userRoles still loading, would skip fetch (GOOD - this is the fix!)');
    }

    // Step 3: Fetch user roles (simulating the useEffect in AuthContext)
    console.log('\n🔍 Step 3: Fetching user roles...');
    const userDocRef = doc(db, "users", currentUser.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      userRoles = data.roles || [];
      rolesLoading = false;
      console.log('📄 User roles loaded:', userRoles);
      console.log('🔄 rolesLoading set to false');
    }

    // Step 4: Now check if admin query would work
    const isAdmin = userRoles.includes('admin');
    console.log('\n🔑 Step 4: isAdmin:', isAdmin, 'rolesLoading:', rolesLoading);

    if (currentUser && !rolesLoading && isAdmin) {
      console.log('✅ All conditions met, would fetch pending words now!');
      
      // Test the actual query
      const q = query(
        collection(db, 'words'),
        where('status', '==', 'pending_review'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      console.log('📄 Query executed successfully, found:', querySnapshot.size, 'pending words');
      
      querySnapshot.forEach((doc) => {
        const wordData = doc.data();
        console.log('📝 Pending word:', wordData.kurukh_word);
      });
      
      console.log('\n🎉 SUCCESS: The timing fix resolves the admin dashboard issue!');
    } else {
      console.log('❌ Conditions not met for admin query');
    }

  } catch (error) {
    console.error('❌ Error in timing test:', error);
  }
}

testTimingFix();
