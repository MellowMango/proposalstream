// src/contexts/CombinedAuthContext.js

import React, { createContext, useEffect, useState, useContext, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { loginRequest, tokenRequest } from '../config/msalConfig';
import axiosInstance, { setAuthToken } from '../utils/axiosInstance';
import msalInstance from '../config/msalInstance';
import { protectedRoutes } from '../routeConfig';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children, onError }) => {
  const navigate = useNavigate();
  const location = useLocation(); // Get current location

  const [accounts, setAccounts] = useState(msalInstance.getAllAccounts());
  const [user, setUser] = useState(null);
  const [authProvider, setAuthProvider] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Initialized to false
  const [error, setError] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleError = useCallback((message) => {
    console.error("AuthProvider Error:", message);
    setError(message);
    if (onError) onError(message);
  }, [onError]);

  const logout = useCallback(() => {
    if (isLoggingOut || !msalInstance) return;
    console.log("Initiating logout...");
    setIsLoggingOut(true);
    msalInstance.logoutRedirect({
      postLogoutRedirectUri: window.location.origin,
    }).catch((e) => {
      console.error('Logout error:', e);
      handleError('Logout failed.');
    }).finally(() => {
      setIsLoggingOut(false);
      console.log("Logout process completed.");
    });
    setAuthToken(null);
    setUser(null); // Clear user state on logout
    setAuthProvider(null);
  }, [handleError, isLoggingOut]);

  const initiateAzureLogin = useCallback(() => {
    if (!msalInstance) {
      console.error("MSAL instance is not initialized");
      handleError("Authentication is not initialized.");
      return;
    }

    console.log("Calling msalInstance.loginRedirect with loginRequest:", loginRequest);
    msalInstance.loginRedirect(loginRequest)
      .catch((error) => {
        console.error("Login redirect error:", error);
        handleError(error.message);
      });
  }, [handleError]);

  useEffect(() => {
    const initializeAuth = async () => {
      console.log("Initializing authentication...");
      setIsLoading(true);
      try {
        const response = await msalInstance.handleRedirectPromise();
        if (response) {
          console.log("Redirect promise resolved with response:", response);
          setAccounts(msalInstance.getAllAccounts());
        }

        const currentAccounts = msalInstance.getAllAccounts();
        console.log("Current accounts:", currentAccounts);
        if (currentAccounts.length > 0) {
          const account = currentAccounts[0];
          msalInstance.setActiveAccount(account);
          console.log("Active account set:", account);

          try {
            console.log("Attempting silent token acquisition...");
            const result = await msalInstance.acquireTokenSilent({
              ...tokenRequest,
              account: account,
            });
            console.log("Silent token acquisition successful:", result);

            setAuthToken(result.accessToken);
            console.log("Access token set in axiosInstance.");

            const userData = {
              id: account.idTokenClaims?.oid || account.localAccountId || account.homeAccountId,
              name: account.name,
              email: account.username,
              roles: account.idTokenClaims?.roles || [],
              provider: 'proposalStream',
              accessToken: result.accessToken,
            };

            setUser(userData);
            setAuthProvider('proposalStream');
            console.log("User state updated:", userData);

            // Redirect to appropriate route after successful login
            const from = location.state?.from?.pathname || '/dashboard';
            console.log(`User authenticated. Redirecting to ${from}`);
            navigate(from, { replace: true });
          } catch (error) {
            console.error("Silent token acquisition failed:", error);
            if (error instanceof InteractionRequiredAuthError) {
              console.log("Redirecting for interactive token acquisition...");
              await msalInstance.acquireTokenRedirect(tokenRequest);
            } else {
              handleError(error.message);
            }
          }
        } else {
          console.log("No accounts found in MSAL cache.");
          setUser(null);
          setAuthProvider(null);
        }
      } catch (error) {
        console.error("Authentication initialization error:", error);
        handleError(error.message);
      } finally {
        setIsLoading(false);
        console.log("Authentication initialization completed. Loading state set to false.");
      }
    };

    // Only initialize auth if the current path is protected
    if (protectedRoutes.includes(location.pathname)) {
      console.log(`Current path (${location.pathname}) is protected. Initializing authentication.`);
      initializeAuth();
    } else {
      console.log(`Current path (${location.pathname}) is not protected. Skipping authentication initialization.`);
    }
  }, [navigate, handleError, location.pathname]);

  return (
    <AuthContext.Provider value={{ user, authProvider, initiateAzureLogin, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};