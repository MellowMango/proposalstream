// config/keys.js
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

const credential = new DefaultAzureCredential();
const vaultName = 'ProposalStreamVault';
const url = `https://proposalstreamvault.vault.azure.net/`;

const client = new SecretClient(url, credential);

// Function to retrieve multiple secrets
export async function getSecrets(secretNames) {
    const secrets = {};
    for (let name of secretNames) {
      const secretValue = await getSecret(name);
      secrets[name] = secretValue;
    }
    return secrets;
  }  