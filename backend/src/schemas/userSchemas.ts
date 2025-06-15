import Joi from 'joi';

export const userSchemas = {
  updateProfile: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
    businessName: Joi.string().min(2).max(200).optional(),
    businessAddress: Joi.string().min(5).max(500).optional()
  }),

  addVehicle: Joi.object({
    make: Joi.string().min(1).max(50).required(),
    model: Joi.string().min(1).max(50).required(),
    licensePlate: Joi.string().min(1).max(20).required(),
    color: Joi.string().min(1).max(30).required()
  }),

  updateVehicle: Joi.object({
    make: Joi.string().min(1).max(50).optional(),
    model: Joi.string().min(1).max(50).optional(),
    licensePlate: Joi.string().min(1).max(20).optional(),
    color: Joi.string().min(1).max(30).optional()
  })
};