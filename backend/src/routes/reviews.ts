import express from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validation';
import { reviewSchemas } from '../schemas/reviewSchemas';
import { logger } from '../utils/logger';

const router = express.Router();

// Create review
router.post('/', authenticate, validate(reviewSchemas.create), async (req: any, res, next) => {
  try {
    const { spotId, rating, comment, photos, isAnonymous } = req.body;
    const userId = req.user.id;

    // Check if user has completed booking for this spot
    const completedBooking = await prisma.booking.findFirst({
      where: {
        spotId,
        userId,
        status: 'COMPLETED'
      }
    });

    if (!completedBooking) {
      return res.status(400).json({ 
        error: 'You can only review parking spots you have used' 
      });
    }

    // Check if user already reviewed this spot
    const existingReview = await prisma.review.findFirst({
      where: {
        spotId,
        userId
      }
    });

    if (existingReview) {
      return res.status(400).json({ 
        error: 'You have already reviewed this parking spot' 
      });
    }

    const review = await prisma.review.create({
      data: {
        spotId,
        userId,
        rating,
        comment,
        photos: photos || [],
        isAnonymous: isAnonymous || false
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    });

    // Update parking spot rating
    const allReviews = await prisma.review.findMany({
      where: { spotId },
      select: { rating: true }
    });

    const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.parkingSpot.update({
      where: { id: spotId },
      data: {
        rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        reviewCount: allReviews.length
      }
    });

    logger.info(`Review created: ${review.id} for spot: ${spotId} by user: ${userId}`);

    res.status(201).json({
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    next(error);
  }
});

// Get reviews for a parking spot
router.get('/spot/:spotId', validateQuery(reviewSchemas.getReviews), async (req, res, next) => {
  try {
    const { spotId } = req.params;
    const { page = 1, limit = 10, rating } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = { spotId };
    if (rating) {
      where.rating = parseInt(rating as string);
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string)
      }),
      prisma.review.count({ where })
    ]);

    // Hide user name if review is anonymous
    const processedReviews = reviews.map(review => ({
      ...review,
      user: review.isAnonymous ? { name: 'Anonymous' } : review.user
    }));

    res.json({
      reviews: processedReviews,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update review
router.put('/:id', authenticate, validate(reviewSchemas.update), async (req: any, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment, photos, isAnonymous } = req.body;
    const userId = req.user.id;

    const existingReview = await prisma.review.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!existingReview) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const review = await prisma.review.update({
      where: { id },
      data: {
        rating,
        comment,
        photos,
        isAnonymous
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    });

    // Recalculate parking spot rating
    const allReviews = await prisma.review.findMany({
      where: { spotId: existingReview.spotId },
      select: { rating: true }
    });

    const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.parkingSpot.update({
      where: { id: existingReview.spotId },
      data: {
        rating: Math.round(averageRating * 10) / 10
      }
    });

    logger.info(`Review updated: ${id} by user: ${userId}`);

    res.json({
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    next(error);
  }
});

// Delete review
router.delete('/:id', authenticate, async (req: any, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existingReview = await prisma.review.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!existingReview) {
      return res.status(404).json({ error: 'Review not found' });
    }

    await prisma.review.delete({
      where: { id }
    });

    // Recalculate parking spot rating
    const allReviews = await prisma.review.findMany({
      where: { spotId: existingReview.spotId },
      select: { rating: true }
    });

    const averageRating = allReviews.length > 0 
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length 
      : 0;

    await prisma.parkingSpot.update({
      where: { id: existingReview.spotId },
      data: {
        rating: Math.round(averageRating * 10) / 10,
        reviewCount: allReviews.length
      }
    });

    logger.info(`Review deleted: ${id} by user: ${userId}`);

    res.json({
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get user's reviews
router.get('/my-reviews', authenticate, validateQuery(reviewSchemas.getUserReviews), async (req: any, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { userId },
        include: {
          spot: {
            select: {
              name: true,
              address: true,
              images: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.review.count({ where: { userId } })
    ]);

    res.json({
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;