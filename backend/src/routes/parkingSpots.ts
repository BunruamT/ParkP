import express from 'express';
import { prisma } from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validation';
import { parkingSpotSchemas } from '../schemas/parkingSpotSchemas';
import { logger } from '../utils/logger';
import { calculateDistance } from '../utils/geoUtils';

const router = express.Router();

// Get all parking spots with filters
router.get('/', validateQuery(parkingSpotSchemas.getSpots), async (req, res, next) => {
  try {
    const {
      search,
      lat,
      lng,
      radius = 10, // km
      minPrice,
      maxPrice,
      amenities,
      priceType,
      page = 1,
      limit = 20,
      sortBy = 'distance'
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    let where: any = {
      status: 'ACTIVE',
      availableSlots: {
        gt: 0
      }
    };

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { address: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    // Price filters
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }

    // Price type filter
    if (priceType) {
      where.priceType = priceType;
    }

    // Amenities filter
    if (amenities) {
      const amenityList = Array.isArray(amenities) ? amenities : [amenities];
      where.amenities = {
        hasEvery: amenityList
      };
    }

    let orderBy: any = { createdAt: 'desc' };
    
    // For distance sorting, we'll sort in application code
    if (sortBy === 'price') {
      orderBy = { price: 'asc' };
    } else if (sortBy === 'rating') {
      orderBy = { rating: 'desc' };
    }

    const [spots, total] = await Promise.all([
      prisma.parkingSpot.findMany({
        where,
        include: {
          owner: {
            select: {
              name: true,
              phone: true
            }
          },
          _count: {
            select: {
              reviews: true,
              bookings: true
            }
          }
        },
        orderBy,
        skip,
        take: parseInt(limit as string)
      }),
      prisma.parkingSpot.count({ where })
    ]);

    // Calculate distances and sort if needed
    let processedSpots = spots;
    if (lat && lng && sortBy === 'distance') {
      processedSpots = spots
        .map(spot => ({
          ...spot,
          distance: calculateDistance(
            parseFloat(lat as string),
            parseFloat(lng as string),
            spot.latitude,
            spot.longitude
          )
        }))
        .filter(spot => !radius || spot.distance <= parseFloat(radius as string))
        .sort((a, b) => a.distance - b.distance);
    }

    res.json({
      spots: processedSpots,
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

// Get parking spot by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const spot = await prisma.parkingSpot.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            name: true,
            phone: true,
            email: true
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            reviews: true,
            bookings: true
          }
        }
      }
    });

    if (!spot) {
      return res.status(404).json({ error: 'Parking spot not found' });
    }

    res.json({ spot });
  } catch (error) {
    next(error);
  }
});

// Create parking spot (Owner only)
router.post('/', authenticate, authorize('OWNER', 'ADMIN'), validate(parkingSpotSchemas.create), async (req: any, res, next) => {
  try {
    const ownerId = req.user.id;
    const {
      name,
      description,
      address,
      latitude,
      longitude,
      price,
      priceType,
      totalSlots,
      amenities,
      images,
      openingHours,
      phone
    } = req.body;

    const spot = await prisma.parkingSpot.create({
      data: {
        name,
        description,
        address,
        latitude,
        longitude,
        price,
        priceType,
        totalSlots,
        availableSlots: totalSlots,
        amenities,
        images,
        openingHours,
        phone,
        ownerId
      },
      include: {
        owner: {
          select: {
            name: true,
            phone: true
          }
        }
      }
    });

    logger.info(`Parking spot created: ${spot.id} by owner: ${ownerId}`);

    res.status(201).json({
      message: 'Parking spot created successfully',
      spot
    });
  } catch (error) {
    next(error);
  }
});

