import jwt from 'jsonwebtoken';
import user from '../models/userModel.js';

export const Auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Access denied' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access denied' });

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) return res.status(401).json({ message: 'Invalid token' });

    const rootUser = await user.findOne({ _id: verified.id }).select('-password');
    if (!rootUser) return res.status(401).json({ message: 'User not found' });

    req.token = token;
    req.rootUser = rootUser;
    req.rootUserId = rootUser._id;

    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication error', error: error.message });
  }
};
