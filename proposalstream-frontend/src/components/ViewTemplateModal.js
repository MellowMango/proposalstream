import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import './ViewTemplateModal.css';

function ViewTemplateModal({ template, onClose }) {
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTemplateContent = async () => {
      try {
        const response = await api.get(`/api/contract-templates/${template._id}`);
        setHtmlContent(response.data.htmlContent);
      } catch (error) {
        console.error('Error fetching template content:', error);
        setError('Failed to load template content.');
      } finally {
        setLoading(false);
      }
    };
    fetchTemplateContent();
  }, [template._id]);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>×</button>
        <h3>{template.originalFileName}</h3>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <div className="template-html-content" dangerouslySetInnerHTML={{ __html: htmlContent }}></div>
        )}
      </div>
    </div>
  );
}

export default ViewTemplateModal;