import Joi from 'joi';

export const authSchemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    name: Joi.string().min(2).max(100).required(),
    phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
    role: Joi.string().valid('CUSTOMER', 'OWNER').optional(),
    businessName: Joi.string().min(2).max(200).when('role', {
      is: 'OWNER',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    businessAddress: Joi.string().min(5).max(500).when('role', {
      is: 'OWNER',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
};