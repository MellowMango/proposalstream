// proposalstream-frontend/src/components/Login.js

import React from 'react';
import { useAuth } from '../CombinedAuthContext';
import { Navigate, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import './Login.css'; // Import the CSS file
import * as api from '../utils/api';

const Login = ({ showNotification }) => {
  const { user, isLoading, error } = useAuth();

  const [loginForm, setLoginForm] = React.useState({
    email: '',
    password: '',
  });

  const handleLogin = async () => {
    console.log('Logging in with:', loginForm);

    if (!loginForm.email || !loginForm.password) {
      showNotification('Please provide an email and password', 'error');
      return;
    }

    const data = await api.login(loginForm.email, loginForm.password)

    if (!data) {
      showNotification('Invalid email or password', 'error');
      return;
    }
  };

  if (user) {
    return <Navigate to={"/dashboard"} />;
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
          Login
        </button>
      </div>

      <hr />
      
      <div className="auth-links">
        <p className="register-prompt">
          Don't have an account? 
          <Link to="/register" className="register-link">Sign up here</Link>
        </p>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
};

Login.propTypes = {
  showNotification: PropTypes.func.isRequired,
};

export default Login;
