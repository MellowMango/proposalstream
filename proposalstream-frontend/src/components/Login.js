// proposalstream-frontend/src/components/Login.js

import React, { useState } from 'react';
import { useAuth } from '../CombinedAuthContext';
import { useLocation, Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import './Login.css'; // Import the CSS file

const Login = ({ showNotification, provider }) => {
  const { user, isLoading, login, error } = useAuth();
  const location = useLocation();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = () => {
    setIsLoggingIn(true);
    console.log(`Initiating login with provider: ${provider}`);
    login(provider);
    // Since loginRedirect initiates a redirect, there's no need for .then() or .catch()
    // Handle loading state accordingly
    setIsLoggingIn(false);
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
          {isLoggingIn ? 'Signing in...' : `Sign in with ${provider}`}
        </button>
      </div>
      <p className="register-prompt">
        Don't have an account? Contact your administrator.
      </p>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

Login.propTypes = {
  showNotification: PropTypes.func.isRequired,
  provider: PropTypes.string,
};

Login.defaultProps = {
  provider: 'proposalStream',
};

export default Login;