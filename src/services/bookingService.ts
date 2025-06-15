import api from '../config/api';

export interface CreateBookingData {
  spotId: string;
  vehicleId: string;
  startTime: string;
  endTime: string;
}

export interface BookingFilters {
  status?: string;
  page?: number;
  limit?: number;
}

class BookingService {
  async createBooking(data: CreateBookingData) {
    const response = await api.post('/bookings', data);
    return response.data;
  }

  async getMyBookings(filters: BookingFilters = {}) {
    const response = await api.get('/bookings/my-bookings', { params: filters });
    return response.data;
  }

  async getBookingById(id: string) {
    const response = await api.get(`/bookings/${id}`);
    return response.data.booking;
  }

  async extendBooking(id: string) {
    const response = await api.post(`/bookings/${id}/extend`);
    return response.data;
  }

  async cancelBooking(id: string) {
    const response = await api.post(`/bookings/${id}/cancel`);
    return response.data;
  }

  async validateEntry(code: string) {
    const response = await api.post('/bookings/validate-entry', { code });
    return response.data;
  }

  async processExit(id: string) {
    const response = await api.post(`/bookings/${id}/exit`);
    return response.data;
  }

  async getOwnerBookings(filters: {
    status?: string;
    spotId?: string;
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  } = {}) {
    const response = await api.get('/bookings/owner/bookings', { params: filters });
    return response.data;
  }
}

export const bookingService = new BookingService();