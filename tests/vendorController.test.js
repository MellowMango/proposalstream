import request from 'supertest';
import mongoose from 'mongoose';
import Vendor from '../models/Vendor.js';
import app from '../index.js';
import { generateToken } from '../utils/authUtils.js'; // Assuming you have this utility function

// Mock authentication middleware
jest.mock('../middleware/authMiddleware.js', () => ({
  authenticateToken: (req, res, next) => next(),
  authorizeRoles: (...roles) => (req, res, next) => next()
}));

let server;
let authToken;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.dropDatabase();

  // Start the server on a unique port to avoid conflicts
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
    server = null;
  }
});

beforeEach(async () => {
  await Vendor.deleteMany({});
});

describe('POST /vendors', () => {
  it('should create a new vendor and return it', async () => {
    const res = await request(app)
      .post('/vendors')
      .send({
        vendorLLC: 'SecureTech LLC',
        contractSignerEmail: 'signer@securetech.com',
        contractSignerFirstName: 'Alice',
        contractSignerLastName: 'Johnson',
        serviceType: 'Security'
      })
      .set('Host', `localhost:${process.env.TEST_PORT}`)  // Ensuring the request is sent to the correct port
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('vendorLLC', 'SecureTech LLC');
  });

  it('should return 400 if required fields are missing', async () => {
    const res = await request(app)
      .post('/vendors')
      .send({
        contractSignerEmail: 'signer@securetech.com'
      })
      .set('Host', `localhost:${process.env.TEST_PORT}`)  // Ensuring the request is sent to the correct port
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
describe('GET /vendors', () => {
  it('should return all vendors', async () => {
    const vendor = new Vendor({
      vendorLLC: 'SecureTech LLC',
      contractSignerEmail: 'signer@securetech.com',
      contractSignerFirstName: 'Alice',
      contractSignerLastName: 'Johnson',
      serviceType: 'Security'
    });
    await vendor.save();

    const res = await request(app)
      .get('/vendors')
      .set('Host', `localhost:${process.env.TEST_PORT}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
  });
});

describe('GET /vendors/:id', () => {
  it('should return a vendor if a valid ID is passed', async () => {
    const vendor = new Vendor({
      vendorLLC: 'SecureTech LLC',
      contractSignerEmail: 'signer@securetech.com',
      contractSignerFirstName: 'Alice',
      contractSignerLastName: 'Johnson',
      serviceType: 'Security'
    });
    await vendor.save();

    const res = await request(app)
      .get(`/vendors/${vendor._id}`)
      .set('Host', `localhost:${process.env.TEST_PORT}`)  // Ensuring the request is sent to the correct port
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('_id', vendor._id.toString());
  });

  it('should return 404 if vendor is not found', async () => {
    const res = await request(app)
      .get('/vendors/invalidId')
      .set('Host', `localhost:${process.env.TEST_PORT}`)  // Ensuring the request is sent to the correct port
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(404);
  });
});
describe('PUT /vendors/:id', () => {
  it('should update a vendor and return it', async () => {
    const vendor = new Vendor({
      vendorLLC: 'SecureTech LLC',
      contractSignerEmail: 'signer@securetech.com',
      contractSignerFirstName: 'Alice',
      contractSignerLastName: 'Johnson',
      serviceType: 'Security'
    });
    await vendor.save();

    const res = await request(app)
      .put(`/vendors/${vendor._id}`)
      .send({ contractSignerLastName: 'Smith' })
      .set('Host', `localhost:${process.env.TEST_PORT}`)  // Ensuring the request is sent to the correct port
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('contractSignerLastName', 'Smith');
  });
});

describe('DELETE /vendors/:id', () => {
  it('should delete a vendor and return a success message', async () => {
    const vendor = new Vendor({
      vendorLLC: 'SecureTech LLC',
      contractSignerEmail: 'signer@securetech.com',
      contractSignerFirstName: 'Alice',
      contractSignerLastName: 'Johnson',
      serviceType: 'Security'
    });
    await vendor.save();

    const res = await request(app)
      .delete(`/vendors/${vendor._id}`)
      .set('Host', `localhost:${process.env.TEST_PORT}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Vendor deleted successfully');
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data', null);
  });
});