import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  type User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../config/firebase';
import type { UserRole } from '../types';

// The merged user object: a Firebase Auth `User` plus the Firestore
// `users/{uid}` document fields that the rest of the app cares about.
export interface AuthedUser extends User {
  roles?: UserRole[];
  username?: string;
}

export interface AuthSuccess<T = unknown> {
  success: true;
  data?: T;
  user?: AuthedUser | User;
  isNewUser?: boolean;
  message?: string;
}

export interface AuthFailure {
  success: false;
  error: string;
}

export type AuthResult<T = unknown> = AuthSuccess<T> | AuthFailure;

export interface AuthContextValue {
  currentUser: AuthedUser | null;
  userRoles: UserRole[];
  loading: boolean;
  isAdmin: boolean;
  register: (
    email: string,
    password: string,
    username: string,
  ) => Promise<AuthResult>;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<AuthResult>;
  loginWithGoogle: () => Promise<AuthResult>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<AuthedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const register = async (
    email: string,
    password: string,
    username: string,
  ): Promise<AuthResult> => {
    try {
      setLoading(true);
      const functions = getFunctions();
      const createUser = httpsCallable<
        { email: string; password: string; username: string },
        unknown
      >(functions, 'createUser');

      const result = await createUser({ email, password, username });
      return { success: true, data: result.data };
    } catch (error) {
      const err = error as { code?: string; message?: string };
      console.error('Registration error:', err);
      let errorMessage = 'Registration failed. Please try again.';
      if (err.code === 'functions/invalid-argument') {
        errorMessage = err.message || 'Invalid input provided';
      } else if (err.code === 'functions/already-exists') {
        errorMessage = 'An account with this email already exists';
      } else if (err.code === 'functions/internal') {
        errorMessage = 'Server error. Please try again later';
      } else if (err.message) {
        errorMessage = err.message;
      }
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
      navigate('/login');
    }
  };

  const login = async (
    email: string,
    password: string,
  ): Promise<AuthResult> => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const logout = async (): Promise<AuthResult> => {
    try {
      setLoading(true);
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<AuthResult> => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      const functions = getFunctions();
      const createGoogleUser = httpsCallable<
        { username: string },
        { isNewUser?: boolean; message?: string }
      >(functions, 'createGoogleUser');

      const result = await createGoogleUser({
        username: user.displayName || user.email?.split('@')[0] || 'user',
      });

      return {
        success: true,
        user,
        isNewUser: result.data?.isNewUser || false,
        message: result.data?.message || 'Login successful',
      };
    } catch (error) {
      console.error('Google sign-in error:', error);
      return { success: false, error: (error as Error).message };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoading(true);
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const data = userDoc.data() as Partial<AuthedUser>;
            setCurrentUser({
              ...user,
              ...data,
              uid: user.uid,
            } as AuthedUser);
          } else {
            setCurrentUser(user as AuthedUser);
          }
        } catch (error) {
          console.error('❌ Error loading user data or roles:', error);
          setCurrentUser(user as AuthedUser);
        } finally {
          setLoading(false);
        }
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const userRoles = currentUser?.roles ?? [];
  const isAdmin = userRoles.includes('admin');

  const value: AuthContextValue = {
    currentUser,
    userRoles,
    loading,
    isAdmin,
    register,
    login,
    logout,
    loginWithGoogle,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
