import mongoose from 'mongoose';
import Proposal from '../models/Proposal.js';
import Job from '../models/Job.js';
import Vendor from '../models/Vendor.js';
import Contract from '../models/Contract.js';
import logger from '../utils/logger.js';
import ContractTemplate from '../models/ContractTemplate.js';
import path from 'path';
import { performMailMerge } from '../utils/mailMerge.js';
import { fileExists } from '../utils/fileUtils.js';

// Create a new proposal
export const createProposal = async (req, res) => {
  logger.info('Received proposal submission:', req.body);
  logger.info('File:', req.file);

  try {
    const { jobId, vendorId } = req.body;

    if (!jobId || !vendorId || !req.file) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate jobId
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Validate vendorId
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const newProposal = new Proposal({
      jobRequest: jobId,
      vendor: vendorId,
      pdfScopeOfWork: req.file.path,
      status: 'Submitted', // Explicitly set the status
    });

    const savedProposal = await newProposal.save();
    logger.info('New proposal saved:', JSON.stringify(savedProposal, null, 2));

    // Update the job with the new proposal
    job.proposal = savedProposal._id;
    job.status = 'Proposal Submitted'; // Update job status
    await job.save();

    res.status(201).json(savedProposal);
  } catch (error) {
    logger.error('Error creating proposal:', error);
    res.status(500).json({ error: 'Server Error', details: error.message });
  }
};

// Get all proposals
export const getAllProposals = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    logger.info('Fetching proposals', { service: 'proposal-stream' });
    const proposals = await Proposal.find({ status: { $ne: 'Deleted' } })
      .populate('jobRequest', 'propertyId')
      .populate('vendor', 'vendorLLC')
      .select('status pdfScopeOfWork createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Filter out proposals with missing references
    const validProposals = proposals.filter(
      proposal => proposal.jobRequest && proposal.vendor
    );

    const total = await Proposal.countDocuments({ status: { $ne: 'Deleted' } });

    logger.info(`Fetched ${validProposals.length} valid proposals out of ${proposals.length}`, { service: 'proposal-stream' });
    res.status(200).json({
      proposals: validProposals,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalProposals: total
    });
  } catch (err) {
    logger.error('Error fetching proposals:', { message: err.message, stack: err.stack }, { service: 'proposal-stream' });
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
};

// Get a proposal by ID
export const getProposalById = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id)
      .populate('jobRequest', 'propertyId')
      .populate('vendor', 'vendorLLC');
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    res.status(200).json(proposal);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ error: 'Invalid ID format' });
    }
    logger.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
};

// Update a proposal by ID
export const updateProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    res.status(200).json(proposal);
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
};

// Delete a proposal by ID
export const deleteProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findByIdAndDelete(req.params.id);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    res.status(200).json({ message: 'Proposal deleted successfully' });
  } catch (error) {
    logger.error('Error deleting proposal:', error);
    res.status(500).json({ error: 'Server Error' });
  }
};

