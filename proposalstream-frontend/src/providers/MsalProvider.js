// src/providers/MsalProvider.js

import React from 'react';
import { MsalProvider } from '@azure/msal-react';
import { 
  msalInstanceProposalStream, 
  msalInstanceMicrosoftProvider 
} from '../msalInstance';

const MsalProviderWrapper = ({ children }) => {
  return (
    <MsalProvider instance={msalInstanceProposalStream}>
      <MsalProvider instance={msalInstanceMicrosoftProvider}>
        {children}
      </MsalProvider>
    </MsalProvider>
  );
};

export default MsalProviderWrapper;