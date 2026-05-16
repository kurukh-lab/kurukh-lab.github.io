import { useState } from 'react';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

interface ConnectionResults {
  created?: boolean;
  exists?: boolean;
  data?: unknown;
  error?: string;
}

const FirebaseTest = () => {
  const [testResults, setTestResults] = useState<ConnectionResults | null>(null);
  const [userTestResults, setUserTestResults] = useState<ConnectionResults | null>(null);
  const [loading, setLoading] = useState(false);

  const runConnectionTest = async () => {
    setLoading(true);
    try {
      const testDocRef = doc(db, 'test', 'debug-test');
      const testData = {
        message: 'Debug test',
        timestamp: new Date(),
        testId: Date.now(),
      };
      await setDoc(testDocRef, testData);
      const testDoc = await getDoc(testDocRef);
      setTestResults({ created: true, exists: testDoc.exists(), data: testDoc.data() });
    } catch (error) {
      setTestResults({ error: (error as Error).message });
    }
    setLoading(false);
  };

  const testUserDocument = async (uid: string) => {
    setLoading(true);
    try {
      const userDocRef = doc(db, 'users', uid);
      await setDoc(userDocRef, {
        uid,
        username: 'testuser',
        email: 'test@example.com',
        createdAt: new Date(),
        roles: ['user'],
      });
      const userDoc = await getDoc(userDocRef);
      setUserTestResults({ created: true, exists: userDoc.exists(), data: userDoc.data() });
    } catch (error) {
      setUserTestResults({ error: (error as Error).message });
    }
    setLoading(false);
  };

  const listAllUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      console.log('👥 Found', snapshot.size, 'users');
      snapshot.forEach((d) => {
        console.log('👤', d.id, d.data());
      });
    } catch (error) {
      console.error('❌ List users failed:', error);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Firebase Debug Test</h1>

      <div className="space-y-4">
        <button onClick={runConnectionTest} disabled={loading} className="btn btn-primary">
          Test Firebase Connection
        </button>
        <button onClick={() => testUserDocument('test-user-123')} disabled={loading} className="btn btn-secondary">
          Test User Document
        </button>
        <button onClick={listAllUsers} disabled={loading} className="btn btn-accent">
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
    </div>
  );
};

export default FirebaseTest;
