import Contract from '../models/Contract.js';
import Proposal from '../models/Proposal.js'; // Assuming Proposal model is imported
import logger from '../utils/logger.js';

// Create a new contract
export const createContract = async (req, res) => {
  try {
    const { proposalId } = req.body;
    const pdfScopeOfWork = req.file ? req.file.path : null;
    
    if (!proposalId) {
      return res.status(400).json({ error: 'ProposalId is required' });
    }

    const proposal = await Proposal.findById(proposalId);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    const newContract = new Contract({
      job: proposal.jobRequest,
      vendor: proposal.vendor,
      proposal: proposal._id,
      pdfScopeOfWork: pdfScopeOfWork || proposal.pdfScopeOfWork,
      contractStatus: 'Draft',
    });

    await newContract.save();

    res.status(201).json({ message: 'Contract created successfully', contract: newContract });
  } catch (error) {
    logger.error('Error creating contract:', error);
    res.status(500).json({ error: 'Server Error', details: error.message });
  }
};

// Get all contracts
export const getAllContracts = async (req, res) => {
  try {
    logger.info('Fetching all contracts');
    
    const contracts = await Contract.find()
      .populate('job', 'building')
      .populate('vendor', 'vendorLLC')
      .populate('proposal', 'status')
      .lean();
    
    logger.info(`Found ${contracts.length} contracts`);
    console.log('Contracts:', JSON.stringify(contracts, null, 2));
    res.status(200).json(contracts);
  } catch (err) {
    logger.error('Error in getAllContracts:', err);
    console.error('Full error object:', JSON.stringify(err, null, 2));
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
};

// Get a contract by ID
export const getContractById = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('job', 'building')
      .populate('vendor', 'vendorLLC')
      .populate('proposal', 'status')
      .lean();
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    res.status(200).json(contract);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ error: 'Invalid ID format' });
    }
    logger.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
};

// Update a contract by ID
export const updateContract = async (req, res) => {
  try {
    let contract = await Contract.findById(req.params.id);
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    contract = await Contract.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json(contract);
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
};

// Delete a contract by ID
export const deleteContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found', success: false, data: null });
    }
    await Contract.deleteOne({ _id: req.params.id });
    res.status(200).json({
      message: 'Contract deleted successfully',
      success: true,
      data: null,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ message: 'Server Error', success: false, data: null });
  }
};