import Joi from 'joi';

export const reviewSchemas = {
  create: Joi.object({
    spotId: Joi.string().required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().max(1000).optional(),
    photos: Joi.array().items(Joi.string().uri()).max(5).optional(),
    isAnonymous: Joi.boolean().optional()
  }),

  update: Joi.object({
    rating: Joi.number().integer().min(1).max(5).optional(),
    comment: Joi.string().max(1000).optional(),
    photos: Joi.array().items(Joi.string().uri()).max(5).optional(),
    isAnonymous: Joi.boolean().optional()
  }),

  getReviews: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(50).optional(),
    rating: Joi.number().integer().min(1).max(5).optional()
  }),

  getUserReviews: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(50).optional()
  })
};