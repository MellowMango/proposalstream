import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

function Register({ showNotification }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client');
  const [showAdminOption, setShowAdminOption] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(email, password, role);
      showNotification('Registered successfully', 'success');
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      showNotification('Registration failed: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const toggleAdminOption = () => {
    setShowAdminOption(!showAdminOption);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
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
      <div>
        <label htmlFor="role">Role:</label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
        >
          <option value="client">Client</option>
          <option value="vendor">Vendor</option>
          {showAdminOption && <option value="admin">Admin</option>}
        </select>
      </div>
      <button type="button" onClick={toggleAdminOption}>
        {showAdminOption ? 'Hide Admin Option' : 'Show Admin Option'}
      </button>
      <button type="submit">Register</button>
    </form>
  );
}

export default Register;
