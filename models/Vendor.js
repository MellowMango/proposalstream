import mongoose from 'mongoose';

const VendorSchema = new mongoose.Schema({
  vendorLLC: {
    type: String,
    required: true,
    unique: true
  },
  contractSignerEmail: {
    type: String,
    required: true,
  },
  contractSignerFirstName: {
    type: String,
    required: true,
  },
  contractSignerLastName: {
    type: String,
    required: true,
  },
  serviceType: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Vendor', VendorSchema);