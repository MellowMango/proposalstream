import dotenv from 'dotenv';
import { expect } from '@jest/globals';
import mongoose from 'mongoose';
import Vendor from '../models/Vendor.js';

dotenv.config();

describe('Vendor Model Test', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('Create & save a vendor successfully', async () => {
    const validVendor = new Vendor({
      vendorLLC: 'Vendor LLC',
      contractSignerEmail: 'signer@example.com',
      contractSignerFirstName: 'John',
      contractSignerLastName: 'Doe',
      serviceType: 'Security',
    });
    const savedVendor = await validVendor.save();
    expect(savedVendor._id).toBeDefined();
    expect(savedVendor.vendorLLC).toBe(validVendor.vendorLLC);
    expect(savedVendor.contractSignerEmail).toBe(validVendor.contractSignerEmail);
  });

  it('Insert vendor without required field should fail', async () => {
    const vendorWithoutRequiredField = new Vendor({ vendorLLC: 'Vendor LLC' });
    let err;
    try {
      await vendorWithoutRequiredField.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.contractSignerEmail).toBeDefined();
  });
});