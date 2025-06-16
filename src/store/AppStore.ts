import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { ParkingSpot, Booking, User, Vehicle } from '../types';

interface AppState {
  // Auth state
  isAuthenticated: boolean;
  user: User | null;
  userType: 'CUSTOMER' | 'OWNER' | 'ADMIN' | null;
  loading: {
    auth: boolean;
    spots: boolean;
    bookings: boolean;
  };

  // Data state
  parkingSpots: ParkingSpot[];
  bookings: Booking[];
  vehicles: Vehicle[];
  
  // Search and filters
  searchQuery: string;
  filters: {
    priceRange: [number, number];
    parkingType: string;
    amenities: string[];
  };

  // Computed state
  filteredSpots: ParkingSpot[];

  // Actions
  initializeApp: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUserType: (type: 'CUSTOMER' | 'OWNER' | 'ADMIN') => void;
  
  // Data actions
  fetchParkingSpots: () => Promise<void>;
  fetchBookings: () => Promise<void>;
  fetchVehicles: () => Promise<void>;
  
  // CRUD operations
  addParkingSpot: (spotData: Omit<ParkingSpot, 'id' | 'ownerId' | 'rating' | 'reviewCount'>) => Promise<void>;
  updateParkingSpot: (id: string, updates: Partial<ParkingSpot>) => void;
  deleteParkingSpot: (id: string) => void;
  createBooking: (bookingData: Omit<Booking, 'id' | 'qrCode' | 'pin' | 'createdAt'>) => Promise<Booking>;
  validateEntry: (code: string) => Booking | null;
  
