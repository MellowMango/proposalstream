import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Vendor from '../models/Vendor.js';
import logger from '../utils/logger.js';

export const register = async (req, res) => {
  try {
    const { email, password, role, vendorData } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      logger.warn('User with email already exists:', email);
      return res.status(400).json({ error: 'User already exists' });
    }

    user = new User({
      email,
      password, // Use the plain password; pre-save hook will hash it
      role,
    });

    await user.save();

    // If the role is vendor, create a Vendor entry
    if (role === 'vendor' && vendorData) {
      // Ensure all required vendor fields are present
      const requiredVendorFields = [
        'vendorLLC',
        'contractSignerEmail',
        'contractSignerFirstName',
        'contractSignerLastName',
        'serviceType',
      ];

      for (const field of requiredVendorFields) {
        if (!vendorData[field]) {
          logger.warn(`Missing vendor field: ${field}`);
          return res.status(400).json({ error: `Missing vendor field: ${field}` });
        }
      }

      // FIXME a new vender is not created, only the user is created
      const vendor = new Vendor({
        user: user._id,
        ...vendorData,
      });

      await vendor.save();
    }

    const payload = {
      user: {
        id: user._id,
        role: user.role,
      },
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, async (err, token) => {
      if (err) {
        logger.error('JWT Sign Error in Register:', err);
        return res.status(500).json({ error: 'Token generation failed' });
      }

      // Fetch user data to send in response
      const userData = await User.findById(user.id).select('-password');

      res.json({ token, user: userData });
    });
  } catch (err) {
    logger.error('Error in user registration:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    logger.info(`Login attempt for email: ${email}`);

    // **Select the password explicitly**
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      logger.warn(`Login attempt with non-existent email: ${email}`);
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      logger.warn(`Invalid password attempt for email: ${email}`);
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, async (err, token) => {
      if (err) {
        logger.error('JWT Sign Error in Login:', err);
        return res.status(500).json({ error: 'Token generation failed' });
      }

      // Exclude password in the response
      const userData = await User.findById(user.id).select('-password');
      logger.info(`Login successful for user: ${email}`);

      res.json({ token, user: userData });
    });
  } catch (err) {
    logger.error('Error in user login:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Add this method to the existing authController.js file
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    logger.error('Error fetching current user:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

export const registerAdmin = async (req, res) => {
  try {
    const { email, password, adminSecretKey } = req.body;

    // Check if the admin secret key is correct
    if (adminSecretKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({ message: 'Invalid admin secret key' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({
      email,
      password, // Use the plain password; pre-save hook will hash it
      role: 'admin',
    });

    await user.save();

    // Generate JWT token
    const payload = {
      user: {
        id: user._id,
        role: user.role,
      },
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, async (err, token) => {
      if (err) {
        logger.error('JWT Sign Error in Register:', err);
        return res.status(500).json({ error: 'Token generation failed' });
      }

      // Fetch user data to send in response
      const userData = await User.findById(user.id).select('-password');

      res.json({ token, user: userData });
    });
  } catch (error) {
    logger.error('Error registering admin:', error);
    res.status(500).json({ message: 'Error registering admin', error: error.message });
  }
};
