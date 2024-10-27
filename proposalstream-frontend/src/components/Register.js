import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../CombinedAuthContext';
import './Register.css'; // Import the CSS file for styling

function Register({ showNotification }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client');
  const [adminSecretKey, setAdminSecretKey] = useState('');
  const [vendorData, setVendorData] = useState({
    vendorLLC: '',
    contractSignerEmail: '',
    contractSignerFirstName: '',
    contractSignerLastName: '',
    serviceType: '',
  });
  const { user, register, registerAdmin } = useAuth();
  const navigate = useNavigate();

  const handleVendorChange = (e) => {
    setVendorData({ ...vendorData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (role === 'admin') {
        // Admin registration
        const registrationData = {
          email,
          password,
          adminSecretKey,
        };
        await registerAdmin(registrationData);
        showNotification('Admin registered successfully', 'success');
        navigate('/');
      } else {
        // Client or Vendor registration
        const registrationData = {
          email,
          password,
          role,
        };

        // Include vendor data if role is vendor
        if (role === 'vendor') {
          registrationData.vendorData = vendorData;
        }

        await register(registrationData);
        showNotification('Registered successfully', 'success');
        navigate('/');
      }
    } catch (error) {
      console.error('Registration error:', error);
      showNotification(
        'Registration failed: ' + (error.response?.data?.message || error.message),
        'error'
      );
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-form">
        <h2>Register</h2>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            placeholder="Enter a secure password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="role">Role:</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="client">Client</option>
            <option value="vendor">Vendor</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Admin-specific field */}
        {role === 'admin' && (
          <div className="form-group">
            <label htmlFor="adminSecretKey">Admin Secret Key:</label>
            <input
              type="password"
              id="adminSecretKey"
              placeholder="Enter admin secret key"
              value={adminSecretKey}
              onChange={(e) => setAdminSecretKey(e.target.value)}
              required
            />
          </div>
        )}

        {/* Vendor-specific fields */}
        {role === 'vendor' && (
          <div className="vendor-fields">
            <h3>Vendor Information</h3>
            <div className="form-group">
              <label htmlFor="vendorLLC">Vendor LLC:</label>
              <input
                type="text"
                id="vendorLLC"
                name="vendorLLC"
                placeholder="Enter your LLC name"
                value={vendorData.vendorLLC}
                onChange={handleVendorChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="contractSignerFirstName">Contract Signer First Name:</label>
              <input
                type="text"
                id="contractSignerFirstName"
                name="contractSignerFirstName"
                placeholder="First name of signer"
                value={vendorData.contractSignerFirstName}
                onChange={handleVendorChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="contractSignerLastName">Contract Signer Last Name:</label>
              <input
                type="text"
                id="contractSignerLastName"
                name="contractSignerLastName"
                placeholder="Last name of signer"
                value={vendorData.contractSignerLastName}
                onChange={handleVendorChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="contractSignerEmail">Contract Signer Email:</label>
              <input
                type="email"
                id="contractSignerEmail"
                name="contractSignerEmail"
                placeholder="Email of signer"
                value={vendorData.contractSignerEmail}
                onChange={handleVendorChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="serviceType">Service Type:</label>
              <input
                type="text"
                id="serviceType"
                name="serviceType"
                placeholder="Type of service provided"
                value={vendorData.serviceType}
                onChange={handleVendorChange}
                required
              />
            </div>
          </div>
        )}

        <button type="submit" className="register-button">Register</button>
      </form>
    </div>
  );
}

export default Register;
