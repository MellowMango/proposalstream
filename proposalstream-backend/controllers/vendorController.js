import Vendor from '../models/Vendor.js';
import logger from '../utils/logger.js';

// Create a new vendor
export const createVendor = async (req, res) => {
  try {
    const newVendor = new Vendor(req.body);
    const savedVendor = await newVendor.save();
    res.status(201).json(savedVendor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all vendors
export const getAllVendors = async (req, res) => {
  try {
    logger.info('Fetching all vendors');
    const vendors = await Vendor.find().lean();
    logger.info(`Found ${vendors.length} vendors`);
    res.status(200).json(vendors);
  } catch (err) {
    logger.error('Error in getAllVendors:', err);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
};

// Get a vendor by ID
export const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    res.status(200).json(vendor);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ error: 'Invalid ID format' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
};

// Update a vendor by ID
export const updateVendor = async (req, res) => {
  try {
    let vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json(vendor);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    if (err.name === 'CastError') {
      return res.status(404).json({ error: 'Invalid ID format' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
};

// Delete a vendor by ID
export const deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found', success: false, data: null });
    }
    await Vendor.deleteOne({ _id: req.params.id });
    res.status(200).json({
      message: 'Vendor deleted successfully',
      success: true,
      data: null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error', success: false, data: null });
  }
};