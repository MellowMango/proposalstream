// proposalstream-frontend/src/msalConfig.js

import { LogLevel } from "@azure/msal-browser";

export const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_CLIENT_ID, // Unified client ID or manage accordingly
    authority: `https://${process.env.REACT_APP_TENANT_NAME}.b2clogin.com/${process.env.REACT_APP_TENANT_NAME}.onmicrosoft.com/B2C_1_signupsignin`, // Use policies as needed
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

// Define and export login requests for different scenarios
export const loginRequestProposalStream = {
  scopes: ['openid', 'profile', 'email', 'your_proposalstream_scope'],
};

export const loginRequestMicrosoftProvider = {
  scopes: ['openid', 'profile', 'User.Read'],
};