import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import ContractTemplate from '../models/ContractTemplate.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';
import { getAllTemplates, getAvailableFields, checkAllTemplates } from '../controllers/contractTemplateController.js';
import mammoth from 'mammoth';
import { PDFDocument } from 'pdf-lib';
import { Document } from 'docx';
import Job from '../models/Job.js';
import Proposal from '../models/Proposal.js';
import User from '../models/User.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/contract-templates';
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and DOCX files are allowed.'));
    }
  }
});

router.post('/', authenticateToken, authorizeRoles('client', 'admin'), async (req, res) => {
  try {
    const { htmlContent, fields, originalFileName } = req.body;

    if (!htmlContent || !fields || !originalFileName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newTemplate = new ContractTemplate({
      user: req.user.id,
      htmlContent,
      originalFileName,
      fields
    });

    await newTemplate.save();
    res.status(201).json({ message: 'Contract template uploaded successfully', template: newTemplate });
  } catch (error) {
    console.error('Error uploading contract template:', error);
    res.status(500).json({ message: 'Error uploading contract template', error: error.message });
  }
});

router.get('/', authenticateToken, authorizeRoles('client', 'admin'), async (req, res) => {
  try {
    console.log('Fetching templates for user:', req.user.id);
    const templates = await ContractTemplate.find({ user: req.user.id });
    console.log('Templates found:', templates);
    res.json(templates);
  } catch (error) {
    console.error('Error fetching contract templates:', error);
    res.status(500).json({ message: 'Error fetching contract templates', error: error.message });
  }
});

router.get('/available-fields', authenticateToken, authorizeRoles('client', 'admin'), async (req, res) => {
  try {
    console.log('Fetching available fields');

    const jobFields = Object.keys(Job.schema.paths);
    const proposalFields = Object.keys(Proposal.schema.paths);
    const userFields = Object.keys(User.schema.paths);

    const availableFields = [...new Set([...jobFields, ...proposalFields, ...userFields])];
    console.log('Available fields:', availableFields);
    res.json(availableFields);
  } catch (error) {
    console.error('Error fetching available fields:', error);
    res.status(500).json({ message: 'Error fetching available fields', error: error.message });
  }
});

router.get('/check', authenticateToken, authorizeRoles('admin'), checkAllTemplates);

export default router;
