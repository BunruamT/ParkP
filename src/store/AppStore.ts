import { create } from 'zustand';
import { ParkingSpot, Booking, User, Vehicle } from '../types';

interface AppState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  userType: 'customer' | 'admin';
  
  // Parking spots
  parkingSpots: ParkingSpot[];
  filteredSpots: ParkingSpot[];
  
  // Bookings
  bookings: Booking[];
  
  // UI state
  searchQuery: string;
  filters: {
    priceRange: [number, number];
    parkingType: string;
    amenities: string[];
  };
  
  // Actions
  setUser: (user: User | null) => void;
  setUserType: (type: 'customer' | 'admin') => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  
  // Parking spots actions
  addParkingSpot: (spot: Omit<ParkingSpot, 'id'>) => void;
  updateParkingSpot: (id: string, updates: Partial<ParkingSpot>) => void;
  deleteParkingSpot: (id: string) => void;
  
  // Booking actions
  createBooking: (booking: Omit<Booking, 'id' | 'qrCode' | 'pin' | 'createdAt'>) => Booking;
  validateEntry: (code: string) => Booking | null;
  
  // Search and filter
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<AppState['filters']>) => void;
  applyFilters: () => void;
  
  // Vehicle management
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
}

// Mock initial data
const mockUser: User = {
  id: 'user1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  vehicles: [
    {
      id: 'v1',
      make: 'Toyota',
      model: 'Camry',
      licensePlate: 'ABC-123',
      color: 'Silver'
    }
  ]
};

const mockParkingSpots: ParkingSpot[] = [
  {
    id: '1',
    name: 'Central Plaza Parking',
    address: '123 Main Street, Downtown',
    price: 25,
    priceType: 'hour',
    totalSlots: 50,
    availableSlots: 12,
    rating: 4.5,
    reviewCount: 128,
    images: [
      'https://images.pexels.com/photos/753876/pexels-photo-753876.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    amenities: ['CCTV Security', 'EV Charging', 'Covered Parking', 'Elevator Access'],
    openingHours: '24/7',
    phone: '+1 (555) 123-4567',
    description: 'Premium parking facility in the heart of downtown with state-of-the-art security and amenities.',
    lat: 40.7589,
    lng: -73.9851,
    ownerId: 'owner1'
  },
  {
    id: '2',
    name: 'Riverside Mall Parking',
    address: '456 River Road, Westside',
    price: 150,
    priceType: 'day',
    totalSlots: 200,
    availableSlots: 45,
    rating: 4.2,
    reviewCount: 89,
    images: [
      'https://images.pexels.com/photos/1004409/pexels-photo-1004409.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2199293/pexels-photo-2199293.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    amenities: ['Shopping Access', 'Food Court Nearby', 'Valet Service', 'Car Wash'],
    openingHours: '6:00 AM - 11:00 PM',
    phone: '+1 (555) 987-6543',
    description: 'Convenient mall parking with direct access to shopping and dining.',
    lat: 40.7505,
    lng: -73.9934,
    ownerId: 'owner2'
  }
];

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  userType: 'customer',
  parkingSpots: mockParkingSpots,
  filteredSpots: mockParkingSpots,
  bookings: [],
  searchQuery: '',
  filters: {
    priceRange: [0, 500],
    parkingType: 'all',
    amenities: []
  },

  // User actions
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setUserType: (userType) => set({ userType }),
  
  login: async (email, password) => {
    // Mock login logic
    if (email.includes('owner') || email.includes('admin')) {
      set({ 
        user: { ...mockUser, email }, 
        isAuthenticated: true, 
        userType: 'admin' 
      });
    } else {
      set({ 
        user: { ...mockUser, email }, 
        isAuthenticated: true, 
        userType: 'customer' 
      });
    }
    return true;
  },
  
  logout: () => set({ 
    user: null, 
    isAuthenticated: false, 
    userType: 'customer',
    bookings: []
  }),

  // Parking spots actions
  addParkingSpot: (spotData) => {
    const newSpot: ParkingSpot = {
      ...spotData,
      id: Date.now().toString(),
      availableSlots: spotData.totalSlots,
      rating: 0,
      reviewCount: 0,
      ownerId: get().user?.id || 'unknown'
    };
    
    set(state => ({
      parkingSpots: [...state.parkingSpots, newSpot],
      filteredSpots: [...state.filteredSpots, newSpot]
    }));
  },

  updateParkingSpot: (id, updates) => {
    set(state => ({
      parkingSpots: state.parkingSpots.map(spot => 
        spot.id === id ? { ...spot, ...updates } : spot
      ),
      filteredSpots: state.filteredSpots.map(spot => 
        spot.id === id ? { ...spot, ...updates } : spot
      )
    }));
  },

  deleteParkingSpot: (id) => {
    set(state => ({
      parkingSpots: state.parkingSpots.filter(spot => spot.id !== id),
      filteredSpots: state.filteredSpots.filter(spot => spot.id !== id)
    }));
  },

  // Booking actions
  createBooking: (bookingData) => {
    const qrCode = `QR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    
    const newBooking: Booking = {
      ...bookingData,
      id: `BK-${Date.now()}`,
      qrCode,
      pin,
      createdAt: new Date().toISOString()
    };
    
    set(state => ({
      bookings: [...state.bookings, newBooking]
    }));
    
    return newBooking;
  },

  validateEntry: (code) => {
    const bookings = get().bookings;
    return bookings.find(booking => 
      booking.qrCode === code || booking.pin === code
    ) || null;
  },

  // Search and filter
  setSearchQuery: (searchQuery) => {
    set({ searchQuery });
    get().applyFilters();
  },

  setFilters: (newFilters) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters }
    }));
    get().applyFilters();
  },

  applyFilters: () => {
    const { parkingSpots, searchQuery, filters } = get();
    
    let filtered = parkingSpots.filter(spot => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!spot.name.toLowerCase().includes(query) && 
            !spot.address.toLowerCase().includes(query)) {
          return false;
        }
      }
      
      // Price range filter
      const hourlyPrice = spot.priceType === 'hour' ? spot.price : 
                         spot.priceType === 'day' ? spot.price / 24 : 
                         spot.price / (24 * 30);
      
      if (hourlyPrice < filters.priceRange[0] || hourlyPrice > filters.priceRange[1]) {
        return false;
      }
      
      // Parking type filter
      if (filters.parkingType !== 'all') {
        const hasType = spot.amenities.some(amenity => 
          amenity.toLowerCase().includes(filters.parkingType.toLowerCase())
        );
        if (!hasType) return false;
      }
      
      // Amenities filter
      if (filters.amenities.length > 0) {
        const hasAllAmenities = filters.amenities.every(amenity =>
          spot.amenities.includes(amenity)
        );
        if (!hasAllAmenities) return false;
      }
      
      return true;
    });
    
    set({ filteredSpots: filtered });
  },

  // Vehicle management
  addVehicle: (vehicleData) => {
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: Date.now().toString()
    };
    
    set(state => ({
      user: state.user ? {
        ...state.user,
        vehicles: [...state.user.vehicles, newVehicle]
      } : state.user
    }));
  },

  updateVehicle: (id, updates) => {
    set(state => ({
      user: state.user ? {
        ...state.user,
        vehicles: state.user.vehicles.map(vehicle =>
          vehicle.id === id ? { ...vehicle, ...updates } : vehicle
        )
      } : state.user
    }));
  },

  deleteVehicle: (id) => {
    set(state => ({
      user: state.user ? {
        ...state.user,
        vehicles: state.user.vehicles.filter(vehicle => vehicle.id !== id)
      } : state.user
    }));
  }
}));