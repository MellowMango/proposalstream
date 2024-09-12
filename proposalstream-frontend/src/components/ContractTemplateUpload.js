import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import DocumentViewer from './DocumentViewer';
import mammoth from 'mammoth';

function ContractTemplateUpload({ showNotification }) {
  const [file, setFile] = useState(null);
  const [availableFields, setAvailableFields] = useState([]);
  const [selectedFields, setSelectedFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [htmlContent, setHtmlContent] = useState(null);

  useEffect(() => {
    fetchTemplates();
    fetchAvailableFields();
  }, []);

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

    setLoading(true);
    const templateData = {
      htmlContent,
      fields: selectedFields,
      originalFileName: file.name
    };

    try {
      const response = await api.post('/api/contract-templates', templateData);
      showNotification('Contract template uploaded successfully', 'success');
      setFile(null);
      setHtmlContent(null);
      setSelectedFields([]);
      fetchTemplates();
    } catch (error) {
      showNotification(`Error uploading template: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contract-template-upload">
      <h2>Upload Contract Template</h2>
      <form onSubmit={handleSubmit}>
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
                {field.name} - {field.text}
                <button type="button" onClick={() => handleFieldRemove(field)}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload Template'}
        </button>
      </form>

      <div className="existing-templates">
        <h3>Existing Templates</h3>
        <ul>
          {templates.map((template) => (
            <li key={template._id}>
              {template.originalFileName} - Fields: {template.fields.map(f => f.name).join(', ')}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ContractTemplateUpload;
