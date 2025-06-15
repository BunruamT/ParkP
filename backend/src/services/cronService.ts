import cron from 'node-cron';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import { notificationService } from './notificationService';

export function startCronJobs() {
  // Release expired reservations every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      await releaseExpiredReservations();
    } catch (error) {
      logger.error('Error in releaseExpiredReservations cron job:', error);
    }
  });

  // Send booking reminders every hour
  cron.schedule('0 * * * *', async () => {
    try {
      await sendBookingReminders();
    } catch (error) {
      logger.error('Error in sendBookingReminders cron job:', error);
    }
  });

  // Clean up old notifications daily
  cron.schedule('0 2 * * *', async () => {
    try {
      await cleanupOldNotifications();
    } catch (error) {
      logger.error('Error in cleanupOldNotifications cron job:', error);
    }
  });

  logger.info('Cron jobs started successfully');
}

async function releaseExpiredReservations() {
  const now = new Date();
  
  // Find bookings where reserved time has expired and user hasn't exited
  const expiredBookings = await prisma.booking.findMany({
    where: {
      status: {
        in: ['ACTIVE', 'EXTENDED']
      },
      reservedEndTime: {
        lt: now
      },
      actualEndTime: null
    },
    include: {
      spot: true,
      user: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  for (const booking of expiredBookings) {
    try {
      // Update booking status to completed
      await prisma.booking.update({
        where: { id: booking.id },
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

      // Create entry log
      await prisma.entryLog.create({
        data: {
          bookingId: booking.id,
          action: 'EXIT',
          method: 'AUTO',
          code: 'EXPIRED'
        }
      });

      // Send notification to user
      await notificationService.createNotification({
        userId: booking.userId,
        title: 'Booking Expired',
        message: `Your booking at ${booking.spot.name} has expired and been automatically completed.`,
        type: 'BOOKING',
        data: { bookingId: booking.id }
      });

      logger.info(`Released expired reservation: ${booking.id}`);
    } catch (error) {
      logger.error(`Error releasing expired reservation ${booking.id}:`, error);
    }
  }

  if (expiredBookings.length > 0) {
    logger.info(`Released ${expiredBookings.length} expired reservations`);
  }
}

async function sendBookingReminders() {
  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + (60 * 60 * 1000));

  // Find bookings starting in the next hour
  const upcomingBookings = await prisma.booking.findMany({
    where: {
      status: 'PENDING',
      startTime: {
        gte: now,
        lte: oneHourFromNow
      }
    },
    include: {
      spot: {
        select: {
          name: true,
          address: true
        }
      },
      user: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  for (const booking of upcomingBookings) {
    try {
      // Check if reminder already sent
      const existingReminder = await prisma.notification.findFirst({
        where: {
          userId: booking.userId,
          type: 'REMINDER',
          data: {
            path: ['bookingId'],
            equals: booking.id
          }
        }
      });

      if (!existingReminder) {
        await notificationService.createNotification({
          userId: booking.userId,
          title: 'Booking Reminder',
          message: `Your parking booking at ${booking.spot.name} starts in 1 hour.`,
          type: 'REMINDER',
          data: { bookingId: booking.id }
        });

        logger.info(`Sent booking reminder for: ${booking.id}`);
      }
    } catch (error) {
      logger.error(`Error sending booking reminder ${booking.id}:`, error);
    }
  }

  if (upcomingBookings.length > 0) {
    logger.info(`Sent ${upcomingBookings.length} booking reminders`);
  }
}

async function cleanupOldNotifications() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    const result = await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        },
        isRead: true
      }
    });

    logger.info(`Cleaned up ${result.count} old notifications`);
  } catch (error) {
    logger.error('Error cleaning up old notifications:', error);
  }
}