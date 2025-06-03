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
import AdminRoute from './components/auth/AdminRoute';
import './App.css';

function App() {
  const WordDetails = React.lazy(() => import('./pages/WordDetails'));
  const Admin = React.lazy(() => import('./pages/Admin'));
  const UserProfile = React.lazy(() => import('./pages/UserProfile'));
  const CommunityReview = React.lazy(() => import('./pages/CommunityReview'));
  const FirebaseTest = React.lazy(() => import('./pages/FirebaseTest'));
  const AdminDebug = React.lazy(() => import('./pages/AdminDebug'));
  const LikeTestPage = React.lazy(() => import('./pages/LikeTestPage'));
  const HighlightTestPage = React.lazy(() => import('./pages/HighlightTestPage'));
  const WordReviewDemo = React.lazy(() => import('./pages/WordReviewDemo'));
  const KurukhEditor = React.lazy(() => import('./pages/KurukhEditor'));

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
            <Route path="/review" element={
              <ProtectedRoute>
                <React.Suspense fallback={<div className="flex justify-center p-10"><span className="loading loading-spinner loading-lg"></span></div>}>
                  <CommunityReview />
                </React.Suspense>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <React.Suspense fallback={<div className="flex justify-center p-10"><span className="loading loading-spinner loading-lg"></span></div>}>
                  <UserProfile />
                </React.Suspense>
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <AdminRoute>
                <React.Suspense fallback={<div className="flex justify-center p-10"><span className="loading loading-spinner loading-lg"></span></div>}>
                  <Admin />
                </React.Suspense>
              </AdminRoute>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {import.meta.env.DEV && (
              <Route path="/firebase-test" element={
                <React.Suspense fallback={<div className="flex justify-center p-10"><span className="loading loading-spinner loading-lg"></span></div>}>
                  <FirebaseTest />
                </React.Suspense>
              } />
            )}
            {import.meta.env.DEV && (
              <Route path="/admin-debug" element={
                <React.Suspense fallback={<div className="flex justify-center p-10"><span className="loading loading-spinner loading-lg"></span></div>}>
                  <AdminDebug />
                </React.Suspense>
              } />
            )}
            {import.meta.env.DEV && (
              <Route path="/like-test" element={
                <React.Suspense fallback={<div className="flex justify-center p-10"><span className="loading loading-spinner loading-lg"></span></div>}>
                  <LikeTestPage />
                </React.Suspense>
              } />
            )}
            {import.meta.env.DEV && (
              <Route path="/highlight-test" element={
                <React.Suspense fallback={<div className="flex justify-center p-10"><span className="loading loading-spinner loading-lg"></span></div>}>
                  <HighlightTestPage />
                </React.Suspense>
              } />
            )}
            {import.meta.env.DEV && (
              <Route path="/word-review-demo" element={
                <React.Suspense fallback={<div className="flex justify-center p-10"><span className="loading loading-spinner loading-lg"></span></div>}>
                  <WordReviewDemo />
                </React.Suspense>
              } />
            )}
            {(
              <Route path="/kurukh-editor" element={
                <React.Suspense fallback={<div className="flex justify-center p-10"><span className="loading loading-spinner loading-lg"></span></div>}>
                  <KurukhEditor />
                </React.Suspense>
              } />
            )}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  )
}

export default App
