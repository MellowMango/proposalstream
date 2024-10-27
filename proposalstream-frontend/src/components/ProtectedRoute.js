// src/components/ProtectedRoute.js

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../CombinedAuthContext';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ children, allowedRoles, provider }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  const isAuthenticated = user !== null;
  // const hasRequiredProvider = !provider || authProvider === provider;
  const shouldRedirectToOnboard = !user?.hasOnboarded
  const hasRequiredRole =
    allowedRoles.length === 0
      ? true
      : user?.role && allowedRoles.includes(user.role);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute - User is not authenticated. Redirecting to /login.');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // if (!hasRequiredProvider) {
  //   console.log(`ProtectedRoute - Provider mismatch. Expected: ${provider}, Found: ${authProvider}. Redirecting accordingly.`);
  //   switch (provider) {
  //     case 'proposalStream':
  //       return <Navigate to="/login" replace />;
  //     case 'microsoftProvider':
  //       return <Navigate to="/microsoft-login" replace />;
  //     default:
  //       console.warn(`Unknown provider: ${provider}. Redirecting to /login`);
  //       return <Navigate to="/login" replace />;
  //   }
  // }

  if (shouldRedirectToOnboard) {
    console.log('ProtectedRoute - User needs onboarding. Redirecting to /onboarding.');
    return <Navigate to="/onboarding" replace />;
  }

  if (!hasRequiredRole) {
    console.log(`ProtectedRoute - User lacks required roles: ${allowedRoles.join(', ')}. Redirecting to /unauthorized.`);
    return <Navigate to="/unauthorized" replace />;
  }

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
