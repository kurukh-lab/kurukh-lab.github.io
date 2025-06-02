import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  // Register a new user using secure Firebase Function
  const register = async (email, password, username) => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
      navigate('/login'); // Redirect to login page after registration
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Logout user
  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Google Sign In with secure user creation
  const loginWithGoogle = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in - get additional data from Firestore
        console.log("👤 Auth state changed - user signed in:", user.uid);
        setLoading(true);
        try {
          // Fetch user roles from Firestore
          console.log("🔍 Fetching user roles for UID:", user.uid);
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          console.log("📄 User roles document exists:", userDoc.exists());

          let roles = [];
          if (userDoc.exists()) {
            const data = userDoc.data();
            console.log("📄 User roles document data:", data);

            setCurrentUser({
              ...user,
              ...(data || {}),
              uid: user.uid // Ensure UID is always available
            });

          }
        } catch (error) {
          console.error("❌ Error loading user data or roles:", error);
          // Set user with auth data only if Firestore fails
          setCurrentUser(user);
        } finally {
          setLoading(false);
          navigate('/'); // Redirect to home page after auth state change
        }
      } else {
        // User is signed out
        console.log("👤 Auth state changed - user signed out");
        setCurrentUser(null);
        logout();
      }

      return unsubscribe;
    });
  }, []);


  const value = {
    currentUser,
    userRoles: currentUser?.roles || [],
    loading,
    isAdmin: currentUser?.roles?.includes('admin') || false,
    register,
    login,
    logout,
    loginWithGoogle
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
