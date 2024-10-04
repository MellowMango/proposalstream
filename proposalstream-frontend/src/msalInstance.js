// src/msalInstance.js

import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "./msalConfig";

// Single MSAL instance handling all providers
export const msalInstance = new PublicClientApplication(msalConfig);