// src/msalInstance.js

import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "./msalConfig";

// **Single Instance (Existing)**
export const msalInstance = new PublicClientApplication(msalConfig);

// **Added Below: Separate Instances for ProposalStream and MicrosoftProvider**
export const msalInstanceProposalStream = new PublicClientApplication(msalConfig);
export const msalInstanceMicrosoftProvider = new PublicClientApplication(msalConfig);