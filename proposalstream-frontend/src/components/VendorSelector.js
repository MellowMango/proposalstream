import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getBackendUrl } from '../utils/api';
import './VendorSelector.css';

function VendorSelector({ selectedVendor, onVendorChange }) {
  const [vendors, setVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVendors, setFilteredVendors] = useState([]);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const baseUrl = await getBackendUrl();
        const token = localStorage.getItem('token');
        const response = await axios.get(`${baseUrl}/api/vendors`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // Assume backend returns only necessary fields
        setVendors(response.data);
        setFilteredVendors(response.data);
      } catch (error) {
        console.error('Error fetching vendors:', error);
      }
    };

    fetchVendors();
  }, []);

  useEffect(() => {
    const results = vendors.filter((vendor) =>
      vendor.vendorLLC.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVendors(results);
  }, [searchTerm, vendors]);

  return (
    <div className="vendor-selector">
      <input
        type="text"
        placeholder="Search vendors..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <select
        value={selectedVendor}
        onChange={(e) => onVendorChange(e.target.value)}
        required
      >
        <option value="">Select a Vendor</option>
        {filteredVendors.map((vendor) => (
          <option key={vendor._id} value={vendor._id}>
            {vendor.vendorLLC}
          </option>
        ))}
      </select>
    </div>
  );
}

export default VendorSelector;