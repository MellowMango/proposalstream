// src/msalInstance.js

import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "./msalConfig";

// Instantiate MSAL PublicClientApplication
const msalInstance = new PublicClientApplication(msalConfig);

export default msalInstance;