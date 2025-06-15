import express from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { paymentSchemas } from '../schemas/paymentSchemas';
import { logger } from '../utils/logger';

const router = express.Router();

// Process payment
router.post('/process', authenticate, validate(paymentSchemas.processPayment), async (req: any, res, next) => {
  try {
    const { bookingId, method, transactionId } = req.body;
    const userId = req.user.id;

    // Verify booking belongs to user
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Update payment status
    const payment = await prisma.payment.updateMany({
      where: { bookingId },
      data: {
        method,
        status: 'COMPLETED',
        transactionId,
        processedAt: new Date()
      }
    });

    if (payment.count === 0) {
      return res.status(404).json({ error: 'Payment record not found' });
    }

    // Update booking status to active
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'ACTIVE' }
    });

    logger.info(`Payment processed for booking: ${bookingId}`);

    res.json({
      message: 'Payment processed successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get payment history
router.get('/history', authenticate, async (req: any, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: {
          booking: {
            userId
          }
        },
        include: {
          booking: {
            include: {
              spot: {
                select: {
                  name: true,
                  address: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string)
      }),
      prisma.payment.count({
        where: {
          booking: {
            userId
          }
        }
      })
    ]);

    res.json({
      payments,
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

export default router;