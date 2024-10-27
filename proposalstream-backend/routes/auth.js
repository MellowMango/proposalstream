import express from 'express';
import * as authController from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Registration and Login Routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Get Current User Route (Protected)
router.get('/me', authenticateToken, authController.getCurrentUser);

// Register Admin Route
router.post('/register-admin', authController.registerAdmin);

// Remove the secured-endpoint route as it's not defined in the controller
export default router;
