/*
  # Update schema for better naming conventions
  
  1. Update column names to use snake_case for consistency
  2. Add proper indexes for performance
  3. Add RLS policies for security
  4. Add triggers for automatic timestamps
*/

-- Update column names to snake_case
ALTER TABLE users RENAME COLUMN "isActive" TO is_active;
ALTER TABLE users RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE users RENAME COLUMN "updatedAt" TO updated_at;
ALTER TABLE users RENAME COLUMN "businessName" TO business_name;
ALTER TABLE users RENAME COLUMN "businessAddress" TO business_address;

ALTER TABLE vehicles RENAME COLUMN "licensePlate" TO license_plate;
ALTER TABLE vehicles RENAME COLUMN "userId" TO user_id;

ALTER TABLE parking_spots RENAME COLUMN "priceType" TO price_type;
ALTER TABLE parking_spots RENAME COLUMN "totalSlots" TO total_slots;
ALTER TABLE parking_spots RENAME COLUMN "availableSlots" TO available_slots;
ALTER TABLE parking_spots RENAME COLUMN "reviewCount" TO review_count;
ALTER TABLE parking_spots RENAME COLUMN "openingHours" TO opening_hours;
ALTER TABLE parking_spots RENAME COLUMN "ownerId" TO owner_id;
ALTER TABLE parking_spots RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE parking_spots RENAME COLUMN "updatedAt" TO updated_at;

ALTER TABLE availability_slots RENAME COLUMN "spotId" TO spot_id;
ALTER TABLE availability_slots RENAME COLUMN "startTime" TO start_time;
ALTER TABLE availability_slots RENAME COLUMN "endTime" TO end_time;
ALTER TABLE availability_slots RENAME COLUMN "slotsAffected" TO slots_affected;
ALTER TABLE availability_slots RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE availability_slots RENAME COLUMN "updatedAt" TO updated_at;

ALTER TABLE bookings RENAME COLUMN "spotId" TO spot_id;
ALTER TABLE bookings RENAME COLUMN "userId" TO user_id;
ALTER TABLE bookings RENAME COLUMN "vehicleId" TO vehicle_id;
ALTER TABLE bookings RENAME COLUMN "startTime" TO start_time;
ALTER TABLE bookings RENAME COLUMN "endTime" TO end_time;
ALTER TABLE bookings RENAME COLUMN "actualEndTime" TO actual_end_time;
ALTER TABLE bookings RENAME COLUMN "reservedEndTime" TO reserved_end_time;
ALTER TABLE bookings RENAME COLUMN "totalCost" TO total_cost;
ALTER TABLE bookings RENAME COLUMN "qrCode" TO qr_code;
ALTER TABLE bookings RENAME COLUMN "isExtended" TO is_extended;
ALTER TABLE bookings RENAME COLUMN "extendedAt" TO extended_at;
ALTER TABLE bookings RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE bookings RENAME COLUMN "updatedAt" TO updated_at;

ALTER TABLE payments RENAME COLUMN "bookingId" TO booking_id;
ALTER TABLE payments RENAME COLUMN "transactionId" TO transaction_id;
ALTER TABLE payments RENAME COLUMN "processedAt" TO processed_at;
ALTER TABLE payments RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE payments RENAME COLUMN "updatedAt" TO updated_at;

ALTER TABLE entry_logs RENAME COLUMN "bookingId" TO booking_id;

ALTER TABLE reviews RENAME COLUMN "spotId" TO spot_id;
ALTER TABLE reviews RENAME COLUMN "userId" TO user_id;
ALTER TABLE reviews RENAME COLUMN "isAnonymous" TO is_anonymous;
ALTER TABLE reviews RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE reviews RENAME COLUMN "updatedAt" TO updated_at;

ALTER TABLE notifications RENAME COLUMN "userId" TO user_id;
ALTER TABLE notifications RENAME COLUMN "isRead" TO is_read;
ALTER TABLE notifications RENAME COLUMN "createdAt" TO created_at;

ALTER TABLE system_settings RENAME COLUMN "updatedAt" TO updated_at;