  // Search and filter actions
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<AppState['filters']>) => void;
  applyFilters: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  isAuthenticated: false,
  user: null,
  userType: null,
  loading: {
    auth: true,
    spots: false,
    bookings: false,
  },
  
  parkingSpots: [],
  bookings: [],
  vehicles: [],
  
  searchQuery: '',
  filters: {
    priceRange: [0, 500],
    parkingType: 'all',
    amenities: [],
  },
  
  filteredSpots: [],

  // Initialize app
  initializeApp: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Get user data from database
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userData && !error) {
          set({
            isAuthenticated: true,
            user: {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              phone: userData.phone || '',
              vehicles: []
            },
            userType: userData.role,
            loading: { ...get().loading, auth: false }
          });

          // Fetch initial data
          await get().fetchParkingSpots();
          if (userData.role === 'CUSTOMER') {
            await get().fetchVehicles();
            await get().fetchBookings();
          } else if (userData.role === 'OWNER' || userData.role === 'ADMIN') {
            await get().fetchBookings();
          }
        }
      } else {
        set({
          isAuthenticated: false,
          user: null,
          userType: null,
          loading: { ...get().loading, auth: false }
        });
      }
    } catch (error) {
      console.error('Error initializing app:', error);
      set({
        isAuthenticated: false,
        user: null,
        userType: null,
        loading: { ...get().loading, auth: false }
      });
    }
  },

  // Auth actions
  login: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        // Get user data from database
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (userData && !userError) {
          set({
            isAuthenticated: true,
            user: {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              phone: userData.phone || '',
              vehicles: []
            },
            userType: userData.role
          });

          // Fetch initial data
          await get().fetchParkingSpots();
          if (userData.role === 'CUSTOMER') {
            await get().fetchVehicles();
            await get().fetchBookings();
          } else if (userData.role === 'OWNER' || userData.role === 'ADMIN') {
            await get().fetchBookings();
          }
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: () => {
    supabase.auth.signOut();
    set({
      isAuthenticated: false,
      user: null,
      userType: null,
      parkingSpots: [],
      bookings: [],
      vehicles: []
    });
  },

  setUserType: (type) => {
    set({ userType: type });
  },

  // Data fetching
  fetchParkingSpots: async () => {
    try {
      set(state => ({ loading: { ...state.loading, spots: true } }));
      
      const { data, error } = await supabase
        .from('parking_spots')
        .select('*')
        .eq('status', 'ACTIVE')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const spots: ParkingSpot[] = (data || []).map(spot => ({
        id: spot.id,
        name: spot.name,
        description: spot.description || '',
        address: spot.address,
        price: spot.price,
        priceType: spot.price_type as 'hour' | 'day' | 'month',
        totalSlots: spot.total_slots,
        availableSlots: spot.available_slots,
        rating: spot.rating,
        reviewCount: spot.review_count,
        images: spot.images || [],
        amenities: spot.amenities || [],
        openingHours: spot.opening_hours,
        phone: spot.phone,
        lat: spot.latitude,
        lng: spot.longitude,
        ownerId: spot.owner_id
      }));

      set({ 
        parkingSpots: spots,
        loading: { ...get().loading, spots: false }
      });
      
      // Update filtered spots
      get().applyFilters();
    } catch (error) {
      console.error('Error fetching parking spots:', error);
      set(state => ({ loading: { ...state.loading, spots: false } }));
    }
  },

  fetchBookings: async () => {
    const { user, userType } = get();
    if (!user) return;

    try {
      set(state => ({ loading: { ...state.loading, bookings: true } }));
      
      let query = supabase
        .from('bookings')
        .select(`
          *,
          parking_spots!inner(name, address),
          vehicles!inner(make, model, license_plate)
        `);

      // Filter based on user type
      if (userType === 'CUSTOMER') {
        query = query.eq('user_id', user.id);
      } else if (userType === 'OWNER' || userType === 'ADMIN') {
        // For owners, get bookings for their parking spots
        const { data: ownerSpots } = await supabase
          .from('parking_spots')
          .select('id')
          .eq('owner_id', user.id);
        
        if (ownerSpots && ownerSpots.length > 0) {
          const spotIds = ownerSpots.map(spot => spot.id);
          query = query.in('spot_id', spotIds);
        } else {
          // No spots owned, return empty array
          set({ 
            bookings: [],
            loading: { ...get().loading, bookings: false }
          });
          return;
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const bookings: Booking[] = (data || []).map(booking => ({
        id: booking.id,
        spotId: booking.spot_id,
        userId: booking.user_id,
        vehicleId: booking.vehicle_id,
        startTime: booking.start_time,
        endTime: booking.end_time,
        totalCost: booking.total_cost,
        status: booking.status.toLowerCase() as 'pending' | 'active' | 'completed' | 'cancelled',
        qrCode: booking.qr_code,
        pin: booking.pin,
        createdAt: booking.created_at
      }));

      set({ 
        bookings,
        loading: { ...get().loading, bookings: false }
      });
    } catch (error) {
      console.error('Error fetching bookings:', error);
      set(state => ({ loading: { ...state.loading, bookings: false } }));
    }
  },

  fetchVehicles: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const vehicles: Vehicle[] = (data || []).map(vehicle => ({
        id: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        licensePlate: vehicle.license_plate,
        color: vehicle.color
      }));

      set(state => ({
        user: state.user ? { ...state.user, vehicles } : null,
        vehicles
      }));
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  },

  // CRUD operations
  addParkingSpot: async (spotData) => {
    const { user } = get();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('parking_spots')
        .insert({
          name: spotData.name,
          description: spotData.description,
          address: spotData.address,
          latitude: spotData.lat,
          longitude: spotData.lng,
          price: spotData.price,
          price_type: spotData.priceType,
          total_slots: spotData.totalSlots,
          available_slots: spotData.totalSlots,
          amenities: spotData.amenities,
          images: spotData.images,
          opening_hours: spotData.openingHours,
          phone: spotData.phone,
          owner_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh parking spots
      await get().fetchParkingSpots();
    } catch (error) {
      console.error('Error adding parking spot:', error);
      throw error;
    }
  },

  updateParkingSpot: (id, updates) => {
    set(state => ({
      parkingSpots: state.parkingSpots.map(spot =>
        spot.id === id ? { ...spot, ...updates } : spot
      )
    }));
    get().applyFilters();
  },

  deleteParkingSpot: (id) => {
    set(state => ({
      parkingSpots: state.parkingSpots.filter(spot => spot.id !== id)
    }));
    get().applyFilters();
  },

  createBooking: async (bookingData) => {
    const { user } = get();
    if (!user) throw new Error('User not authenticated');

    try {
      // Generate QR code and PIN
      const qrCode = `QR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const pin = Math.floor(1000 + Math.random() * 9000).toString();

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          spot_id: bookingData.spotId,
          user_id: user.id,
          vehicle_id: bookingData.vehicleId,
          start_time: bookingData.startTime,
          end_time: bookingData.endTime,
          reserved_end_time: bookingData.endTime,
          total_cost: bookingData.totalCost,
          status: 'PENDING',
          qr_code: qrCode,
          pin: pin
        })
        .select()
        .single();

      if (error) throw error;

      const newBooking: Booking = {
        id: data.id,
        spotId: data.spot_id,
        userId: data.user_id,
        vehicleId: data.vehicle_id,
        startTime: data.start_time,
        endTime: data.end_time,
        totalCost: data.total_cost,
        status: data.status.toLowerCase() as 'pending',
        qrCode: data.qr_code,
        pin: data.pin,
        createdAt: data.created_at
      };

      // Update local state
      set(state => ({
        bookings: [newBooking, ...state.bookings]
      }));

      return newBooking;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  validateEntry: (code) => {
    const { bookings } = get();
    return bookings.find(booking => 
      (booking.qrCode === code || booking.pin === code) &&
      (booking.status === 'pending' || booking.status === 'active')
    ) || null;
  },

  // Search and filter actions
  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().applyFilters();
  },

  setFilters: (newFilters) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters }
    }));
    get().applyFilters();
  },

  // Helper function to apply filters
  applyFilters: () => {
    const { parkingSpots, searchQuery, filters } = get();
    
    let filtered = parkingSpots.filter(spot => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!spot.name.toLowerCase().includes(query) && 
            !spot.address.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Price filter
      if (spot.price > filters.priceRange[1]) {
        return false;
      }

      // Parking type filter
      if (filters.parkingType !== 'all') {
        const hasType = spot.amenities.some(amenity => {
          switch (filters.parkingType) {
            case 'covered': return amenity.toLowerCase().includes('covered');
            case 'valet': return amenity.toLowerCase().includes('valet');
            case 'security': return amenity.toLowerCase().includes('security');
            default: return true;
          }
        });
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
  }
}));