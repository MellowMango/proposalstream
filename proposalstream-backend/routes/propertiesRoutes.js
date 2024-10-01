import express from 'express';
import multer from 'multer';
import { addProperty, getUserProperties } from '../controllers/propertiesController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js'; // Correct import

const router = express.Router();

// Configure Multer for in-memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

// @route   POST /api/properties
// @desc    Add a new property
// @access  Private (Client and Admin)
router.post('/', authenticateToken, upload.single('cOIFile'), addProperty);

// @route   GET /api/properties
// @desc    Get all properties for the authenticated user
// @access  Private (Client and Admin)
router.get('/', authenticateToken, getUserProperties);

export default router;