import { create } from 'zustand';
import { ParkingSpot, Booking, User, Vehicle } from '../types';
import { authService } from '../services/authService';
import { parkingSpotService } from '../services/parkingSpotService';
import { bookingService } from '../services/bookingService';
import { userService } from '../services/userService';

interface AppState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  userType: 'CUSTOMER' | 'OWNER' | 'ADMIN';
  
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
  
  // Loading states
  loading: {
    spots: boolean;
    bookings: boolean;
    auth: boolean;
  };
  
  // Actions
  setUser: (user: User | null) => void;
  setUserType: (type: 'CUSTOMER' | 'OWNER' | 'ADMIN') => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => void;
  
  // Parking spots actions
  fetchParkingSpots: (filters?: any) => Promise<void>;
  addParkingSpot: (spot: any) => Promise<void>;
  updateParkingSpot: (id: string, updates: any) => Promise<void>;
  deleteParkingSpot: (id: string) => Promise<void>;
  
  // Booking actions
  createBooking: (booking: any) => Promise<Booking>;
  fetchBookings: () => Promise<void>;
  extendBooking: (id: string) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
  validateEntry: (code: string) => Promise<any>;
  
  // Search and filter
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<AppState['filters']>) => void;
  applyFilters: () => void;
  
  // Vehicle management
  addVehicle: (vehicle: any) => Promise<void>;
  updateVehicle: (id: string, updates: any) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  
  // Initialize app
  initializeApp: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  userType: 'CUSTOMER',
  parkingSpots: [],
  filteredSpots: [],
  bookings: [],
  searchQuery: '',
  filters: {
    priceRange: [0, 500],
    parkingType: 'all',
    amenities: []
  },
  loading: {
    spots: false,
    bookings: false,
    auth: false
  },

  // User actions
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setUserType: (userType) => set({ userType }),
  
  login: async (email, password) => {
    try {
      set(state => ({ loading: { ...state.loading, auth: true } }));
      const response = await authService.login({ email, password });
      
      set({ 
        user: response.user, 
        isAuthenticated: true, 
        userType: response.user.role,
        loading: { ...get().loading, auth: false }
      });
      
      return true;
    } catch (error) {
      set(state => ({ loading: { ...state.loading, auth: false } }));
      console.error('Login error:', error);
      return false;
    }
  },
  
  register: async (data) => {
    try {
      set(state => ({ loading: { ...state.loading, auth: true } }));
      const response = await authService.register(data);
      
      set({ 
        user: response.user, 
        isAuthenticated: true, 
        userType: response.user.role,
        loading: { ...get().loading, auth: false }
      });
      
      return true;
    } catch (error) {
      set(state => ({ loading: { ...state.loading, auth: false } }));
      console.error('Register error:', error);
      return false;
    }
  },
  
  logout: () => {
    authService.logout();
    set({ 
      user: null, 
      isAuthenticated: false, 
      userType: 'CUSTOMER',
      bookings: [],
      parkingSpots: [],
      filteredSpots: []
    });
  },

  // Parking spots actions
  fetchParkingSpots: async (filters = {}) => {
    try {
      set(state => ({ loading: { ...state.loading, spots: true } }));
      const response = await parkingSpotService.getParkingSpots(filters);
      
      set({ 
        parkingSpots: response.spots,
        filteredSpots: response.spots,
        loading: { ...get().loading, spots: false }
      });
    } catch (error) {
      set(state => ({ loading: { ...state.loading, spots: false } }));
      console.error('Fetch parking spots error:', error);
    }
  },

  addParkingSpot: async (spotData) => {
    try {
      const response = await parkingSpotService.createParkingSpot(spotData);
      const newSpot = response.spot;
      
      set(state => ({
        parkingSpots: [...state.parkingSpots, newSpot],
        filteredSpots: [...state.filteredSpots, newSpot]
      }));
    } catch (error) {
      console.error('Add parking spot error:', error);
      throw error;
    }
  },

  updateParkingSpot: async (id, updates) => {
    try {
      const response = await parkingSpotService.updateParkingSpot(id, updates);
      const updatedSpot = response.spot;
      
      set(state => ({
        parkingSpots: state.parkingSpots.map(spot => 
          spot.id === id ? updatedSpot : spot
        ),
        filteredSpots: state.filteredSpots.map(spot => 
          spot.id === id ? updatedSpot : spot
        )
      }));
    } catch (error) {
      console.error('Update parking spot error:', error);
      throw error;
    }
  },

  deleteParkingSpot: async (id) => {
    try {
      await parkingSpotService.deleteParkingSpot(id);
      
      set(state => ({
        parkingSpots: state.parkingSpots.filter(spot => spot.id !== id),
        filteredSpots: state.filteredSpots.filter(spot => spot.id !== id)
      }));
    } catch (error) {
      console.error('Delete parking spot error:', error);
      throw error;
    }
  },

  // Booking actions
  createBooking: async (bookingData) => {
    try {
      const response = await bookingService.createBooking(bookingData);
      const newBooking = response.booking;
      
      set(state => ({
        bookings: [...state.bookings, newBooking]
      }));
      
      return newBooking;
    } catch (error) {
      console.error('Create booking error:', error);
      throw error;
    }
  },

  fetchBookings: async () => {
    try {
      set(state => ({ loading: { ...state.loading, bookings: true } }));
      const response = await bookingService.getMyBookings();
      
      set({ 
        bookings: response.bookings,
        loading: { ...get().loading, bookings: false }
      });
    } catch (error) {
      set(state => ({ loading: { ...state.loading, bookings: false } }));
      console.error('Fetch bookings error:', error);
    }
  },

  extendBooking: async (id) => {
    try {
      await bookingService.extendBooking(id);
      // Refresh bookings
      await get().fetchBookings();
    } catch (error) {
      console.error('Extend booking error:', error);
      throw error;
    }
  },

  cancelBooking: async (id) => {
    try {
      await bookingService.cancelBooking(id);
      // Refresh bookings
      await get().fetchBookings();
    } catch (error) {
      console.error('Cancel booking error:', error);
      throw error;
    }
  },

  validateEntry: async (code) => {
    try {
      const response = await bookingService.validateEntry(code);
      return response;
    } catch (error) {
      console.error('Validate entry error:', error);
      throw error;
    }
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
  addVehicle: async (vehicleData) => {
    try {
      const response = await userService.addVehicle(vehicleData);
      // Refresh user data to get updated vehicles
      const updatedUser = await userService.getProfile();
      set({ user: updatedUser });
    } catch (error) {
      console.error('Add vehicle error:', error);
      throw error;
    }
  },

  updateVehicle: async (id, updates) => {
    try {
      await userService.updateVehicle(id, updates);
      // Refresh user data to get updated vehicles
      const updatedUser = await userService.getProfile();
      set({ user: updatedUser });
    } catch (error) {
      console.error('Update vehicle error:', error);
      throw error;
    }
  },

  deleteVehicle: async (id) => {
    try {
      await userService.deleteVehicle(id);
      // Refresh user data to get updated vehicles
      const updatedUser = await userService.getProfile();
      set({ user: updatedUser });
    } catch (error) {
      console.error('Delete vehicle error:', error);
      throw error;
    }
  },

  // Initialize app
  initializeApp: async () => {
    try {
      if (authService.isAuthenticated()) {
        const user = await authService.getCurrentUser();
        set({ 
          user, 
          isAuthenticated: true, 
          userType: user.role 
        });
        
        // Fetch initial data
        await get().fetchParkingSpots();
        await get().fetchBookings();
      }
    } catch (error) {
      console.error('Initialize app error:', error);
      // If token is invalid, logout
      authService.logout();
      set({ 
        user: null, 
        isAuthenticated: false, 
        userType: 'CUSTOMER' 
      });
    }
  }
}));