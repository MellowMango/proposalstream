import mongoose from 'mongoose';

const ProposalSchema = new mongoose.Schema({
  jobRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  pdfScopeOfWork: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Submitted', 'Approved', 'Needs Revision', 'Rejected', 'Contract Created', 'Deleted'],
    default: 'Submitted',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Proposal', ProposalSchema);
