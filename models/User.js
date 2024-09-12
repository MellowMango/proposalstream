import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

if (!bcrypt) {
  console.error('bcrypt import failed');
} else {
  console.log('bcrypt imported successfully:', bcrypt.version);
}

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
    required: true
  },
  role: {
    type: String,
    enum: ['client', 'vendor', 'admin'],
    default: 'client'
  }
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);  // Change to 12 rounds
    this.password = await bcrypt.hash(this.password, salt);
    console.log('Password hashed in pre-save hook:', this.password);
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    console.log('Comparing passwords in User model:');
    console.log('Candidate password:', candidatePassword);
    console.log('Stored hashed password:', this.password);
    console.log('bcrypt version:', bcrypt.version);
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('Password match result:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    throw error;
  }
};

export default mongoose.model('User', UserSchema);