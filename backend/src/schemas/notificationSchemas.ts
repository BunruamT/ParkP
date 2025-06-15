import Joi from 'joi';

export const notificationSchemas = {
  getNotifications: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(50).optional(),
    type: Joi.string().optional(),
    isRead: Joi.boolean().optional()
  })
};