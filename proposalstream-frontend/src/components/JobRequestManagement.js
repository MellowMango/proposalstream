import React, { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import Modal from './Modal';
import { getBackendUrl } from '../utils/api';
import { AuthContext } from '../contexts/AuthContext';
import { jwtDecode } from 'jwt-decode';

function JobRequestManagement({ showNotification }) {
  const { user, logout } = useContext(AuthContext);
  const [jobRequests, setJobRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJobRequest, setSelectedJobRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scopeOfWork, setScopeOfWork] = useState(null);
  const [vendorId, setVendorId] = useState('');
  const [vendors, setVendors] = useState([]);

  const fetchJobRequests = useCallback(async () => {
    try {
      setLoading(true);
      const baseUrl = await getBackendUrl();
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const response = await axios.get(`${baseUrl}/api/jobs?populate=proposal`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data && Array.isArray(response.data.jobs)) {
        setJobRequests(response.data.jobs);
      } else {
        console.error('Unexpected response format:', response.data);
        setError('Received invalid data format for job requests');
        showNotification('Error fetching job requests: Invalid data format', 'error');
      }
    } catch (error) {
      console.error('Error fetching job requests:', error);
      setError('Failed to fetch job requests');
      showNotification(`Error fetching job requests: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const fetchVendors = useCallback(async () => {
    try {
      const baseUrl = await getBackendUrl();
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      console.log('Fetching vendors from:', `${baseUrl}/api/vendors`);
      console.log('Using token:', token);
      const response = await axios.get(`${baseUrl}/api/vendors`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Vendors fetched:', response.data);
      setVendors(response.data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
        if (error.response.status === 403) {
          console.error('Invalid token. Attempting to refresh...');
          showNotification('Session expired. Please log in again.', 'error');
          logout();
          // Redirect to login page or show login modal
        } else {
          showNotification(`Error fetching vendors: ${error.response.data.error || 'Unknown error'}`, 'error');
        }
      } else if (error.request) {
        console.error('Error request:', error.request);
        showNotification('Error fetching vendors: No response received', 'error');
      } else {
        console.error('Error message:', error.message);
        showNotification(`Error fetching vendors: ${error.message}`, 'error');
      }
    }
  }, [showNotification, logout]);

  useEffect(() => {
    fetchJobRequests();
    fetchVendors();

    return () => {
      setJobRequests([]);  // Reset jobRequests when component unmounts
    };
  }, [fetchJobRequests, fetchVendors]);

  const handleJobRequestClick = async (jobRequest) => {
    setLoading(true);
    try {
      const baseUrl = await getBackendUrl();
      const response = await axios.get(`${baseUrl}/api/jobs/${jobRequest._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSelectedJobRequest(response.data);
      setIsModalOpen(true);
      setScopeOfWork(null);
      setVendorId('');
    } catch (error) {
      console.error('Error fetching updated job request:', error);
      showNotification('Error fetching updated job request', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event) => {
    setScopeOfWork(event.target.files[0]);
  };

  const handleSubmitProposal = async () => {
    if (!selectedJobRequest || !scopeOfWork || !vendorId) {
      showNotification('Please fill all fields and attach a scope of work', 'error');
      return;
    }

    try {
      setLoading(true);
      const baseUrl = await getBackendUrl();
      const formData = new FormData();
      formData.append('jobId', selectedJobRequest._id);
      formData.append('vendorId', vendorId);
      formData.append('scopeOfWork', scopeOfWork, scopeOfWork.name);

      console.log('Submitting proposal with data:', {
        jobId: selectedJobRequest._id,
        vendorId: vendorId,
        scopeOfWork: scopeOfWork.name,
        baseUrl: baseUrl
      });

      const response = await axios.post(`${baseUrl}/api/proposals`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log('Proposal submission response:', response.data);
      showNotification('Proposal submitted successfully', 'success');
      setIsModalOpen(false);
      await fetchJobRequests();
    } catch (error) {
      console.error('Error submitting proposal:', error);
      if (error.response) {
        console.error('Error data:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
        showNotification(`Error submitting proposal: ${error.response.data.error || 'Unknown error'}`, 'error');
      } else if (error.request) {
        console.error('Error request:', error.request);
        showNotification('Error submitting proposal: No response received', 'error');
      } else {
        console.error('Error message:', error.message);
        showNotification(`Error submitting proposal: ${error.message}`, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProposal = async (jobId) => {
    try {
      setLoading(true);
      const baseUrl = await getBackendUrl();
      await axios.put(`${baseUrl}/api/jobs/${jobId}/approve-proposal`, null, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      showNotification('Proposal approved successfully', 'success');
      await fetchJobRequests();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error approving proposal:', error);
      showNotification('Error approving proposal', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJobRequest = async (jobId) => {
    try {
      setLoading(true);
      const baseUrl = await getBackendUrl();
      const token = localStorage.getItem('token');
      console.log('Deleting job request with token:', token);

      const response = await axios.delete(`${baseUrl}/api/jobs/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Delete response:', response.data);
      showNotification('Job request deleted successfully', 'success');
      await fetchJobRequests();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error deleting job request:', error);
      showNotification('Error deleting job request', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReviseProposal = async (jobId) => {
    if (!scopeOfWork) {
      showNotification('Please upload a new scope of work', 'error');
      return;
    }

    try {
      setLoading(true);
      const baseUrl = await getBackendUrl();
      const formData = new FormData();
      formData.append('jobId', jobId);
      formData.append('vendorId', vendorId);
      formData.append('scopeOfWork', scopeOfWork, scopeOfWork.name);

      const response = await axios.put(`${baseUrl}/api/proposals/${jobId}/submit-revision`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      showNotification('Proposal revision submitted successfully', 'success');
      
      // Update the local state to reflect the change
      setSelectedJobRequest(prevState => ({
        ...prevState,
        proposal: {
          ...prevState.proposal,
          status: 'Submitted' // Or whatever status your backend returns
        }
      }));

      // Update the job requests list
      setJobRequests(prevRequests => 
        prevRequests.map(request => 
          request._id === jobId 
            ? {
                ...request, 
                proposal: {
                  ...request.proposal,
                  status: 'Submitted' // Or whatever status your backend returns
                }
              }
            : request
        )
      );

      setIsModalOpen(false);
    } catch (error) {
      console.error('Error submitting proposal revision:', error);
      showNotification('Error submitting proposal revision', 'error');
    } finally {
      setLoading(false);
    }
  };

  const checkTokenExpiration = useCallback(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      if (decodedToken.exp * 1000 < Date.now()) {
        showNotification('Your session has expired. Please log in again.', 'error');
        logout();
        // Redirect to login page
      }
    }
  }, [showNotification, logout]);

  useEffect(() => {
    checkTokenExpiration();
    // ... other effect logic
  }, [checkTokenExpiration]);

  if (loading) {
    return <div>Loading job requests...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="job-request-management">
      <h2>Job Management</h2>
      {!Array.isArray(jobRequests) ? (
        <p>Error: Invalid job requests data</p>
      ) : jobRequests.length === 0 ? (
        <p>No job requests available.</p>
      ) : (
        <ul>
          {jobRequests.map((jobRequest) => (
            <li key={jobRequest._id} onClick={() => handleJobRequestClick(jobRequest)}>
              Building: {jobRequest.building || 'Unknown Building'} - 
              Client: {jobRequest.clientName || 'Unknown Client'} - 
              Status: {jobRequest.status || 'Pending'} - 
              Proposal: {jobRequest.proposal ? 
                (jobRequest.proposal.status === 'Deleted' ? 'Deleted' : 'Submitted') : 
                'Not Submitted'}
            </li>
          ))}
        </ul>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {selectedJobRequest && (
          <div>
            <h3>Job Request Details</h3>
            <p>Building: {selectedJobRequest.building || 'Unknown'}</p>
            <p>Client: {selectedJobRequest.clientName || 'Unknown'}</p>
            <p>Request Details: {selectedJobRequest.requestDetails || 'Not provided'}</p>
            <p>Service Type: {selectedJobRequest.serviceType || 'Not specified'}</p>
            <p>Status: {selectedJobRequest.status || 'Pending'}</p>
            
            {!selectedJobRequest.proposal && (
              <div>
                <h4>Submit New Proposal</h4>
                <input type="file" onChange={handleFileChange} accept=".pdf" />
                <select 
                  value={vendorId} 
                  onChange={(e) => setVendorId(e.target.value)}
                >
                  <option value="">Select a Vendor</option>
                  {vendors.map((vendor) => (
                    <option key={vendor._id} value={vendor._id}>
                      {vendor.vendorLLC}
                    </option>
                  ))}
                </select>
                <button onClick={handleSubmitProposal} disabled={loading || !scopeOfWork || !vendorId}>
                  {loading ? 'Submitting...' : 'Submit Proposal'}
                </button>
              </div>
            )}
            
            {/* Delete Job Request button */}
            <button 
              onClick={() => handleDeleteJobRequest(selectedJobRequest._id)} 
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete Job Request'}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default JobRequestManagement;