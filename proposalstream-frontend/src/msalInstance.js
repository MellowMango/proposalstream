// src/msalInstance.js

import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "./msalConfig";

// Initialize MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

export default msalInstance;