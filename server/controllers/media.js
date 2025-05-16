import path from 'path';
import fs from 'fs';

export const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check file size
    if (req.file.size > 5 * 1024 * 1024) {
      // Delete the uploaded file if it's too large
      fs.unlinkSync(req.file.path);
      return res.status(413).json({ error: 'File size too large. Maximum size is 5MB.' });
    }

    const isVideo = req.file.mimetype.startsWith('video/');
    
    // Create URL for the file
    const fileUrl = `/uploads/${path.basename(req.file.path)}`;

    res.status(200).json({ 
      url: fileUrl,
      type: isVideo ? 'video' : 'image'
    });
  } catch (err) {
    console.error('Media upload error:', err);
    // Delete the file if there was an error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ 
      error: 'Something went wrong', 
      details: err.message
    });
  }
};
