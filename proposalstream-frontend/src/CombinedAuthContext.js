// src/contexts/CombinedAuthContext.js
import React, { createContext, useEffect, useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from './utils/api';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children, onError }) => {
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  const handleError = useCallback((message) => {
    console.error(message);
    setError(message);
    if (onError) onError(message);
  }, [onError]);

  const handleAuthenticated = (userData, token) => {
    setUser(userData);
    setAccessToken(token);
  };

  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    navigate('/');
  }, [navigate]);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const { user: userData, token } = await api.login(email, password);
      handleAuthenticated(userData, token);
      navigate('/dashboard');
    } catch (error) {
      handleError(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  }, [navigate, handleError]);


  const register = useCallback(async ({ email, password, role }) => {
    setIsLoading(true);
    try {
      const { user: userData, token } = await api.register(email, password, role);
      handleAuthenticated(userData, token);
      navigate('/dashboard');
    } catch (error) {
      handleError(error.response?.data?.message || 'Registration failed');
      throw error; // Rethrow to handle in Register component
    } finally {
      setIsLoading(false);
    }
  }, [navigate, handleError]);

  // TODO Add registerAdmin function on api
  const registerAdmin = useCallback(async (registrationData) => {
    setIsLoading(true);
    try {
      const { user: userData, token } = await api.registerAdmin(registrationData);
      handleAuthenticated(userData, token);
      navigate('/dashboard');
    } catch (error) {
      handleError(error.response?.data?.message || 'Admin registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [navigate, handleError]);

  // Check for stored token on mount
  // const isCurrentPathProtected = useMemo(
  //   () => protectedRoutes.some(route => location.pathname.startsWith(route)
  // ), [location.pathname]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoading(true);
      api.me()
        .then(data => {
          handleAuthenticated(data, token);
        })
        .catch(() => {
          logout();
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [logout]);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      register,
      registerAdmin,
      isLoading,
      error,
      accessToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};
