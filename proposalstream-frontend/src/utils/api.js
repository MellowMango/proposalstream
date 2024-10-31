import axios from 'axios';

// Event name for unauthorized access
export const UNAUTHORIZED_EVENT = 'unauthorized';

// Environment-based Backend URL Resolution
export const getBackendUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    // In production, use relative path since frontend and backend are served from same domain
    return '';
  } else {
    return process.env.REACT_APP_API_URL_LOCAL || 'http://localhost:6001';
  }
};

export const api = axios.create({
  baseURL: getBackendUrl(),
});

// Request interceptor to attach the token
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('Outgoing request config:', {
        url: config.url,
        method: config.method,
        headers: config.headers,
        data: config.data
      });
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Response received:', {
        status: response.status,
        data: response.data
      });
    }
    return response;
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401 || status === 403) {
        console.error('Authentication error:', error.response.data.message || 'Unauthorized access');

        // Clear token and user data
        localStorage.removeItem('token');

        // Remove Authorization header
        delete api.defaults.headers.common['Authorization'];

        // Dispatch an event to notify AuthContext
        window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));

        // Redirect to login page
        window.location.href = '/login';
      } else {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Error response:', {
            status: error.response.status,
            data: error.response.data
          });
        }
      }
    } else if (error.request) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error request:', error.request);
      }
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error', error.message);
      }
    }
    return Promise.reject(error);
  }
);

// Login function
export const login = async (email, password) => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Sending login request to:', '/api/auth/login');
    }
    const response = await api.post('/api/auth/login', { email, password });
    if (process.env.NODE_ENV !== 'production') {
      console.log('Login response:', response.data);
    }
    // Store token in local storage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }

    return response.data; // Should include token and user data
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Login error:', error.response?.data || error.message);
    }
    // throw error;
  }
};

// Register function
export const register = async (email, password, role) => {
  try {
    const response = await api.post('/api/auth/register', { email, password, role });
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
      return response.data;
    } else {
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      if (error.response) {
        console.error('Registration error response:', error.response.data);
      } else if (error.request) {
        console.error('Registration error request:', error.request);
      } else {
        console.error('Registration error:', error.message);
      }
    }
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    } else if (error.request) {
      throw new Error('No response from server');
    } else {
      throw new Error(error.message);
    }
  }
};

export const registerAdmin = async (email, password, adminSecretKey) => {
  try {
    const response = await api.post('/api/auth/register-admin', { email, password, adminSecretKey });
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
      return response.data;
    } else {
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      if (error.response) {
        console.error('Admin registration error response:', error.response.data);
      } else if (error.request) {
        console.error('Admin registration error request:', error.request);
      } else {
        console.error('Admin registration error:', error.message);
      }
    }
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    } else if (error.request) {
      throw new Error('No response from server');
    } else {
      throw new Error(error.message);
    }
  }
}

// Function to clear all non-admin users
export const clearAllNonAdminUsers = async () => {
  try {
    const response = await api.delete('/api/users/clear-all');
    if (process.env.NODE_ENV !== 'production') {
      console.log('Clear all non-admin users response:', response.data);
    }
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error clearing non-admin users:', error.response?.data || error.message);
    }
    throw error;
  }
};

// Function to fetch current user
export const me = async () => {
  try {
    const response = await api.get('/api/auth/me');
    if (process.env.NODE_ENV !== 'production') {
      console.log('Me response:', response.data);
    }
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Me error:', error.response?.data || error.message);
    }
    throw error;
  }
}

export default api;
