import React, { useState } from 'react';
import api from '../utils/api';
import './EditTemplateModal.css';

function EditTemplateModal({ template, onClose, onUpdated, showNotification }) {
  // Initializing contractType safely
  const initialContractType = template.contractType 
    ? (template.contractType.toLowerCase() === 'other' ? 'other' : template.contractType)
    : 'service agreement'; // Default value

  // Initializing customContractName safely
  const initialCustomContractName = 
    template.contractType && template.contractType.toLowerCase() === 'other' 
      ? template.contractType 
      : '';

  const [fields, setFields] = useState(template.fields || []);
  const [contractType, setContractType] = useState(initialContractType);
  const [customContractName, setCustomContractName] = useState(initialCustomContractName);

  const handleFieldChange = (index, key, value) => {
    const updatedFields = [...fields];
    updatedFields[index][key] = value;
    setFields(updatedFields);
  };

  const handleAddField = () => {
    setFields([...fields, { name: '', text: '' }]);
  };

  const handleRemoveField = (index) => {
    const updatedFields = fields.filter((_, idx) => idx !== index);
    setFields(updatedFields);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate fields
    if (fields.length === 0) {
      showNotification('Please add at least one field', 'error');
      return;
    }

    // If contract type is 'other', ensure custom name is provided
    if (contractType === 'other' && customContractName.trim() === '') {
      showNotification('Please provide a custom name for the contract template', 'error');
      return;
    }

    const updatedContractType = contractType === 'other' ? customContractName.trim() : contractType;

    try {
      const response = await api.put(`/api/contract-templates/${template._id}`, {
        fields,
        contractType: updatedContractType
      });
      showNotification('Contract template updated successfully', 'success');
      onUpdated();
    } catch (error) {
      console.error('Error updating template:', error);
      showNotification(`Error updating template: ${error.response?.data?.message || error.message}`, 'error');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>×</button>
        <h3>Edit Contract Template</h3>
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

          <div className="fields-section">
            <h4>Fields</h4>
            {fields.map((field, index) => (
              <div key={index} className="field-item">
                <input 
                  type="text" 
                  placeholder="Field Name" 
                  value={field.name} 
                  onChange={(e) => handleFieldChange(index, 'name', e.target.value)} 
                  required
                />
                <input 
                  type="text" 
                  placeholder="Field Text" 
                  value={field.text} 
                  onChange={(e) => handleFieldChange(index, 'text', e.target.value)} 
                  required
                />
                <button type="button" onClick={() => handleRemoveField(index)}>Remove</button>
              </div>
            ))}
            <button type="button" onClick={handleAddField}>Add Field</button>
          </div>

          <button type="submit" className="submit-button">Update Template</button>
        </form>
      </div>
    </div>
  );
}

export default EditTemplateModal;