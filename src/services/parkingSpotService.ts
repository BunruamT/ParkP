import api from '../config/api';

export interface ParkingSpotFilters {
  search?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  priceType?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
}

export interface CreateParkingSpotData {
  name: string;
  description?: string;
  address: string;
  latitude: number;
  longitude: number;
  price: number;
  priceType: 'hour' | 'day' | 'month';
  totalSlots: number;
  amenities?: string[];
  images?: string[];
  openingHours: string;
  phone?: string;
}

class ParkingSpotService {
  async getParkingSpots(filters: ParkingSpotFilters = {}) {
    const response = await api.get('/parking-spots', { params: filters });
    return response.data;
  }

  async getParkingSpotById(id: string) {
    const response = await api.get(`/parking-spots/${id}`);
    return response.data.spot;
  }

  async createParkingSpot(data: CreateParkingSpotData) {
    const response = await api.post('/parking-spots', data);
    return response.data;
  }

  async updateParkingSpot(id: string, data: Partial<CreateParkingSpotData>) {
    const response = await api.put(`/parking-spots/${id}`, data);
    return response.data;
  }

  async deleteParkingSpot(id: string) {
    const response = await api.delete(`/parking-spots/${id}`);
    return response.data;
  }

  async getOwnerSpots(params: { status?: string; page?: number; limit?: number } = {}) {
    const response = await api.get('/parking-spots/owner/my-spots', { params });
    return response.data;
  }

  async createAvailabilitySlot(spotId: string, data: {
    date: string;
    startTime: string;
    endTime: string;
    status: string;
    reason?: string;
    slotsAffected: number;
  }) {
    const response = await api.post(`/parking-spots/${spotId}/availability`, data);
    return response.data;
  }

  async getAvailabilitySlots(spotId: string, params: { startDate?: string; endDate?: string } = {}) {
    const response = await api.get(`/parking-spots/${spotId}/availability`, { params });
    return response.data;
  }
}

export const parkingSpotService = new ParkingSpotService();