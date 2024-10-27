import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import VendorSelector from './VendorSelector';
import AddVendorModal from './AddVendorModal';
import './JobRequestForm.css';

function JobRequestForm({ showNotification }) {
  const [formData, setFormData] = useState({
    propertyId: '',
    requestDetails: '',
    serviceType: '',
    vendorId: '',
  });
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [isAddVendorModalOpen, setIsAddVendorModalOpen] = useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await api.get('/api/properties');
        if (response.data && Array.isArray(response.data.properties)) {
          setProperties(response.data.properties);
        } else {
          console.error('Unexpected response format:', response.data);
          setProperties([]);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
        setProperties([]);
      }
    };

    fetchProperties();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVendorChange = (selectedVendor) => {
    setFormData({ ...formData, vendorId: selectedVendor });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (properties.length === 0) {
      showNotification('Please add a property before submitting a job request.', 'error');
      return;
    }

    if (!formData.vendorId) {
      showNotification('Please select a vendor.', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        propertyId: formData.propertyId,
        requestDetails: formData.requestDetails,
        serviceType: formData.serviceType,
        vendorId: formData.vendorId,
        // Remove 'client' from payload since backend attaches it automatically
        // client: user._id,
      };

      const response = await api.post('/api/jobs', payload);

      showNotification('Job request submitted successfully', 'success');
      setFormData({
        propertyId: '',
        requestDetails: '',
        serviceType: '',
        vendorId: '',
      });
    } catch (error) {
      console.error('Error creating job request:', error.response?.data || error.message);
      const errorMsg = error.response?.data?.errors
        ? error.response.data.errors.map(err => err.msg).join(', ')
        : `Error submitting job request: ${error.message}`;
      showNotification(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="job-request-form-container">
      <h2 className="form-title">New Job Request</h2>
      {properties.length === 0 && (
        <div className="alert-warning">
          <p>
            No properties found. Please{' '}
            <Link to="/add-property" className="alert-link" onClick={() => window.scrollTo(0, 0)}>
              add a property
            </Link>
            .
          </p>
        </div>
      )}
      <form className="job-request-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="property" className="form-label">
            Property:
          </label>
          <select
            id="property"
            name="propertyId"
            value={formData.propertyId}
            onChange={handleChange}
            className="form-select"
            required
            disabled={properties.length === 0}
          >
            <option value="">Select a Property</option>
            {properties.map((property) => (
              <option key={property._id} value={property._id}>
                {property.propertyName}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="requestDetails" className="form-label">
            Request Details:
          </label>
          <textarea
            id="requestDetails"
            name="requestDetails"
            value={formData.requestDetails}
            onChange={handleChange}
            className="form-textarea"
            required
            placeholder="Describe your job request in detail"
            rows="4"
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="serviceType" className="form-label">
            Service Type:
          </label>
          <input
            type="text"
            id="serviceType"
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            className="form-input"
            required
            placeholder="e.g., Plumbing, Electrical"
          />
        </div>

        <div className="form-group">
          <label htmlFor="vendor" className="form-label">
            Select Vendor:
          </label>
          <div className="vendor-selector-wrapper">
            <VendorSelector selectedVendor={formData.vendorId} onVendorChange={handleVendorChange} />
            <button
              type="button"
              className="add-vendor-button"
              onClick={() => setIsAddVendorModalOpen(true)}
            >
              + Add New Vendor
            </button>
          </div>
        </div>

        <div className="form-group">
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Job Request'}
          </button>
        </div>
      </form>

      {isAddVendorModalOpen && (
        <AddVendorModal
          onClose={() => setIsAddVendorModalOpen(false)}
          onVendorAdded={(newVendor) => {
            handleVendorChange(newVendor._id);
            setIsAddVendorModalOpen(false);
            showNotification('Vendor added successfully', 'success');
          }}
        />
      )}
    </div>
  );
}

export default JobRequestForm;
