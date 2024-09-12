import axios from 'axios';

let backendPort = null;

const PORT_RANGE = Array.from({ length: 1000 }, (_, i) => 6001 + i);
const MAX_RETRIES = 50; // Increase this number
let retries = 0;

export const getBackendUrl = async () => {
  if (backendPort) return `http://localhost:${backendPort}`;
  
  const cachedPort = localStorage.getItem('backendPort');
  if (cachedPort) {
    try {
      await axios.get(`http://localhost:${cachedPort}/api/port`, { timeout: 1000 });
      backendPort = cachedPort;
      console.log(`Using cached port: ${backendPort}`);
      return `http://localhost:${backendPort}`;
    } catch (error) {
      console.log('Cached port not valid, searching for new port...');
    }
  }
  
  console.log('Searching for backend server...');
  for (const port of PORT_RANGE) {
    if (retries >= MAX_RETRIES) {
      console.error('Max retries reached. Backend not found.');
      throw new Error('Backend not found after maximum retries');
    }
    try {
      console.log(`Trying port ${port}...`);
      const response = await axios.get(`http://localhost:${port}/api/port`, { timeout: 1000 });
      backendPort = response.data.port;
      console.log(`Backend found on port ${backendPort}`);
      localStorage.setItem('backendPort', backendPort);
      return `http://localhost:${backendPort}`;
    } catch (error) {
      console.log(`Error on port ${port}:`, error.message);
    }
    retries++;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.error('Backend not found in the specified range');
  throw new Error('Backend port not found in the specified range');
};

export const api = axios.create();

api.interceptors.request.use(async (config) => {
  if (!config.baseURL) {
    try {
      config.baseURL = await getBackendUrl();
    } catch (error) {
      console.error('Error getting backend URL:', error);
      throw error;
    }
  }
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('Outgoing request config:', {
    url: config.url,
    method: config.method,
    headers: config.headers,
    data: config.data
  });
  return config;
}, (error) => {
  console.error('Error in request interceptor:', error);
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => {
    console.log('Response received:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('Error response:', {
        status: error.response.status,
        data: error.response.data
      });
      if (error.response.status === 401) {
        console.error('Unauthorized access. Please check your authentication.');
        // You can add additional logic here, like redirecting to login page
      }
    } else if (error.request) {
      console.error('Error request:', error.request);
    } else {
      console.error('Error', error.message);
    }
    return Promise.reject(error);
  }
);

// Add this function to handle login
export const login = async (email, password) => {
  try {
    const baseUrl = await getBackendUrl();
    console.log('Sending login request to:', `${baseUrl}/api/auth/login`);
    const response = await axios.post(`${baseUrl}/api/auth/login`, { email, password });
    console.log('Login response:', response.data);
    return response.data; // This should include both token and user data
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};

export const register = async (email, password, role) => {
  try {
    const baseUrl = await getBackendUrl();
    const response = await axios.post(`${baseUrl}/api/auth/register`, { email, password, role });
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
      return response.data;
    } else {
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    if (error.response) {
      console.error('Registration error response:', error.response.data);
      throw new Error(error.response.data.message || 'Registration failed');
    } else if (error.request) {
      console.error('Registration error request:', error.request);
      throw new Error('No response from server');
    } else {
      console.error('Registration error:', error.message);
      throw error;
    }
  }
};

// Add this function to the api.js file
export const clearAllNonAdminUsers = async () => {
  try {
    const response = await api.delete('/api/users/clear-all');
    console.log('Clear all non-admin users response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error clearing non-admin users:', error.response?.data || error.message);
    throw error;
  }
};

export default api;
