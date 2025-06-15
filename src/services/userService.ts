import api from '../config/api';

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  businessName?: string;
  businessAddress?: string;
}

export interface VehicleData {
  make: string;
  model: string;
  licensePlate: string;
  color: string;
}

class UserService {
  async getProfile() {
    const response = await api.get('/users/profile');
    return response.data.user;
  }

  async updateProfile(data: UpdateProfileData) {
    const response = await api.put('/users/profile', data);
    return response.data;
  }

  async getVehicles() {
    const response = await api.get('/users/vehicles');
    return response.data.vehicles;
  }

  async addVehicle(data: VehicleData) {
    const response = await api.post('/users/vehicles', data);
    return response.data;
  }

  async updateVehicle(id: string, data: Partial<VehicleData>) {
    const response = await api.put(`/users/vehicles/${id}`, data);
    return response.data;
  }

  async deleteVehicle(id: string) {
    const response = await api.delete(`/users/vehicles/${id}`);
    return response.data;
  }
}

export const userService = new UserService();