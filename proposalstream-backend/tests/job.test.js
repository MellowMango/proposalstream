import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Job from '../models/Job.js';

dotenv.config();

describe('Job Model Test', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI, {});
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('Create & save a job successfully', async () => {
    const validJob = new Job({
      building: 'Building A',
      requestDetails: 'Install security cameras',
      vendorEmail: 'vendor@example.com',
      contractSignerLastName: 'Doe',
      contractSignerFirstName: 'John',
      contractSignerEmail: 'john.doe@example.com',
      client: 'Client Company'
    });
    const savedJob = await validJob.save();
    expect(savedJob._id).toBeDefined();
    expect(savedJob.building).toBe(validJob.building);
    expect(savedJob.requestDetails).toBe(validJob.requestDetails);
    expect(savedJob.vendorEmail).toBe(validJob.vendorEmail);
    expect(savedJob.contractSignerLastName).toBe(validJob.contractSignerLastName);
    expect(savedJob.contractSignerFirstName).toBe(validJob.contractSignerFirstName);
    expect(savedJob.contractSignerEmail).toBe(validJob.contractSignerEmail);
    expect(savedJob.client).toBe(validJob.client);
  });

  it('Insert job without required field should fail', async () => {
    const jobWithoutRequiredField = new Job({ building: 'Building A' });
    let err;
    try {
      await jobWithoutRequiredField.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.requestDetails).toBeDefined();
  });
});