import api from '../config/api';

class NotificationService {
  async getNotifications(params: { page?: number; limit?: number; type?: string; isRead?: boolean } = {}) {
    const response = await api.get('/notifications', { params });
    return response.data;
  }

  async markAsRead(id: string) {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  }

  async markAllAsRead() {
    const response = await api.put('/notifications/read-all');
    return response.data;
  }

  async getUnreadCount() {
    const response = await api.get('/notifications/unread-count');
    return response.data.count;
  }
}

export const notificationService = new NotificationService();