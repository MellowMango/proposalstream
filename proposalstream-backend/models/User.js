import mongoose from 'mongoose';
import bcrypt from 'bcrypt'; // Changed from 'bcryptjs' to 'bcrypt'

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false // Exclude password by default
  },
  name: {
    type: String,
  },
  role: {
    type: String,
    enum: ['client', 'vendor', 'admin'],
    default: 'client'
  },
  // Optionally, reference to Vendor
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
  },
});

// Pre-save middleware to hash password
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(12);  // Change to 12 rounds
    this.password = await bcrypt.hash(this.password, salt);
    console.log('Password hashed in pre-save hook:', this.password);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    console.log('Comparing passwords in User model:');
    console.log('Candidate password:', candidatePassword);
    console.log('Stored hashed password:', this.password);
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('Password match result:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    throw error;
  }
};

export default mongoose.model('User', UserSchema);