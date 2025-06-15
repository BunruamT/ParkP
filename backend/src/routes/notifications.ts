import express from 'express';
import { authenticate } from '../middleware/auth';
import { validateQuery } from '../middleware/validation';
import { notificationSchemas } from '../schemas/notificationSchemas';
import { notificationService } from '../services/notificationService';

const router = express.Router();

// Get user notifications
router.get('/', authenticate, validateQuery(notificationSchemas.getNotifications), async (req: any, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, type, isRead } = req.query;

    const result = await notificationService.getUserNotifications(
      userId, 
      parseInt(page), 
      parseInt(limit)
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Mark notification as read
router.put('/:id/read', authenticate, async (req: any, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await notificationService.markAsRead(id, userId);

    res.json({
      message: 'Notification marked as read'
    });
  } catch (error) {
    next(error);
  }
});

// Mark all notifications as read
router.put('/read-all', authenticate, async (req: any, res, next) => {
  try {
    const userId = req.user.id;

    await notificationService.markAllAsRead(userId);

    res.json({
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
});

// Get unread count
router.get('/unread-count', authenticate, async (req: any, res, next) => {
  try {
    const userId = req.user.id;

    const count = await notificationService.getUnreadCount(userId);

    res.json({ count });
  } catch (error) {
    next(error);
  }
});

export default router;