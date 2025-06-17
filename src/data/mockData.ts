import { ParkingSpot, Booking, User, Review } from '../types';

export const mockParkingSpots: ParkingSpot[] = [
  {
    id: '1',
    name: 'Downtown Central Parking',
    address: '123 Main Street, Downtown',
    price: 15,
    priceType: 'hour',
    totalSlots: 50,
    availableSlots: 23,
    rating: 4.5,
    reviewCount: 128,
    images: [
      '/placeholder.svg',
      '/placeholder.svg',
      '/placeholder.svg'
    ],
    amenities: ['Security Camera', '24/7 Access', 'Covered Parking', 'Electric Vehicle Charging'],
    openingHours: '24/7',
    description: 'Secure covered parking in the heart of downtown. Perfect for business meetings and shopping.',
    lat: 40.7128,
    lng: -74.0060,
    phone: '+1 (555) 123-4567',
    ownerId: 'owner1',
    isActive: true
  },
  {
    id: '2',
    name: 'Airport Express Parking',
    address: '456 Airport Boulevard, Terminal Area',
    price: 25,
    priceType: 'day',
    totalSlots: 200,
    availableSlots: 89,
    rating: 4.2,
    reviewCount: 256,
    images: [
      '/placeholder.svg',
      '/placeholder.svg'
    ],
    amenities: ['Shuttle Service', 'Security Camera', 'Covered Parking', 'Car Wash'],
    openingHours: '24/7',
    description: 'Convenient airport parking with complimentary shuttle service. Ideal for travelers.',
    lat: 40.6892,
    lng: -74.1745,
    phone: '+1 (555) 987-6543',
    ownerId: 'owner2',
    isActive: true
  },
  {
    id: '3',
    name: 'Shopping Mall Parking',
    address: '789 Mall Drive, Shopping District',
    price: 8,
    priceType: 'day',
    totalSlots: 300,
    availableSlots: 156,
    rating: 4.0,
    reviewCount: 89,
    images: [
      '/placeholder.svg'
    ],
    amenities: ['Security Camera', 'Covered Parking', 'Walking Distance to Mall'],
    openingHours: '6:00 AM - 11:00 PM',
    description: 'Large parking facility adjacent to the main shopping mall. Great for shoppers and diners.',
    lat: 40.7282,
    lng: -73.7949,
    phone: '+1 (555) 456-7890',
    ownerId: 'owner1',
    isActive: true
  }
];

export const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  password: 'hashedpassword',
  userType: 'customer',
  vehicles: [
    {
      id: 'v1',
      make: 'Toyota',
      model: 'Camry',
      licensePlate: 'ABC-123',
      color: 'Blue'
    }
  ]
};

export const mockBookings: Booking[] = [
  {
    id: 'b1',
    spotId: '1',
    userId: 'user1',
    startTime: '2024-01-15T09:00:00Z',
    endTime: '2024-01-15T17:00:00Z',
    vehicleId: 'v1',
    totalCost: 200,
    status: 'active',
    qrCode: 'QR123456789',
    pin: '1234',
    createdAt: '2024-01-14T10:30:00Z'
  },
  {
    id: 'b2',
    spotId: '2',
    userId: 'user1',
    startTime: '2024-01-12T14:00:00Z',
    endTime: '2024-01-12T18:00:00Z',
    vehicleId: 'v2',
    totalCost: 100,
    status: 'completed',
    qrCode: 'QR987654321',
    pin: '5678',
    createdAt: '2024-01-11T16:20:00Z'
  }
];

export const mockReviews: Review[] = [
  {
    id: 'r1',
    userId: 'user1',
    spotId: '1',
    rating: 5,
    comment: 'Excellent parking facility with great security and easy access. Highly recommended!',
    createdAt: '2024-01-10T15:30:00Z',
    userName: 'John D.'
  },
  {
    id: 'r2',
    userId: 'user2',
    spotId: '1',
    rating: 4,
    comment: 'Good location and clean facilities. The EV charging station was very convenient.',
    createdAt: '2024-01-08T11:45:00Z',
    userName: 'Sarah M.'
  }
];
