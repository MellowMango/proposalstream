   // proposalstream-frontend/src/utils/axiosInstance.js

   import axios from 'axios';

   // Create an Axios instance
   const axiosInstance = axios.create({
     baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:6001/api',
   });

   // Request interceptor to add the access token
   export const setAuthToken = (token) => {
     if (token) {
       axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
     } else {
       delete axiosInstance.defaults.headers.common['Authorization'];
     }
   };

   // Response interceptor to handle errors globally
   axiosInstance.interceptors.response.use(
     (response) => response,
     (error) => {
       if (error.response && error.response.status === 401) {
         // Unauthorized, possibly invalid token
         // You can dispatch an action or emit an event here to handle the logout
         console.error('Unauthorized access, please log in again');
         // Dispatch an event to notify the app about the unauthorized access
         window.dispatchEvent(new Event('UNAUTHORIZED_EVENT'));
       }
       return Promise.reject(error);
     }
   );

   // Request interceptor to log the token
   axiosInstance.interceptors.request.use(request => {
     console.log('Request headers:', request.headers);
     return request;
   });

   export default axiosInstance;