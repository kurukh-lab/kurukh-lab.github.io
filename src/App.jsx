import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthProvider from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Contribute from './pages/Contribute';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/auth/ProtectedRoute';
import './App.css';

function App() {
  const WordDetails = React.lazy(() => import('./pages/WordDetails'));
  const Admin = React.lazy(() => import('./pages/Admin'));
  const UserProfile = React.lazy(() => import('./pages/UserProfile'));
  
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/word/:wordId" element={
              <React.Suspense fallback={<div className="flex justify-center p-10"><span className="loading loading-spinner loading-lg"></span></div>}>
                <WordDetails />
              </React.Suspense>
            } />
            <Route path="/contribute" element={<Contribute />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <React.Suspense fallback={<div className="flex justify-center p-10"><span className="loading loading-spinner loading-lg"></span></div>}>
                  <UserProfile />
                </React.Suspense>
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <React.Suspense fallback={<div className="flex justify-center p-10"><span className="loading loading-spinner loading-lg"></span></div>}>
                  <Admin />
                </React.Suspense>
              </ProtectedRoute>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  )
}

export default App
