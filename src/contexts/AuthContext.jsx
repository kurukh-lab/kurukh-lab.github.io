import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { testFirebaseConnection, getUserDocument } from '../utils/firebaseTest';

// Create the context
export const AuthContext = createContext(null);

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Register a new user using secure Firebase Function
  const register = async (email, password, username) => {
    try {
      // Get Firebase Functions instance
      const functions = getFunctions();
      const createUser = httpsCallable(functions, 'createUser');

      // Call the secure server-side function
      const result = await createUser({
        email,
        password,
        username
      });

      return { success: true, data: result.data };
    } catch (error) {
      console.error('Registration error:', error);

      // Handle Firebase Functions errors
      let errorMessage = 'Registration failed. Please try again.';

      if (error.code === 'functions/invalid-argument') {
        errorMessage = error.message || 'Invalid input provided';
      } else if (error.code === 'functions/already-exists') {
        errorMessage = 'An account with this email already exists';
      } else if (error.code === 'functions/internal') {
        errorMessage = 'Server error. Please try again later';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return { success: false, error: errorMessage };
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Google Sign In with secure user creation
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Use Firebase Function to securely create user document if needed
      const functions = getFunctions();
      const createGoogleUser = httpsCallable(functions, 'createGoogleUser');

      const result = await createGoogleUser({
        username: user.displayName || user.email.split('@')[0]
      });

      return {
        success: true,
        user,
        isNewUser: result.data?.isNewUser || false,
        message: result.data?.message || 'Login successful'
      };
    } catch (error) {
      console.error('Google sign-in error:', error);
      return { success: false, error: error.message };
    }
  };

  // Get user data from Firestore with enhanced error handling
  const getUserData = async (uid) => {
    try {
      console.log("🔍 getUserData called for UID:", uid);

      if (!uid) {
        console.error("❌ getUserData called with null/undefined UID");
        return null;
      }

      // Use the enhanced debugging function
      const userData = await getUserDocument(uid);

      if (!userData) {
        console.warn("⚠️ No user data found for UID:", uid);

        // Return a minimal user data object to prevent null reference errors
        return {
          uid: uid,
          roles: ['user']  // Default role
        };
      }

      return userData;
    } catch (error) {
      console.error("❌ Error in getUserData:", error);
      // Return minimal data to prevent null reference errors
      return {
        uid: uid,
        roles: ['user']
      };
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    // Test Firebase connection when app starts
    if (import.meta.env.DEV) {
      testFirebaseConnection().then(result => {
        console.log('🧪 Firebase connection test result:', result);
      });
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in - get additional data from Firestore
        console.log("👤 Auth state changed - user signed in:", user.uid);
        try {
          const userData = await getUserData(user.uid);
          console.log("📋 User data loaded:", userData);
          // Ensure we always have the UID in currentUser even if Firestore data fails
          setCurrentUser({
            ...user,
            ...(userData || {}),
            uid: user.uid // Ensure UID is always available
          });
        } catch (error) {
          console.error("❌ Error loading user data:", error);
          // Set user with auth data only if Firestore fails
          setCurrentUser(user);
        }
      } else {
        // User is signed out
        console.log("👤 Auth state changed - user signed out");
        setCurrentUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  // Get user roles from Firestore
  const [userRoles, setUserRoles] = useState(null); // Start with null to indicate not loaded
  const [rolesLoading, setRolesLoading] = useState(false);

  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!currentUser) {
        setUserRoles([]);
        setRolesLoading(false);
        return;
      }

      setRolesLoading(true);

      try {
        console.log("🔍 Fetching user roles for UID:", currentUser.uid);
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        console.log("📄 User roles document exists:", userDoc.exists());

        if (userDoc.exists()) {
          const data = userDoc.data();
          console.log("📄 User roles document data:", data);
          setUserRoles(data.roles || []);
        } else {
          console.log("📄 No user roles document found");
          setUserRoles([]);
        }
      } catch (error) {
        console.error("❌ Error fetching user roles:", error);
        setUserRoles([]);
      } finally {
        setRolesLoading(false);
      }
    };

    fetchUserRoles();
  }, [currentUser]);

  const value = {
    currentUser,
    userRoles,
    rolesLoading,
    isAdmin: userRoles?.includes('admin') || false,
    register,
    login,
    logout,
    loginWithGoogle,
    getUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
