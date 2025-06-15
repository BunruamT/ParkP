import Joi from 'joi';

export const parkingSpotSchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(200).required(),
    description: Joi.string().max(1000).optional(),
    address: Joi.string().min(5).max(500).required(),
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    price: Joi.number().positive().required(),
    priceType: Joi.string().valid('hour', 'day', 'month').required(),
    totalSlots: Joi.number().integer().min(1).required(),
    amenities: Joi.array().items(Joi.string()).optional(),
    images: Joi.array().items(Joi.string().uri()).optional(),
    openingHours: Joi.string().required(),
    phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional()
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(200).optional(),
    description: Joi.string().max(1000).optional(),
    address: Joi.string().min(5).max(500).optional(),
    latitude: Joi.number().min(-90).max(90).optional(),
    longitude: Joi.number().min(-180).max(180).optional(),
    price: Joi.number().positive().optional(),
    priceType: Joi.string().valid('hour', 'day', 'month').optional(),
    totalSlots: Joi.number().integer().min(1).optional(),
    amenities: Joi.array().items(Joi.string()).optional(),
    images: Joi.array().items(Joi.string().uri()).optional(),
    openingHours: Joi.string().optional(),
    phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
    status: Joi.string().valid('ACTIVE', 'INACTIVE', 'MAINTENANCE').optional()
  }),

  getSpots: Joi.object({
    search: Joi.string().optional(),
    lat: Joi.number().min(-90).max(90).optional(),
    lng: Joi.number().min(-180).max(180).optional(),
    radius: Joi.number().positive().optional(),
    minPrice: Joi.number().positive().optional(),
    maxPrice: Joi.number().positive().optional(),
    amenities: Joi.alternatives().try(
      Joi.string(),
      Joi.array().items(Joi.string())
    ).optional(),
    priceType: Joi.string().valid('hour', 'day', 'month').optional(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    sortBy: Joi.string().valid('distance', 'price', 'rating', 'created').optional()
  }),

  getOwnerSpots: Joi.object({
    status: Joi.string().valid('ACTIVE', 'INACTIVE', 'MAINTENANCE').optional(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional()
  }),

  createAvailability: Joi.object({
    date: Joi.date().iso().required(),
    startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    status: Joi.string().valid('available', 'blocked', 'maintenance').required(),
    reason: Joi.string().max(500).optional(),
    slotsAffected: Joi.number().integer().min(1).required()
  })
};