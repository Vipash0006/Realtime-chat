import mongoose from 'mongoose';
import dotenv from 'dotenv';
import user from './models/userModel.js';

dotenv.config();

const clearUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Delete all users
    const result = await user.deleteMany({});
    console.log(`Deleted ${result.deletedCount} users`);

    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error:', error);
  }
};

clearUsers(); 