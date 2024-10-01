import request from 'supertest';
import mongoose from 'mongoose';
import Contract from '../models/Contract.js';
import Job from '../models/Job.js';
import Vendor from '../models/Vendor.js';
import Proposal from '../models/Proposal.js';
import app from '../index.js';
import { generateToken } from '../utils/authUtils.js'; // Assuming you have this utility function

let server;
let job;
let vendor;
let authToken;

// Mock authentication middleware
jest.mock('../middleware/authMiddleware.js', () => ({
  authenticateToken: (req, res, next) => next(),
  authorizeRoles: (...roles) => (req, res, next) => next()
}));

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  if (!server) {
    server = app.listen(0, function() {
      console.log(`Test server running on port ${this.address().port}`);
      process.env.TEST_PORT = this.address().port;
    });
  }

  // Generate a mock auth token
  authToken = generateToken({ id: 'testuser', role: 'admin' });
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
  await Contract.deleteMany({});
  await Job.deleteMany({});
  await Vendor.deleteMany({});
  await Proposal.deleteMany({});

  job = new Job({
    building: 'Test Building',
    client: 'Test Client',
    requestDetails: 'Test Details',
    contractSignerEmail: 'test@example.com',
    contractSignerFirstName: 'John',
    contractSignerLastName: 'Doe',
    serviceType: 'Test Service'
  });
  await job.save();

  vendor = new Vendor({
    vendorLLC: 'SecureTech LLC',
    contractSignerEmail: 'signer@securetech.com',
    contractSignerFirstName: 'Alice',
    contractSignerLastName: 'Johnson',
    serviceType: 'Security'
  });
  await vendor.save();
});

describe('POST /contracts', () => {
  it('should create a new contract and return it', async () => {
    const proposal = new Proposal({
      job: job._id,
      vendor: vendor._id,
      scopeOfWork: 'Test scope of work'
    });
    await proposal.save();

    const mockFile = {
      buffer: Buffer.from('Mock PDF content'),
      originalname: 'mock.pdf'
    };

    const res = await request(app)
      .post('/contracts')
      .field('job', job._id.toString())
      .field('vendor', vendor._id.toString())
      .field('proposal', proposal._id.toString())
      .attach('pdfScopeOfWork', mockFile.buffer, mockFile.originalname)
      .set('Host', `localhost:${process.env.TEST_PORT}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.pdfScopeOfWork).toBeDefined();
  });

  it('should return 400 if required fields are missing', async () => {
    const res = await request(app).post('/contracts').send({
      job: job._id,
      vendor: vendor._id,
      // Missing required fields
    }).set('Host', `localhost:${process.env.TEST_PORT}`)
    .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('GET /contracts', () => {
  it('should return all contracts', async () => {
    const contract = new Contract({
      job: job._id,
      vendor: vendor._id,
      pdfScopeOfWork: 'uploads/sample.pdf',
    });
    await contract.save();

    const res = await request(app)
      .get('/contracts')
      .set('Host', `localhost:${process.env.TEST_PORT}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
  });
});

describe('GET /contracts/:id', () => {
  it('should return a contract if valid ID is passed', async () => {
    const contract = new Contract({
      job: job._id,
      vendor: vendor._id,
      pdfScopeOfWork: 'uploads/sample.pdf',
    });
    await contract.save();

    const res = await request(app)
      .get(`/contracts/${contract._id}`)
      .set('Host', `localhost:${process.env.TEST_PORT}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('_id', contract._id.toString());
  });

  it('should return 404 if contract is not found', async () => {
    const res = await request(app)
      .get('/contracts/invalidId')
      .set('Host', `localhost:${process.env.TEST_PORT}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(404);
  });
});

describe('PUT /contracts/:id', () => {
  it('should update a contract and return it', async () => {
    const contract = new Contract({
      job: job._id,
      vendor: vendor._id,
      pdfScopeOfWork: 'uploads/sample.pdf',
    });
    await contract.save();

    const res = await request(app)
      .put(`/contracts/${contract._id}`)
      .send({ contractStatus: 'Approved' })
      .set('Host', `localhost:${process.env.TEST_PORT}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('contractStatus', 'Approved');
  });
});

describe('DELETE /contracts/:id', () => {
  it('should delete a contract and return a success message', async () => {
    const contract = new Contract({
      job: job._id,
      vendor: vendor._id,
      pdfScopeOfWork: 'uploads/sample.pdf',
    });
    await contract.save();

    const res = await request(app)
      .delete(`/contracts/${contract._id}`)
      .set('Host', `localhost:${process.env.TEST_PORT}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({
      message: 'Contract deleted successfully',  // Updated to match the actual response
      success: true,
      data: null
    }));
  });
});