import jwt from 'jsonwebtoken';

export const generateTestToken = (userId, role) => {
  const payload = {
    user: {
      id: userId,
      role: role
    }
  };

  return jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret_for_tests', { expiresIn: '1h' });
};
