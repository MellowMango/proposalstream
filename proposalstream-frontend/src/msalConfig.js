// src/msalConfig.js

import { LogLevel } from "@azure/msal-browser";

// Console logs for environment variables
console.log("REACT_APP_PROPOSALSTREAM_CLIENT_ID:", process.env.REACT_APP_PROPOSALSTREAM_CLIENT_ID);
console.log("REACT_APP_PROPOSALSTREAM_TENANT_NAME:", process.env.REACT_APP_PROPOSALSTREAM_TENANT_NAME);
console.log("REACT_APP_POLICY:", process.env.REACT_APP_POLICY);
console.log("REACT_APP_PROPOSALSTREAM_REDIRECT_URI:", process.env.REACT_APP_PROPOSALSTREAM_REDIRECT_URI);

export const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_PROPOSALSTREAM_CLIENT_ID,
    authority: `https://${process.env.REACT_APP_PROPOSALSTREAM_TENANT_NAME}.b2clogin.com/${process.env.REACT_APP_PROPOSALSTREAM_TENANT_NAME}.onmicrosoft.com/${process.env.REACT_APP_POLICY}`,
    knownAuthorities: [`${process.env.REACT_APP_PROPOSALSTREAM_TENANT_NAME}.b2clogin.com`],
    redirectUri: process.env.REACT_APP_PROPOSALSTREAM_REDIRECT_URI,
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: "localStorage",
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
      logLevel: LogLevel.Verbose, // Set to Verbose for detailed logs
    },
  },
};

// Optional: Configure additional request objects for different scenarios
export const silentRequest = {
  scopes: ["openid", "profile", "offline_access"],
  forceRefresh: false
};

export const tokenRequest = {
  scopes: ["openid", "profile", "offline_access"],
  forceRefresh: false
};

export const loginRequest = {
  scopes: ["openid", "profile", "offline_access"]
};