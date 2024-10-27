import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import DocumentViewer from './DocumentViewer';
import mammoth from 'mammoth';
import './ContractTemplateUpload.css';
import ContractTemplatesList from './ContractTemplatesList';
import ViewTemplateModal from './ViewTemplateModal';
import EditTemplateModal from './EditTemplateModal';

function ContractTemplateUpload({ showNotification }) {
  const [file, setFile] = useState(null);
  const [availableFields, setAvailableFields] = useState([]);
  const [selectedFields, setSelectedFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [htmlContent, setHtmlContent] = useState(null);
  
  // New state variables for contract type and custom name
  const [contractType, setContractType] = useState('service agreement');
  const [customContractName, setCustomContractName] = useState('');

  // New state for managing modals or views
  const [viewingTemplate, setViewingTemplate] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);

  useEffect(() => {
    const init = async () => {
      await fetchTemplates();
      await fetchAvailableFields();
    };
    init();
  }, [fetchTemplates, fetchAvailableFields]);

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/api/contract-templates');
      setTemplates(response.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      showNotification(`Error fetching templates: ${error.response?.data?.message || error.message}`, 'error');
    }
  };

  const fetchAvailableFields = async () => {
    try {
      const response = await api.get('/api/contract-templates/available-fields');
      setAvailableFields(response.data);
    } catch (error) {
      console.error('Error fetching available fields:', error);
      showNotification(`Error fetching available fields: ${error.response?.data?.message || error.message}`, 'error');
    }
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      setFile(selectedFile);
      const htmlContent = await convertDocxToHtml(selectedFile);
      setHtmlContent(htmlContent);
    } else {
      showNotification('Please select a valid DOCX file', 'error');
    }
  };

  const convertDocxToHtml = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target.result;
        try {
          const result = await mammoth.convertToHtml({ arrayBuffer });
          resolve(result.value);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFieldSelect = (fieldInfo) => {
    setSelectedFields([...selectedFields, { ...fieldInfo, id: Date.now() }]);
  };

  const handleFieldRemove = (field) => {
    setSelectedFields(selectedFields.filter(f => f !== field));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!htmlContent) {
      showNotification('Please select a file', 'error');
      return;
    }

    if (selectedFields.length === 0) {
      showNotification('Please select at least one mail merge field', 'error');
      return;
    }

    // If contract type is 'other', ensure custom name is provided
    if (contractType === 'other' && customContractName.trim() === '') {
      showNotification('Please provide a custom name for the contract template', 'error');
      return;
    }

    setLoading(true);
    const templateData = {
      htmlContent,
      fields: selectedFields,
      originalFileName: file.name,
      contractType: contractType === 'other' ? customContractName : contractType
    };

    try {
      await api.post('/api/contract-templates', templateData);
      showNotification('Contract template uploaded successfully', 'success');
      setFile(null);
      setHtmlContent(null);
      setSelectedFields([]);
      setContractType('service agreement');
      setCustomContractName('');
      fetchTemplates();
    } catch (error) {
      showNotification(`Error uploading template: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contract template?')) {
      return;
    }
    try {
      await api.delete(`/api/contract-templates/${id}`);
      showNotification('Contract template deleted successfully', 'success');
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      showNotification(`Error deleting template: ${error.response?.data?.message || error.message}`, 'error');
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    // Logic to open an edit form/modal
  };

  const handleView = (template) => {
    setViewingTemplate(template);
    // Logic to open a view modal or navigate to a detailed view page
  };

  return (
    <div className="contract-template-upload">
      <h2>Upload Contract Template</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="contractType">Contract Type:</label>
          <select
            id="contractType"
            value={contractType}
            onChange={(e) => setContractType(e.target.value)}
          >
            <option value="service agreement">Service Agreement</option>
            <option value="change order">Change Order</option>
            <option value="professional services agreement">Professional Services Agreement</option>
            <option value="other">Other Contract Type</option>
          </select>
        </div>
        {contractType === 'other' && (
          <div>
            <label htmlFor="customContractName">Custom Contract Name:</label>
            <input
              type="text"
              id="customContractName"
              value={customContractName}
              onChange={(e) => setCustomContractName(e.target.value)}
              placeholder="Enter custom contract name"
            />
          </div>
        )}
        <div>
          <label htmlFor="template">Contract Template (DOCX):</label>
          <input type="file" id="template" accept=".docx" onChange={handleFileChange} />
        </div>
        {file && (
          <DocumentViewer 
            file={file} 
            onFieldSelect={handleFieldSelect} 
            availableFields={availableFields}
            showNotification={showNotification} 
            selectedFields={selectedFields}
          />
        )}
        <div className="selected-fields">
          <h3>Selected Fields</h3>
          <ul>
            {selectedFields.map((field, index) => (
              <li key={index}>
                <div className="field-info">
                  <span className="field-name">{field.name}</span>
                  <span className="field-text">{field.text}</span>
                </div>
                <button type="button" onClick={() => handleFieldRemove(field)}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload Template'}
        </button>
      </form>

      <ContractTemplatesList 
        templates={templates} 
        onDelete={handleDelete} 
        onEdit={handleEdit} 
        onView={handleView} 
      />

      {/* Modals or Separate Components for Viewing and Editing */}
      {viewingTemplate && (
        <ViewTemplateModal 
          template={viewingTemplate} 
          onClose={() => setViewingTemplate(null)} 
        />
      )}

      {editingTemplate && (
        <EditTemplateModal 
          template={editingTemplate} 
          onClose={() => setEditingTemplate(null)} 
          onUpdated={() => {
            setEditingTemplate(null);
            fetchTemplates();
            showNotification('Contract template updated successfully', 'success');
          }} 
          showNotification={showNotification}
        />
      )}
    </div>
  );
}

export default ContractTemplateUpload;
