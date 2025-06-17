
import { ParkingSpot, Booking, User, Review, Vehicle } from '../types';

// Temporary in-memory database for development
// This will be replaced with actual Supabase calls once the database is properly set up
class TemporaryDatabase {
  private spots: ParkingSpot[] = [];
  private bookings: Booking[] = [];
  private users: User[] = [];
  private reviews: Review[] = [];

  async getParkingSpots(): Promise<ParkingSpot[]> {
    return this.spots;
  }

  async getParkingSpotsByOwner(ownerId: string): Promise<ParkingSpot[]> {
    return this.spots.filter(spot => spot.owner_id === ownerId);
  }

  async getParkingSpotById(id: string): Promise<ParkingSpot | undefined> {
    return this.spots.find(spot => spot.id === id);
  }

  async getAllBookings(): Promise<Booking[]> {
    return this.bookings;
  }

  async getBookingsBySpotId(spotId: string): Promise<Booking[]> {
    return this.bookings.filter(booking => booking.spot_id === spotId);
  }

  async getBookingsByUserId(userId: string): Promise<Booking[]> {
    return this.bookings.filter(booking => booking.guest_id === userId);
  }

  async getBookingById(id: string): Promise<Booking | undefined> {
    return this.bookings.find(booking => booking.id === id);
  }

  async getBookingByPin(pin: string): Promise<Booking | null> {
    // For demo purposes, return a mock booking for PIN 1234
    if (pin === '1234') {
      return {
        id: 'demo-booking-1',
        spot_id: 'demo-spot-1',
        guest_id: 'demo-user-1', 
        host_id: 'demo-host-1',
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        total_amount: 25.00,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
    return null;
  }

  async getBookingByQRCode(qrCode: string): Promise<Booking | null> {
    // For demo purposes, return a mock booking for the demo QR code
    if (qrCode === 'QR_b1_1_1737123456789') {
      return {
        id: 'demo-booking-1',
        spot_id: 'demo-spot-1',
        guest_id: 'demo-user-1',
        host_id: 'demo-host-1', 
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        total_amount: 25.00,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
    return null;
  }

  async updateBookingStatus(id: string, status: string): Promise<Booking | undefined> {
    const booking = this.bookings.find(b => b.id === id);
    if (booking) {
      booking.status = status as any;
      return booking;
    }
    return undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return this.users;
  }

  async getUserById(id: string): Promise<User | undefined> {
    // For demo purposes, return a mock user
    if (id === 'demo-user-1') {
      return {
        id: 'demo-user-1',
        name: 'John Doe',
        email: 'john@example.com',
        userType: 'customer'
      };
    }
    return this.users.find(user => user.id === id);
  }

  async getAllReviews(): Promise<Review[]> {
    return this.reviews;
  }

  async getReviewsBySpotId(spotId: string): Promise<Review[]> {
    return this.reviews.filter(review => review.spotId === spotId);
  }

  async getReviewsBySpot(spotId: string): Promise<Review[]> {
    return this.getReviewsBySpotId(spotId);
  }

  async searchParkingSpots(query: string, filters?: any): Promise<ParkingSpot[]> {
    return this.spots.filter(spot => 
      spot.title?.toLowerCase().includes(query.toLowerCase()) ||
      spot.address?.toLowerCase().includes(query.toLowerCase())
    );
  }

  async getNextAvailableTime(spotId: string): Promise<string | null> {
    return new Date().toISOString();
  }

  // Legacy methods for backward compatibility
  async addBooking(bookingData: Booking): Promise<Booking> {
    this.bookings.push(bookingData);
    return bookingData;
  }

  async addUser(userData: User): Promise<User> {
    this.users.push(userData);
    return userData;
  }
}

export const database = new TemporaryDatabase();
