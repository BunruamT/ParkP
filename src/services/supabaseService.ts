
import { supabase } from '../integrations/supabase/client';

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

class SupabaseService {
  // Profile methods
  async getCurrentUserProfile(): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  }

  async updateProfile(updates: Partial<Profile>): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Parking spot methods
  async getParkingSpots(filters?: {
    location?: string;
    startDate?: string;
    endDate?: string;
    maxPrice?: number;
  }): Promise<ParkingSpot[]> {
    let query = supabase
      .from('parking_spots')
      .select('*')
      .eq('is_available', true);

    if (filters?.maxPrice) {
      query = query.lte('hourly_rate', filters.maxPrice);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async getParkingSpotById(id: string): Promise<ParkingSpot | null> {
    const { data, error } = await supabase
      .from('parking_spots')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching parking spot:', error);
      return null;
    }

    return data;
  }

  async getMyParkingSpots(): Promise<ParkingSpot[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('parking_spots')
      .select('*')
      .eq('owner_id', user.id);

    if (error) throw error;
    return data || [];
  }

  async createParkingSpot(spotData: Omit<ParkingSpot, 'id' | 'owner_id' | 'created_at' | 'updated_at'>): Promise<ParkingSpot> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('parking_spots')
      .insert({
        ...spotData,
        owner_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateParkingSpot(id: string, updates: Partial<ParkingSpot>): Promise<ParkingSpot> {
    const { data, error } = await supabase
      .from('parking_spots')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteParkingSpot(id: string): Promise<void> {
    const { error } = await supabase
      .from('parking_spots')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Booking methods
  async createBooking(bookingData: {
    spot_id: string;
    host_id: string;
    start_time: string;
    end_time: string;
    total_amount: number;
    guest_notes?: string;
  }): Promise<Booking> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        ...bookingData,
        guest_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getMyBookings(): Promise<Booking[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .or(`guest_id.eq.${user.id},host_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async updateBookingStatus(id: string, status: Booking['status']): Promise<Booking> {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Review methods
  async getReviewsForSpot(spotId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        reviewer:profiles!reviews_reviewer_id_fkey(full_name, avatar_url)
      `)
      .eq('is_host_review', false)
      .in('booking_id', [
        // We need to get booking IDs for this spot
      ]);

    if (error) throw error;
    return data || [];
  }

  async createReview(reviewData: {
    booking_id: string;
    reviewee_id: string;
    rating: number;
    comment?: string;
    is_host_review: boolean;
  }): Promise<Review> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        ...reviewData,
        reviewer_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Authentication methods
  async signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });

    if (error) throw error;
    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  // Search and filter methods
  async searchParkingSpots(query: string, filters?: {
    spot_type?: string;
    max_hourly_rate?: number;
    amenities?: string[];
  }): Promise<ParkingSpot[]> {
    let supabaseQuery = supabase
      .from('parking_spots')
      .select('*')
      .eq('is_available', true);

    if (query) {
      supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,address.ilike.%${query}%,description.ilike.%${query}%`);
    }

    if (filters?.spot_type) {
      supabaseQuery = supabaseQuery.eq('spot_type', filters.spot_type);
    }

    if (filters?.max_hourly_rate) {
      supabaseQuery = supabaseQuery.lte('hourly_rate', filters.max_hourly_rate);
    }

    if (filters?.amenities && filters.amenities.length > 0) {
      supabaseQuery = supabaseQuery.contains('amenities', filters.amenities);
    }

    const { data, error } = await supabaseQuery.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}

export const supabaseService = new SupabaseService();
