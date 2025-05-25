/**
 * Test script to simulate the full admin flow including authentication and role checking
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

async function simulateAdminFlow() {
  try {
    console.log('🔐 Step 1: Login as admin...');
    const userCredential = await signInWithEmailAndPassword(auth, 'admin@kurukhdictionary.com', 'Admin123!');
    const user = userCredential.user;
    console.log('✅ Admin login successful, UID:', user.uid);

    console.log('🔍 Step 2: Get user roles from Firestore...');
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('📄 User data:', userData);
      
      const userRoles = userData.roles || [];
      const isAdmin = userRoles.includes('admin');
      
      console.log('👤 User roles:', userRoles);
      console.log('🔑 Is admin:', isAdmin);
      
      if (isAdmin) {
        console.log('🔍 Step 3: Admin confirmed, querying pending words...');
        
        const q = query(
          collection(db, 'words'),
          where('status', '==', 'pending_review'),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        console.log('📄 Pending words query result size:', querySnapshot.size);
        
        const words = [];
        querySnapshot.forEach((doc) => {
          const wordData = {
            id: doc.id,
            ...doc.data()
          };
          console.log('📝 Found pending word:', wordData.kurukh_word, 'Status:', wordData.status);
          words.push(wordData);
        });
        
        console.log('✅ Total pending words found:', words.length);
        
        if (words.length === 0) {
          console.log('❌ No pending words found - this is the issue!');
        } else {
          console.log('✅ Pending words found successfully');
        }
      } else {
        console.log('❌ User is not admin');
      }
    } else {
      console.log('❌ User document not found');
    }

  } catch (error) {
    console.error('❌ Flow failed:', error);
    console.error('Error details:', error.code, error.message);
  }
}

simulateAdminFlow();
