   // proposalstream-frontend/src/utils/axiosInstance.js

   import axios from 'axios';

   // Create an Axios instance
   const axiosInstance = axios.create({
     baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:6001/api',
     withCredentials: true, // Ensure cookies are sent with requests
   });

   // Request interceptor to log the request headers
   axiosInstance.interceptors.request.use(request => {
     console.log('Request headers:', request.headers);
     return request;
   });

   // Response interceptor to handle global errors
   axiosInstance.interceptors.response.use(
     (response) => response,
     (error) => {
       if (error.response && error.response.status === 401) {
         // Unauthorized, possibly trigger logout or redirect to login
         console.error('Unauthorized access, please log in again');
         window.dispatchEvent(new Event('UNAUTHORIZED_EVENT'));
       }
       return Promise.reject(error);
     }
   );

   export default axiosInstance;
