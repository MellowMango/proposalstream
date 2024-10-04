// src/components/Onboarding.js

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/CombinedAuthContext';
import './Onboarding.css'; // Import CSS for styling

function Onboarding({ showNotification }) {
  const { user, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [additionalInfo, setAdditionalInfo] = useState({
    // Define fields based on roles
    vendorLLC: '',
    contractSignerEmail: '',
    contractSignerFirstName: '',
    contractSignerLastName: '',
    serviceType: '',
    // Admin-specific fields
    adminSecretKey: '',
  });

  const handleChange = (e) => {
    setAdditionalInfo({ ...additionalInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register({
        ...user,
        ...additionalInfo,
      });
      showNotification('Registration completed successfully', 'success');
      navigate('/dashboard');
    } catch (error) {
      showNotification('Registration failed', 'error');
    }
  };

  return (
    <div className="onboarding-container">
      <h2>Complete Your Profile</h2>
      <form onSubmit={handleSubmit}>
        {/* Render fields based on user's role */}
        {user.roles.includes('vendor') && (
          <>
            <div className="form-group">
              <label htmlFor="vendorLLC">Vendor LLC:</label>
              <input
                type="text"
                id="vendorLLC"
                name="vendorLLC"
                value={additionalInfo.vendorLLC}
                onChange={handleChange}
                required
              />
            </div>
            {/* Add other vendor-specific fields */}
            <div className="form-group">
              <label htmlFor="contractSignerEmail">Contract Signer Email:</label>
              <input
                type="email"
                id="contractSignerEmail"
                name="contractSignerEmail"
                value={additionalInfo.contractSignerEmail}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="contractSignerFirstName">Contract Signer First Name:</label>
              <input
                type="text"
                id="contractSignerFirstName"
                name="contractSignerFirstName"
                value={additionalInfo.contractSignerFirstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="contractSignerLastName">Contract Signer Last Name:</label>
              <input
                type="text"
                id="contractSignerLastName"
                name="contractSignerLastName"
                value={additionalInfo.contractSignerLastName}
                onChange={handleChange}
                required
              />
            </div>
          </>
        )}

        {user.roles.includes('admin') && (
          <>
            <div className="form-group">
              <label htmlFor="adminSecretKey">Admin Secret Key:</label>
              <input
                type="password"
                id="adminSecretKey"
                name="adminSecretKey"
                value={additionalInfo.adminSecretKey}
                onChange={handleChange}
                required
              />
            </div>
          </>
        )}

        {/* Add more role-specific fields as needed */}

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default Onboarding;