// Approve a proposal
export const approveProposal = async (req, res) => {
  try {
    const { templateId } = req.body;
    if (!templateId) {
      logger.error('Contract template ID is missing');
      return res.status(400).json({ error: 'Contract template ID is required' });
    }
    logger.info(`Approving proposal with ID: ${req.params.id}, using template: ${templateId}`);
    const proposal = await Proposal.findById(req.params.id)
      .populate('jobRequest')
      .populate('vendor');
    if (!proposal) {
      logger.error(`Proposal not found with ID: ${req.params.id}`);
      return res.status(404).json({ error: 'Proposal not found' });
    }
    const contractTemplate = await ContractTemplate.findById(templateId);
    if (!contractTemplate) {
      logger.error(`Contract template not found with ID: ${templateId}`);
      return res.status(404).json({ error: 'Contract template not found' });
    }

    // Check if the proposal PDF exists
    const proposalPdfPath = path.resolve(proposal.pdfScopeOfWork);
    const proposalPdfExists = await fileExists(proposalPdfPath);
    if (!proposalPdfExists) {
      logger.error(`Proposal PDF file not found at path: ${proposalPdfPath}`);
      return res.status(404).json({ error: 'Proposal PDF file not found' });
    }
    logger.info(`Proposal PDF file found at: ${proposalPdfPath}`);

    logger.info(`Preparing merge fields for proposal: ${proposal._id}`);
    const mergeFields = {
      proposalId: proposal._id.toString(),
      proposalStatus: proposal.status,
      proposalCreatedAt: proposal.createdAt.toISOString(),
      proposalPdfScopeOfWork: proposal.pdfScopeOfWork,
      jobRequestId: proposal.jobRequest?._id?.toString() || 'N/A',
      buildingName: proposal.jobRequest?.building || 'N/A',
      client: proposal.jobRequest?.client || 'N/A',
      jobDescription: proposal.jobRequest?.description || 'N/A',
      vendorId: proposal.vendor?._id?.toString() || 'N/A',
      vendorName: proposal.vendor?.vendorLLC || 'N/A',
      vendorEmail: proposal.vendor?.email || 'N/A',
      vendorPhone: proposal.vendor?.phone || 'N/A',
    };
    const mergedContractPath = path.join('uploads', `merged_contract_${proposal._id}.pdf`);
    logger.info(`Performing mail merge for proposal: ${proposal._id}`);
    await performMailMerge(contractTemplate.htmlContent, mergeFields, proposal.pdfScopeOfWork, mergedContractPath);

    logger.info(`Creating new contract for proposal: ${proposal._id}`);
    const newContract = new Contract({
      job: proposal.jobRequest?._id,
      vendor: proposal.vendor?._id,
      proposal: proposal._id,
      pdfScopeOfWork: proposal.pdfScopeOfWork,
      contractStatus: 'Draft',
      mergedContractPdf: mergedContractPath,
    });
    await newContract.save();
    logger.info(`New contract created with ID: ${newContract._id}`);

    proposal.status = 'Approved';
    await proposal.save();
    logger.info(`Proposal ${proposal._id} status updated to Approved`);

    res.status(200).json({ message: 'Proposal approved and contract created', contract: newContract });
  } catch (error) {
    logger.error('Error approving proposal:', error);
    res.status(500).json({ error: 'Server Error', details: error.message, stack: error.stack });
  }
};

// Update proposal status
export const updateProposalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { newStatus } = req.body;

    const proposal = await Proposal.findById(id);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    const allowedTransitions = {
      'Submitted': ['Approved', 'Needs Revision', 'Rejected', 'Deleted'],
      'Approved': ['Contract Created', 'Deleted'],
      'Needs Revision': ['Submitted', 'Deleted'],
      'Rejected': ['Deleted'],
      'Contract Created': ['Deleted'],
      'Deleted': []
    };

    if (!allowedTransitions[proposal.status].includes(newStatus)) {
      return res.status(400).json({ error: 'Invalid status transition' });
    }

    proposal.status = newStatus;
    await proposal.save();

    // Update related job status
    const job = await Job.findById(proposal.jobRequest);
    if (job) {
      if (newStatus === 'Approved') {
        job.status = 'Proposal Approved';
      } else if (newStatus === 'Needs Revision') {
        job.status = 'Proposal Needs Revision';
      }
      await job.save();
    }

    res.status(200).json(proposal);
  } catch (error) {
    logger.error('Error updating proposal status:', error);
    res.status(500).json({ error: 'Server Error' });
  }
};

export const requestRevision = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    proposal.status = 'Needs Revision';
    await proposal.save();
    res.status(200).json(proposal);
  } catch (error) {
    logger.error('Error requesting revision:', error);
    res.status(500).json({ error: 'Server Error' });
  }
};

export const submitRevision = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    if (req.file) {
      // Corrected field name
      proposal.pdfScopeOfWork = req.file.path;
    }
    proposal.status = 'Submitted';
    await proposal.save();
    res.status(200).json(proposal);
  } catch (error) {
    logger.error('Error submitting revision:', error);
    res.status(500).json({ error: 'Server Error' });
  }
};
