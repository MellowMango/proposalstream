// src/components/ProtectedRoute.js

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/CombinedAuthContext'; // Updated import

const ProtectedRoute = ({ children, allowedRoles, provider }) => {
  const { user, authProvider } = useAuth();

  // Verify if the current provider matches the required provider
  if (provider && authProvider !== provider) {
    // Redirect to the appropriate login based on the provider prop
    if (provider === 'proposalStream') {
      return <Navigate to="/login" replace />;
    } else if (provider === 'microsoftProvider') {
      return <Navigate to="/microsoft-login" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  if (!user) {
    // User is not authenticated
    if (provider === 'proposalStream') {
      return <Navigate to="/login" replace />;
    } else if (provider === 'microsoftProvider') {
      return <Navigate to="/microsoft-login" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasRequiredRole = allowedRoles.some((role) => user.roles.includes(role));

    if (!hasRequiredRole) {
      // User does not have the required role
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;