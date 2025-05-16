import express from 'express';
import upload from '../middleware/upload.js';
import { uploadMedia } from '../controllers/media.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protect all media routes
router.use(protect);

// Upload media
router.post('/upload', upload.single('file'), uploadMedia);

export default router;
