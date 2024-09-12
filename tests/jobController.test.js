import request from 'supertest';
import mongoose from 'mongoose';
import Job from '../models/Job.js';
import app from '../index.js';  // Ensure this is your Express app
import { generateToken } from '../utils/authUtils.js'; // Assuming you have this utility function

// Mock authentication middleware
jest.mock('../middleware/authMiddleware.js', () => ({
  authenticateToken: (req, res, next) => next(),
  authorizeRoles: (...roles) => (req, res, next) => next()
}));

let authToken;

beforeAll(() => {
  // Generate a mock auth token
  authToken = generateToken({ id: 'testuser', role: 'admin' });
});

let server;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.dropDatabase(); // Drop the database before running tests

  if (!server) {
    server = app.listen(0, function() {
      console.log(`Test server running on port ${this.address().port}`);
      process.env.TEST_PORT = this.address().port;
    });
  }
});

afterAll(async () => {
  await mongoose.connection.close();

  if (server) {
    await new Promise((resolve, reject) => {
      server.close((err) => {
        if (err) return reject(err);
        console.log('Test server closed');
        resolve();
      });
    });
    server = null;  // Set to null to avoid reuse issues
  }
});

beforeEach(async () => {
  await Job.deleteMany({});
});

describe('POST /jobs', () => {
  it('should create a new job and return it', async () => {
    const res = await request(app)
      .post('/jobs')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        building: 'Building A',
        clientName: 'Test Client',
        requestDetails: 'Install security cameras',
        contractSignerEmail: 'signer@example.com',
        contractSignerFirstName: 'John',
        contractSignerLastName: 'Doe',
        serviceType: 'Security'
      })
      .set('Host', `localhost:${process.env.TEST_PORT}`);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('building', 'Building A');
    expect(res.body).toHaveProperty('status', 'Pending');
  });

  it('should return 400 if required fields are missing', async () => {
    const res = await request(app)
      .post('/jobs')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        building: 'Building A'
      })
      .set('Host', `localhost:${process.env.TEST_PORT}`);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('GET /jobs', () => {
  it('should return all jobs', async () => {
    const job = new Job({
      building: 'Building A',
      requestDetails: 'Install security cameras',
      vendorEmail: 'vendor@example.com',
    });
    await job.save();

    const res = await request(app)
      .get('/jobs')
      .set('Authorization', `Bearer ${authToken}`)
      .set('Host', `localhost:${process.env.TEST_PORT}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
  });
});

describe('GET /jobs/:id', () => {
  it('should return a job if valid ID is passed', async () => {
    const job = new Job({
      building: 'Building A',
      requestDetails: 'Install security cameras',
      vendorEmail: 'vendor@example.com',
    });
    await job.save();

    const res = await request(app)
      .get(`/jobs/${job._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .set('Host', `localhost:${process.env.TEST_PORT}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('_id', job._id.toString());
  });

  it('should return 404 if job is not found', async () => {
    const res = await request(app)
      .get('/jobs/invalidId')
      .set('Authorization', `Bearer ${authToken}`)
      .set('Host', `localhost:${process.env.TEST_PORT}`);

    expect(res.statusCode).toBe(404);
  });
});

describe('PUT /jobs/:id', () => {
  it('should update a job and return it', async () => {
    const job = new Job({
      building: 'Building A',
      requestDetails: 'Install security cameras',
      vendorEmail: 'vendor@example.com',
    });
    await job.save();

    const res = await request(app)
      .put(`/jobs/${job._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ building: 'Building B' })
      .set('Host', `localhost:${process.env.TEST_PORT}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('building', 'Building B');
  });
});

describe('DELETE /jobs/:id', () => {
  it('should delete a job and return a success message', async () => {
    const job = new Job({
      building: 'Building A',
      requestDetails: 'Install security cameras',
      vendorEmail: 'vendor@example.com',
    });
    await job.save();

    const res = await request(app)
      .delete(`/jobs/${job._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .set('Host', `localhost:${process.env.TEST_PORT}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Job deleted successfully');
  });
});