// src/contexts/CombinedAuthContext.js

import React, { createContext, useEffect, useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { InteractionRequiredAuthError, PublicClientApplication } from "@azure/msal-browser";
import { msalConfig, loginRequest } from "./msalConfig";
import axiosInstance, { setAuthToken } from './utils/axiosInstance';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children, onError }) => {
  const navigate = useNavigate();
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const [user, setUser] = useState(null);
  const [authProvider, setAuthProvider] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [msalInstance, setMsalInstance] = useState(null);

  const handleError = useCallback((message) => {
    console.error(message);
    setError(message);
    if (onError) onError(message);
  }, [onError]);

  useEffect(() => {
    const initializeMsal = async () => {
      try {
        const msalInstance = new PublicClientApplication(msalConfig);
        await msalInstance.initialize();
        setMsalInstance(msalInstance);
        console.log("MSAL initialized successfully");
      } catch (error) {
        console.error("Error initializing MSAL:", error);
        handleError("Failed to initialize authentication. Error: " + error.message);
      }
    };

    initializeMsal();
  }, [handleError]);

  const logout = useCallback(() => {
    if (isLoggingOut || !msalInstance) return;
    setIsLoggingOut(true);
    msalInstance.logoutRedirect({
      postLogoutRedirectUri: window.location.origin,
    }).catch((e) => {
      console.error('Logout error:', e);
      handleError('Logout failed.');
    }).finally(() => {
      setIsLoggingOut(false);
    });
    setAuthToken(null);
  }, [msalInstance, handleError, isLoggingOut]);

  const login = useCallback(() => {
    if (!msalInstance) {
      handleError("Authentication is not initialized.");
      return;
    }
    setIsLoading(true);
    msalInstance.loginRedirect(loginRequest)
      .catch((e) => {
        console.error("Login error:", e);
        handleError(e.message);
        setIsLoading(false);
      });
  }, [msalInstance, handleError]);

  useEffect(() => {
    if (!msalInstance || inProgress !== "none") return;

    const initializeAuth = async () => {
      try {
        console.log("Initializing auth...");
        console.log("Is authenticated:", isAuthenticated);
        console.log("Accounts:", accounts);

        if (isAuthenticated && accounts.length > 0) {
          const account = accounts[0];
          console.log("Selected account:", account);

          const userId = account.idTokenClaims?.oid || account.localAccountId || account.homeAccountId;
          if (!userId) {
            throw new Error("Unable to find a valid user identifier in the ID token.");
          }
          console.log("User ID:", userId);

          const tokenRequest = {
            scopes: ["openid", "profile", "offline_access"],
            account: account,
            forceRefresh: true
          };

          let result;
          try {
            result = await msalInstance.acquireTokenSilent(tokenRequest);
            if (!result || !result.accessToken) {
              console.log("Silent token acquisition failed, attempting interactive login...");
              result = await msalInstance.acquireTokenPopup(tokenRequest);
            }
          } catch (error) {
            console.error("Token acquisition failed:", error);
            throw error; // Rethrow to be caught by the outer try-catch
          }

          console.log("Token response:", result);

          if (!result || !result.accessToken) {
            console.error("Incomplete token response:", result);
            throw new Error("Incomplete token response");
          }

          const userData = {
            id: userId,
            name: account.name,
            email: account.username,
            roles: account.idTokenClaims?.roles || [],
            provider: 'proposalStream',
            accessToken: result.accessToken,
          };

          setUser(userData);
          setAuthProvider('proposalStream');

          try {
            console.log("Checking onboarding status...");
            const response = await axiosInstance.get(`/users/${userId}`);
            console.log("Onboarding response:", response);
            if (response.data.hasOnboarded) {
              navigate('/dashboard');
            } else {
              navigate('/onboarding');
            }
          } catch (apiError) {
            console.error("Error checking onboarding status:", apiError);
            if (apiError.response && apiError.response.status === 401) {
              handleError("Authentication failed. Please log in again.");
              logout();
            } else {
              handleError("Failed to verify onboarding status.");
            }
          }
        } else {
          console.log("User is not authenticated or no accounts found");
          setAuthProvider(null);
          setAuthToken(null);
        }
      } catch (error) {
        console.error("Authentication initialization error:", error);
        handleError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    const handleRedirectPromise = async () => {
      try {
        const response = await msalInstance.handleRedirectPromise();
        if (response) {
          // User has been redirected back from Azure AD B2C
          const account = msalInstance.getActiveAccount();
          if (account) {
            const userData = {
              id: account.homeAccountId,
              name: account.name,
              email: account.username,
              roles: account.idTokenClaims?.roles || [],
              provider: 'proposalStream',
            };
            setUser(userData);
            setAuthProvider('proposalStream');
          }
        }
      } catch (error) {
        console.error("Error handling redirect:", error);
        handleError(error.message);
      }
    };

    handleRedirectPromise().then(initializeAuth);
  }, [msalInstance, accounts, isAuthenticated, navigate, handleError, logout, inProgress]);

  return (
    <AuthContext.Provider value={{ user, authProvider, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};