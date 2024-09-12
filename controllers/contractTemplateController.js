import ContractTemplate from '../models/ContractTemplate.js';
import { fileExists } from '../utils/fileUtils.js';
import logger from '../utils/logger.js';
import Job from '../models/Job.js';
import Proposal from '../models/Proposal.js';
import User from '../models/User.js';

export const getAllTemplates = async (req, res) => {
  try {
    const templates = await ContractTemplate.find({ user: req.user.id }).lean();
    res.status(200).json(templates);
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
      const exists = await fileExists(template.filePath);
      return {
        id: template._id,
        filePath: template.filePath,
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
    const { htmlContent, fields, originalFileName } = req.body;
    const newTemplate = new ContractTemplate({
      user: req.user.id,
      htmlContent,
      originalFileName,
      fields
    });
    await newTemplate.save();
    res.status(201).json({ message: 'Contract template created successfully', template: newTemplate });
  } catch (error) {
    logger.error('Error creating contract template:', error);
    res.status(500).json({ message: 'Error creating contract template', error: error.message });
  }
};
