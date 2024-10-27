// proposalstream-frontend/src/components/Login.js

import React, { useEffect } from 'react';
import { useAuth } from '../CombinedAuthContext';
import { useLocation, Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import './Login.css'; // Import the CSS file
import { login } from '../utils/api';

const Login = ({ showNotification }) => {
  const { user, isLoading, error, initiateAzureLogin } = useAuth();
  const location = useLocation();

  const [loginForm, setLoginForm] = React.useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    console.log('Login component state:', { user, isLoading, error });
  }, [user, isLoading, error]);

  const handleLogin = async () => {
    console.log('Logging in with:', loginForm);

    if (!loginForm.email || !loginForm.password) {
      showNotification('Please provide an email and password', 'error');
      return;
    }

    const data = await login(loginForm.email, loginForm.password)

    if (!data) {
      showNotification('Invalid email or password', 'error');
      return;
    }
  };

  // If user is already logged in, redirect to intended page or home
  if (user) {
    const from = location.state?.from?.pathname || '/';
    console.log('User is logged in, redirecting to:', from);
    return <Navigate to={from} replace />;
  }

  if (isLoading) {
    console.log('Login component is in loading state');
    return <div className="login-form">
      <p>Loading... (isLoading: {isLoading.toString()})</p>
      <p>If this persists, please try refreshing the page.</p>
    </div>;
  }

  console.log('Rendering login form');
  return (
    <div className="login-form">
      <h2>Login</h2>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input value={loginForm.email} onChange={e => setLoginForm(_ => ({ ..._, email: e.target.value }))} type="email" id="email" name="email" />
      </div>
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input value={loginForm.password} onChange={e => setLoginForm(_ => ({ ..._, password: e.target.value }))} type="password" id="password" name="password" />
      </div>
      <div className="form-group">
      <button 
          className="login-button" 
          onClick={handleLogin}
        >
          Sign in
        </button>
      </div>

      <hr />
      
      <p className="register-prompt">
        Don't have an account? Contact your administrator.
      </p>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

Login.propTypes = {
  showNotification: PropTypes.func.isRequired,
};

export default Login;
