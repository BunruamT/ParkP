import express from 'express';
import QRCode from 'qrcode';
import { prisma } from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validation';
import { bookingSchemas } from '../schemas/bookingSchemas';
import { logger } from '../utils/logger';
import { generatePin, generateQRData } from '../utils/qrUtils';
import { notificationService } from '../services/notificationService';

const router = express.Router();

// Create booking
router.post('/', authenticate, validate(bookingSchemas.create), async (req: any, res, next) => {
  try {
    const { spotId, vehicleId, startTime, endTime } = req.body;
    const userId = req.user.id;

    // Verify parking spot exists and is available
    const spot = await prisma.parkingSpot.findUnique({
      where: { id: spotId }
    });

    if (!spot || spot.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'Parking spot not available' });
    }

    if (spot.availableSlots <= 0) {
      return res.status(400).json({ error: 'No available slots' });
    }

    // Verify vehicle belongs to user
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: vehicleId, userId }
    });

    if (!vehicle) {
      return res.status(400).json({ error: 'Vehicle not found' });
    }

    // Calculate duration and cost
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    if (durationHours <= 0) {
      return res.status(400).json({ error: 'Invalid booking duration' });
    }

    // Calculate cost based on spot pricing
    let totalCost = 0;
    if (spot.priceType === 'hour') {
      totalCost = durationHours * spot.price;
    } else if (spot.priceType === 'day') {
      totalCost = Math.ceil(durationHours / 24) * spot.price;
    } else if (spot.priceType === 'month') {
      totalCost = Math.ceil(durationHours / (24 * 30)) * spot.price;
    }

    // Generate QR code and PIN
    const pin = generatePin();
    const qrData = generateQRData();

    // Calculate reserved end time (booked time + 1 hour buffer)
    const reservedEndTime = new Date(end.getTime() + (60 * 60 * 1000)); // +1 hour

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        spotId,
        userId,
        vehicleId,
        startTime: start,
        endTime: end,
        reservedEndTime,
        totalCost,
        qrCode: qrData,
        pin,
        status: 'PENDING'
      },
      include: {
        spot: {
          select: {
            name: true,
            address: true,
            price: true,
            priceType: true
          }
        },
        vehicle: {
          select: {
            make: true,
            model: true,
            licensePlate: true
          }
        }
      }
    });

    // Update available slots
    await prisma.parkingSpot.update({
      where: { id: spotId },
      data: {
        availableSlots: {
          decrement: 1
        }
      }
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: totalCost,
        method: 'CREDIT_CARD', // Default, will be updated when payment is processed
        status: 'PENDING'
      }
    });

    // Send notification
    await notificationService.createNotification({
      userId,
      title: 'Booking Confirmed',
      message: `Your booking at ${spot.name} has been confirmed.`,
      type: 'BOOKING',
      data: { bookingId: booking.id }
    });

    logger.info(`Booking created: ${booking.id} for user: ${userId}`);

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    next(error);
  }
});

