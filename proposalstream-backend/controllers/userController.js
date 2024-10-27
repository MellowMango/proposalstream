// controllers/userController.js

import User from '../models/User.js'; // Note the .js extension

// Add the getUserById function
export const getUserById = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Ensure the requesting user is authorized to access this data
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const user = await User.findById(userId);
    if (user) {
      res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// If there are other functions in this file, make sure to export them like this:
// export const someOtherFunction = ...