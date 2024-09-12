import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { errorHandler } from './middleware/errorHandler.js';
import logger from './utils/logger.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Import routes
import jobsRoutes from './routes/jobs.js';
import vendorsRoutes from './routes/vendors.js';
import contractsRoutes from './routes/contracts.js';
import proposalRoutes from './routes/proposals.js';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import contractTemplatesRoutes from './routes/contractTemplates.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Initialize Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ extended: false }));

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Define a wide range of ports to try, starting from 6001
const PORT_RANGE = Array.from({ length: 1000 }, (_, i) => 6001 + i);

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
app.use('/api/auth', (req, res, next) => {
  console.log('Received request on /api/auth');
  next();
}, authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/vendors', vendorsRoutes);
app.use('/api/contracts', contractsRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/contract-templates', contractTemplatesRoutes);
app.use('/api/user', usersRoutes);

// Wildcard route for handling 404s
app.use('*', (req, res) => {
  console.log(`No route found for ${req.method} ${req.originalUrl}`);
  res.status(404).send('Not Found');
});

// Error handling middleware
app.use(errorHandler);

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

const startServer = () => {
  for (const port of PORT_RANGE) {
    try {
      server = app.listen(port, () => {
        logger.info(`Server started on port ${port}`);
      });
      break; // Exit the loop if server starts successfully
    } catch (error) {
      console.log(`Port ${port} is in use, trying next port...`);
    }
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your_default_database';

mongoose.connect(MONGODB_URI)
.then(() => {
  logger.info('MongoDB connected successfully');
  logger.info(`Connected to database: ${mongoose.connection.name}`);
})
.catch(err => {
  logger.error('MongoDB connection error:', err);
  logger.error('MONGODB_URI:', MONGODB_URI);
  console.error('Full error object:', JSON.stringify(err, null, 2));
  process.exit(1);
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB connection error:', err);
  console.error('Full error object:', JSON.stringify(err, null, 2));
});

export default app;