// proposalstream-frontend/src/msalConfig.js

import { LogLevel } from "@azure/msal-browser";

export const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_CLIENT_ID, // Your Azure AD B2C Client ID
    authority: `https://${process.env.REACT_APP_TENANT_NAME}.b2clogin.com/${process.env.REACT_APP_TENANT_NAME}.onmicrosoft.com/B2C_1_signupsignin`, // Your Azure AD B2C Sign-up/Sign-in policy
    knownAuthorities: [`${process.env.REACT_APP_TENANT_NAME}.b2clogin.com`],
    redirectUri: "/", // Ensure this matches a valid route in your app
  },
  cache: {
    cacheLocation: "sessionStorage", // or "localStorage"
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
          default:
            return;
        }
      },
      piiLoggingEnabled: false,
      logLevel: LogLevel.Info,
    },
  },
};

// Define login request scopes
export const loginRequest = {
  scopes: ["openid", "profile", "User.Read"],
};

// Define specific login requests if needed
export const loginRequestProposalStream = {
  scopes: ['openid', 'profile', 'email', 'User.Read', 'your_proposalstream_scope'], // Adjust scopes
};

export const loginRequestMicrosoftProvider = {
  scopes: ['openid', 'profile', 'email', 'User.Read'],
};