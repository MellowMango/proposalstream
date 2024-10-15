import React, { useContext } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { AuthContext } from '../CombinedAuthContext';
import navLinks from '../utils/navLinks'; // Import the centralized navLinks
import './Dashboard.css'; // Import the CSS file for styling

function Dashboard({ showNotification }) {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Function to filter links based on user roles and exclude the Home link
  const getFilteredLinks = () => {
    return navLinks.filter(
      (link) => link.roles.some((role) => user.roles.includes(role)) && link.path !== '/'
    );
  };

  // Separate links by category for better UI (optional)
  const categorizedLinks = {
    client: [],
    vendor: [],
    admin: [],
  };

  getFilteredLinks().forEach((link) => {
    // Categorize Client Links
    if (link.roles.includes('client')) {
      categorizedLinks.client.push(link);
    }

    // Categorize Vendor Links
    if (link.roles.includes('vendor')) {
      categorizedLinks.vendor.push(link);
    }

    // Categorize Admin Links (Only if the link is exclusively for admin)
    if (link.roles.includes('admin') && link.roles.length === 1) {
      categorizedLinks.admin.push(link);
    }
  });

  // Helper function to create option cards based on categories
  const createOptionCard = (title, links, category) => (
    <div className={`option-card ${category}`} key={title}>
      <h2>{title} Options</h2>
      <ul>
        {links.map((link) => (
          <li key={link.path}>
            <Link to={link.path}>{link.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Welcome to Your Dashboard</h1>
      <p className="dashboard-greeting">Hello, {user.email}!</p>
      <div className="options-container">
        {/* Render Client Options if applicable */}
        {(user.roles.includes('client') || user.roles.includes('admin')) &&
          categorizedLinks.client.length > 0 &&
          createOptionCard('Client', categorizedLinks.client, 'client')}

        {/* Render Vendor Options if applicable */}
        {(user.roles.includes('vendor') || user.roles.includes('admin')) &&
          categorizedLinks.vendor.length > 0 &&
          createOptionCard('Vendor', categorizedLinks.vendor, 'vendor')}

        {/* Render Admin Options if applicable */}
        {user.roles.includes('admin') &&
          categorizedLinks.admin.length > 0 &&
          createOptionCard('Admin', categorizedLinks.admin, 'admin')}
      </div>
    </div>
  );
}

export default Dashboard;