// Update parking spot
router.put('/:id', authenticate, authorize('OWNER', 'ADMIN'), validate(parkingSpotSchemas.update), async (req: any, res, next) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;

    // Check if spot exists and belongs to owner
    const existingSpot = await prisma.parkingSpot.findFirst({
      where: {
        id,
        ownerId: req.user.role === 'ADMIN' ? undefined : ownerId
      }
    });

    if (!existingSpot) {
      return res.status(404).json({ error: 'Parking spot not found or access denied' });
    }

    const {
      name,
      description,
      address,
      latitude,
      longitude,
      price,
      priceType,
      totalSlots,
      amenities,
      images,
      openingHours,
      phone,
      status
    } = req.body;

    // Calculate new available slots if total slots changed
    let availableSlots = existingSpot.availableSlots;
    if (totalSlots !== undefined && totalSlots !== existingSpot.totalSlots) {
      const difference = totalSlots - existingSpot.totalSlots;
      availableSlots = Math.max(0, existingSpot.availableSlots + difference);
    }

    const spot = await prisma.parkingSpot.update({
      where: { id },
      data: {
        name,
        description,
        address,
        latitude,
        longitude,
        price,
        priceType,
        totalSlots,
        availableSlots,
        amenities,
        images,
        openingHours,
        phone,
        status
      },
      include: {
        owner: {
          select: {
            name: true,
            phone: true
          }
        }
      }
    });

    logger.info(`Parking spot updated: ${spot.id} by owner: ${ownerId}`);

    res.json({
      message: 'Parking spot updated successfully',
      spot
    });
  } catch (error) {
    next(error);
  }
});

// Delete parking spot
router.delete('/:id', authenticate, authorize('OWNER', 'ADMIN'), async (req: any, res, next) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;

    // Check if spot exists and belongs to owner
    const existingSpot = await prisma.parkingSpot.findFirst({
      where: {
        id,
        ownerId: req.user.role === 'ADMIN' ? undefined : ownerId
      }
    });

    if (!existingSpot) {
      return res.status(404).json({ error: 'Parking spot not found or access denied' });
    }

    // Check for active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        spotId: id,
        status: {
          in: ['PENDING', 'ACTIVE', 'EXTENDED']
        }
      }
    });

    if (activeBookings > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete parking spot with active bookings' 
      });
    }

    await prisma.parkingSpot.delete({
      where: { id }
    });

    logger.info(`Parking spot deleted: ${id} by owner: ${ownerId}`);

    res.json({
      message: 'Parking spot deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get owner's parking spots
router.get('/owner/my-spots', authenticate, authorize('OWNER', 'ADMIN'), validateQuery(parkingSpotSchemas.getOwnerSpots), async (req: any, res, next) => {
  try {
    const ownerId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: any = {
      ownerId: req.user.role === 'ADMIN' ? undefined : ownerId
    };

    if (status) {
      where.status = status;
    }

    const [spots, total] = await Promise.all([
      prisma.parkingSpot.findMany({
        where,
        include: {
          _count: {
            select: {
              bookings: true,
              reviews: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.parkingSpot.count({ where })
    ]);

    // Calculate revenue for each spot
    const spotsWithRevenue = await Promise.all(
      spots.map(async (spot) => {
        const revenue = await prisma.payment.aggregate({
          where: {
            booking: {
              spotId: spot.id
            },
            status: 'COMPLETED'
          },
          _sum: {
            amount: true
          }
        });

        return {
          ...spot,
          totalRevenue: revenue._sum.amount || 0
        };
      })
    );

    res.json({
      spots: spotsWithRevenue,
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

// Manage availability slots
router.post('/:id/availability', authenticate, authorize('OWNER', 'ADMIN'), validate(parkingSpotSchemas.createAvailability), async (req: any, res, next) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;
    const { date, startTime, endTime, status, reason, slotsAffected } = req.body;

    // Check if spot belongs to owner
    const spot = await prisma.parkingSpot.findFirst({
      where: {
        id,
        ownerId: req.user.role === 'ADMIN' ? undefined : ownerId
      }
    });

    if (!spot) {
      return res.status(404).json({ error: 'Parking spot not found or access denied' });
    }

    const availabilitySlot = await prisma.availabilitySlot.create({
      data: {
        spotId: id,
        date: new Date(date),
        startTime,
        endTime,
        status,
        reason,
        slotsAffected
      }
    });

    logger.info(`Availability slot created for spot: ${id} by owner: ${ownerId}`);

    res.status(201).json({
      message: 'Availability slot created successfully',
      availabilitySlot
    });
  } catch (error) {
    next(error);
  }
});

// Get availability slots for a spot
router.get('/:id/availability', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const where: any = { spotId: id };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    const availabilitySlots = await prisma.availabilitySlot.findMany({
      where,
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    });

    res.json({ availabilitySlots });
  } catch (error) {
    next(error);
  }
});

export default router;