import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  requestDetails: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: [
      'Pending',
      'Proposal Submitted',
      'Proposal Approved',
      'Proposal Needs Revision',
      'Contract Drafted',
      'Contract Approved',
      'In Progress',
      'Completed',
      'Cancelled'
    ],
    default: 'Pending',
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
  vendorCompany: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
  },
  vendorEmail: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  serviceType: {
    type: String,
    default: 'Not specified' // Or make it optional by removing 'required: true'
  },
  proposal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proposal',
  },
});

const Job = mongoose.model('Job', JobSchema);

export default Job;