// proposalstream-frontend/src/components/Login.js

import React, { useState } from 'react';
import { useAuth } from '../CombinedAuthContext';
import { useLocation, Navigate } from 'react-router-dom';
import './Login.css'; // Import the CSS file

const Login = ({ showNotification }) => {
  const { user, isLoading, login } = useAuth();
  const location = useLocation();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = () => {
    setIsLoggingIn(true);
    login();
  };

  // If user is already logged in, redirect to intended page or home
  if (user) {
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  if (isLoading) {
    return <div className="login-form">Loading...</div>;
  }

  return (
    <div className="login-form">
      <h2>Login</h2>
      <div className="form-group">
        <button 
          className="login-button" 
          onClick={handleLogin} 
          disabled={isLoggingIn}
        >
          {isLoggingIn ? 'Signing in...' : 'Sign in with Azure AD B2C'}
        </button>
      </div>
      <p className="register-prompt">
        Don't have an account? Contact your administrator.
      </p>
    </div>
  );
};

export default Login;
