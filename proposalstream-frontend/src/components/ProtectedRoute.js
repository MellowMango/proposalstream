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
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // If no user is authenticated, redirect to login
  if (!user?.id) {
    console.log('ProtectedRoute - No authenticated user found. Redirecting to /login');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If provider is specified and doesn't match, redirect accordingly
  if (provider && authProvider !== provider) {
    console.log(`ProtectedRoute - Provider mismatch. Expected: ${provider}, Found: ${authProvider}`);
    switch (provider) {
      case 'proposalStream':
        return <Navigate to="/login" replace />;
      case 'microsoftProvider':
        return <Navigate to="/microsoft-login" replace />;
      default:
        console.warn(`ProtectedRoute - Unknown provider: ${provider}. Redirecting to /login`);
        return <Navigate to="/login" replace />;
    }
  }

  // Check if user needs onboarding
  if (user.needsOnboarding) {
    console.log('ProtectedRoute - User needs onboarding. Redirecting to /onboarding');
    return <Navigate to="/onboarding" replace />;
  }

  // If roles are specified, check if user has at least one required role
  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const userRoles = Array.isArray(user.roles) ? user.roles : [];
    const hasRequiredRole = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasRequiredRole) {
      console.warn(`ProtectedRoute - User lacks required roles: ${allowedRoles.join(', ')}`);
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // If all checks pass, render the children components
  console.log('ProtectedRoute - Access granted. Rendering children.');
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
  provider: PropTypes.string,
};

ProtectedRoute.defaultProps = {
  allowedRoles: [],
  provider: null,
};

export default ProtectedRoute;