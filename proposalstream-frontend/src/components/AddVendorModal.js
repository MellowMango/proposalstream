import React, { useState } from 'react';
import axios from 'axios';
import api, { getBackendUrl } from '../utils/api';
import './AddVendorModal.css';

function AddVendorModal({ onClose, onVendorAdded }) {
  const [vendorData, setVendorData] = useState({
    vendorLLC: '',
    contactEmail: '',
    phoneNumber: '',
    // Add other necessary fields
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setVendorData({ ...vendorData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/api/vendors', vendorData);
      onVendorAdded(response.data); // Pass the new vendor back to the parent
    } catch (error) {
      console.error('Error adding vendor:', error);
      // Optionally, show notification or handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Add New Vendor</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="vendorLLC">Vendor LLC:</label>
            <input
              type="text"
              id="vendorLLC"
              name="vendorLLC"
              value={vendorData.vendorLLC}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="contactEmail">Contact Email:</label>
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              value={vendorData.contactEmail}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number:</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={vendorData.phoneNumber}
              onChange={handleChange}
              required
            />
          </div>
          {/* Add other necessary fields */}
          <button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Vendor'}
          </button>
          <button type="button" onClick={onClose} disabled={loading}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddVendorModal;