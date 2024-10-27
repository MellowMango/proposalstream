// src/contexts/CombinedAuthContext.js

import React, { createContext, useEffect, useState, useContext, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from './utils/axiosInstance';
import { protectedRoutes } from './routeConfig';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children, onError }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
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
    localStorage.setItem('token', token);
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('token');
    delete axiosInstance.defaults.headers.common['Authorization'];
    navigate('/');
  }, [navigate]);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      const { user: userData, token } = response.data;
      handleAuthenticated(userData, token);
      navigate('/dashboard');
    } catch (error) {
      handleError(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  }, [navigate, handleError]);

  const register = useCallback(async (registrationData) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/auth/register', registrationData);
      const { user: userData, token } = response.data;
      handleAuthenticated(userData, token);
      navigate('/dashboard');
    } catch (error) {
      handleError(error.response?.data?.message || 'Registration failed');
      throw error; // Rethrow to handle in Register component
    } finally {
      setIsLoading(false);
    }
  }, [navigate, handleError]);

  const registerAdmin = useCallback(async (registrationData) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/auth/register-admin', registrationData);
      const { user: userData, token } = response.data;
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
  const isCurrentPathProtected = () => {
    return protectedRoutes.some(route => location.pathname.startsWith(route));
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && isCurrentPathProtected()) {
      setIsLoading(true);
      axiosInstance.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => {
          handleAuthenticated(response.data, token);
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
