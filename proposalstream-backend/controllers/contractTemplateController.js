import ContractTemplate from '../models/ContractTemplate.js';
import { fileExists } from '../utils/fileUtils.js';
import logger from '../utils/logger.js';
import Job from '../models/Job.js';
import Proposal from '../models/Proposal.js';
import User from '../models/User.js';
import crypto from 'crypto';
import { BlobServiceClient } from '@azure/storage-blob';
import { contractTemplatesContainerClient } from '../config/db.js';  // Correct import
import path from 'path';

// Helper function to convert stream to string
const streamToString = async (readableStream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (data) => {
      chunks.push(data.toString());
    });
    readableStream.on("end", () => {
      resolve(chunks.join(""));
    });
    readableStream.on("error", reject);
  });
};

const encryptData = (data, key) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let encrypted = cipher.update(data);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

const decryptData = (data, key) => {
  try {
    if (!data) throw new Error('No data provided for decryption.');

    const parts = data.split(':');
    if (parts.length !== 2) throw new Error('Invalid encrypted data format.');

    const [ivHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const encryptedText = Buffer.from(encryptedHex, 'hex');
    
    if (iv.length !== 16) throw new Error('Invalid IV length.');

    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    logger.error('Error decrypting data:', error);
    throw error; // Propagate the error
  }
};

export const getAllTemplates = async (req, res) => {
  try {
    const templates = await ContractTemplate.find({ user: req.user.id }).lean();
    const encryptionKey = process.env.ENCRYPTION_KEY;

    const decryptedTemplates = await Promise.all(templates.map(async (template) => {
      if (!template.blobName) {
        logger.warn(`Template ID ${template._id} does not have a blobName.`);
        return { ...template, htmlContent: null };
      }

      const blobClient = contractTemplatesContainerClient.getBlobClient(template.blobName);
      const downloadBlockBlobResponse = await blobClient.download(0);
      const downloaded = await streamToString(downloadBlockBlobResponse.readableStreamBody);
      
      let decryptedHtmlContent = '';
      try {
        decryptedHtmlContent = decryptData(downloaded, encryptionKey);
      } catch (decryptError) {
        decryptedHtmlContent = 'Error decrypting content.';
      }

      return {
        ...template,
        htmlContent: decryptedHtmlContent
      };
    }));

    res.status(200).json(decryptedTemplates);
  } catch (error) {
    logger.error('Error fetching contract templates:', error);
    res.status(500).json({ message: 'Error fetching contract templates', error: error.message });
  }
};

export const getAvailableFields = async (req, res) => {
  try {
    const jobFields = Object.keys(Job.schema.paths);
    const proposalFields = Object.keys(Proposal.schema.paths);
    const userFields = Object.keys(User.schema.paths);

    const availableFields = [...new Set([...jobFields, ...proposalFields, ...userFields])];
    res.status(200).json(availableFields);
  } catch (error) {
    logger.error('Error fetching available fields:', error);
    res.status(500).json({ message: 'Error fetching available fields', error: error.message });
  }
};

export const checkAllTemplates = async (req, res) => {
  try {
    const templates = await ContractTemplate.find();
    const results = await Promise.all(templates.map(async (template) => {
      if (!template.blobName) {
        return {
          id: template._id,
          blobName: null,
          exists: false
        };
      }

      const blobClient = contractTemplatesContainerClient.getBlobClient(template.blobName);
      const exists = await blobClient.exists();
      return {
        id: template._id,
        blobName: template.blobName,
        exists: exists
      };
    }));

    const missingTemplates = results.filter(result => !result.exists);

    if (missingTemplates.length > 0) {
      logger.warn('Some template files are missing:', missingTemplates);
      return res.status(200).json({ 
        message: 'Some template files are missing', 
        missingTemplates: missingTemplates 
      });
    }

    return res.status(200).json({ message: 'All template files exist' });
  } catch (error) {
    logger.error('Error checking templates:', error);
    res.status(500).json({ error: 'Error checking templates', details: error.message });
  }
};

export const createTemplate = async (req, res) => {
  try {
    const { htmlContent, fields, originalFileName, contractType } = req.body;
    
    if (!htmlContent || !fields || !originalFileName || !contractType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const encryptionKey = process.env.ENCRYPTION_KEY;
    const encryptedContent = encryptData(htmlContent, encryptionKey);
    
    const blobName = `${req.user.id}-${originalFileName}-${Date.now()}`;
    const blockBlobClient = contractTemplatesContainerClient.getBlockBlobClient(blobName);
    
    await blockBlobClient.upload(encryptedContent, Buffer.byteLength(encryptedContent, 'utf8'));
    
    const newTemplate = new ContractTemplate({
      user: req.user.id,
      originalFileName,
      blobName,
      fields,
      contractType
      // Do not include htmlContent here
    });
    await newTemplate.save();
    
    res.status(201).json({ message: 'Contract template created successfully', template: newTemplate });
  } catch (error) {
    logger.error('Error creating contract template:', error);
    res.status(500).json({ message: 'Error creating contract template', error: error.message });
  }
};

export const getTemplateById = async (req, res) => {
  try {
    const template = await ContractTemplate.findOne({ _id: req.params.id, user: req.user.id }).lean();
    if (!template) {
      return res.status(404).json({ message: 'Contract template not found' });
    }

    if (!template.blobName) {
      logger.error('No blobName found for the template.');
      return res.status(400).json({ message: 'Invalid template data. Missing blobName.' });
    }
    
    const encryptionKey = process.env.ENCRYPTION_KEY;
    const blobClient = contractTemplatesContainerClient.getBlobClient(template.blobName);
    const downloadBlockBlobResponse = await blobClient.download(0);
    const downloaded = await streamToString(downloadBlockBlobResponse.readableStreamBody);

    let decryptedContent = '';
    try {
      decryptedContent = decryptData(downloaded, encryptionKey);
    } catch (decryptError) {
      decryptedContent = 'Error decrypting content.';
    }
    
    res.status(200).json({ ...template, htmlContent: decryptedContent });
  } catch (error) {
    logger.error('Error fetching contract template by ID:', error);
    res.status(500).json({ message: 'Error fetching contract template', error: error.message });
  }
};

export const deleteTemplate = async (req, res) => {
  try {
    const template = await ContractTemplate.findOne({ _id: req.params.id, user: req.user.id });
    if (!template) {
      return res.status(404).json({ message: 'Contract template not found' });
    }

    if (!template.blobName) {
      logger.error('No blobName found for the template.');
      return res.status(400).json({ message: 'Invalid template data. Missing blobName.' });
    }

    // Delete the blob from Azure Storage
    const blobClient = contractTemplatesContainerClient.getBlobClient(template.blobName);
    const exists = await blobClient.exists();
    if (exists) {
      await blobClient.delete();
      logger.info(`Blob ${template.blobName} deleted successfully.`);
    } else {
      logger.warn(`Blob ${template.blobName} not found in Azure Storage.`);
    }

    // Delete the record from the database
    await ContractTemplate.deleteOne({ _id: req.params.id });

    res.status(200).json({ message: 'Contract template deleted successfully' });
  } catch (error) {
    logger.error('Error deleting contract template:', error);
    res.status(500).json({ message: 'Error deleting contract template', error: error.message });
  }
};

export const updateTemplate = async (req, res) => {
  try {
    const { fields, contractType } = req.body;

    // Validate input
    if (!fields || !Array.isArray(fields)) {
      return res.status(400).json({ message: 'Fields must be an array' });
    }

    if (!contractType || typeof contractType !== 'string') {
      return res.status(400).json({ message: 'Contract type must be a string' });
    }

    // If contractType is 'other', ensure a custom name is provided
    let updatedContractType = contractType;
    if (contractType.toLowerCase() === 'other') {
      if (!req.body.customContractName || req.body.customContractName.trim() === '') {
        return res.status(400).json({ message: 'Custom contract name is required for "Other" contract type' });
      }
      updatedContractType = req.body.customContractName.trim();
    }

    const template = await ContractTemplate.findOne({ _id: req.params.id, user: req.user.id });
    if (!template) {
      return res.status(404).json({ message: 'Contract template not found' });
    }

    // Update fields
    template.fields = fields;
    template.contractType = updatedContractType;
    template.updatedAt = Date.now();

    await template.save();

    res.status(200).json({ message: 'Contract template updated successfully', template });
  } catch (error) {
    logger.error('Error updating contract template:', error);
    res.status(500).json({ message: 'Error updating contract template', error: error.message });
  }
};

// Example function using the container client
export const uploadContractTemplate = async (req, res) => {
  try {
    const blobName = `contract_template_${Date.now()}${path.extname(req.file.originalname)}`;
    const blockBlobClient = contractTemplatesContainerClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadData(req.file.buffer, {
      blobHTTPHeaders: { blobContentType: req.file.mimetype },
    });
    const url = blockBlobClient.url;

    res.status(201).json({ message: 'Contract template uploaded successfully.', url });
  } catch (error) {
    console.error('Error uploading contract template:', error.message);
    res.status(500).json({ message: 'Server error while uploading contract template.' });
  }
};
