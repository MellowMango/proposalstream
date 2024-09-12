import React, { useState } from 'react';
import axios from 'axios';
import { getBackendUrl } from '../utils/api';

function JobRequestForm({ showNotification }) {
  const [formData, setFormData] = useState({
    building: '',
    clientName: '',
    requestDetails: '',
    contractSignerEmail: '',
    contractSignerFirstName: '',
    contractSignerLastName: '',
    serviceType: '', // Add this line
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log('Attempting to get backend URL...');
      const baseUrl = await getBackendUrl();
      console.log('Backend URL obtained:', baseUrl);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const response = await axios.post(`${baseUrl}/api/jobs`, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Job request created:', response.data);
      showNotification('Job request submitted successfully', 'success');
      setFormData({
        building: '',
        clientName: '',
        requestDetails: '',
        contractSignerEmail: '',
        contractSignerFirstName: '',
        contractSignerLastName: '',
        serviceType: '', // Add this line
      });
    } catch (error) {
      console.error('Error creating job request:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      } else if (error.request) {
        console.error('Error request:', error.request);
      }
      showNotification(`Error submitting job request: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="job-request-form">
      <h2>New Job Request</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="building">Building:</label>
          <input
            type="text"
            id="building"
            name="building"
            value={formData.building}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="clientName">Client Name:</label>
          <input
            type="text"
            id="clientName"
            name="clientName"
            value={formData.clientName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="requestDetails">Request Details:</label>
          <textarea
            id="requestDetails"
            name="requestDetails"
            value={formData.requestDetails}
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
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Job Request'}
        </button>
      </form>
    </div>
  );
}

export default JobRequestForm;
