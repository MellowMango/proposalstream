import Property from '../models/Property.js';
import { propertyCoiContainerClient } from '../config/db.js';
import path from 'path';

// Add a New Property
export const addProperty = async (req, res) => {
  try {
    const {
      propertyName,
      building,
      propertyLLC,
      address,
      noiNoticeAddress,
      contractSignerEmail,
      contractSignerFirstName,
      contractSignerLastName,
    } = req.body;

    // Validate required fields
    if (
      !propertyName ||
      !building ||
      !propertyLLC ||
      !address ||
      !noiNoticeAddress ||
      !contractSignerEmail ||
      !contractSignerFirstName ||
      !contractSignerLastName
    ) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    // Handle file upload if present
    let coiRequirementsUrl = '';
    if (req.file) {
      const blobName = `coi_${req.user.id}_${Date.now()}${path.extname(req.file.originalname)}`;
      const blockBlobClient = propertyCoiContainerClient.getBlockBlobClient(blobName);
      await blockBlobClient.uploadData(req.file.buffer, {
        blobHTTPHeaders: { blobContentType: req.file.mimetype },
      });
      coiRequirementsUrl = blockBlobClient.url;
    }

    // Create new Property
    const newProperty = new Property({
      propertyName,
      buildings: Array.isArray(building)
        ? building.map((b) => ({ name: b }))
        : [{ name: building }],
      propertyLLC,
      address,
      contractSignerEmail,
      contractSignerFirstName,
      contractSignerLastName,
      coiRequirementsUrl,
      noticeAddress: noiNoticeAddress,
      user: req.user.id,
    });

    await newProperty.save();

    res.status(201).json({ message: 'Property added successfully.', property: newProperty });
  } catch (error) {
    console.error('Error adding property:', error.message);
    res.status(500).json({ message: 'Server error while adding property.' });
  }
};

// Get All Properties for the Authenticated User
export const getUserProperties = async (req, res) => {
  try {
    const properties = await Property.find({ user: req.user.id });

    res.status(200).json({ properties });
  } catch (error) {
    console.error('Error fetching properties:', error.message);
    res.status(500).json({ message: 'Server error while fetching properties.' });
  }
};