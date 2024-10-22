// src/msalConfig.js

import { LogLevel } from "@azure/msal-browser";

// Console logs for environment variables (Optional: Remove in production)
console.log("REACT_APP_PROPOSALSTREAM_CLIENT_ID:", process.env.REACT_APP_PROPOSALSTREAM_CLIENT_ID);
console.log("REACT_APP_PROPOSALSTREAM_TENANT_NAME:", process.env.REACT_APP_PROPOSALSTREAM_TENANT_NAME);
console.log("REACT_APP_POLICY:", process.env.REACT_APP_POLICY);
console.log("REACT_APP_PROPOSALSTREAM_REDIRECT_URI:", process.env.REACT_APP_PROPOSALSTREAM_REDIRECT_URI);

const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_PROPOSALSTREAM_CLIENT_ID, // Azure AD B2C Client ID
    authority: `https://${process.env.REACT_APP_PROPOSALSTREAM_TENANT_NAME}.b2clogin.com/${process.env.REACT_APP_PROPOSALSTREAM_TENANT_NAME}.onmicrosoft.com/${process.env.REACT_APP_POLICY}`, // Azure AD B2C Authority
    knownAuthorities: [`${process.env.REACT_APP_PROPOSALSTREAM_TENANT_NAME}.b2clogin.com`], // Known Authorities
    redirectUri: process.env.REACT_APP_PROPOSALSTREAM_REDIRECT_URI, // Redirect URI
  },
  cache: {
    cacheLocation: "sessionStorage", // Changed from 'localStorage' to 'sessionStorage' for enhanced security
    storeAuthStateInCookie: false, // Set to true for IE11
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            break;
          case LogLevel.Info:
            console.info(message);
            break;
          case LogLevel.Verbose:
            console.debug(message);
            break;
          case LogLevel.Warning:
            console.warn(message);
            break;
          default:
            break;
        }
      },
      piiLoggingEnabled: false,
      logLevel: LogLevel.Info,
    },
  },
};

export default msalConfig;

// Login request scopes
export const loginRequest = {
  scopes: [
    "openid",
    "profile",
    "offline_access",
    "https://proposalstreamb2c.onmicrosoft.com/c2f76643-7852-4308-adfc-99538cdee2c5/Files.Read",
  ],
};

// Token request scopes
export const tokenRequest = {
  scopes: [
    "https://proposalstreamb2c.onmicrosoft.com/c2f76643-7852-4308-adfc-99538cdee2c5/Files.Read",
    // Add any additional scopes your application requires
  ],
};
