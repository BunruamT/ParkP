import Joi from 'joi';

export const bookingSchemas = {
  create: Joi.object({
    spotId: Joi.string().required(),
    vehicleId: Joi.string().required(),
    startTime: Joi.date().iso().required(),
    endTime: Joi.date().iso().greater(Joi.ref('startTime')).required()
  }),

  getBookings: Joi.object({
    status: Joi.string().valid('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'EXTENDED').optional(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional()
  }),

  getOwnerBookings: Joi.object({
    status: Joi.string().valid('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'EXTENDED').optional(),
    spotId: Joi.string().optional(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional()
  }),

  validateEntry: Joi.object({
    code: Joi.string().required()
  })
};