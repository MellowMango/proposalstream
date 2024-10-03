// proposalstream-frontend/src/msalConfig.js

import { LogLevel } from "@azure/msal-browser";

export const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_CLIENT_ID, // Unified client ID
    authority: `https://${process.env.REACT_APP_TENANT_NAME}.b2clogin.com/${process.env.REACT_APP_TENANT_NAME}.onmicrosoft.com/B2C_1_signupsignin`, // Single user flow
    knownAuthorities: [`${process.env.REACT_APP_TENANT_NAME}.b2clogin.com`],
    redirectUri: process.env.REACT_APP_REDIRECT_URI,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
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

// Define and export a single login request
export const loginRequest = {
  scopes: ['openid', 'profile', 'email', 'User.Read'], // Adjust scopes as needed
};

// **Added Below: Separate Login Requests for ProposalStream and MicrosoftProvider**
export const loginRequestProposalStream = {
  scopes: ['openid', 'profile', 'email', 'User.Read', 'your_proposalstream_scope'], // Adjust scopes as needed
};

export const loginRequestMicrosoftProvider = {
  scopes: ['openid', 'profile', 'email', 'User.Read'], // Scopes for Microsoft
};