import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import VendorSelector from './VendorSelector';
import AddVendorModal from './AddVendorModal';
import {
  Box,
  Container,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Paper,
  Alert,
  styled,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  maxWidth: 700,
  margin: '40px auto',
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
}));

const FormContainer = styled('form')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

const VendorSelectorWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  alignItems: 'center',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
}));

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
      };

      await api.post('/api/jobs', payload);
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
    <Container>
      <StyledPaper>
        <Typography variant="h4" component="h2" gutterBottom align="center" 
          sx={{ mb: 3, fontWeight: 600 }}>
          New Job Request
        </Typography>

        {properties.length === 0 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            No properties found. Please{' '}
            <Link to="/add-property" style={{ color: 'inherit', fontWeight: 600 }}>
              add a property
            </Link>
            .
          </Alert>
        )}

        <FormContainer onSubmit={handleSubmit}>
          <FormControl fullWidth>
            <InputLabel id="property-label">Property</InputLabel>
            <Select
              labelId="property-label"
              id="property"
              name="propertyId"
              value={formData.propertyId}
              onChange={handleChange}
              required
              disabled={properties.length === 0}
              label="Property"
            >
              <MenuItem value="">
                <em>Select a Property</em>
              </MenuItem>
              {properties.map((property) => (
                <MenuItem key={property._id} value={property._id}>
                  {property.propertyName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            id="requestDetails"
            name="requestDetails"
            label="Request Details"
            multiline
            rows={4}
            value={formData.requestDetails}
            onChange={handleChange}
            required
            placeholder="Describe your job request in detail"
            fullWidth
          />

          <TextField
            id="serviceType"
            name="serviceType"
            label="Service Type"
            value={formData.serviceType}
            onChange={handleChange}
            required
            placeholder="e.g., Plumbing, Electrical"
            fullWidth
          />

          <VendorSelectorWrapper>
            <Box flexGrow={1}>
              <VendorSelector 
                selectedVendor={formData.vendorId} 
                onVendorChange={handleVendorChange}
              />
            </Box>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => setIsAddVendorModalOpen(true)}
              startIcon={<AddIcon />}
            >
              Add New Vendor
            </Button>
          </VendorSelectorWrapper>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? 'Submitting...' : 'Submit Job Request'}
          </Button>
        </FormContainer>

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
      </StyledPaper>
    </Container>
  );
}

export default JobRequestForm;
