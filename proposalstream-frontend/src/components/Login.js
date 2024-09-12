import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

function Login({ showNotification }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Attempting login...');
      const userData = await login(email, password);
      console.log('Login successful, user data:', userData);
      showNotification('Logged in successfully', 'success');
      
      console.log('User role:', userData.role);
      // Redirect based on user role
      if (userData.role === 'admin') {
        console.log('Admin logged in, redirecting to dashboard');
        navigate('/');
      } else if (userData.role === 'client') {
        console.log('Redirecting to /job-request');
        navigate('/job-request');
      } else if (userData.role === 'vendor') {
        console.log('Redirecting to /job-request-management');
        navigate('/job-request-management');
      } else {
        console.log('Unrecognized role, redirecting to /');
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      showNotification(`Login failed: ${error.message}`, 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit">Login</button>
    </form>
  );
}

export default Login;
