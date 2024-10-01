import mongoose from 'mongoose';
import { fileExists } from '../utils/fileUtils.js';

const ContractTemplateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalFileName: {
    type: String,
    required: true
  },
  blobName: {
    type: String,
    required: true
  },
  fields: {
    type: Array,
    required: true
  },
  contractType: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

ContractTemplateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const ContractTemplate = mongoose.model('ContractTemplate', ContractTemplateSchema);

export default ContractTemplate;
