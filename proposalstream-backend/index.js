import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { errorHandler } from './middleware/errorHandler.js';
import logger from './utils/logger.js';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import passport from 'passport';
import { BearerStrategy } from 'passport-azure-ad';

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

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
app.use('/api/proposals', proposalsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/contract-templates', contractTemplatesRoutes);
app.use('/api/user', usersRoutes);
app.use('/api/properties', propertiesRoutes); // Use propertiesRoutes

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

// Initialize Passport
const options = {
  identityMetadata: `https://login.microsoftonline.com/${process.env.TENANT_ID}/v2.0/.well-known/openid-configuration`,
  clientID: process.env.AZURE_CLIENT_ID,
  validateIssuer: true,
  issuer: `https://sts.windows.net/${process.env.AZURE_TENANT_ID}/`,
  passReqToCallback: false,
  loggingLevel: 'info',
  scope: ['profile', 'offline_access', 'https://graph.microsoft.com/mail.read']
};

passport.use(new BearerStrategy(options, (token, done) => {
  done(null, token);
}));

app.use(passport.initialize());

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