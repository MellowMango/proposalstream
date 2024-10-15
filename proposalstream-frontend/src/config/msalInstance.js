// src/config/msalInstance.js

import { PublicClientApplication } from "@azure/msal-browser";
import msalConfig from "./msalConfig"; // Corrected Import

const msalInstance = new PublicClientApplication(msalConfig);

export default msalInstance;
