import express from 'express';
import multer from 'multer';
import path from 'path';
import * as proposalController from '../controllers/proposalController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';
import logger from '../utils/logger.js';
import { createProposalRules } from '../middleware/validationRules.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = express.Router();

// Configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.fieldname === "scopeOfWork") {
      cb(null, true);
    } else {
      cb(new Error("Unexpected field"));
    }
  }
});

// @route   POST /proposals
// @desc    Create a new proposal
// @access  Public
router.post('/', authenticateToken, authorizeRoles('vendor'), upload.single('scopeOfWork'), createProposalRules, validateRequest, (req, res, next) => {
  logger.info(`Received request to create proposal: ${JSON.stringify(req.body)}`);
  proposalController.createProposal(req, res, next);
});

// @route   GET /proposals
// @desc    Get all proposals
// @access  Public
router.get('/', authenticateToken, (req, res, next) => {
  logger.info(`Received request to get all proposals: page=${req.query.page}, limit=${req.query.limit}`);
  proposalController.getAllProposals(req, res, next);
});

// @route   GET /proposals/:id
// @desc    Get a proposal by ID
// @access  Public
router.get('/:id', authenticateToken, (req, res, next) => {
  logger.info(`Received request to get proposal by ID: ${req.params.id}`);
  proposalController.getProposalById(req, res, next);
});

// @route   PUT /proposals/:id
// @desc    Update a proposal by ID
// @access  Public
router.put('/:id', authenticateToken, authorizeRoles('vendor'), (req, res, next) => {
  logger.info(`Received request to update proposal: ${req.params.id}`);
  proposalController.updateProposal(req, res, next);
});

// @route   DELETE /proposals/:id
// @desc    Delete a proposal by ID
// @access  Public
router.delete('/:id', authenticateToken, authorizeRoles('admin'), (req, res, next) => {
  logger.info(`Received request to delete proposal: ${req.params.id}`);
  proposalController.deleteProposal(req, res, next);
});

// @route   PUT /proposals/:id/approve
// @desc    Approve a proposal by ID
// @access  Public
router.put('/:id/approve', authenticateToken, authorizeRoles('client', 'admin'), (req, res, next) => {
  logger.info(`Received request to approve proposal: ${req.params.id} with template: ${req.body.templateId}`);
  proposalController.approveProposal(req, res, next);
});

// @route   PUT /proposals/:id/status
// @desc    Update proposal status
// @access  Public
router.put('/:id/status', authenticateToken, authorizeRoles('client', 'admin'), (req, res, next) => {
  logger.info(`Received request to update proposal status: ${req.params.id}`);
  proposalController.updateProposalStatus(req, res, next);
});

// @route   PUT /proposals/:id/revise
// @desc    Request revision for a proposal by ID
// @access  Public
router.put('/:id/revise', authenticateToken, authorizeRoles('client', 'admin'), (req, res, next) => {
  logger.info(`Received request to revise proposal: ${req.params.id}`);
  proposalController.requestRevision(req, res, next);
});

// @route   PUT /proposals/:id/submit-revision
// @desc    Submit a revised proposal by ID
// @access  Public
router.put('/:id/submit-revision', authenticateToken, authorizeRoles('vendor'), upload.single('scopeOfWork'), (req, res, next) => {
  logger.info(`Received request to submit revision for proposal: ${req.params.id}`);
  proposalController.submitRevision(req, res, next);
});

// Test route to verify proposals route is working
router.get('/test', (req, res) => {
  res.json({ message: 'Proposals route is working' });
});

export default router;
