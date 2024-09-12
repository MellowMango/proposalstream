import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

export const authenticateToken = (req, res, next) => {
  logger.info(`Authenticating token for request to ${req.originalUrl}`);
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    logger.warn('No token provided');
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      logger.warn('Invalid token:', err.message);
      return res.status(403).json({ error: 'Invalid token' });
    }
    
    if (!decoded || !decoded.user || !decoded.user.id) {
      logger.warn('Token payload is missing user information');
      return res.status(403).json({ error: 'Invalid token payload' });
    }
    
    req.user = decoded.user;
    logger.info(`Token authenticated successfully for user ID: ${req.user.id}`);
    next();
  });
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      logger.warn('User not found in request object');
      return res.status(403).json({ message: 'User not authenticated' });
    }
    if (!roles.includes(req.user.role) && req.user.role !== 'admin') {
      logger.warn(`Access denied for user ID ${req.user.id} with role ${req.user.role}`);
      return res.status(403).json({ message: 'Access denied' });
    }
    logger.info(`User ID ${req.user.id} authorized with role ${req.user.role}`);
    next();
  };
};
