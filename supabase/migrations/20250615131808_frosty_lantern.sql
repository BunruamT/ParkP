-- Seed data for ParkPass application

-- Insert test users
INSERT INTO users (id, email, name, phone, role, business_name, business_address) VALUES
  ('user-admin-1', 'admin@parkpass.com', 'Admin User', '+1-555-0001', 'ADMIN', NULL, NULL),
  ('user-owner-1', 'owner1@parkpass.com', 'John Smith', '+1-555-0002', 'OWNER', 'Downtown Parking Solutions', '123 Business Ave, Downtown'),
  ('user-owner-2', 'owner2@parkpass.com', 'Sarah Johnson', '+1-555-0003', 'OWNER', 'Mall Parking Services', '456 Mall Road, Westside'),
  ('user-customer-1', 'customer1@parkpass.com', 'Mike Wilson', '+1-555-0004', 'CUSTOMER', NULL, NULL),
  ('user-customer-2', 'customer2@parkpass.com', 'Emily Davis', '+1-555-0005', 'CUSTOMER', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- Insert test vehicles
INSERT INTO vehicles (id, make, model, license_plate, color, user_id) VALUES
  ('vehicle-1', 'Toyota', 'Camry', 'ABC-123', 'Silver', 'user-customer-1'),
  ('vehicle-2', 'Honda', 'Civic', 'XYZ-789', 'Blue', 'user-customer-1'),
  ('vehicle-3', 'BMW', 'X3', 'BMW-456', 'Black', 'user-customer-2')
ON CONFLICT (id) DO NOTHING;

-- Insert test parking spots
INSERT INTO parking_spots (
  id, name, description, address, latitude, longitude, price, price_type,
  total_slots, available_slots, rating, review_count, amenities, images,
  opening_hours, phone, owner_id
) VALUES
  (
    'spot-1',
    'Central Plaza Parking',
    'Premium parking facility in the heart of downtown with state-of-the-art security and amenities.',
    '123 Main Street, Downtown',
    40.7589, -73.9851, 25, 'hour',
    50, 45, 4.5, 128,
    ARRAY['CCTV Security', 'EV Charging', 'Covered Parking', 'Elevator Access'],
    ARRAY[
      'https://images.pexels.com/photos/753876/pexels-photo-753876.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    '24/7', '+1-555-123-4567', 'user-owner-1'
  ),
  (
    'spot-2',
    'Riverside Mall Parking',
    'Convenient mall parking with direct access to shopping and dining.',
    '456 River Road, Westside',
    40.7505, -73.9934, 150, 'day',
    200, 180, 4.2, 89,
    ARRAY['Shopping Access', 'Food Court Nearby', 'Valet Service', 'Car Wash'],
    ARRAY[
      'https://images.pexels.com/photos/1004409/pexels-photo-1004409.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2199293/pexels-photo-2199293.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    '6:00 AM - 11:00 PM', '+1-555-987-6543', 'user-owner-2'
  ),
  (
    'spot-3',
    'Airport Express Parking',
    'Premium airport parking with complimentary shuttle service and full-service amenities.',
    '789 Airport Way, Terminal District',
    40.6413, -73.7781, 300, 'day',
    800, 750, 4.7, 342,
    ARRAY['Shuttle Service', 'Long-term Storage', 'Car Detailing', 'Luggage Assistance'],
    ARRAY[
      'https://images.pexels.com/photos/2425567/pexels-photo-2425567.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1004409/pexels-photo-1004409.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    '24/7', '+1-555-456-7890', 'user-owner-1'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert test reviews
INSERT INTO reviews (id, spot_id, user_id, rating, comment, is_anonymous) VALUES
  ('review-1', 'spot-1', 'user-customer-1', 5, 'Excellent parking facility with great security and easy access. Highly recommended!', false),
  ('review-2', 'spot-1', 'user-customer-2', 4, 'Good location and clean facilities. The EV charging station was very convenient.', false),
  ('review-3', 'spot-2', 'user-customer-1', 4, 'Perfect for shopping trips. Direct mall access is a huge plus.', false)
ON CONFLICT (id) DO NOTHING;

-- Insert system settings
INSERT INTO system_settings (id, key, value, description) VALUES
  ('setting-1', 'BOOKING_BUFFER_HOURS', '1', 'Buffer time in hours added to each booking'),
  ('setting-2', 'MAX_EXTENSION_HOURS', '1', 'Maximum hours a booking can be extended'),
  ('setting-3', 'CANCELLATION_DEADLINE_HOURS', '1', 'Minimum hours before start time to allow cancellation'),
  ('setting-4', 'NOTIFICATION_REMINDER_HOURS', '1', 'Hours before booking start to send reminder')
ON CONFLICT (id) DO NOTHING;