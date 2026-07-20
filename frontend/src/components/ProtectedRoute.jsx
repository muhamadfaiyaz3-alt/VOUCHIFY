import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    console.log("ProtectedRoute: Not logged in, redirecting to /login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
