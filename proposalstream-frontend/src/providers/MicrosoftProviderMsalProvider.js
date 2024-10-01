// src/providers/MicrosoftProviderMsalProvider.js

import React from 'react';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfigMicrosoftProvider } from '../msalConfigMicrosoftProvider';

export const msalInstanceMicrosoftProvider = new PublicClientApplication(msalConfigMicrosoftProvider);

const MicrosoftProviderMsalProvider = ({ children }) => {
  return (
    <MsalProvider instance={msalInstanceMicrosoftProvider}>
      {children}
    </MsalProvider>
  );
};

export default MicrosoftProviderMsalProvider;