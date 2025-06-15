import Joi from 'joi';

export const paymentSchemas = {
  processPayment: Joi.object({
    bookingId: Joi.string().required(),
    method: Joi.string().valid('CREDIT_CARD', 'DEBIT_CARD', 'QR_PAYMENT', 'E_WALLET').required(),
    transactionId: Joi.string().optional()
  })
};