const express = require('express');
const router = express.Router();
const multer = require('multer');
const ImageKit = require('imagekit');
const { protect } = require('../middlewares/authMiddleware');

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || 'your_public_key',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || 'your_private_key',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/your_imagekit_id',
});

// Use multer memory storage (no disk needed)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// @route POST /api/upload
// @desc Upload a single image to ImageKit
// @access Private
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const result = await imagekit.upload({
      file: req.file.buffer,
      fileName: `${Date.now()}_${req.file.originalname}`,
      folder: '/localconnect',
    });

    res.json({ url: result.url, fileId: result.fileId });
  } catch (error) {
    console.error('ImageKit upload error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/upload/multiple
// @desc Upload multiple images to ImageKit
// @access Private
router.post('/multiple', protect, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadPromises = req.files.map((file) =>
      imagekit.upload({
        file: file.buffer,
        fileName: `${Date.now()}_${file.originalname}`,
        folder: '/localconnect',
      })
    );

    const results = await Promise.all(uploadPromises);
    const urls = results.map((r) => r.url);

    res.json({ urls });
  } catch (error) {
    console.error('ImageKit upload error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/upload/auth
// @desc Get ImageKit auth params (for client-side upload)
// @access Private
router.get('/auth', protect, (req, res) => {
  const authParams = imagekit.getAuthenticationParameters();
  res.json(authParams);
});

module.exports = router;
