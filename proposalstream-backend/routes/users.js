import express from 'express';
import { 
  authenticateToken, 
  authorizeRoles, 
  authenticateAzureToken,
  default as authMiddleware // Add this line
} from '../middleware/authMiddleware.js';
import * as userController from '../controllers/userController.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateAzureToken, authorizeRoles('admin'), async (req, res) => {
  try {
    logger.info('Fetching all users');
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    logger.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Clear all non-admin users (admin only)
router.delete('/clear-all', authenticateAzureToken, authorizeRoles('admin'), async (req, res) => {
  try {
    logger.info('Attempting to clear all non-admin users');
    logger.info('User making the request:', req.user);
    
    const result = await User.deleteMany({ role: { $ne: 'admin' } });
    logger.info('Clear all result:', result);

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'No non-admin users found to delete' });
    }

    res.json({ message: `${result.deletedCount} non-admin users deleted successfully`, result });
  } catch (error) {
    logger.error('Error clearing users:', error);
    res.status(500).json({ message: 'Error clearing users', error: error.message });
  }
});

// Delete a specific user (admin only)
router.delete('/:userId', authenticateAzureToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const result = await User.findByIdAndDelete(req.params.userId);
    if (!result) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    logger.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

// New endpoint to handle user-related requests
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Assuming the user information is attached to the request by the authenticateToken middleware
    const user = req.user;
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Return user information (exclude sensitive data like password)
    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      // Add other non-sensitive user fields as needed
    });
  } catch (error) {
    logger.error('Error fetching user:', error);
    res.status(500).json({ error: 'Server Error', details: error.message });
  }
});

// Add the new route
router.get('/:userId', authenticateToken, userController.getUserById);

// Get user by OID
router.get('/:oid', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ oid: req.params.oid }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    logger.error('Error fetching user by OID:', error);
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

// New route to handle user-related requests
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ oid: req.params.userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ hasOnboarded: user.hasOnboarded });
  } catch (error) {
    logger.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

export default router;
