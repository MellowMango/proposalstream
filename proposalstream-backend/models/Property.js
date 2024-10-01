import mongoose from 'mongoose';

const BuildingSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

const PropertySchema = new mongoose.Schema({
  propertyName: { type: String, required: true },
  buildings: { type: [BuildingSchema], required: true },
  propertyLLC: { type: String, required: true },
  address: { type: String, required: true },
  contractSignerEmail: { type: String, required: true },
  contractSignerFirstName: { type: String, required: true },
  contractSignerLastName: { type: String, required: true },
  coiRequirementsUrl: { type: String }, // Optional
  noticeAddress: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Associates property with a user
  createdAt: { type: Date, default: Date.now },
});

const Property = mongoose.model('Property', PropertySchema);

export default Property;