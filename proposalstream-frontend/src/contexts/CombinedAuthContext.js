// src/contexts/CombinedAuthContext.js

import React, { createContext, useEffect, useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UNAUTHORIZED_EVENT } from '../utils/api';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { useMsal } from '@azure/msal-react';
import { 
  loginRequestProposalStream, 
  loginRequestMicrosoftProvider 
} from '../msalConfig';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children, onError }) => {
  const navigate = useNavigate();
  const { instance } = useMsal();
  const [user, setUser] = useState(null);
  const [authProvider, setAuthProvider] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to logout
  const logout = useCallback(() => {
    if (authProvider === 'proposalStream' || authProvider === 'microsoftProvider') {
      instance
        .logoutRedirect({
          postLogoutRedirectUri: window.location.origin,
        })
        .catch((e) => {
          console.error('Logout error:', e);
          onError('Logout failed.');
        });
    } else if (authProvider === 'emailPassword') {
      // Clear tokens and user state for email/password
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken'); // If using refresh tokens
      setUser(null);
      setAuthProvider(null);
      navigate('/login');
    } else {
      onError('No active provider to logout from.');
    }
  }, [authProvider, instance, onError, navigate]);

  // Handle authentication initialization
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await instance.handleRedirectPromise();
        if (response) {
          // Successful login via redirect
          const provider = determineProvider(response);
          setAuthProvider(provider);

          const decoded = jwtDecode(response.accessToken);
          setUser({
            id: decoded.sub,
            name: decoded.name,
            email: decoded.email || decoded.unique_name,
            roles: decoded.roles || [],
            provider,
            accessToken: response.accessToken,
          });

          // Determine if onboarding is needed
          if (await needsOnboarding(decoded.sub)) {
            navigate('/onboarding');
          } else {
            navigate('/dashboard'); // Updated from '/dashboard' to '/dashboard'
          }
        } else {
          // Check if user is already logged in
          const account = instance.getActiveAccount();
          if (account) {
            // Acquire token silently
            const tokenResponse = await instance.acquireTokenSilent({
              ...loginRequestMicrosoftProvider,
              account: account,
            });
            const decoded = jwtDecode(tokenResponse.accessToken);
            setUser({
              id: decoded.sub,
              name: decoded.name,
              email: decoded.email || decoded.unique_name,
              roles: decoded.roles || [],
              provider: determineProvider(tokenResponse),
              accessToken: tokenResponse.accessToken,
            });

            // Determine if onboarding is needed
            if (await needsOnboarding(decoded.sub)) {
              navigate('/onboarding');
            } else {
              navigate('/dashboard'); // Updated from '/dashboard' to '/dashboard'
            }
          } else {
            // No active account, navigate to login
            setAuthProvider(null);
            navigate('/login');
          }
        }
      } catch (error) {
        console.error('Authentication initialization error:', error);
        onError('Authentication failed.');
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [instance, navigate, onError]);

  // Function to check if onboarding is needed
  const needsOnboarding = async (userId) => {
    // Implement logic to check if the user has completed onboarding
    // This could be an API call to your backend
    try {
      const response = await axios.get(`/api/users/${userId}`);
      return !response.data.hasOnboarded;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return true; // Default to needing onboarding on error
    }
  };

  // Handle unauthorized access globally
  useEffect(() => {
    const handleUnauthorized = () => {
      onError('Session expired. Please log in again.');
      logout();
      navigate('/login');
    };

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);

    return () => {
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, [onError, logout, navigate]);

  // Provide the context value
  return (
    <AuthContext.Provider value={{ user, authProvider, logout, isLoading }}>
      {isLoading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
};

// Helper function to determine the provider
const determineProvider = (response) => {
  if (response.scopes && response.scopes.includes('User.Read')) {
    return 'microsoftProvider';
  } else if (response.scopes && response.scopes.includes('your_proposalstream_scope')) {
    return 'proposalStream';
  } else {
    return 'unknown';
  }
};