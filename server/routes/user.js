import express from 'express';
import {
  register,
  login,
  validUser,
  googleAuth,
  logout,
  searchUsers,
  updateInfo,
  getUserById,
} from '../controllers/user.js';
import { Auth } from '../middleware/user.js';
const router = express.Router();

// Auth routes
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/valid', Auth, validUser);
router.get('/auth/logout', Auth, logout);
router.post('/auth/google', googleAuth);

// User routes
router.get('/user', Auth, searchUsers);
router.get('/users/:id', Auth, getUserById);
router.patch('/users/update/:id', Auth, updateInfo);

export default router;
