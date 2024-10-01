// proposalstream-frontend/src/contexts/CombinedAuthContext.js

import React, { createContext, useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UNAUTHORIZED_EVENT } from '../utils/api';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { msalInstance } from '../msalInstances';
import { loginRequestProposalStream, loginRequestMicrosoftProvider } from '../msalConfig';

// Create a unified AuthContext
export const AuthContext = createContext();

// Define supported authentication providers, including 'emailPassword'
const AVAILABLE_PROVIDERS = ['proposalStream', 'microsoftProvider', 'emailPassword'];

// Define the determineProvider function
const determineProvider = (response) => {
  // Implement your logic to determine the provider
  // This example assumes that different scopes or claims identify the provider

  if (response.scopes && response.scopes.includes('User.Read')) {
    return 'microsoftProvider';
  } else if (response.scopes && response.scopes.includes('your_proposalstream_scope')) {
    return 'proposalStream';
  } else {
    return 'unknown';
  }

};

export const AuthProvider = ({ children, onError }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [authProvider, setAuthProvider] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Handle redirect responses
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const response = await msalInstance.handleRedirectPromise();
        if (response) {
          // Determine provider based on response
          const provider = determineProvider(response); // Now defined

          const decoded = jwtDecode(response.accessToken);
          setUser({
            id: decoded.sub,
            name: decoded.name,
            email: decoded.email || decoded.unique_name,
            roles: decoded.roles || [],
            provider,
            accessToken: response.accessToken,
          });
          setAuthProvider(provider);
        }
      } catch (error) {
        console.error('Redirect handling error:', error);
        onError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    handleRedirect();
  }, [onError]);

  // Effect to handle token acquisition
  useEffect(() => {
    const fetchToken = async () => {
      if (msalInstance.getAllAccounts().length > 0) {
        const account = msalInstance.getAllAccounts()[0];
        const accessTokenRequest =
          authProvider === 'proposalStream'
            ? { ...loginRequestProposalStream, account }
            : { ...loginRequestMicrosoftProvider, account };

        try {
          const response = await msalInstance.acquireTokenSilent(accessTokenRequest);
          const decoded = jwtDecode(response.accessToken);
          setUser({
            id: decoded.sub,
            name: decoded.name,
            email: decoded.email || decoded.unique_name,
            roles: decoded.roles || [],
            provider: authProvider,
            accessToken: response.accessToken,
          });
        } catch (error) {
          if (error instanceof InteractionRequiredAuthError) {
            try {
              await msalInstance.acquireTokenRedirect(accessTokenRequest);
            } catch (e) {
              console.error('Token acquisition error:', e);
              onError(e.message);
            }
          } else {
            console.error('Token acquisition error:', error);
            onError(error.message);
          }
        }
      } else {
        // Handle email/password authentication
        const storedAccessToken = localStorage.getItem('accessToken');
        if (storedAccessToken) {
          try {
            const decoded = jwtDecode(storedAccessToken);
            setUser({
              id: decoded.sub,
              name: decoded.name,
              email: decoded.email,
              roles: decoded.roles || [],
              provider: 'emailPassword',
              accessToken: storedAccessToken,
            });
            setAuthProvider('emailPassword');
          } catch (err) {
            console.error('Invalid access token:', err);
            onError('Invalid session. Please log in again.');
            setUser(null);
            setAuthProvider(null);
          }
        } else {
          setUser(null);
          setAuthProvider(null);
        }
      }
    };

    fetchToken();
  }, [authProvider, onError]);

  // Effect to handle unauthorized access globally
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
  }, [onError, navigate]);

  // Logout function
  const logout = () => {
    if (authProvider === 'proposalStream' || authProvider === 'microsoftProvider') {
      msalInstance
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
  };

  // Login function
  const login = async (provider, credentials = null) => {
    console.log('Attempting to login with provider:', provider);

    // Prevent initiating a new interaction if one is already in progress
    const { interactionStatus } = msalInstance.getActiveAccount() || {};
    if (msalInstance.getInteractionStatus() === 'interaction_in_progress') {
      onError('An interaction is already in progress. Please wait.');
      return;
    }

    if (!AVAILABLE_PROVIDERS.includes(provider)) {
      console.error('Unknown authentication provider:', provider);
      onError('Unknown authentication provider.');
      return;
    }

    if (provider === 'proposalStream') {
      try {
        await msalInstance.loginRedirect(loginRequestProposalStream);
      } catch (e) {
        console.error('Login error:', e);
        onError(e.message);
      }
    } else if (provider === 'microsoftProvider') {
      try {
        await msalInstance.loginRedirect(loginRequestMicrosoftProvider);
      } catch (e) {
        console.error('Login error:', e);
        onError(e.message);
      }
    } else if (provider === 'emailPassword') {
      // Handle email/password login via backend API
      try {
        const response = await axios.post('/api/auth/login', credentials);
        const { accessToken, refreshToken, user: userData } = response.data;

        // Store tokens securely (Consider using HttpOnly cookies for production)
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        setUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          roles: userData.roles || [],
          provider: 'emailPassword',
          accessToken,
        });

        setAuthProvider('emailPassword');

        // Navigate to the dashboard or desired route post-login
        navigate('/');
      } catch (error) {
        console.error('Email/Password login error:', error);
        const message =
          error.response?.data?.message || 'Email/Password login failed.';
        onError(message);
      }
    } else {
      onError('Provider not configured properly.');
    }
  };

  // Registration function remains the same
  const register = async (userInfo) => {
    try {
      const response = await axios.post('/api/auth/register', userInfo);
      // Optionally auto-login after registration
      await login('emailPassword', {
        email: userInfo.email,
        password: userInfo.password,
      });
    } catch (error) {
      console.error('Registration error:', error);
      const message =
        error.response?.data?.message || 'Registration failed.';
      onError(message);
    }
  };

  // Return loading indicator if still handling redirects
  if (isLoading) {
    return <div>Loading...</div>; // Customize as needed
  }

  return (
    <AuthContext.Provider value={{ user, authProvider, logout, login, register }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for accessing the AuthContext
export const useAuth = () => useContext(AuthContext);