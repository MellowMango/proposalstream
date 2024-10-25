import mongoose from 'mongoose';
import { BlobServiceClient } from '@azure/storage-blob';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';  // Assuming you have a logger utility

dotenv.config();

// Validate Essential Environment Variables
const {
  AZURE_STORAGE_CONNECTION_STRING,
  MONGODB_URI,
  CONTRACT_TEMPLATES_CONTAINER,
  PROPERTY_COI_CONTAINER,
  ENCRYPTION_KEY,
} = process.env;

if (!AZURE_STORAGE_CONNECTION_STRING) {
  logger.error('AZURE_STORAGE_CONNECTION_STRING is not defined in environment variables.');
  process.exit(1);
}

if (!MONGODB_URI) {
  logger.error('MONGODB_URI is not defined in environment variables.');
  process.exit(1);
}

if (!CONTRACT_TEMPLATES_CONTAINER) {
  logger.error('CONTRACT_TEMPLATES_CONTAINER is not defined in environment variables.');
  process.exit(1);
}

if (!PROPERTY_COI_CONTAINER) {
  logger.error('PROPERTY_COI_CONTAINER is not defined in environment variables.');
  process.exit(1);
}

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) { // AES-256 requires a 32-byte key
  logger.error('ENCRYPTION_KEY must be set and exactly 32 characters long.');
  process.exit(1);
}

let contractTemplatesContainerClient;
let propertyCoiContainerClient;

// Initialize Azure Blob Storage Containers
const initializeAzureBlob = async () => {
  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    
    // Initialize Contract Templates Container
    contractTemplatesContainerClient = blobServiceClient.getContainerClient(CONTRACT_TEMPLATES_CONTAINER);
    const createContractContainerResponse = await contractTemplatesContainerClient.createIfNotExists();
    if (createContractContainerResponse.succeeded) {
      logger.info(`Container "${CONTRACT_TEMPLATES_CONTAINER}" created.`);
    } else {
      logger.info(`Container "${CONTRACT_TEMPLATES_CONTAINER}" already exists.`);
    }

    // Initialize Property CoI Container
    propertyCoiContainerClient = blobServiceClient.getContainerClient(PROPERTY_COI_CONTAINER);
    const createPropertyCoiContainerResponse = await propertyCoiContainerClient.createIfNotExists();
    if (createPropertyCoiContainerResponse.succeeded) {
      logger.info(`Container "${PROPERTY_COI_CONTAINER}" created.`);
    } else {
      logger.info(`Container "${PROPERTY_COI_CONTAINER}" already exists.`);
    }

  } catch (error) {
    logger.error('Error initializing Azure Blob Storage:', error);
    process.exit(1);
  }
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    await initializeAzureBlob(); // Ensure Azure Blob is initialized before connecting to DB

    const conn = await mongoose.connect(MONGODB_URI, {});

    // Debug Logging to confirm the active database
    console.log(`Connected to database: ${mongoose.connection.name}`);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    // Debug Logging for connection errors
    console.error('Database connection error:', err);
    logger.error('MongoDB connection error:', err.message);
    process.exit(1); // Exit process with failure
  }
};

export { connectDB, contractTemplatesContainerClient, propertyCoiContainerClient };