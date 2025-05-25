/**
 * Test script to simulate the React admin flow including timing and state management
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  query,
  where,
  getDocs,
  orderBy,
  doc,
  getDoc,
  connectFirestoreEmulator
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  onAuthStateChanged,
  connectAuthEmulator 
} from 'firebase/auth';

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

// Simulate React state
let currentUser = null;
let userRoles = [];
let isAdmin = false;
let pendingWords = [];
let loading = true;

// Simulate getUserData function from AuthContext
async function getUserData(uid) {
  try {
    console.log("🔍 getUserData called for UID:", uid);
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);
    console.log("📄 User document exists:", userDoc.exists());
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      console.log("📄 User document data:", data);
      return data;
    } else {
      console.log("📄 No user document found");
      return null;
    }
  } catch (error) {
    console.error("❌ Error in getUserData:", error);
    return null;
  }
}

// Simulate fetchUserRoles function
async function fetchUserRoles(user) {
  if (!user) {
    userRoles = [];
    isAdmin = false;
    return;
  }
  
  try {
    console.log("🔍 Fetching user roles for UID:", user.uid);
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    console.log("📄 User roles document exists:", userDoc.exists());
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      console.log("📄 User roles document data:", data);
      userRoles = data.roles || [];
      isAdmin = userRoles.includes('admin');
      console.log("👤 User roles:", userRoles);
      console.log("🔑 Is admin:", isAdmin);
    } else {
      console.log("📄 No user roles document found");
      userRoles = [];
      isAdmin = false;
    }
  } catch (error) {
    console.error("❌ Error fetching user roles:", error);
    userRoles = [];
    isAdmin = false;
  }
}

// Simulate fetchPendingWords function from Admin component
async function fetchPendingWords() {
  console.log('🔍 fetchPendingWords called', { 
    isAdmin, 
    currentUser: currentUser?.uid,
    userRoles,
    hasCurrentUser: !!currentUser,
    rolesLoaded: userRoles !== undefined && userRoles !== null
  });
  
  // If user is not logged in, skip
  if (!currentUser) {
    console.log('❌ No current user, skipping fetch');
    return;
  }
  
  // If user roles haven't been loaded yet, skip (avoid race condition)
  if (userRoles === undefined || userRoles === null) {
    console.log('⏳ User roles not loaded yet, skipping fetch');
    return;
  }
  
  // If user is not admin after roles are loaded, skip
  if (!isAdmin) {
    console.log('❌ Not admin after roles loaded, skipping fetch');
    loading = false;
    return;
  }

  loading = true;
  console.log('🔍 Admin confirmed, fetching pending words...');

  try {
    console.log('🔍 Admin fetching pending words...', { isAdmin });
    const q = query(
      collection(db, 'words'),
      where('status', '==', 'pending_review'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    console.log('📄 Query snapshot size:', querySnapshot.size);
    
    pendingWords = [];
    querySnapshot.forEach((doc) => {
      const wordData = {
        id: doc.id,
        ...doc.data()
      };
      console.log('📝 Found pending word:', wordData.kurukh_word, wordData.status);
      pendingWords.push(wordData);
    });
    
    console.log('📋 Total pending words:', pendingWords.length);
    console.log('✅ Pending words fetch completed successfully');
  } catch (err) {
    console.error("❌ Error fetching pending words:", err);
  } finally {
    loading = false;
  }
}

async function simulateReactFlow() {
  try {
    console.log('🚀 Starting React-like admin flow simulation...\n');

    // Step 1: Simulate login
    console.log('🔐 Step 1: Login as admin...');
    const userCredential = await signInWithEmailAndPassword(auth, 'admin@kurukhdictionary.com', 'Admin123!');
    currentUser = userCredential.user;
    console.log('✅ Admin login successful, UID:', currentUser.uid);

    // Step 2: Simulate the auth state change that would trigger useEffect in AuthContext
    console.log('\n🔄 Step 2: Simulating auth state change...');
    
    // First, get additional user data from Firestore (simulating AuthContext behavior)
    const userData = await getUserData(currentUser.uid);
    if (userData) {
      currentUser = { ...currentUser, ...userData };
    }

    // Step 3: Simulate fetching user roles (this happens in a separate useEffect)
    console.log('\n🔍 Step 3: Simulating user roles fetch...');
    await fetchUserRoles(currentUser);

    // Step 4: Simulate Admin component useEffect triggering after roles are loaded
    console.log('\n📱 Step 4: Simulating Admin component useEffect...');
    await fetchPendingWords();

    // Step 5: Show final state
    console.log('\n📊 Final State:');
    console.log('- Current User:', currentUser?.uid);
    console.log('- User Roles:', userRoles);
    console.log('- Is Admin:', isAdmin);
    console.log('- Pending Words Count:', pendingWords.length);
    console.log('- Loading:', loading);

    if (pendingWords.length > 0) {
      console.log('\n✅ SUCCESS: Pending words found in React simulation!');
      pendingWords.forEach(word => {
        console.log(`  - ${word.kurukh_word} (${word.status})`);
      });
    } else {
      console.log('\n❌ ISSUE: No pending words found in React simulation');
    }

  } catch (error) {
    console.error('❌ React flow simulation failed:', error);
  }
}

// Run the simulation
simulateReactFlow();
