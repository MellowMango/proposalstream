import express from 'express';
import * as jobController from '../controllers/jobController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';
import logger from '../utils/logger.js';
import { createJobRules } from '../middleware/validationRules.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = express.Router();

// @route   POST /jobs
// @desc    Create a new job (formerly job request)
// @access  Private (client, admin)
router.post('/', authenticateToken, authorizeRoles('client', 'admin'), createJobRules, validateRequest, (req, res, next) => {
  logger.info(`Received request to create job: ${JSON.stringify(req.body)}`);
  jobController.createJob(req, res, next);
});

// @route   GET /jobs
// @desc    Get all jobs
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    logger.info(`Received request to get all jobs: page=${req.query.page}, limit=${req.query.limit}`);
    await jobController.getAllJobs(req, res);
  } catch (error) {
    logger.error('Error in getAllJobs route:', error);
    res.status(500).json({ error: 'Server Error', details: error.message });
  }
});

// @route   GET /jobs/:id
// @desc    Get a job by ID
// @access  Private
router.get('/:id', authenticateToken, (req, res, next) => {
  logger.info(`Received request to get job by ID: ${req.params.id}`);
  jobController.getJobById(req, res, next);
});

// @route   PUT /jobs/:id
// @desc    Update a job by ID
// @access  Private (client, admin)
router.put('/:id', authenticateToken, authorizeRoles('client', 'admin'), (req, res, next) => {
  logger.info(`Received request to update job: ${req.params.id}`);
  jobController.updateJob(req, res, next);
});

// @route   DELETE /jobs/:id
// @desc    Delete a job by ID
// @access  Private (admin, vendor)
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'vendor'), (req, res, next) => {
  logger.info(`Received request to delete job: ${req.params.id}`);
  jobController.deleteJob(req, res, next);
});

// @route   PUT /jobs/:id/approve-proposal
// @desc    Approve a proposal and create a contract
// @access  Private (client, admin)
router.put('/:id/approve-proposal', authenticateToken, authorizeRoles('client', 'admin'), (req, res, next) => {
  logger.info(`Received request to approve proposal for job: ${req.params.id}`);
  jobController.approveProposalAndCreateContract(req, res, next);
});

// @route   PUT /jobs/:id/status
// @desc    Update job status
// @access  Private (client, admin)
router.put('/:id/status', authenticateToken, authorizeRoles('client', 'admin'), (req, res, next) => {
  logger.info(`Received request to update job status: ${req.params.id}`);
  jobController.updateJobStatus(req, res, next);
});

// @route   PUT /jobs/:id/request-revision
// @desc    Request revision of a proposal
// @access  Private (client, admin)
router.put('/:id/request-revision', authenticateToken, authorizeRoles('client', 'admin'), (req, res, next) => {
  logger.info(`Received request to request revision for job: ${req.params.id}`);
  jobController.requestRevision(req, res, next);
});

export default router;