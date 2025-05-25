import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminRoute = ({ children }) => {
  const { currentUser, isAdmin } = useAuth();

  if (!currentUser) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    // Redirect to home page if not admin
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
