import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('MongoDB Connected...');

    // List databases to verify connection
    const admin = mongoose.connection.db.admin();
    const databases = await admin.listDatabases();
    console.log('Databases:', databases.databases);

    // Close the connection
    mongoose.connection.close();
  } catch (err) {
    console.error('Connection error:', err.message);
  }
};

connectDB();