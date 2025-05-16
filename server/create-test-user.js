import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure MongoDB connection URI exists
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/realtime-chat';

// Define test user
const testUser = {
  firstname: 'Test',
  lastname: 'User',
  email: 'test@example.com',
  password: 'test1234',
};

// Connect to MongoDB
async function connectToMongo() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    return false;
  }
}

// Create User Schema
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      default: 'Available',
    },
    profilePic: {
      type: String,
      default:
        'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
    },
    contacts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create User Model
const User = mongoose.model('User', userSchema);

// Create test user
async function createTestUser() {
  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email: testUser.email });
    
    if (existingUser) {
      console.log('Test user already exists');
      return existingUser;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    
    // Create new user
    const newUser = new User({
      name: `${testUser.firstname} ${testUser.lastname}`,
      email: testUser.email,
      password: hashedPassword,
    });
    
    // Save user
    await newUser.save();
    console.log('Test user created successfully');
    return newUser;
  } catch (error) {
    console.error('Error creating test user:', error.message);
    return null;
  }
}

// Main function
async function main() {
  console.log('Creating test user...');
  
  // Connect to MongoDB
  const connected = await connectToMongo();
  if (!connected) {
    console.error('Cannot proceed without MongoDB connection');
    process.exit(1);
  }
  
  // Create test user
  const user = await createTestUser();
  
  if (user) {
    console.log('\nUser created with the following credentials:');
    console.log('Email:', testUser.email);
    console.log('Password:', testUser.password);
    console.log('\nYou can now use these credentials to log in.');
  }
  
  // Disconnect from MongoDB
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

// Run the main function
main().catch(console.error); 