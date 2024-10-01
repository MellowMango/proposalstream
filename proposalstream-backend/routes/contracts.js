import express from 'express';
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import * as contractController from '../controllers/contractController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';
import logger from '../utils/logger.js';
import { createContractRules, updateContractRules } from '../middleware/validationRules.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();

// Configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Specify the directory where files should be saved
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Use a unique filename
  }
});

const upload = multer({ storage: storage });

// @route   POST /contracts
// @desc    Create a new contract
// @access  Public
router.post('/', authenticateToken, authorizeRoles('admin'), upload.single('pdfScopeOfWork'), createContractRules, validateRequest, (req, res, next) => {
  logger.info(`Received request to create contract: ${JSON.stringify(req.body)}`);
  contractController.createContract(req, res, next);
});

// @route   GET /contracts
// @desc    Get all contracts
// @access  Public
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    logger.info('GET /api/contracts route hit');
    await contractController.getAllContracts(req, res);
  } catch (error) {
    logger.error('Error in GET /contracts route:', error);
    next(error);
  }
});

// @route   GET /contracts/:id
// @desc    Get a contract by ID
// @access  Public
router.get('/:id', authenticateToken, (req, res, next) => {
  logger.info(`Received request to get contract by ID: ${req.params.id}`);
  contractController.getContractById(req, res, next);
});

// @route   PUT /contracts/:id
// @desc    Update a contract by ID
// @access  Public
router.put('/:id', authenticateToken, authorizeRoles('admin'), updateContractRules, validateRequest, (req, res, next) => {
  logger.info(`Received request to update contract: ${req.params.id}`);
  contractController.updateContract(req, res, next);
});

// @route   DELETE /contracts/:id
// @desc    Delete a contract by ID
// @access  Public
router.delete('/:id', authenticateToken, authorizeRoles('admin'), (req, res, next) => {
  logger.info(`Received request to delete contract: ${req.params.id}`);
  contractController.deleteContract(req, res, next);
});

export default router;