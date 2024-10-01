import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import ContractTemplate from '../models/ContractTemplate.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';
import { getAllTemplates, getAvailableFields, checkAllTemplates, createTemplate, deleteTemplate, updateTemplate, getTemplateById } from '../controllers/contractTemplateController.js';
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

// Updated POST route to handle contract type and custom name
router.post('/', authenticateToken, authorizeRoles('client', 'admin'), createTemplate);

router.get('/', authenticateToken, authorizeRoles('client', 'admin'), getAllTemplates);

router.get('/available-fields', authenticateToken, authorizeRoles('client', 'admin'), getAvailableFields);

router.get('/check', authenticateToken, authorizeRoles('admin'), checkAllTemplates);

router.get('/:id', authenticateToken, authorizeRoles('client', 'admin'), getTemplateById);

router.put('/:id', authenticateToken, authorizeRoles('client', 'admin'), updateTemplate);

router.delete('/:id', authenticateToken, authorizeRoles('client', 'admin'), deleteTemplate);

export default router;
