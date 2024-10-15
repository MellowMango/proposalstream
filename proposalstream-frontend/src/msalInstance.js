// src/msalInstance.js

import { PublicClientApplication } from '@azure/msal-browser';
import msalConfig from './msalConfig'; // Ensure the path is correct

const msalInstance = new PublicClientApplication(msalConfig);

export default msalInstance;