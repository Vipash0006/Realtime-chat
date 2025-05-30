import express from 'express';
import { Auth } from '../middleware/user.js';
const router = express.Router();

import {
  accessChats,
  fetchAllChats,
  createGroup,
  renameGroup,
  addToGroup,
  removeFromGroup,
} from '../controllers/chatControllers.js';
router.post('/', Auth, accessChats);
router.get('/', Auth, fetchAllChats);
router.post('/group', Auth, createGroup);
router.patch('/group/rename', Auth, renameGroup);
router.patch('/groupAdd', Auth, addToGroup);
router.patch('/groupRemove', Auth, removeFromGroup);

export default router;
