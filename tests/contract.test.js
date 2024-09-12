import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Contract from '../models/Contract.js';
import Job from '../models/Job.js';
import Vendor from '../models/Vendor.js';
import Proposal from '../models/Proposal.js'; // Assuming Proposal model is used

dotenv.config();

describe('Contract Model Test', () => {
  let job;
  let vendor;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);

    // Create a Job and Vendor to use in Contract tests
    job = new Job({
      building: 'Test Building',
      clientName: 'Test Client',
      requestDetails: 'Test Details',
      contractSignerEmail: 'test@example.com',
      contractSignerFirstName: 'John',
      contractSignerLastName: 'Doe',
      serviceType: 'Test Service'
    });
    await job.save();

    vendor = new Vendor({
      vendorLLC: 'Test Vendor LLC',
      email: 'vendor@example.com',
      serviceType: 'Test Service',
      contractSignerLastName: 'Doe',
      contractSignerFirstName: 'John',
      contractSignerEmail: 'john.doe@example.com'
    });
    await vendor.save();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should have at least one test', () => {
    expect(true).toBe(true);
  });

  it('Create & save a contract successfully', async () => {
    const job = new Job({
      building: 'Test Building',
      clientName: 'Test Client',
      requestDetails: 'Test Details',
      contractSignerEmail: 'test@example.com',
      contractSignerFirstName: 'John',
      contractSignerLastName: 'Doe',
      serviceType: 'Test Service'
    });
    await job.save();

    const vendor = new Vendor({
      vendorLLC: 'Test Vendor LLC',
      email: 'vendor@example.com',
      serviceType: 'Test Service',
      contractSignerLastName: 'Doe',
      contractSignerFirstName: 'John',
      contractSignerEmail: 'john.doe@example.com'
    });
    await vendor.save();

    const proposal = new Proposal({
      job: job._id,
      vendor: vendor._id,
      scopeOfWork: 'Test scope of work'
    });
    await proposal.save();

    const validContract = new Contract({
      job: job._id,
      vendor: vendor._id,
      proposal: proposal._id,
      pdfScopeOfWork: 'test.pdf',
      contractStatus: 'Draft'
    });

    const savedContract = await validContract.save();
    expect(savedContract._id).toBeDefined();
    expect(savedContract.job).toBe(job._id);
    expect(savedContract.vendor).toBe(vendor._id);
    expect(savedContract.proposal).toBe(proposal._id);
  });

  it('Insert contract without required field should fail', async () => {
    const contractWithoutRequiredField = new Contract({ job: job._id });
    let err;
    try {
      await contractWithoutRequiredField.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.pdfScopeOfWork).toBeDefined();
  });
});