// src/utils/navLinks.js

const navLinks = [
  // Common Links for All Authenticated Users
  { path: '/', name: 'Home', roles: ['client', 'vendor', 'admin'] },

  // Client-specific Links
  { path: '/job-request', name: 'Submit a Job Request', roles: ['client', 'admin'] },
  { path: '/contract-management', name: 'Manage Contracts', roles: ['client', 'admin'] },
  { path: '/contract-template-upload', name: 'Upload Contract Template', roles: ['client', 'admin'] },

  // Vendor-specific Links
  { path: '/job-request-management', name: 'Manage Job Requests', roles: ['vendor', 'admin'] },

  // Admin-specific Links
  { path: '/admin/user-management', name: 'Manage Users', roles: ['admin'] },
  { path: '/admin/jobs', name: 'Manage All Jobs', roles: ['admin'] },
  { path: '/admin/contracts', name: 'Manage All Contracts', roles: ['admin'] },
  { path: '/admin/reporting', name: 'View Reports', roles: ['admin'] },
  { path: '/admin/settings', name: 'System Settings', roles: ['admin'] },
];

export default navLinks;