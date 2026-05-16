/**
 * Developer-mode connectivity test for the Firebase emulators. Imported by
 * the FirebaseTest dev page; not part of the production user flow.
 */

import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';

export interface FirebaseConnectionResult {
  success: boolean;
  testDocExists?: boolean;
  testDocData?: unknown;
  usersCount?: number;
  emulatorHost?: string;
  error?: string;
  stack?: string;
}

export const testFirebaseConnection = async (): Promise<FirebaseConnectionResult> => {
  try {
    const testDocRef = doc(db, 'test', 'connection-test');
    const testData = {
      message: 'Hello from test',
      timestamp: new Date(),
      testId: 'connection-test-' + Date.now(),
    };
    await setDoc(testDocRef, testData);

    const testDoc = await getDoc(testDocRef);
    const usersSnapshot = await getDocs(collection(db, 'users'));

    return {
      success: true,
      testDocExists: testDoc.exists(),
      testDocData: testDoc.data(),
      usersCount: usersSnapshot.size,
    };
  } catch (error) {
    const err = error as Error;
    return { success: false, error: err.message, stack: err.stack };
  }
};

export const getUserDocument = async (uid: string): Promise<unknown> => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    console.error('❌ Error getting user document:', error);
    return null;
  }
};

// Force the auth import to be retained even if tree-shaken;
// references kept for parity with the older runtime checks.
void auth;