-- Update foreign key constraint names
ALTER TABLE vehicles DROP CONSTRAINT "vehicles_userId_fkey";
ALTER TABLE vehicles ADD CONSTRAINT "vehicles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE parking_spots DROP CONSTRAINT "parking_spots_ownerId_fkey";
ALTER TABLE parking_spots ADD CONSTRAINT "parking_spots_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE availability_slots DROP CONSTRAINT "availability_slots_spotId_fkey";
ALTER TABLE availability_slots ADD CONSTRAINT "availability_slots_spot_id_fkey" FOREIGN KEY ("spot_id") REFERENCES "parking_spots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE bookings DROP CONSTRAINT "bookings_spotId_fkey";
ALTER TABLE bookings DROP CONSTRAINT "bookings_userId_fkey";
ALTER TABLE bookings DROP CONSTRAINT "bookings_vehicleId_fkey";
ALTER TABLE bookings ADD CONSTRAINT "bookings_spot_id_fkey" FOREIGN KEY ("spot_id") REFERENCES "parking_spots"("id") ON UPDATE CASCADE;
ALTER TABLE bookings ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON UPDATE CASCADE;
ALTER TABLE bookings ADD CONSTRAINT "bookings_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON UPDATE CASCADE;

ALTER TABLE payments DROP CONSTRAINT "payments_bookingId_fkey";
ALTER TABLE payments ADD CONSTRAINT "payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON UPDATE CASCADE;

ALTER TABLE entry_logs DROP CONSTRAINT "entry_logs_bookingId_fkey";
ALTER TABLE entry_logs ADD CONSTRAINT "entry_logs_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON UPDATE CASCADE;

ALTER TABLE reviews DROP CONSTRAINT "reviews_spotId_fkey";
ALTER TABLE reviews DROP CONSTRAINT "reviews_userId_fkey";
ALTER TABLE reviews ADD CONSTRAINT "reviews_spot_id_fkey" FOREIGN KEY ("spot_id") REFERENCES "parking_spots"("id") ON UPDATE CASCADE;
ALTER TABLE reviews ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON UPDATE CASCADE;

ALTER TABLE notifications DROP CONSTRAINT "notifications_userId_fkey";
ALTER TABLE notifications ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Update unique constraint names
ALTER TABLE bookings DROP CONSTRAINT "bookings_qrCode_key";
ALTER TABLE bookings ADD CONSTRAINT "bookings_qr_code_key" UNIQUE ("qr_code");

ALTER TABLE payments DROP CONSTRAINT "payments_bookingId_key";
ALTER TABLE payments ADD CONSTRAINT "payments_booking_id_key" UNIQUE ("booking_id");

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_parking_spots_location ON parking_spots USING GIST (
  ll_to_earth(latitude, longitude)
);
CREATE INDEX IF NOT EXISTS idx_parking_spots_owner_id ON parking_spots(owner_id);
CREATE INDEX IF NOT EXISTS idx_parking_spots_status ON parking_spots(status);
CREATE INDEX IF NOT EXISTS idx_parking_spots_price ON parking_spots(price);

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_spot_id ON bookings(spot_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_qr_code ON bookings(qr_code);
CREATE INDEX IF NOT EXISTS idx_bookings_pin ON bookings(pin);

CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_spot_id ON reviews(spot_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id);

-- RLS Policies for vehicles table
CREATE POLICY "Users can manage own vehicles" ON vehicles
  FOR ALL USING (auth.uid()::text = user_id);

-- RLS Policies for parking_spots table
CREATE POLICY "Anyone can read active parking spots" ON parking_spots
  FOR SELECT USING (status = 'ACTIVE');

CREATE POLICY "Owners can manage own parking spots" ON parking_spots
  FOR ALL USING (auth.uid()::text = owner_id);

-- RLS Policies for bookings table
CREATE POLICY "Users can read own bookings" ON bookings
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own bookings" ON bookings
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Spot owners can read bookings for their spots" ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM parking_spots 
      WHERE parking_spots.id = bookings.spot_id 
      AND parking_spots.owner_id = auth.uid()::text
    )
  );

-- RLS Policies for reviews table
CREATE POLICY "Anyone can read reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own reviews" ON reviews
  FOR DELETE USING (auth.uid()::text = user_id);

-- RLS Policies for notifications table
CREATE POLICY "Users can read own notifications" ON notifications
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parking_spots_updated_at BEFORE UPDATE ON parking_spots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_availability_slots_updated_at BEFORE UPDATE ON availability_slots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();