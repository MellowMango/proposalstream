// src/msalConfig.js

import { LogLevel } from "@azure/msal-browser";

// Console logs for environment variables
console.log("REACT_APP_PROPOSALSTREAM_CLIENT_ID:", process.env.REACT_APP_PROPOSALSTREAM_CLIENT_ID);
console.log("REACT_APP_PROPOSALSTREAM_TENANT_NAME:", process.env.REACT_APP_PROPOSALSTREAM_TENANT_NAME);
console.log("REACT_APP_POLICY:", process.env.REACT_APP_POLICY);
console.log("REACT_APP_PROPOSALSTREAM_REDIRECT_URI:", process.env.REACT_APP_PROPOSALSTREAM_REDIRECT_URI);

const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_PROPOSALSTREAM_CLIENT_ID,
    authority: `https://${process.env.REACT_APP_PROPOSALSTREAM_TENANT_NAME}.b2clogin.com/${process.env.REACT_APP_PROPOSALSTREAM_TENANT_NAME}.onmicrosoft.com/${process.env.REACT_APP_POLICY}`,
    redirectUri: process.env.REACT_APP_PROPOSALSTREAM_REDIRECT_URI,
  },
  cache: {
    cacheLocation: 'localStorage', // or 'sessionStorage'
    storeAuthStateInCookie: false, // Set to true if issues arise on IE11 or Edge
  },
};

export default msalConfig;

// Updated loginRequest scopes for redirect-based authentication
export const loginRequest = {
  scopes: [
    "openid",
    "profile",
    "offline_access",
    "https://proposalstreamb2c.onmicrosoft.com/c2f76643-7852-4308-adfc-99538cdee2c5/Files.Read"
  ],
};