import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

function Header() {
  const { user, logout } = useContext(AuthContext);

  return (
    <header>
      <nav>
        <ul>
          <li><Link to="/">New Job Request</Link></li>
          <li><Link to="/job-request-management">Job Request Management</Link></li>
          <li><Link to="/vendor-submission">Vendor Submission</Link></li>
          <li><Link to="/contract-management">Contract Management</Link></li>
          <li><Link to="/contract-template-upload">Upload Contract Template</Link></li>
          {user ? (
            <>
              <li>Welcome, {user.email}</li>
              <li><button onClick={logout}>Logout</button></li>
            </>
          ) : (
            <>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
