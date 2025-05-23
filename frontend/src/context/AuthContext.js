import React, { createContext, useContext, useState, useEffect } from 'react';

// Create authentication context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user data on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth', {
          headers: {
            'x-auth-token': token,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to authenticate token');
        }

        const userData = await response.json();
        setUser(userData);
        setError(null);
      } catch (err) {
        console.error('Failed to load user:', err);
        setError(err.message);
        // Clear invalid token
        localStorage.removeItem('token');
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Register new user
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        const errorMessage = data.errors ? data.errors[0].msg : 'Registration failed';
        throw new Error(errorMessage);
      }
      
      // Save token to local storage
      localStorage.setItem('token', data.token);
      setToken(data.token);
      
      // Load user data after successful registration
      await loadUserData(data.token);
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        const errorMessage = data.errors ? data.errors[0].msg : 'Login failed';
        throw new Error(errorMessage);
      }
      
      // Save token to local storage
      localStorage.setItem('token', data.token);
      setToken(data.token);
      
      // Load user data after successful login
      await loadUserData(data.token);
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Load user data helper function
  const loadUserData = async (authToken) => {
    try {
      const response = await fetch('/api/auth', {
        headers: {
          'x-auth-token': authToken,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load user data');
      }

      const userData = await response.json();
      setUser(userData);
      return userData;
    } catch (err) {
      console.error('Failed to load user data:', err);
      throw err;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        register,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