// Get user bookings
router.get('/my-bookings', authenticate, validateQuery(bookingSchemas.getBookings), async (req: any, res, next) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          spot: {
            select: {
              name: true,
              address: true,
              images: true
            }
          },
          vehicle: {
            select: {
              make: true,
              model: true,
              licensePlate: true
            }
          },
          payment: {
            select: {
              status: true,
              method: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.booking.count({ where })
    ]);

    res.json({
      bookings,
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

// Get booking by ID
router.get('/:id', authenticate, async (req: any, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const booking = await prisma.booking.findFirst({
      where: {
        id,
        OR: [
          { userId }, // User's own booking
          { spot: { ownerId: userId } } // Owner's spot booking
        ]
      },
      include: {
        spot: {
          select: {
            name: true,
            address: true,
            images: true,
            phone: true,
            ownerId: true
          }
        },
        vehicle: {
          select: {
            make: true,
            model: true,
            licensePlate: true,
            color: true
          }
        },
        user: {
          select: {
            name: true,
            phone: true,
            email: true
          }
        },
        payment: {
          select: {
            status: true,
            method: true,
            amount: true
          }
        },
        entryLogs: {
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ booking });
  } catch (error) {
    next(error);
  }
});

// Extend booking (only 1 hour extension allowed)
router.post('/:id/extend', authenticate, async (req: any, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const booking = await prisma.booking.findFirst({
      where: {
        id,
        userId,
        status: 'ACTIVE'
      },
      include: {
        spot: true
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Active booking not found' });
    }

    if (booking.isExtended) {
      return res.status(400).json({ error: 'Booking has already been extended' });
    }

    // Check if extension is still possible (within the reserved time)
    const now = new Date();
    if (now > booking.reservedEndTime) {
      return res.status(400).json({ error: 'Extension time has expired' });
    }

    // Calculate extension cost (1 hour)
    const extensionCost = booking.spot.priceType === 'hour' 
      ? booking.spot.price 
      : booking.spot.price / 24; // Convert daily/monthly to hourly

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        endTime: new Date(booking.endTime.getTime() + (60 * 60 * 1000)), // +1 hour
        reservedEndTime: new Date(booking.reservedEndTime.getTime() + (60 * 60 * 1000)), // +1 hour
        totalCost: booking.totalCost + extensionCost,
        isExtended: true,
        extendedAt: now,
        status: 'EXTENDED'
      },
      include: {
        spot: {
          select: {
            name: true,
            address: true
          }
        }
      }
    });

    // Create additional payment record for extension
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: extensionCost,
        method: 'CREDIT_CARD',
        status: 'COMPLETED' // Assume extension payment is processed immediately
      }
    });

    // Log the extension
    await prisma.entryLog.create({
      data: {
        bookingId: booking.id,
        action: 'EXTEND',
        method: 'APP',
        code: 'EXTENSION'
      }
    });

    // Send notification
    await notificationService.createNotification({
      userId,
      title: 'Booking Extended',
      message: `Your booking at ${booking.spot.name} has been extended by 1 hour.`,
      type: 'BOOKING',
      data: { bookingId: booking.id }
    });

    logger.info(`Booking extended: ${booking.id} for user: ${userId}`);

    res.json({
      message: 'Booking extended successfully',
      booking: updatedBooking,
      extensionCost
    });
  } catch (error) {
    next(error);
  }
});

// Validate entry (QR/PIN)
router.post('/validate-entry', authenticate, authorize('OWNER', 'ADMIN'), validate(bookingSchemas.validateEntry), async (req: any, res, next) => {
  try {
    const { code } = req.body;

    // Find booking by QR code or PIN
    const booking = await prisma.booking.findFirst({
      where: {
        OR: [
          { qrCode: code },
          { pin: code }
        ],
        status: {
          in: ['PENDING', 'ACTIVE', 'EXTENDED']
        }
      },
      include: {
        spot: {
          select: {
            name: true,
            address: true,
            ownerId: true
          }
        },
        vehicle: {
          select: {
            make: true,
            model: true,
            licensePlate: true,
            color: true
          }
        },
        user: {
          select: {
            name: true,
            phone: true
          }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({ 
        success: false,
        error: 'Invalid code or booking not found' 
      });
    }

    // Check if the requesting user is the owner of the parking spot
    if (booking.spot.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied' 
      });
    }

    // Check if booking is within valid time
    const now = new Date();
    if (now < booking.startTime) {
      return res.status(400).json({ 
        success: false,
        error: 'Booking has not started yet' 
      });
    }

    if (now > booking.reservedEndTime) {
      return res.status(400).json({ 
        success: false,
        error: 'Booking has expired' 
      });
    }

    // Update booking status to ACTIVE if it was PENDING
    if (booking.status === 'PENDING') {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'ACTIVE' }
      });
    }

    // Log the entry
    await prisma.entryLog.create({
      data: {
        bookingId: booking.id,
        action: 'ENTRY',
        method: booking.qrCode === code ? 'QR' : 'PIN',
        code
      }
    });

    logger.info(`Entry validated for booking: ${booking.id}`);

    res.json({
      success: true,
      message: 'Entry validated successfully',
      booking: {
        id: booking.id,
        spotName: booking.spot.name,
        startTime: booking.startTime,
        endTime: booking.endTime,
        reservedEndTime: booking.reservedEndTime,
        totalCost: booking.totalCost,
        status: booking.status,
        vehicle: booking.vehicle,
        user: booking.user,
        isExtended: booking.isExtended
      }
    });
  } catch (error) {
    next(error);
  }
});

