// src/MainContent.js

import React from 'react';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { loginRequest } from './msalConfig';

function MainContent() {
  const isAuthenticated = useIsAuthenticated();
  const { instance } = useMsal();

  if (!isAuthenticated) {
    const handleLogin = () => {
      instance.loginRedirect(loginRequest).catch((error) => {
        console.error("Login error:", error);
      });
    };

    return (
      <div>
        <h2>Please sign in</h2>
        <button onClick={handleLogin}>Login</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Welcome, you are logged in!</h2>
      {/* Rest of your authenticated content */}
    </div>
  );
}

export default MainContent;