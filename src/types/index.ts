
// Updated types for the C2C parking booking platform

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  user_type: 'host' | 'guest' | 'both';
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface ParkingSpot {
  id: string;
  owner_id: string;
  title: string;
  description?: string;
  spot_type: 'driveway' | 'garage' | 'street' | 'lot' | 'covered';
  address: string;
  latitude?: number;
  longitude?: number;
  hourly_rate: number;
  daily_rate?: number;
  is_available: boolean;
  images: string[];
  amenities: string[];
  instructions?: string;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  spot_id: string;
  guest_id: string;
  host_id: string;
  start_time: string;
  end_time: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  guest_notes?: string;
  host_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment?: string;
  is_host_review: boolean;
  created_at: string;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  licensePlate: string;
  color: string;
}

// Legacy types for backward compatibility - will be gradually phased out
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  userType: 'customer' | 'owner';
  vehicles?: Vehicle[];
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  userType: 'customer' | 'owner';
  vehicles?: Vehicle[];
}

// Filter and search types
export interface SpotFilters {
  location?: string;
  spot_type?: 'driveway' | 'garage' | 'street' | 'lot' | 'covered';
  max_hourly_rate?: number;
  amenities?: string[];
  start_date?: string;
  end_date?: string;
}

export interface BookingRequest {
  spot_id: string;
  host_id: string;
  start_time: string;
  end_time: string;
  total_amount: number;
  guest_notes?: string;
}
