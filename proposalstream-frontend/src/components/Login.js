// proposalstream-frontend/src/components/Login.js

import React, { useState } from 'react';
import { useAuth } from '../contexts/CombinedAuthContext';
import { useLocation, Navigate } from 'react-router-dom';

const Login = ({ showNotification, provider = 'proposalStream' }) => {
  const { login, user, isLoading } = useAuth();
  const location = useLocation();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await login(provider); // Initiate login with the specified provider
      showNotification('Redirecting to login...', 'info'); // Notify user
    } catch (error) {
      showNotification(error.message, 'error'); // Notify on error
    } finally {
      setIsLoggingIn(false);
    }
  };

  // If user is already logged in, redirect to intended page or home
  if (user) {
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  if (isLoading) {
    return <div>Loading...</div>; // Show loader while authentication status is being determined
  }

  return (
    <div>
      <h2>Login</h2>
      <button onClick={handleLogin} disabled={isLoggingIn}>
        Sign in with {provider === 'proposalStream' ? 'Azure AD B2C' : 'Microsoft'}
      </button>
    </div>
  );
};

export default Login;