import mongoose from 'mongoose';

const ContractSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  proposal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proposal',
    required: true,
  },
  pdfScopeOfWork: {
    type: String,
    required: true,
  },
  contractStatus: {
    type: String,
    enum: ['Draft', 'Approved', 'Rejected', 'Revised'],
    default: 'Draft',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  mergedContractPdf: {
    type: String,
    required: true,
  },
});

export default mongoose.model('Contract', ContractSchema);