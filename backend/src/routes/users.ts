import express from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { userSchemas } from '../schemas/userSchemas';
import { logger } from '../utils/logger';

const router = express.Router();

// Get user profile
router.get('/profile', authenticate, async (req: any, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        vehicles: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        businessName: true,
        businessAddress: true,
        vehicles: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/profile', authenticate, validate(userSchemas.updateProfile), async (req: any, res, next) => {
  try {
    const { name, phone, businessName, businessAddress } = req.body;
    
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name,
        phone,
        businessName,
        businessAddress
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        businessName: true,
        businessAddress: true,
        createdAt: true
      }
    });

    logger.info(`User profile updated: ${req.user.id}`);

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
});

// Add vehicle
router.post('/vehicles', authenticate, validate(userSchemas.addVehicle), async (req: any, res, next) => {
  try {
    const { make, model, licensePlate, color } = req.body;
    
    const vehicle = await prisma.vehicle.create({
      data: {
        make,
        model,
        licensePlate,
        color,
        userId: req.user.id
      }
    });

    logger.info(`Vehicle added for user: ${req.user.id}`);

    res.status(201).json({
      message: 'Vehicle added successfully',
      vehicle
    });
  } catch (error) {
    next(error);
  }
});

// Update vehicle
router.put('/vehicles/:id', authenticate, validate(userSchemas.updateVehicle), async (req: any, res, next) => {
  try {
    const { id } = req.params;
    const { make, model, licensePlate, color } = req.body;
    
    const vehicle = await prisma.vehicle.updateMany({
      where: {
        id,
        userId: req.user.id
      },
      data: {
        make,
        model,
        licensePlate,
        color
      }
    });

    if (vehicle.count === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const updatedVehicle = await prisma.vehicle.findUnique({
      where: { id }
    });

    logger.info(`Vehicle updated: ${id} for user: ${req.user.id}`);

    res.json({
      message: 'Vehicle updated successfully',
      vehicle: updatedVehicle
    });
  } catch (error) {
    next(error);
  }
});

// Delete vehicle
router.delete('/vehicles/:id', authenticate, async (req: any, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if vehicle has active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        vehicleId: id,
        status: {
          in: ['PENDING', 'ACTIVE', 'EXTENDED']
        }
      }
    });

    if (activeBookings > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete vehicle with active bookings' 
      });
    }

    const result = await prisma.vehicle.deleteMany({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (result.count === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    logger.info(`Vehicle deleted: ${id} for user: ${req.user.id}`);

    res.json({
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get user vehicles
router.get('/vehicles', authenticate, async (req: any, res, next) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { userId: req.user.id },
      orderBy: { id: 'desc' }
    });

    res.json({ vehicles });
  } catch (error) {
    next(error);
  }
});

export default router;