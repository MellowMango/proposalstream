// src/contexts/CombinedAuthContext.js

import React, { createContext, useEffect, useState, useContext, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMsal } from "@azure/msal-react";
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { loginRequest } from './config/msalConfig';
import axiosInstance from './utils/axiosInstance';
import { protectedRoutes } from './routeConfig';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children, onError }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = accounts && accounts.length > 0;

  const [user, setUser] = useState(null);
  const [authProvider, setAuthProvider] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [accessToken, setAccessToken] = useState(null); // Centralized access token

  const handleError = useCallback((message) => {
    console.error(message);
    setError(message);
    if (onError) onError(message);
  }, [onError]);

  // Centralized method to handle user and token
  const handleAuthenticated = (userData, token) => {
    setUser(userData);
    setAccessToken(token);
    // Set token in Axios
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = useCallback(() => {
    if (isLoggingOut || !instance) return;
    console.log("Initiating logout...");
    setIsLoggingOut(true);
    instance.logoutRedirect({
      postLogoutRedirectUri: window.location.origin,
    }).catch((e) => {
      console.error('Logout error:', e);
      handleError('Logout failed.');
    }).finally(() => {
      setIsLoggingOut(false);
      console.log("Logout process completed.");
      handleAuthenticated(null, null); // Clear user and token on logout
    });
  }, [instance, handleError, isLoggingOut]);

  const login = useCallback(() => {
    if (!instance) {
      handleError("Authentication is not initialized.");
      return;
    }
    console.log("Initiating redirect-based login...");
    setIsLoading(true);
    instance.loginRedirect(loginRequest)
      .catch((e) => {
        console.error("Login error:", e);
        handleError(e.message);
        setIsLoading(false);
      });
  }, [instance, handleError]);

  const initiateAzureLogin = useCallback(() => {
    if (!instance) {
      console.error("MSAL instance is not initialized");
      handleError("Authentication is not initialized.");
      return;
    }
    console.log("Calling instance.loginRedirect");
    instance.loginRedirect(loginRequest)
      .catch((e) => {
        console.error("Login error:", e);
        handleError(e.message);
      });
  }, [instance, handleError]);

  const isCurrentPathProtected = () => {
    return protectedRoutes.includes(location.pathname);
  };

  useEffect(() => {
    // Only initialize authentication if the current path is protected
    if (!isCurrentPathProtected()) {
      console.log(`Current path (${location.pathname}) is not protected. Skipping authentication initialization.`);
      setUser(null);
      setAuthProvider(null);
      setAccessToken(null);
      return;
    }

    if (!instance || inProgress !== "none") return;

    const initializeAuth = async () => {
      console.log("Starting redirect-based authentication initialization...");
      setIsLoading(true);
      try {
        console.log("Initializing auth...");
        const response = await instance.handleRedirectPromise();
        if (response) {
          console.log("Redirect response received:", response);
        }

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
            scopes: [
              "openid",
              "profile",
              "offline_access",
              "https://proposalstreamb2c.onmicrosoft.com/c2f76643-7852-4308-adfc-99538cdee2c5/Files.Read"
            ],
            account: account,
            forceRefresh: true
          };

          let result;
          try {
            console.log("Attempting to acquire token silently...");
            result = await instance.acquireTokenSilent(tokenRequest);
            console.log("Silent token acquisition successful:", result);
          } catch (error) {
            console.error("Silent token acquisition failed:", error);
            if (error instanceof InteractionRequiredAuthError) {
              console.log("Redirecting for token acquisition...");
              await instance.acquireTokenRedirect(tokenRequest);
            } else {
              throw error;
            }
          }

          if (!result || !result.accessToken) {
            console.error("Incomplete token response:", result);
            throw new Error("Incomplete token response");
          }

          // Centralize token management
          setAccessToken(result.accessToken);
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${result.accessToken}`;

          const userData = {
            id: userId,
            name: account.name,
            email: account.username,
            roles: account.idTokenClaims?.roles || [],
            provider: 'proposalStream',
          };

          setUser(userData);
          setAuthProvider('proposalStream');

          try {
            console.log("Checking onboarding status...");
            const response = await axiosInstance.get(`/users/${userId}`);
            console.log("Onboarding response:", response);
            if (response.data.hasOnboarded) {
              console.log("User has onboarded. Navigating to dashboard.");
              navigate('/dashboard');
            } else {
              console.log("User has not onboarded. Navigating to onboarding.");
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
          setAccessToken(null);
        }
      } catch (error) {
        console.error("Authentication initialization error:", error);
        if (isCurrentPathProtected()) {
          handleError(error.message);
        }
      } finally {
        setIsLoading(false);
        console.log("Authentication initialization completed. Loading state set to false.");
      }
    };

    initializeAuth();
  }, [instance, inProgress, isAuthenticated, accounts, navigate, handleError, logout, isCurrentPathProtected, location.pathname]);

  return (
    <AuthContext.Provider value={{ user, authProvider, login, logout, isLoading, error, initiateAzureLogin, accessToken }}>
      {children}
    </AuthContext.Provider>
  );
};
