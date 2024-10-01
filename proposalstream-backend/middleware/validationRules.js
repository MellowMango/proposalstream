import { body } from 'express-validator';

export const createJobRules = [
  body('propertyId')
    .notEmpty()
    .withMessage('Property ID is required')
    .isMongoId()
    .withMessage('Invalid Property ID'),

  body('requestDetails')
    .notEmpty()
    .withMessage('Request details are required'),

  body('serviceType')
    .optional()
    .isString()
    .withMessage('Service Type must be a string'),

  body('vendorId')
    .notEmpty()
    .withMessage('Vendor ID is required')
    .isMongoId()
    .withMessage('Invalid Vendor ID'),
];

export const createVendorRules = [
  body('vendorLLC').notEmpty().withMessage('Vendor LLC is required'),
  body('contractSignerEmail').isEmail().withMessage('Valid email is required'),
  body('serviceType').notEmpty().withMessage('Service type is required'),
];

export const createProposalRules = [
  body('jobId').isMongoId().withMessage('Valid job ID is required'),
  body('vendorId').isMongoId().withMessage('Valid vendor ID is required'),
];

export const createContractRules = [
  body('jobId').isMongoId().withMessage('Valid job ID is required'),
  body('vendorId').isMongoId().withMessage('Valid vendor ID is required'),
  body('proposalId').isMongoId().withMessage('Valid proposal ID is required'),
];

export const updateContractRules = [
  body('contractStatus').isIn(['Draft', 'Approved', 'Cancelled']).withMessage('Invalid contract status'),
];
// Add more validation rules for other routes as needed

