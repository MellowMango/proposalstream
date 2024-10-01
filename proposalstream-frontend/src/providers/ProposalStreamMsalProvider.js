// src/providers/ProposalStreamMsalProvider.js

import React from 'react';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfigProposalStream } from '../msalConfigProposalStream';

export const msalInstanceProposalStream = new PublicClientApplication(msalConfigProposalStream);

const ProposalStreamMsalProvider = ({ children }) => {
  return (
    <MsalProvider instance={msalInstanceProposalStream}>
      {children}
    </MsalProvider>
  );
};

export default ProposalStreamMsalProvider;