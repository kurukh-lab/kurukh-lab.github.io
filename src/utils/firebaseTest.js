// Test Firebase connection and document operations
import { db, auth } from '../config/firebase';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  console.log('🧪 Testing Firebase connection...');
  console.log('🔧 Database instance:', db);
  console.log('🔧 Auth instance:', auth);
  
  try {
    // First, let's check if we're connected to emulator
    console.log('🏠 Database host:', db._delegate._settings?.host || 'production');
    console.log('🔐 Auth emulator:', auth.config?.emulator || 'production');
    
    // Test 1: Create a test document
    const testDocRef = doc(db, 'test', 'connection-test');
    const testData = {
      message: 'Hello from test',
      timestamp: new Date(),
      testId: 'connection-test-' + Date.now()
    };
    
    console.log('📝 Creating test document...');
    await setDoc(testDocRef, testData);
    console.log('✅ Test document created successfully');
    
    // Test 2: Read the test document back
    console.log('📖 Reading test document...');
    const testDoc = await getDoc(testDocRef);
    console.log('📄 Test document exists:', testDoc.exists());
    console.log('📄 Test document data:', testDoc.data());
    
    // Test 3: List all documents in users collection
    console.log('👥 Checking users collection...');
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    console.log('👥 Users collection size:', usersSnapshot.size);
    
    if (usersSnapshot.size > 0) {
      usersSnapshot.forEach((doc) => {
        console.log('👤 User document:', doc.id, doc.data());
      });
    } else {
      console.log('👤 No user documents found');
    }
    
    return {
      success: true,
      testDocExists: testDoc.exists(),
      testDocData: testDoc.data(),
      usersCount: usersSnapshot.size,
      emulatorHost: db._delegate._settings?.host || 'production'
    };
    
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
};

export const getUserDocument = async (uid) => {
  console.log('🔍 Getting user document for UID:', uid);
  
  try {
    const userDocRef = doc(db, 'users', uid);
    console.log('📋 Document reference path:', userDocRef.path);
    
    const userDoc = await getDoc(userDocRef);
    console.log('📄 Document exists:', userDoc.exists());
    console.log('📄 Document metadata:', {
      fromCache: userDoc.metadata.fromCache,
      hasPendingWrites: userDoc.metadata.hasPendingWrites
    });
    
    if (userDoc.exists()) {
      console.log('📄 Document data:', userDoc.data());
      return userDoc.data();
    } else {
      console.log('📄 Document does not exist');
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting user document:', error);
    return null;
  }
};
