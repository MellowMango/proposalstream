// proposalstream-frontend/src/components/Login.js

import React, { useState } from 'react';
import { useAuth } from '../contexts/CombinedAuthContext'; // Unified Auth Context

const Login = ({ showNotification, provider = 'proposalStream' }) => {
  const { login } = useAuth(); // Destructure login function from AuthContext

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