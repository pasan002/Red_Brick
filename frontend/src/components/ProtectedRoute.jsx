import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    // Redirect to sign-in page if user is not logged in
    return <Navigate to="/signin" replace />;
  }

  // Render the protected component if authenticated
  return <Outlet />;
};

export default ProtectedRoute; 