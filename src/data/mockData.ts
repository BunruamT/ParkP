// This file now serves as fallback data and type definitions
// Most data is now fetched from Supabase

import type { User, Vehicle, Booking, ParkingSpot, Review } from '../types';

// Demo user data for testing
export const mockUser: User = {
  id: 'user-customer-1',
  name: 'Mike Wilson',
  email: 'customer1@parkpass.com',
  phone: '+1-555-0004',
  vehicles: [
    {
      id: 'vehicle-1',
      make: 'Toyota',
      model: 'Camry',
      licensePlate: 'ABC-123',
      color: 'Silver'
    },
    {
      id: 'vehicle-2',
      make: 'Honda',
      model: 'Civic',
      licensePlate: 'XYZ-789',
      color: 'Blue'
    }
  ]
};

// Mock reviews for spots (these could be fetched from Supabase reviews table)
export const mockReviews: Review[] = [
  {
    id: 'review-1',
    userId: 'user-customer-1',
    spotId: 'spot-1',
    rating: 5,
    comment: 'Excellent parking facility with great security and easy access. Highly recommended!',
    createdAt: '2024-01-15T10:30:00Z',
    userName: 'Mike Wilson'
  },
  {
    id: 'review-2',
    userId: 'user-customer-2',
    spotId: 'spot-1',
    rating: 4,
    comment: 'Good location and clean facilities. The EV charging station was very convenient.',
    createdAt: '2024-01-12T14:20:00Z',
    userName: 'Emily Davis'
  },
  {
    id: 'review-3',
    userId: 'user-customer-1',
    spotId: 'spot-2',
    rating: 4,
    comment: 'Perfect for shopping trips. Direct mall access is a huge plus.',
    createdAt: '2024-01-10T16:45:00Z',
    userName: 'Mike Wilson'
  }
];

// Fallback parking spots (now fetched from Supabase)
export const fallbackParkingSpots: ParkingSpot[] = [
  {
    id: 'spot-1',
    name: 'Central Plaza Parking',
    description: 'Premium parking facility in the heart of downtown with state-of-the-art security and amenities.',
    address: '123 Main Street, Downtown',
    price: 25,
    priceType: 'hour',
    totalSlots: 50,
    availableSlots: 45,
    rating: 4.5,
    reviewCount: 128,
    images: [
      'https://images.pexels.com/photos/753876/pexels-photo-753876.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    amenities: ['CCTV Security', 'EV Charging', 'Covered Parking', 'Elevator Access'],
    openingHours: '24/7',
    phone: '+1-555-123-4567',
    lat: 40.7589,
    lng: -73.9851,
    ownerId: 'user-owner-1'
  }
];

// Mock bookings for testing (now fetched from Supabase)
export const mockBookings: Booking[] = [
  {
    id: 'booking-1',
    spotId: 'spot-1',
    userId: 'user-customer-1',
    vehicleId: 'vehicle-1',
    startTime: '2024-01-20T14:00:00Z',
    endTime: '2024-01-20T16:00:00Z',
    totalCost: 50,
    status: 'active',
    qrCode: 'QR123456789',
    pin: '1234',
    createdAt: '2024-01-20T13:30:00Z'
  }
];