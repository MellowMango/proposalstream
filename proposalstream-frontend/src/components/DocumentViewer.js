import React, { useState, useEffect, useRef } from 'react';
import mammoth from 'mammoth';
import './DocumentViewer.css';

function DocumentViewer({ file, onFieldSelect, availableFields, showNotification, selectedFields }) {
  const [content, setContent] = useState('');
  const [selectedText, setSelectedText] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const loadDocument = async () => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setContent(result.value);
      } catch (error) {
        console.error('Error loading document:', error);
        showNotification('Error loading document. Please try again.', 'error');
      }
    };

    loadDocument();
  }, [file, showNotification]);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection.toString().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      
      setSelectedText({
        text: selection.toString(),
        position: {
          x: rect.x - containerRect.x,
          y: rect.y - containerRect.y,
          width: rect.width,
          height: rect.height
        }
      });
    } else {
      setSelectedText(null);
    }
  };

  const handleFieldNameSubmit = (fieldName) => {
    if (selectedText && fieldName) {
      onFieldSelect({ ...selectedText, name: fieldName });
      setSelectedText(null);
    }
  };

  const renderHighlightedFields = () => {
    return selectedFields.map((field) => (
      <div
        key={field.id}
        style={{
          position: 'absolute',
          left: field.position.x,
          top: field.position.y,
          width: field.position.width,
          height: field.position.height,
          backgroundColor: 'rgba(255, 192, 203, 0.5)',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-20px',
            left: '0',
            backgroundColor: 'white',
            border: '1px solid #ccc',
            padding: '2px 5px',
            fontSize: '12px',
          }}
        >
          {field.name}
        </div>
      </div>
    ));
  };

  return (
    <div className="document-viewer-container">
      <div className="document-viewer" ref={containerRef} onMouseUp={handleTextSelection}>
        <div dangerouslySetInnerHTML={{ __html: content }} />
        {renderHighlightedFields()}
        {selectedText && (
          <FieldNameTooltip
            position={selectedText.position}
            onSubmit={handleFieldNameSubmit}
            availableFields={availableFields}
          />
        )}
      </div>
    </div>
  );
}

function FieldNameTooltip({ position, onSubmit, availableFields }) {
  const [fieldName, setFieldName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(fieldName);
    setFieldName('');
  };

  const tooltipStyle = {
    position: 'absolute',
    top: `${position.y + position.height}px`,
    left: `${position.x}px`,
    backgroundColor: 'white',
    border: '1px solid #ccc',
    padding: '5px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
  };

  return (
    <div className="field-name-tooltip" style={tooltipStyle}>
      <div>
        <select
          value={fieldName}
          onChange={(e) => setFieldName(e.target.value)}
          required
        >
          <option value="">Select a field</option>
          {availableFields.map((field) => (
            <option key={field} value={field}>{field}</option>
          ))}
        </select>
        <button onClick={handleSubmit}>Add Field</button>
      </div>
    </div>
  );
}

export default DocumentViewer;