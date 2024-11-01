import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { errorHandler } from './middleware/errorHandler.js';
import logger from './utils/logger.js';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

dotenv.config();

// Import routes
import jobsRoutes from './routes/jobs.js';
import vendorsRoutes from './routes/vendors.js';
import contractsRoutes from './routes/contracts.js';
import proposalsRoutes from './routes/proposals.js';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import contractTemplatesRoutes from './routes/contractTemplates.js';
import propertiesRoutes from './routes/propertiesRoutes.js'; // Import propertiesRoutes

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// === Updated CORS Configuration ===
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Frontend origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Include OPTIONS method
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  credentials: true, // Allow credentials (cookies, authentication headers)
};

// Apply CORS middleware with the specified options
app.use(cors(corsOptions));
// ================================

// Middleware to parse JSON requests
app.use(express.json());

// TODO host files on Azure Blob Storage
// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

let server;

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.get('/api/port', (req, res) => {
  console.log(`Received request on /api/port. Responding with port: ${server.address().port}`);
  res.json({ port: server.address().port });
});

// Log registered routes
app._router.stack.forEach(function(r){
  if (r.route && r.route.path){
    console.log(`Route registered: ${r.route.stack[0].method.toUpperCase()} ${r.route.path}`)
  }
})

// Define Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/vendors', vendorsRoutes);
app.use('/api/contracts', contractsRoutes);
app.use('/api/proposals', proposalsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/contract-templates', contractTemplatesRoutes);
app.use('/api/user', usersRoutes);
app.use('/api/properties', propertiesRoutes); // Use propertiesRoutes

// Add these lines after your route definitions and before the wildcard route
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React build directory
  app.use(express.static(path.join(__dirname, '../proposalstream-frontend/build')));

  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../proposalstream-frontend/build', 'index.html'));
  });
}

// Error handling middleware
app.use(errorHandler);

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// Add near the top of your Express app setup
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

const startServer = async () => {
  try {
    await connectDB(); // Initialize Azure Blob Storage and connect to MongoDB

    const port = process.env.PORT || 6001;
    server = app.listen(port, () => {
      logger.info(`Server started on port ${port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;