// Process exit
router.post('/:id/exit', authenticate, authorize('OWNER', 'ADMIN'), async (req: any, res, next) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findFirst({
      where: {
        id,
        status: {
          in: ['ACTIVE', 'EXTENDED']
        }
      },
      include: {
        spot: {
          select: {
            ownerId: true
          }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Active booking not found' });
    }

    // Check if the requesting user is the owner of the parking spot
    if (booking.spot.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const now = new Date();

    // Update booking
    await prisma.booking.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        actualEndTime: now
      }
    });

    // Release the parking slot
    await prisma.parkingSpot.update({
      where: { id: booking.spotId },
      data: {
        availableSlots: {
          increment: 1
        }
      }
    });

    // Log the exit
    await prisma.entryLog.create({
      data: {
        bookingId: booking.id,
        action: 'EXIT',
        method: 'MANUAL',
        code: 'EXIT'
      }
    });

    logger.info(`Exit processed for booking: ${booking.id}`);

    res.json({
      message: 'Exit processed successfully',
      actualEndTime: now
    });
  } catch (error) {
    next(error);
  }
});

// Cancel booking
router.post('/:id/cancel', authenticate, async (req: any, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const booking = await prisma.booking.findFirst({
      where: {
        id,
        userId,
        status: {
          in: ['PENDING', 'ACTIVE']
        }
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found or cannot be cancelled' });
    }

    // Check if cancellation is allowed (e.g., at least 1 hour before start time)
    const now = new Date();
    const oneHourBeforeStart = new Date(booking.startTime.getTime() - (60 * 60 * 1000));
    
    if (now > oneHourBeforeStart && booking.status === 'PENDING') {
      return res.status(400).json({ error: 'Cannot cancel booking less than 1 hour before start time' });
    }

    if (booking.status === 'ACTIVE') {
      return res.status(400).json({ error: 'Cannot cancel active booking. Please contact support.' });
    }

    // Update booking status
    await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });

    // Release the parking slot
    await prisma.parkingSpot.update({
      where: { id: booking.spotId },
      data: {
        availableSlots: {
          increment: 1
        }
      }
    });

    // Update payment status for refund processing
    await prisma.payment.updateMany({
      where: { bookingId: booking.id },
      data: { status: 'REFUNDED' }
    });

    logger.info(`Booking cancelled: ${booking.id} for user: ${userId}`);

    res.json({
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get owner's bookings
router.get('/owner/bookings', authenticate, authorize('OWNER', 'ADMIN'), validateQuery(bookingSchemas.getOwnerBookings), async (req: any, res, next) => {
  try {
    const ownerId = req.user.id;
    const { status, spotId, page = 1, limit = 10, startDate, endDate } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: any = {
      spot: { ownerId }
    };

    if (status) {
      where.status = status;
    }

    if (spotId) {
      where.spotId = spotId;
    }

    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) {
        where.startTime.gte = new Date(startDate);
      }
      if (endDate) {
        where.startTime.lte = new Date(endDate);
      }
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          spot: {
            select: {
              name: true,
              address: true
            }
          },
          vehicle: {
            select: {
              make: true,
              model: true,
              licensePlate: true
            }
          },
          user: {
            select: {
              name: true,
              phone: true,
              email: true
            }
          },
          payment: {
            select: {
              status: true,
              amount: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.booking.count({ where })
    ]);

    res.json({
      bookings,
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