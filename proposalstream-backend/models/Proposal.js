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
  // Remove the createdAt field as it will be automatically added by timestamps
}, { timestamps: true }); // Add this option
collection: 'proposals' // Explicitly set collection name

// Define an index on createdAt in Mongoose (optional but recommended for consistency)
ProposalSchema.index({ createdAt: -1 });

export default mongoose.model('Proposal', ProposalSchema);
