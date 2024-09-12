import React, { useContext } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

function Dashboard({ showNotification }) {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" />;
  }

  const clientOptions = (
    <div>
      <h2>Client Options</h2>
      <ul>
        <li><Link to="/job-request">Submit a Job Request</Link></li>
        <li><Link to="/contract-management">Manage Contracts</Link></li>
        <li><Link to="/contract-template-upload">Upload Contract Template</Link></li>
      </ul>
    </div>
  );

  const vendorOptions = (
    <div>
      <h2>Vendor Options</h2>
      <ul>
        <li><Link to="/job-request-management">Manage Job Requests</Link></li>
        <li><Link to="/vendor-submission">Submit a Proposal</Link></li>
      </ul>
    </div>
  );

  const adminOptions = (
    <div>
      <h2>Admin Options</h2>
      <ul>
        <li><Link to="/admin/user-management">Manage Users</Link></li>
        <li><Link to="/admin/jobs">Manage All Jobs</Link></li>
        <li><Link to="/admin/contracts">Manage All Contracts</Link></li>
        <li><Link to="/contract-template-upload">Upload Contract Template</Link></li>
      </ul>
    </div>
  );

  return (
    <div className="dashboard">
      <h1>Welcome to Your Dashboard</h1>
      <p>Hello, {user.email}!</p>
      {(user.role === 'client' || user.role === 'admin') && clientOptions}
      {(user.role === 'vendor' || user.role === 'admin') && vendorOptions}
      {user.role === 'admin' && adminOptions}
    </div>
  );
}

export default Dashboard;
