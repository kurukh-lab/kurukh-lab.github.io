import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';

const FirebaseTest = () => {
  const [testResults, setTestResults] = useState(null);
  const [userTestResults, setUserTestResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const runConnectionTest = async () => {
    setLoading(true);
    try {
      console.log('🧪 Running Firebase connection test...');
      
      // Test creating and reading a document
      const testDocRef = doc(db, 'test', 'debug-test');
      const testData = {
        message: 'Debug test',
        timestamp: new Date(),
        testId: Date.now()
      };
      
      await setDoc(testDocRef, testData);
      console.log('✅ Test document created');
      
      const testDoc = await getDoc(testDocRef);
      console.log('📄 Test document exists:', testDoc.exists());
      
      setTestResults({
        created: true,
        exists: testDoc.exists(),
        data: testDoc.data()
      });
      
    } catch (error) {
      console.error('❌ Test failed:', error);
      setTestResults({
        error: error.message
      });
    }
    setLoading(false);
  };

  const testUserDocument = async (uid) => {
    setLoading(true);
    try {
      console.log('🔍 Testing user document:', uid);
      
      // First, create a user document
      const userDocRef = doc(db, 'users', uid);
      const userData = {
        uid: uid,
        username: 'testuser',
        email: 'test@example.com',
        createdAt: new Date(),
        roles: ['user']
      };
      
      await setDoc(userDocRef, userData);
      console.log('✅ User document created');
      
      // Now try to read it
      const userDoc = await getDoc(userDocRef);
      console.log('📄 User document exists:', userDoc.exists());
      console.log('📄 User document data:', userDoc.data());
      
      setUserTestResults({
        created: true,
        exists: userDoc.exists(),
        data: userDoc.data()
      });
      
    } catch (error) {
      console.error('❌ User test failed:', error);
      setUserTestResults({
        error: error.message
      });
    }
    setLoading(false);
  };

  const listAllUsers = async () => {
    try {
      console.log('👥 Listing all users...');
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      console.log('👥 Found', snapshot.size, 'users');
      snapshot.forEach((doc) => {
        console.log('👤', doc.id, doc.data());
      });
      
    } catch (error) {
      console.error('❌ List users failed:', error);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Firebase Debug Test</h1>
      
      <div className="space-y-4">
        <button 
          onClick={runConnectionTest}
          disabled={loading}
          className="btn btn-primary"
        >
          Test Firebase Connection
        </button>
        
        <button 
          onClick={() => testUserDocument('test-user-123')}
          disabled={loading}
          className="btn btn-secondary"
        >
          Test User Document
        </button>
        
        <button 
          onClick={listAllUsers}
          disabled={loading}
          className="btn btn-accent"
        >
          List All Users
        </button>
      </div>
      
      {testResults && (
        <div className="mt-6 p-4 bg-base-200 rounded">
          <h3 className="font-bold">Connection Test Results:</h3>
          <pre>{JSON.stringify(testResults, null, 2)}</pre>
        </div>
      )}
      
      {userTestResults && (
        <div className="mt-6 p-4 bg-base-200 rounded">
          <h3 className="font-bold">User Test Results:</h3>
          <pre>{JSON.stringify(userTestResults, null, 2)}</pre>
        </div>
      )}
      
      <div className="mt-6 p-4 bg-info text-info-content rounded">
        <h3 className="font-bold">Instructions:</h3>
        <p>1. Open browser console to see detailed logs</p>
        <p>2. Run connection test first</p>
        <p>3. Then test user document creation/reading</p>
        <p>4. Check emulator UI at http://127.0.0.1:4001/firestore</p>
      </div>
    </div>
  );
};

export default FirebaseTest;
