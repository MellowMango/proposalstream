import mongoose from 'mongoose';
import { fileExists } from '../utils/fileUtils.js';

const ContractTemplateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  htmlContent: {
    type: String,
    required: true
  },
  originalFileName: {
    type: String,
    required: true
  },
  fields: [{
    name: String,
    text: String,
    position: {
      x: Number,
      y: Number,
      width: Number,
      height: Number
    }
  }],
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
