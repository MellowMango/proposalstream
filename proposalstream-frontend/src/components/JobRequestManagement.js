import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from '../CombinedAuthContext';
import VendorSelector from './VendorSelector';
import {
  Box,
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  styled,
  Stack,
  IconButton,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  CheckCircle as ApproveIcon,
  Edit as ReviseIcon,
  Upload as UploadIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  maxWidth: 800,
  margin: '20px auto',
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    cursor: 'pointer',
  },
}));

const UploadButton = styled('label')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1, 2),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderRadius: theme.shape.borderRadius,
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

function JobRequestManagement({ showNotification }) {
  const { logout } = useAuth();
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
      const response = await api.get('/api/jobs?populate=proposal');
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
      const response = await api.get('/api/vendors');
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
          // Optionally, redirect to login page
          window.location.href = '/login';
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
      const response = await api.get(`/api/jobs/${jobRequest._id}`);
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
      const formData = new FormData();
      formData.append('jobId', selectedJobRequest._id);
      formData.append('vendorId', vendorId);
      formData.append('scopeOfWork', scopeOfWork, scopeOfWork.name);

      console.log('Submitting proposal with data:', {
        jobId: selectedJobRequest._id,
        vendorId: vendorId,
        scopeOfWork: scopeOfWork.name,
      });

      const response = await api.post('/api/proposals', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
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
      await api.put(`/api/jobs/${jobId}/approve-proposal`);
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
      await api.delete(`/api/jobs/${jobId}`);
      console.log('Delete response:', 'Success');
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
      const formData = new FormData();
      formData.append('jobId', jobId);
      formData.append('vendorId', vendorId);
      formData.append('scopeOfWork', scopeOfWork, scopeOfWork.name);

      await api.put(`/api/proposals/${jobId}/submit-revision`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
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

  // Custom Dialog Component
  const CustomDialog = ({ open, onClose, children }) => (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ pr: 6 }}>
        Job Request Details
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {children}
      </DialogContent>
    </Dialog>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <StyledPaper>
        <Typography variant="h4" component="h2" gutterBottom align="center">
          Job Management
        </Typography>

        {!Array.isArray(jobRequests) ? (
          <Alert severity="error">Invalid job requests data</Alert>
        ) : jobRequests.length === 0 ? (
          <Alert severity="info">No job requests available.</Alert>
        ) : (
          <List>
            {jobRequests.map((jobRequest) => (
              <StyledListItem 
                key={jobRequest._id} 
                onClick={() => handleJobRequestClick(jobRequest)}
              >
                <ListItemText
                  primary={
                    <Typography variant="subtitle1">
                      Building: {jobRequest.building || 'Unknown Building'}
                    </Typography>
                  }
                  secondary={
                    <Stack spacing={1}>
                      <Typography variant="body2">
                        Client: {jobRequest.client || 'Unknown Client'}
                      </Typography>
                      <Typography variant="body2">
                        Status: {jobRequest.status || 'Pending'}
                      </Typography>
                      <Typography variant="body2">
                        Proposal: {jobRequest.proposal ? 
                          (jobRequest.proposal.status === 'Deleted' ? 'Deleted' : 'Submitted') : 
                          'Not Submitted'}
                      </Typography>
                    </Stack>
                  }
                />
              </StyledListItem>
            ))}
          </List>
        )}

        <CustomDialog 
          open={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
        >
          {selectedJobRequest && (
            <Stack spacing={3}>
              <Typography variant="h6">Details</Typography>
              <Stack spacing={2}>
                <Typography>Building: {selectedJobRequest.building || 'Unknown'}</Typography>
                <Typography>Client: {selectedJobRequest.client || 'Unknown'}</Typography>
                <Typography>Request Details: {selectedJobRequest.requestDetails || 'Not provided'}</Typography>
                <Typography>Service Type: {selectedJobRequest.serviceType || 'Not specified'}</Typography>
                <Typography>Status: {selectedJobRequest.status || 'Pending'}</Typography>
              </Stack>

              <Divider />

              {!selectedJobRequest.proposal ? (
                <Box>
                  <Typography variant="h6" gutterBottom>Submit New Proposal</Typography>
                  <Stack spacing={2}>
                    <UploadButton>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf"
                        style={{ display: 'none' }}
                        id="scope-of-work-upload"
                      />
                      <UploadIcon />
                      {scopeOfWork ? scopeOfWork.name : 'Upload Scope of Work'}
                    </UploadButton>

                    <VendorSelector 
                      selectedVendor={vendorId} 
                      onVendorChange={setVendorId}
                      vendors={vendors}
                    />

                    <Button
                      variant="contained"
                      onClick={handleSubmitProposal}
                      disabled={loading || !scopeOfWork || !vendorId}
                      startIcon={loading ? <CircularProgress size={20} /> : null}
                    >
                      {loading ? 'Submitting...' : 'Submit Proposal'}
                    </Button>
                  </Stack>
                </Box>
              ) : (
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleApproveProposal(selectedJobRequest._id)}
                    disabled={loading}
                    startIcon={<ApproveIcon />}
                  >
                    {loading ? 'Approving...' : 'Approve Proposal'}
                  </Button>

                  <Button
                    variant="contained"
                    color="info"
                    onClick={() => handleReviseProposal(selectedJobRequest._id)}
                    disabled={loading}
                    startIcon={<ReviseIcon />}
                  >
                    {loading ? 'Revising...' : 'Revise Proposal'}
                  </Button>
                </Stack>
              )}

              <Button
                variant="contained"
                color="error"
                onClick={() => handleDeleteJobRequest(selectedJobRequest._id)}
                disabled={loading}
                startIcon={<DeleteIcon />}
              >
                {loading ? 'Deleting...' : 'Delete Job Request'}
              </Button>
            </Stack>
          )}
        </CustomDialog>
      </StyledPaper>
    </Container>
  );
}

export default JobRequestManagement;
