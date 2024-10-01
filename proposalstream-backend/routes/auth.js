import express from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate, authorizeRoles, authenticateToken } from '../middleware/authMiddleware.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Registration and Login Routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Get Current User Route (Protected)
router.get('/me', authenticateToken, authController.getCurrentUser);

// Register Admin Route
router.post('/register-admin', authController.registerAdmin);

// Secured Endpoint
router.get('/secured-endpoint', authenticate, (req, res) => {
  res.json({ message: 'This is a secured endpoint.', user: req.user });
});

export default router;