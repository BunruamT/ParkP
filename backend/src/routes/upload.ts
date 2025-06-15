import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { authenticate } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Upload single image
router.post('/image', authenticate, upload.single('image'), async (req: any, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'parkpass',
          transformation: [
            { width: 800, height: 600, crop: 'limit' },
            { quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    logger.info(`Image uploaded by user: ${req.user.id}`);

    res.json({
      message: 'Image uploaded successfully',
      url: (result as any).secure_url,
      publicId: (result as any).public_id
    });
  } catch (error) {
    next(error);
  }
});

// Upload multiple images
router.post('/images', authenticate, upload.array('images', 5), async (req: any, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No image files provided' });
    }

    const uploadPromises = req.files.map((file: any) => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            folder: 'parkpass',
            transformation: [
              { width: 800, height: 600, crop: 'limit' },
              { quality: 'auto' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(file.buffer);
      });
    });

    const results = await Promise.all(uploadPromises);

    const urls = results.map((result: any) => ({
      url: result.secure_url,
      publicId: result.public_id
    }));

    logger.info(`${urls.length} images uploaded by user: ${req.user.id}`);

    res.json({
      message: 'Images uploaded successfully',
      images: urls
    });
  } catch (error) {
    next(error);
  }
});

// Delete image
router.delete('/image/:publicId', authenticate, async (req: any, res, next) => {
  try {
    const { publicId } = req.params;

    await cloudinary.uploader.destroy(publicId);

    logger.info(`Image deleted by user: ${req.user.id}`);

    res.json({
      message: 'Image deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;