import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Modal from './Modal';
import api, { getBackendUrl } from '../utils/api';
import './ContractManagement.css';

function ContractManagement({ showNotification }) {
  const [contracts, setContracts] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [pdfUrl, setPdfUrl] = useState(null);
  const [contractTemplates, setContractTemplates] = useState([]);

  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      console.log('Starting to fetch data');
      setLoading(true);
      setError(null);
      const baseUrl = await getBackendUrl();
      
      console.log('Fetching contracts from:', `${baseUrl}/api/contracts`);
      const contractsResponse = await api.get('/api/contracts', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Contracts fetched:', JSON.stringify(contractsResponse.data, null, 2));
      
      console.log('Fetching proposals from:', `${baseUrl}/api/proposals`);
      const proposalsResponse = await api.get('/api/proposals', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Proposals fetched:', JSON.stringify(proposalsResponse.data, null, 2));
      
      setContracts(Array.isArray(contractsResponse.data) ? contractsResponse.data : []);
      setProposals(Array.isArray(proposalsResponse.data.proposals) 
        ? proposalsResponse.data.proposals.filter(proposal => proposal.status !== 'Deleted')
        : []
      );
      console.log('Data fetch completed');
    } catch (error) {
      console.error('Error fetching data:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setError(`Failed to fetch data: ${error.message}`);
      showNotification(`Error fetching data: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const fetchContractTemplates = useCallback(async () => {
    try {
      const response = await api.get('/api/contract-templates', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Templates found:', response.data);
      setContractTemplates(response.data);
    } catch (error) {
      console.error('Error fetching contract templates:', error);
      showNotification(`Error fetching contract templates: ${error.response?.data?.message || error.message}`, 'error');
    }
  }, [showNotification]);

  useEffect(() => {
    if (error) {
      return;
    }
    fetchData();
    fetchContractTemplates();
  }, [fetchData, fetchContractTemplates, error]);

  const handleItemClick = async (item, type) => {
    setSelectedItem(item);
    setModalType(type);
    setIsModalOpen(true);

    if (item.pdfScopeOfWork) {
      try {
        const baseUrl = await getBackendUrl();
        const pdfPath = item.pdfScopeOfWork.replace(/\\/g, '/');
        setPdfUrl(`${baseUrl}/${pdfPath}`);
      } catch (error) {
        console.error('Error setting PDF URL:', error);
        showNotification('Error loading PDF', 'error');
      }
    } else {
      setPdfUrl(null);
    }
  };

  const handleApproveProposal = async (proposalId) => {
    if (contractTemplates.length === 0) {
      showNotification('No contract templates available. Please upload a template first.', 'error');
      return;
    }

    try {
      setLoading(true);
      const selectedTemplateId = document.getElementById('templateSelect').value;
      
      if (!selectedTemplateId) {
        showNotification('Please select a contract template', 'error');
        return;
      }

      console.log(`Approving proposal ${proposalId} with template ${selectedTemplateId}`);

      const approveResponse = await api.put(`/api/proposals/${proposalId}/approve`, {
        templateId: selectedTemplateId
      });
      
      console.log('Approve response:', approveResponse);

      if (approveResponse.status !== 200) {
        throw new Error(approveResponse.data.error || 'Failed to approve proposal');
      }
      
      const newContract = approveResponse.data.contract;
      
      if (!newContract || !newContract._id) {
        throw new Error('Invalid contract data received from server');
      }
      
      showNotification('Proposal approved and contract created successfully', 'success');
      setIsModalOpen(false);
      
      setProposals(prevProposals => prevProposals.map(p => 
        p._id === proposalId ? { ...p, status: 'Approved' } : p
      ));
      setContracts(prevContracts => [...prevContracts, newContract]);
      
      setSelectedItem(newContract);
      setModalType('contract');
      
      const baseUrl = await getBackendUrl();
      const pdfPath = newContract.mergedContractPdf?.replace(/\\/g, '/');
      if (pdfPath) {
        setPdfUrl(`${baseUrl}/${pdfPath}`);
      } else {
        console.warn('No merged contract PDF path received');
        setPdfUrl(null);
      }
      
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error approving proposal and creating contract:', error);
      console.error('Error response:', error.response?.data);
      showNotification(`Error: ${error.response?.data?.details || error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveContract = async () => {
    if (!selectedItem) return;
    try {
      setLoading(true);
      const baseUrl = await getBackendUrl();
      const response = await api.put(`/api/contracts/${selectedItem._id}`, {
        contractStatus: 'Approved'
      });
      
      if (response.status === 200) {
        showNotification('Contract approved successfully', 'success');
        setIsModalOpen(false);
        
        // Update the contracts list
        setContracts(prevContracts => 
          prevContracts.map(contract => 
            contract._id === selectedItem._id ? {...contract, contractStatus: 'Approved'} : contract
          )
        );
        
        // Update the related proposal status
        if (selectedItem.proposal) {
          await api.put(`/api/proposals/${selectedItem.proposal._id}`, {
            status: 'Contract Approved'
          });
        }
      } else {
        throw new Error('Failed to approve contract');
      }
    } catch (error) {
      console.error('Error approving contract:', error);
      showNotification('Error approving contract', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReviseProposal = async (proposalId) => {
    try {
      setLoading(true);
      const baseUrl = await getBackendUrl();
      
      // Find the proposal
      const proposal = proposals.find(p => p._id === proposalId);
      
      if (!proposal) {
        throw new Error('Proposal not found');
      }
      
      // Check if the proposal has a job or jobRequest property
      const jobId = proposal.job?._id || proposal.jobRequest?._id;
      
      if (!jobId) {
        throw new Error('No job found for this proposal');
      }
      
      console.log('Requesting revision for proposal:', proposalId);
      console.log('Associated job ID:', jobId);
      console.log('Request URL:', `${baseUrl}/api/jobs/${jobId}/request-revision`);
      
      const response = await api.put(`/api/jobs/${jobId}/request-revision`);
      console.log('Response:', response.data);
      
      const updatedJob = response.data.job;
      const updatedProposal = response.data.proposal;

      // Update the local state immediately
      setProposals(prevProposals => 
        prevProposals.map(proposal => 
          proposal._id === proposalId 
            ? {...proposal, status: updatedProposal.status} 
            : proposal
        )
      );
      
      // Update the selected item if it's the one being revised
      if (selectedItem && selectedItem._id === proposalId) {
        setSelectedItem(prevItem => ({...prevItem, status: updatedProposal.status}));
      }

      showNotification('Revision request sent for proposal', 'success');
      setIsModalOpen(false);
      
      // Refresh all data from the backend
      await fetchData();
    } catch (error) {
      console.error('Error requesting revision for proposal:', error);
      console.error('Error details:', error.response?.data);
      showNotification(`Error requesting revision for proposal: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContract = async () => {
    if (!selectedItem) return;
    try {
      setLoading(true);
      const baseUrl = await getBackendUrl();
      await api.delete(`/api/contracts/${selectedItem._id}`);
      showNotification('Contract deleted successfully', 'success');
      setIsModalOpen(false);
      await fetchData();
    } catch (error) {
      console.error('Error deleting contract:', error);
      showNotification('Error deleting contract', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProposal = async (proposalId) => {
    try {
      setLoading(true);
      await api.put(`/api/proposals/${proposalId}/status`, { newStatus: 'Deleted' });
      showNotification('Proposal marked as deleted successfully', 'success');
      setIsModalOpen(false);
      await fetchData();
    } catch (error) {
      console.error('Error deleting proposal:', error);
      showNotification('Error deleting proposal', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProposalStatusChange = async (proposalId, newStatus) => {
    try {
      setLoading(true);
      const baseUrl = await getBackendUrl();
      await api.put(`/api/proposals/${proposalId}/status`, { newStatus });
      showNotification(`Proposal status updated to ${newStatus}`, 'success');
      await fetchData();
    } catch (error) {
      console.error('Error updating proposal status:', error);
      showNotification('Error updating proposal status', 'error');
    } finally {
      setLoading(false);
    }
  };

  console.log('Rendering ContractManagement, proposals:', proposals);
  console.log('Rendering ContractManagement, contracts:', contracts);
  console.log('Rendering ContractManagement, contractTemplates:', contractTemplates);

  if (!loading && contractTemplates.length === 0) {
    return (
      <div className="contract-management no-templates">
        <h2>Contract Management</h2>
        <p>No contract templates found. Please upload a contract template to proceed.</p>
        <Link to="/contract-template-upload">
          <button className="navigate-button">Upload Contract Template</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="contract-management">
      <h2>Client Dashboard</h2>
      <button onClick={fetchData} disabled={loading}>
        {loading ? 'Refreshing...' : 'Refresh Data'}
      </button>
      <h3>Proposals ({proposals.length})</h3>
      {Array.isArray(proposals) && proposals.length > 0 ? (
        <ul className="proposals-list">
          {proposals.map((proposal) => (
            <li key={proposal._id} onClick={() => handleItemClick(proposal, 'proposal')}>
              Building: {proposal.jobRequest?.building || proposal.job?.building || 'Unknown Building'} - 
              Vendor: {proposal.vendor?.vendorLLC || 'Unknown Vendor'} - 
              Status: {proposal.status || 'Pending'}
            </li>
          ))}
        </ul>
      ) : (
        <p>No proposals available.</p>
      )}
      <h3>Contracts ({contracts.length})</h3>
      {Array.isArray(contracts) && contracts.length > 0 ? (
        <ul className="contracts-list">
          {contracts.map((contract) => (
            <li key={contract._id} onClick={() => handleItemClick(contract, 'contract')}>
              Building: {contract.job?.building || 'Unknown Building'} - 
              Vendor: {contract.vendor?.vendorLLC || 'Unknown Vendor'} - 
              Status: {contract.contractStatus || 'Unknown'}
            </li>
          ))}
        </ul>
      ) : (
        <p>No contracts available.</p>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {selectedItem && (
          <div>
            <h3>{modalType === 'proposal' ? 'Proposal Details' : 'Contract Details'}</h3>
            <p>Building: {selectedItem.jobRequest?.building || selectedItem.job?.building || 'Unknown'}</p>
            <p>Vendor: {selectedItem.vendor?.vendorLLC || 'Unknown'}</p>
            <p>Status: {selectedItem.status || selectedItem.contractStatus || 'Unknown'}</p>
            {pdfUrl && (
              <div>
                <p>{modalType === 'contract' ? 'Merged Contract:' : 'Scope of Work:'}</p>
                <iframe
                  src={pdfUrl}
                  width="100%"
                  height="500px"
                  style={{ border: 'none' }}
                  title={modalType === 'contract' ? 'Merged Contract PDF' : 'Scope of Work PDF'}
                />
              </div>
            )}
            {modalType === 'proposal' && (
              <div className="action-buttons">
                <select id="templateSelect">
                  <option value="">Select a contract template</option>
                  {contractTemplates.map(template => (
                    <option key={template._id} value={template._id}>
                      {template.originalFileName}
                    </option>
                  ))}
                </select>
                <button
                  className="approve"
                  onClick={() => handleApproveProposal(selectedItem._id)}
                  disabled={loading}
                >
                  {loading ? 'Approving...' : 'Approve Proposal'}
                </button>
                <button
                  className="request-revision"
                  onClick={() => handleReviseProposal(selectedItem._id)}
                  disabled={loading}
                >
                  {loading ? 'Requesting Revision...' : 'Request Revision'}
                </button>
                <button
                  className="delete"
                  onClick={() => handleDeleteProposal(selectedItem._id)}
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Delete Proposal'}
                </button>
              </div>
            )}
            {modalType === 'contract' && (
              <div className="action-buttons">
                {selectedItem.contractStatus !== 'Approved' && (
                  <button
                    className="approve"
                    onClick={handleApproveContract}
                    disabled={loading}
                  >
                    {loading ? 'Approving...' : 'Approve Contract'}
                  </button>
                )}
                <button
                  className="delete"
                  onClick={handleDeleteContract}
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Delete Contract'}
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default ContractManagement;