   // proposalstream-frontend/src/utils/axiosInstance.js

   import axios from 'axios';
   import { useAuth } from '../contexts/CombinedAuthContext';
   import { useEffect } from 'react';

   // Custom hook to get Axios instance
   export const useAxios = () => {
     const { user, logout, onError } = useAuth();

     // Create an Axios instance
     const axiosInstance = axios.create({
       baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:6001/api',
     });

     // Request interceptor to add the access token
     axiosInstance.interceptors.request.use(
       (config) => {
         if (user && user.accessToken) {
           config.headers['Authorization'] = `Bearer ${user.accessToken}`;
         }
         return config;
       },
       (error) => {
         return Promise.reject(error);
       }
     );

     // Response interceptor to handle errors globally
     axiosInstance.interceptors.response.use(
       (response) => response,
       (error) => {
         if (error.response && error.response.status === 401) {
           // Unauthorized, possibly invalid token
           logout();
           onError('Session expired. Please log in again.');
         }
         return Promise.reject(error);
       }
     );

     return axiosInstance;
   };