import React, { useState } from 'react';
import axios from 'axios';
import { getBackendUrl } from '../utils/api';

function VendorSubmissionForm({ showNotification }) {
  const [formData, setFormData] = useState({
    vendorLLC: '',
    contractSignerEmail: '',
    contractSignerFirstName: '',
    contractSignerLastName: '',
    serviceType: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const baseUrl = await getBackendUrl();
      const response = await axios.post(`${baseUrl}/api/vendors`, formData);
      console.log('Response:', response);
      console.log('Vendor submitted:', response.data);
      showNotification('Vendor submitted successfully', 'success');
      setFormData({
        vendorLLC: '',
        contractSignerEmail: '',
        contractSignerFirstName: '',
        contractSignerLastName: '',
        serviceType: ''
      });
    } catch (error) {
      console.error('Error details:', error.response || error);
      showNotification(`Error: ${error.response?.data?.message || error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vendor-submission-form">
      <h2>Vendor Submission</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="vendorLLC">Vendor LLC:</label>
          <input
            type="text"
            id="vendorLLC"
            name="vendorLLC"
            value={formData.vendorLLC}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="contractSignerEmail">Contract Signer Email:</label>
          <input
            type="email"
            id="contractSignerEmail"
            name="contractSignerEmail"
            value={formData.contractSignerEmail}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="contractSignerFirstName">Contract Signer First Name:</label>
          <input
            type="text"
            id="contractSignerFirstName"
            name="contractSignerFirstName"
            value={formData.contractSignerFirstName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="contractSignerLastName">Contract Signer Last Name:</label>
          <input
            type="text"
            id="contractSignerLastName"
            name="contractSignerLastName"
            value={formData.contractSignerLastName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="serviceType">Service Type:</label>
          <input
            type="text"
            id="serviceType"
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Vendor Information'}
        </button>
      </form>
    </div>
  );
}

export default VendorSubmissionForm;
