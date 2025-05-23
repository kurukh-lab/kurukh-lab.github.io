import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Contribute } from './pages/Contribute';
import { About } from './pages/About';
import { MyContributions } from './pages/MyContributions';
import { WordDetails } from './pages/WordDetails';
import { EditWord } from './pages/EditWord';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Main App component
const AppContent = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/contribute" element={<Contribute />} />
      <Route path="/about" element={<About />} />
      <Route path="/word/:id" element={<WordDetails />} />
      <Route 
        path="/edit-word/:id" 
        element={
          <ProtectedRoute>
            <EditWord />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/my-contributions" 
        element={
          <ProtectedRoute>
            <MyContributions />
          </ProtectedRoute>
        } 
      />
      {/* Add a catch-all route that redirects to the home page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Wrapper with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
