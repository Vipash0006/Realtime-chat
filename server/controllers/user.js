import user from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.CLIENT_ID);

// Register User
export const register = async (req, res) => {
  const { firstname, lastname, email, password } = req.body;
  try {
    const existingUser = await user.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const fullname = firstname + ' ' + lastname;
    const newUser = new user({ name: fullname, email, password });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ token });
  } catch (error) {
    console.log('Error in register:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Login User
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log('Login attempt for email:', email);
    
    const existingUser = await user.findOne({ email });
    if (!existingUser) {
      console.log('User not found:', email);
      return res.status(400).json({ message: 'User does not exist' });
    }

    console.log('User found, comparing passwords');
    const validPassword = await bcrypt.compare(password, existingUser.password);
    if (!validPassword) {
      console.log('Invalid password for user:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('Password valid, generating token');
    const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ token });
  } catch (error) {
    console.log('Error in login:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

// Validate User
export const validUser = async (req, res) => {
  try {
    const validuser = await user.findOne({ _id: req.rootUserId }).select('-password');
    if (!validuser) return res.status(400).json({ message: 'User is not valid' });

    res.status(200).json({ user: validuser, token: req.token });
  } catch (error) {
    res.status(500).json({ message: 'Validation failed', error });
  }
};

// Google Auth
export const googleAuth = async (req, res) => {
  try {
    const { tokenId } = req.body;

    const verify = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.CLIENT_ID,
    });

    const { email, name, picture } = verify.getPayload();
    const userExist = await user.findOne({ email }).select('-password');

    if (userExist) {
      res.cookie('userToken', tokenId, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      return res.status(200).json({ token: tokenId, user: userExist });
    }

    const password = email + process.env.CLIENT_ID;
    const newUser = new user({ name, profilePic: picture, password, email });
    await newUser.save();

    res.cookie('userToken', tokenId, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: 'User registered successfully', token: tokenId });
  } catch (error) {
    console.log('Error in googleAuth:', error);
    res.status(500).json({ message: 'Google auth failed', error });
  }
};

// Logout
export const logout = async (req, res) => {
  try {
    res.clearCookie('userToken');
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Logout failed', error });
  }
};

// Search Users
export const searchUsers = async (req, res) => {
  try {
    const search = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } },
          ],
        }
      : {};

    const users = await user.find(search).find({ _id: { $ne: req.rootUserId } });
    res.status(200).send(users);
  } catch (error) {
    res.status(500).json({ message: 'Search failed', error });
  }
};

// Get User by ID
export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const selectedUser = await user.findOne({ _id: id }).select('-password');
    res.status(200).json(selectedUser);
  } catch (error) {
    res.status(500).json({ message: 'Get user failed', error });
  }
};

// Update User Info
export const updateInfo = async (req, res) => {
  const { id } = req.params;
  try {
    // Check if the user is authorized to update this profile
    if (id !== req.rootUserId.toString()) {
      console.error('Authorization failed:', { 
        requestedId: id, 
        userId: req.rootUserId.toString() 
      });
      return res.status(403).json({ 
        message: 'Not authorized to update this profile',
        details: 'You can only update your own profile'
      });
    }

    const updateData = { ...req.body };
    // Remove sensitive fields
    delete updateData.password;
    delete updateData.email;

    const updatedUser = await user.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true,
        runValidators: true,
        select: '-password' // Don't return password
      }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Emit profile update event to all connected clients
    req.app.get('io').emit('profile updated', {
      userId: id,
      updatedData: updatedUser
    });

    // Return the updated user data
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error in updateInfo:', error);
    res.status(500).json({ 
      message: 'Update failed', 
      error: error.message,
      details: 'Please try again or contact support if the issue persists'
    });
  }
};
