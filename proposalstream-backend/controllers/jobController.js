import Job from '../models/Job.js';
import Proposal from '../models/Proposal.js';
import Contract from '../models/Contract.js';
import logger from '../utils/logger.js';
import Property from '../models/Property.js';
import Vendor from '../models/Vendor.js';

export const createJob = async (req, res) => {
  try {
    const {
      propertyId,
      requestDetails,
      vendorId,
      serviceType,
    } = req.body;

    const user = req.user;
    const property = await Property.findById(propertyId);
    const vendor = await Vendor.findById(vendorId);

    console.log('Property:', property);
    console.log('Vendor:', vendor);
    console.log('user:', user);
    
    const newJob = new Job({
      propertyId: property._id,
      client: user.id,
      requestDetails,
      // contract stuff :)
      vendorCompany: vendor._id,
      vendorEmail: vendor.contractSignerEmail,
      contractSignerEmail: vendor.contractSignerEmail,
      contractSignerFirstName: vendor.contractSignerFirstName,
      contractSignerLastName: vendor.contractSignerLastName,
      serviceType: serviceType ?? 'Not specified',
    });

    const job = await newJob.save();
    res.status(201).json(job);
  } catch (err) {
    logger.error('Error creating job:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Server Error' });
  }
};

export const getAllJobs = async (req, res) => {
  try {
    logger.info('Fetching all jobs');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    logger.info(`Pagination: page=${page}, limit=${limit}, skip=${skip}`);

    const jobs = await Job.find()
      .populate({
        path: 'proposal',
        select: 'status vendor',
        populate: {
          path: 'vendor',
          select: 'vendorLLC'
        }
      })
      .skip(skip)
      .limit(limit)
      .lean();

    logger.info(`Found ${jobs.length} jobs`);

    const total = await Job.countDocuments();
    logger.info(`Total jobs: ${total}`);

    res.status(200).json({
      jobs,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalJobs: total
    });
  } catch (err) {
    logger.error('Error fetching jobs:', err);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
};

export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.status(200).json(job);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ error: 'Invalid ID format' });
    }
    logger.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
};

export const updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, 
      { ...req.body, updatedAt: Date.now() }, 
      { new: true, runValidators: true }
    );
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.status(200).json(job);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    if (err.name === 'CastError') {
      return res.status(404).json({ error: 'Invalid ID format' });
    }
    logger.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found', success: false });
    }
    res.status(200).json({
      message: 'Job deleted successfully',
      success: true,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ message: 'Server Error', success: false });
  }
};

export const approveProposalAndCreateContract = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('proposal');
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    if (!job.proposal) {
      return res.status(400).json({ error: 'No proposal found for this job' });
    }

    job.proposal.status = 'Approved';
    await job.proposal.save();

    const newContract = new Contract({
      job: job._id,
      vendor: job.proposal.vendor,
      proposal: job.proposal._id,
      pdfScopeOfWork: job.proposal.pdfScopeOfWork,
      contractStatus: 'Draft',
    });

    await newContract.save();
    job.status = 'Approved';
    await job.save();

    res.status(200).json({ message: 'Proposal approved and contract created', job, contract: newContract });
  } catch (error) {
    logger.error('Error approving proposal and creating contract:', error);
    res.status(500).json({ error: 'Server Error', details: error.message });
  }
};

export const updateJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { newStatus } = req.body;

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const allowedTransitions = {
      'Pending': ['Proposal Submitted', 'Cancelled'],
      'Proposal Submitted': ['Proposal Approved', 'Proposal Needs Revision', 'Cancelled'],
      'Proposal Approved': ['Contract Drafted', 'Cancelled'],
      'Proposal Needs Revision': ['Proposal Submitted', 'Cancelled'],
      'Contract Drafted': ['Contract Approved', 'Cancelled'],
      'Contract Approved': ['In Progress', 'Cancelled'],
      'In Progress': ['Completed', 'Cancelled'],
      'Completed': [],
      'Cancelled': []
    };

    if (!allowedTransitions[job.status].includes(newStatus)) {
      return res.status(400).json({ error: 'Invalid status transition' });
    }

    job.status = newStatus;
    await job.save();

    res.status(200).json(job);
  } catch (error) {
    logger.error('Error updating job status:', error);
    res.status(500).json({ error: 'Server Error' });
  }
};

export const requestRevision = async (req, res) => {
  try {
    const { id } = req.params;
    logger.info('Requesting revision for job ID:', id);
    const job = await Job.findById(id).populate('proposal');
    if (!job) {
      logger.error('Job not found for ID:', id);
      return res.status(404).json({ error: 'Job not found' });
    }
    logger.info('Job found:', job);
    if (!job.proposal) {
      logger.error('No proposal found for job:', id);
      return res.status(400).json({ error: 'No proposal found for this job' });
    }
    logger.info('Proposal found:', job.proposal);

    job.proposal.status = 'Needs Revision';
    await job.proposal.save();

    job.status = 'Proposal Needs Revision';
    await job.save();

    res.status(200).json({ job, proposal: job.proposal });
  } catch (error) {
    logger.error('Error requesting revision:', error);
    res.status(500).json({ error: 'Server Error' });
  }
};