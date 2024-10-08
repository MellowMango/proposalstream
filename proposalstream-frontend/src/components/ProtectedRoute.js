// src/components/ProtectedRoute.js

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../CombinedAuthContext';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ children, allowedRoles, provider }) => {
  const { user, authProvider, isLoading } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute - isLoading:', isLoading);
  console.log('ProtectedRoute - user:', user);
  console.log('ProtectedRoute - authProvider:', authProvider);

  // While loading, render a loader
  if (isLoading || user === null) {
    return <div>Loading...</div>;
  }

  // If no user is authenticated, redirect to login
  if (!user || !user.id) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If provider is specified and doesn't match, redirect accordingly
  if (provider && authProvider !== provider) {
    if (provider === 'proposalStream') {
      return <Navigate to="/login" replace />;
    } else if (provider === 'microsoftProvider') {
      return <Navigate to="/microsoft-login" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  // Check if user needs onboarding
  if (user.needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  // If roles are specified, check if user has at least one required role
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRequiredRole = allowedRoles.some((role) => user.roles.includes(role));

    if (!hasRequiredRole) {
      // Optionally, redirect to an unauthorized page or home
      return <Navigate to="/" replace />;
    }
  }

  // If all checks pass, render the children components
  return children;
};

// At the end of the component
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
  provider: PropTypes.string,
};

export default ProtectedRoute;