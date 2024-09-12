import express from 'express';
import { Router } from 'express';
import * as vendorController from '../controllers/vendorController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';
import logger from '../utils/logger.js';
import { createVendorRules } from '../middleware/validationRules.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();

// Use the controller methods for each route with authentication
router.post('/', authenticateToken, authorizeRoles('admin'), createVendorRules, validateRequest, (req, res, next) => {
  logger.info(`Received request to create vendor: ${JSON.stringify(req.body)}`);
  vendorController.createVendor(req, res, next);
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    logger.info('Received request to get all vendors');
    await vendorController.getAllVendors(req, res);
  } catch (error) {
    logger.error('Error in getAllVendors route:', error);
    res.status(500).json({ error: 'Server Error', details: error.message });
  }
});

router.get('/:id', authenticateToken, (req, res, next) => {
  logger.info(`Received request to get vendor by ID: ${req.params.id}`);
  vendorController.getVendorById(req, res, next);
});

router.put('/:id', authenticateToken, authorizeRoles('admin'), (req, res, next) => {
  logger.info(`Received request to update vendor: ${req.params.id}`);
  vendorController.updateVendor(req, res, next);
});

router.delete('/:id', authenticateToken, authorizeRoles('admin'), (req, res, next) => {
  logger.info(`Received request to delete vendor: ${req.params.id}`);
  vendorController.deleteVendor(req, res, next);
});

export default router;