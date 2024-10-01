import React, { useEffect, useState } from 'react';
import api from '../utils/api';

function Reporting({ showNotification }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await api.get('/api/admin/reports');
        setReports(response.data);
      } catch (error) {
        console.error('Error fetching reports:', error);
        showNotification('Failed to load reports', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [showNotification]);

  if (loading) {
    return <div>Loading reports...</div>;
  }

  return (
    <div className="reporting">
      <h2>Administrative Reports</h2>
      {/* Render reports here */}
      <ul>
        {reports.map(report => (
          <li key={report.id}>{report.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default Reporting;