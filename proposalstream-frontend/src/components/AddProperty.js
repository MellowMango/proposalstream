import React, { useState } from 'react';
import axios from 'axios';
import { getBackendUrl } from '../utils/api';
import { useAuth } from '../CombinedAuthContext';
import './AddProperty.css'; // Ensure this CSS file exists and is styled appropriately

function AddProperty({ showNotification }) {
  const { user } = useAuth;
  const [formData, setFormData] = useState({
    propertyName: '',
    propertyLLC: '',
    address: '',
    noiNoticeAddress: '',
    contractSignerEmail: '',
    contractSignerFirstName: '',
    contractSignerLastName: '',
  });
  const [cOIFile, setCOIFile] = useState(null);
  const [buildings, setBuildings] = useState(['']); // Initialize with one building field
  const [loading, setLoading] = useState(false);

  // Handle input changes for text fields
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle building changes
  const handleBuildingChange = (index, value) => {
    const newBuildings = [...buildings];
    newBuildings[index] = value;
    setBuildings(newBuildings);
  };

  // Add a new building field
  const addBuildingField = () => {
    setBuildings([...buildings, '']);
  };

  // Handle file selection
  const handleFileChange = (e) => {
    setCOIFile(e.target.files[0]);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      showNotification('You must be logged in to add properties.', 'error');
      return;
    }

    setLoading(true);
    try {
      const baseUrl = await getBackendUrl();
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Prepare form data with file
      const propertyData = new FormData();
      propertyData.append('propertyName', formData.propertyName);
      buildings
        .filter((b) => b.trim() !== '')
        .forEach((building) => propertyData.append('building', building));
      propertyData.append('propertyLLC', formData.propertyLLC);
      propertyData.append('address', formData.address);
      propertyData.append('noiNoticeAddress', formData.noiNoticeAddress);
      propertyData.append('contractSignerEmail', formData.contractSignerEmail);
      propertyData.append('contractSignerFirstName', formData.contractSignerFirstName);
      propertyData.append('contractSignerLastName', formData.contractSignerLastName);
      if (cOIFile) {
        propertyData.append('cOIFile', cOIFile);
      }

      const response = await axios.post(`${baseUrl}/api/properties`, propertyData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 201) {
        showNotification('Property added successfully.', 'success');
        // Reset form
        setFormData({
          propertyName: '',
          propertyLLC: '',
          address: '',
          noiNoticeAddress: '',
          contractSignerEmail: '',
          contractSignerFirstName: '',
          contractSignerLastName: '',
        });
        setBuildings(['']);
        setCOIFile(null);
      } else {
        showNotification('Failed to add property.', 'error');
      }
    } catch (error) {
      console.error('Error adding property:', error);
      showNotification(error.response?.data?.message || 'Error adding property.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-property-container">
      <h2>Add New Property</h2>
      <form onSubmit={handleSubmit} className="add-property-form">
        {/* Property Name */}
        <div className="form-group">
          <label htmlFor="propertyName">Property Name:</label>
          <input
            type="text"
            id="propertyName"
            name="propertyName"
            value={formData.propertyName}
            onChange={handleChange}
            required
            placeholder="Enter property name"
          />
        </div>

        {/* Buildings */}
        <div className="form-group">
          <label>Building(s):</label>
          {buildings.map((building, index) => (
            <input
              key={index}
              type="text"
              name={`building-${index}`}
              value={building}
              onChange={(e) => handleBuildingChange(index, e.target.value)}
              required={index === 0} // Only the first building is required
              placeholder={`Enter building ${index + 1}`}
              className="building-input"
            />
          ))}
          <button type="button" className="add-building-button" onClick={addBuildingField}>
            + Add Another Building
          </button>
        </div>

        {/* Property LLC */}
        <div className="form-group">
          <label htmlFor="propertyLLC">Property LLC:</label>
          <input
            type="text"
            id="propertyLLC"
            name="propertyLLC"
            value={formData.propertyLLC}
            onChange={handleChange}
            required
            placeholder="Enter Property LLC"
          />
        </div>

        {/* Address */}
        <div className="form-group">
          <label htmlFor="address">Address:</label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            placeholder="Enter property address"
            rows="2"
          ></textarea>
        </div>

        {/* NOI Notice Address */}
        <div className="form-group">
          <label htmlFor="noiNoticeAddress">NOI Notice Address:</label>
          <textarea
            id="noiNoticeAddress"
            name="noiNoticeAddress"
            value={formData.noiNoticeAddress}
            onChange={handleChange}
            required
            placeholder="Enter NOI Notice Address"
            rows="2"
          ></textarea>
        </div>

        {/* Contract Signer Email */}
        <div className="form-group">
          <label htmlFor="contractSignerEmail">Contract Signer Email:</label>
          <input
            type="email"
            id="contractSignerEmail"
            name="contractSignerEmail"
            value={formData.contractSignerEmail}
            onChange={handleChange}
            required
            placeholder="Enter signer email"
          />
        </div>

        {/* Contract Signer First Name */}
        <div className="form-group">
          <label htmlFor="contractSignerFirstName">Contract Signer First Name:</label>
          <input
            type="text"
            id="contractSignerFirstName"
            name="contractSignerFirstName"
            value={formData.contractSignerFirstName}
            onChange={handleChange}
            required
            placeholder="Enter signer first name"
          />
        </div>

        {/* Contract Signer Last Name */}
        <div className="form-group">
          <label htmlFor="contractSignerLastName">Contract Signer Last Name:</label>
          <input
            type="text"
            id="contractSignerLastName"
            name="contractSignerLastName"
            value={formData.contractSignerLastName}
            onChange={handleChange}
            required
            placeholder="Enter signer last name"
          />
        </div>

        {/* CoI Requirements PDF */}
        <div className="form-group">
          <label htmlFor="cOIFile">CoI Requirements PDF (Optional):</label>
          <input
            type="file"
            id="cOIFile"
            name="cOIFile"
            accept=".pdf"
            onChange={handleFileChange}
          />
        </div>

        {/* Submit Button */}
        <button type="submit" disabled={loading} className="submit-button">
          {loading ? 'Submitting...' : 'Add Property'}
        </button>
      </form>
    </div>
  );
}

export default AddProperty;