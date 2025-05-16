import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// Check if JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  console.log('JWT_SECRET not found in environment variables');
  
  // Create or update .env file with a secure JWT_SECRET
  const envFilePath = path.join(process.cwd(), '.env');
  const newSecret = 'realtime-chat-app-secret-key-' + Date.now();
  
  try {
    let envContent = '';
    
    // Try to read existing .env content
    try {
      envContent = fs.readFileSync(envFilePath, 'utf8');
    } catch (err) {
      console.log('Creating new .env file');
    }
    
    // Check if JWT_SECRET exists in the file
    if (envContent.includes('JWT_SECRET=')) {
      // Replace JWT_SECRET
      envContent = envContent.replace(/JWT_SECRET=.*\n?/, `JWT_SECRET=${newSecret}\n`);
    } else {
      // Add JWT_SECRET
      envContent += `\nJWT_SECRET=${newSecret}\n`;
    }
    
    // Check if MONGO_URI exists, add a default if not
    if (!envContent.includes('MONGO_URI=')) {
      envContent += `MONGO_URI=mongodb://localhost:27017/realtime-chat\n`;
    }
    
    // Write back to .env
    fs.writeFileSync(envFilePath, envContent);
    console.log('Updated .env file with new JWT_SECRET');
    
    // Update process.env for the current process
    process.env.JWT_SECRET = newSecret;
  } catch (err) {
    console.error('Error updating .env file:', err);
  }
}

// Test MongoDB connection
async function testMongoConnection() {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/realtime-chat';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connection successful');
    
    // Check if user collection exists and has data
    const collections = await mongoose.connection.db.listCollections().toArray();
    const hasUserCollection = collections.some(col => col.name === 'users');
    
    if (hasUserCollection) {
      const userCount = await mongoose.connection.db.collection('users').countDocuments();
      console.log(`Users collection exists with ${userCount} documents`);
    } else {
      console.log('Users collection does not exist yet - will be created on first user registration');
    }
    
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
    
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  }
}

console.log('Authentication Fix Script');
console.log('------------------------');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set (secured)' : 'Not set');
console.log('MONGO_URI:', process.env.MONGO_URI || 'Not set (will use default)');

testMongoConnection();

console.log('\nInstructions:');
console.log('1. After this script runs, restart your server: npm start');
console.log('2. Try registering a new user with the following details:');
console.log('   - First name: Test');
console.log('   - Last name: User');
console.log('   - Email: test@example.com');
console.log('   - Password: test1234');
console.log('3. Then try logging in with the same credentials'); 