import React, { createContext, useState, useEffect } from 'react';
import { getBackendUrl, login as apiLogin, register as apiRegister } from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const baseUrl = await getBackendUrl();
          const response = await fetch(`${baseUrl}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            throw new Error('Failed to load user data');
          }
        } catch (error) {
          console.error('Error loading user:', error.message);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiLogin(email, password);
      console.log('Login response:', response);
      const userData = response.user; // Ensure this matches your API response structure
      setUser(userData);
      localStorage.setItem('token', response.token);
      return userData; // This should include the role
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email, password, role) => {
    try {
      const data = await apiRegister(email, password, role);
      setUser(data.user);
      return data;
    } catch (error) {
      console.error('Registration error:', error.message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
