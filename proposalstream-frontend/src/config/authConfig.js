// src/config/authConfig.js

export const authConfig = {
    clientId: 'YOUR_CLIENT_ID', // Replace with your actual client ID
    authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID', // Replace with your tenant ID
    redirectUri: 'http://localhost:3000', // Replace with your redirect URI
    postLogoutRedirectUri: 'http://localhost:3000', // Replace with your post-logout redirect URI
    // Add other necessary configurations as needed
  };