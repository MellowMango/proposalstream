import React from 'react';
import './ContractTemplatesList.css';

function ContractTemplatesList({ templates, onDelete, onEdit, onView }) {
  return (
    <div className="contract-templates-list">
      <h3>Existing Templates</h3>
      {templates.length === 0 ? (
        <p>No templates uploaded yet.</p>
      ) : (
        <ul>
          {templates.map((template) => (
            <li key={template._id}>
              <div className="template-info">
                <span className="template-name">{template.originalFileName}</span> - 
                <span className="template-type">{template.contractType}</span> - 
                <span className="template-fields">Fields: {template.fields.map(f => f.name).join(', ')}</span>
              </div>
              <div className="template-actions">
                <button onClick={() => onView(template)}>View</button>
                <button onClick={() => onEdit(template)}>Edit</button>
                <button onClick={() => onDelete(template._id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ContractTemplatesList;