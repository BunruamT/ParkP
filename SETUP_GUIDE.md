# ParkPass Setup Guide

## Overview
This guide provides comprehensive instructions for setting up ParkPass with Supabase as the backend database and implementing all the features outlined in the application.

## Prerequisites
- Node.js 18+ installed
- Supabase account
- Stripe account (for payments)
- Google Maps API key (for maps integration)
- Email service account (SendGrid, AWS SES, or SMTP)

## 1. Supabase Setup

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a project name: `parkpass-production`
3. Set a strong database password
4. Select your preferred region
5. Wait for the project to be created

### 1.2 Database Schema Setup
1. Navigate to the SQL Editor in your Supabase dashboard
2. Copy and paste the entire database schema from `db_structure.txt`
3. Execute the SQL to create all tables, indexes, and constraints
4. Verify all tables are created successfully

### 1.3 Row Level Security (RLS) Setup
Execute the following RLS policies:

```sql
-- Users table policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id::uuid);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id::uuid);

-- Vehicles table policies
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own vehicles" ON vehicles
  FOR ALL USING (auth.uid() = user_id::uuid);

-- Parking spots table policies
ALTER TABLE parking_spots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active parking spots" ON parking_spots
  FOR SELECT USING (is_active = true);

CREATE POLICY "Owners can manage own spots" ON parking_spots
  FOR ALL USING (auth.uid() = owner_id::uuid);

-- Bookings table policies
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (auth.uid() = user_id::uuid);

CREATE POLICY "Users can create bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id::uuid);

CREATE POLICY "Spot owners can view bookings for their spots" ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM parking_spots 
      WHERE parking_spots.id = bookings.spot_id 
      AND parking_spots.owner_id::uuid = auth.uid()
    )
  );

-- Reviews table policies
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for their bookings" ON reviews
  FOR INSERT WITH CHECK (
    auth.uid() = user_id::uuid AND
    EXISTS (
      SELECT 1 FROM bookings 
      WHERE bookings.id = reviews.booking_id 
      AND bookings.user_id::uuid = auth.uid()
      AND bookings.status = 'completed'
    )
  );

-- Notifications table policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id::uuid);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id::uuid);
```

### 1.4 Storage Setup
1. Navigate to Storage in Supabase dashboard
2. Create the following buckets:
   - `parking-spot-images` (public)
   - `review-images` (public)
   - `profile-images` (public)

3. Set up storage policies:

```sql
-- Parking spot images policies
CREATE POLICY "Anyone can view parking spot images" ON storage.objects
  FOR SELECT USING (bucket_id = 'parking-spot-images');

CREATE POLICY "Authenticated users can upload parking spot images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'parking-spot-images' AND auth.role() = 'authenticated');

-- Review images policies
CREATE POLICY "Anyone can view review images" ON storage.objects
  FOR SELECT USING (bucket_id = 'review-images');

CREATE POLICY "Authenticated users can upload review images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'review-images' AND auth.role() = 'authenticated');

-- Profile images policies
CREATE POLICY "Anyone can view profile images" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-images');

CREATE POLICY "Users can upload own profile images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'profile-images' AND auth.role() = 'authenticated');
```

### 1.5 Real-time Setup
1. Navigate to Database > Replication in Supabase
2. Enable real-time for the following tables:
   - `notifications`
   - `bookings`
   - `parking_spots`

## 2. Environment Configuration

### 2.1 Frontend Environment Variables
Create a `.env` file in your project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Google Maps API
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Stripe (Public Key)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-public-key

# App Configuration
VITE_APP_URL=http://localhost:5173
VITE_API_URL=http://localhost:3000/api
```

### 2.2 Backend Environment Variables
Create a `.env` file in your backend directory:

```env
# Database
DATABASE_URL=your-supabase-database-url
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Authentication
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-jwt-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Google Maps
GOOGLE_MAPS_API_KEY=your-google-maps-server-key

# Email Service (Choose one)
# Option 1: SendGrid
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@yourapp.com

# Option 2: SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# App Configuration
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-frontend-domain.com

# Feature Flags
ENABLE_EMAIL_VERIFICATION=true
ENABLE_PUSH_NOTIFICATIONS=true
ENABLE_REAL_TIME_NOTIFICATIONS=true

# Notification Settings
NOTIFICATION_CHECK_INTERVAL=60000
BOOKING_REMINDER_MINUTES=30
EXTENSION_REMINDER_MINUTES=30
```

## 3. Backend Implementation

### 3.1 Install Dependencies
```bash
npm install express cors helmet morgan
npm install @supabase/supabase-js
npm install stripe
npm install @sendgrid/mail
npm install node-cron
npm install bcryptjs jsonwebtoken
npm install joi express-rate-limit
npm install winston
```

### 3.2 Basic Server Setup
Create `server.js`:

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/spots', require('./routes/spots'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/payments', require('./routes/payments'));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 3.3 Supabase Client Setup
Create `config/supabase.js`:

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = supabase;
```

### 3.4 Notification System
Create `services/notificationService.js`:

```javascript
const supabase = require('../config/supabase');
const cron = require('node-cron');

class NotificationService {
  constructor() {
    this.startScheduler();
  }

  async createNotification(notification) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notification]);
    
    if (error) throw error;
    return data[0];
  }

  async scheduleBookingReminders(booking) {
    const startTime = new Date(booking.start_time);
    const endTime = new Date(booking.end_time);
    
    // Schedule start reminder (30 minutes before)
    const startReminder = new Date(startTime.getTime() - 30 * 60 * 1000);
    await this.createNotification({
      user_id: booking.user_id,
      title: 'Parking Session Starting Soon',
      message: `Your parking session starts in 30 minutes`,
      type: 'booking_reminder',
      scheduled_for: startReminder.toISOString(),
      action_url: '/bookings'
    });
    
    // Schedule end reminder (30 minutes before)
    const endReminder = new Date(endTime.getTime() - 30 * 60 * 1000);
    await this.createNotification({
      user_id: booking.user_id,
      title: 'Extend Your Parking?',
      message: 'Your parking session ends in 30 minutes. Would you like to extend?',
      type: 'extension_reminder',
      scheduled_for: endReminder.toISOString(),
      action_url: '/bookings',
      metadata: { booking_id: booking.id, can_extend: true }
    });
  }

  async processScheduledNotifications() {
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .lte('scheduled_for', new Date().toISOString())
      .is('sent_at', null);

    if (error) {
      console.error('Error fetching scheduled notifications:', error);
      return;
    }

    for (const notification of notifications) {
      try {
        // Send notification (implement your preferred method)
        await this.sendNotification(notification);
        
        // Mark as sent
        await supabase
          .from('notifications')
          .update({ sent_at: new Date().toISOString() })
          .eq('id', notification.id);
          
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    }
  }

  async sendNotification(notification) {
    // Implement your notification sending logic here
    // This could be push notifications, email, SMS, etc.
    console.log('Sending notification:', notification);
  }

  startScheduler() {
    // Run every minute to check for scheduled notifications
    cron.schedule('* * * * *', () => {
      this.processScheduledNotifications();
    });
  }
}

module.exports = new NotificationService();
```

## 4. Email Verification System

### 4.1 Email Service Setup
Create `services/emailService.js`:

```javascript
const sgMail = require('@sendgrid/mail');
const supabase = require('../config/supabase');
const crypto = require('crypto');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class EmailService {
  async sendVerificationEmail(user) {
    if (!process.env.ENABLE_EMAIL_VERIFICATION === 'true') {
      return; // Email verification is disabled
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Save verification token
    const { error } = await supabase
      .from('users')
      .update({
        email_verification_token: token,
        email_verification_expires: expiresAt.toISOString()
      })
      .eq('id', user.id);

    if (error) throw error;
    
    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    const msg = {
      to: user.email,
      from: process.env.FROM_EMAIL,
      subject: 'Verify your ParkPass account',
      html: `
        <h1>Welcome to ParkPass!</h1>
        <p>Hi ${user.name},</p>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create this account, please ignore this email.</p>
      `
    };

    await sgMail.send(msg);
  }

  async verifyEmail(token) {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email_verification_token', token)
      .gt('email_verification_expires', new Date().toISOString())
      .single();

    if (error || !user) {
      throw new Error('Invalid or expired verification token');
    }

    // Mark email as verified
    const { error: updateError } = await supabase
      .from('users')
      .update({
        email_verified: true,
        email_verification_token: null,
        email_verification_expires: null
      })
      .eq('id', user.id);

    if (updateError) throw updateError;

    return user;
  }
}

module.exports = new EmailService();
```

### 4.2 Enable Email Verification
To enable email verification:

1. Set `ENABLE_EMAIL_VERIFICATION=true` in your environment variables
2. Configure your email service (SendGrid, AWS SES, or SMTP)
3. Update your registration endpoint to send verification emails
4. Add email verification check to protected routes
5. Create a verification page in your frontend

## 5. Google Maps Integration

### 5.1 Frontend Maps Setup
Install Google Maps dependencies:

```bash
npm install @googlemaps/js-api-loader
```

Create `components/GoogleMap.tsx`:

```typescript
import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface GoogleMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void;
  markers?: Array<{
    position: { lat: number; lng: number };
    title: string;
    info?: string;
  }>;
  height?: string;
}

export const GoogleMap: React.FC<GoogleMapProps> = ({
  center = { lat: 40.7589, lng: -73.9851 },
  zoom = 13,
  onLocationSelect,
  markers = [],
  height = '400px'
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places', 'geometry']
    });

    loader.load().then(() => {
      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (isLoaded && mapRef.current && !map) {
      const googleMap = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        styles: [
          // Add custom map styling here
        ]
      });

      setMap(googleMap);

      // Add click listener for location selection
      if (onLocationSelect) {
        googleMap.addListener('click', async (event: google.maps.MapMouseEvent) => {
          const lat = event.latLng?.lat();
          const lng = event.latLng?.lng();
          
          if (lat && lng) {
            // Reverse geocoding to get address
            const geocoder = new google.maps.Geocoder();
            try {
              const response = await geocoder.geocode({
                location: { lat, lng }
              });
              
              const address = response.results[0]?.formatted_address || '';
              onLocationSelect({ lat, lng, address });
            } catch (error) {
              console.error('Geocoding error:', error);
              onLocationSelect({ lat, lng, address: '' });
            }
          }
        });
      }
    }
  }, [isLoaded, map, center, zoom, onLocationSelect]);

  // Add markers
  useEffect(() => {
    if (map && markers.length > 0) {
      markers.forEach(marker => {
        const mapMarker = new google.maps.Marker({
          position: marker.position,
          map,
          title: marker.title
        });

        if (marker.info) {
          const infoWindow = new google.maps.InfoWindow({
            content: marker.info
          });

          mapMarker.addListener('click', () => {
            infoWindow.open(map, mapMarker);
          });
        }
      });
    }
  }, [map, markers]);

  return (
    <div 
      ref={mapRef} 
      style={{ height, width: '100%' }}
      className="rounded-lg"
    />
  );
};
```

### 5.2 Map Integration in Parking Spot Creation
Update `AddParkingSpot.tsx` to include map selection:

```typescript
// Add to your AddParkingSpot component
const [showMapPicker, setShowMapPicker] = useState(false);
const [selectedLocation, setSelectedLocation] = useState<{
  lat: number;
  lng: number;
  address: string;
} | null>(null);

const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
  setSelectedLocation(location);
  setFormData(prev => ({
    ...prev,
    address: location.address,
    lat: location.lat,
    lng: location.lng
  }));
  setShowMapPicker(false);
};

// Add this to your form JSX
<div className="flex gap-4">
  <div className="flex-1">
    <input
      type="text"
      name="address"
      value={formData.address}
      onChange={handleInputChange}
      placeholder="123 Main Street, Downtown, City, State"
      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
      required
    />
  </div>
  <button
    type="button"
    onClick={() => setShowMapPicker(true)}
    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
  >
    📍 Pick on Map
  </button>
</div>

{showMapPicker && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Select Location</h3>
          <button
            onClick={() => setShowMapPicker(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <GoogleMap
          height="500px"
          onLocationSelect={handleLocationSelect}
        />
        <p className="text-sm text-gray-600 mt-4">
          Click on the map to select your parking spot location
        </p>
      </div>
    </div>
  </div>
)}
```

## 6. Deployment

### 6.1 Frontend Deployment (Netlify/Vercel)
1. Build your application: `npm run build`
2. Deploy to your preferred platform
3. Set environment variables in your deployment platform
4. Configure custom domain if needed

### 6.2 Backend Deployment (Railway/Heroku/DigitalOcean)
1. Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

2. Deploy to your preferred platform
3. Set all environment variables
4. Configure database connection

### 6.3 Domain and SSL Setup
1. Configure custom domain
2. Set up SSL certificates
3. Update CORS settings
4. Update Supabase allowed origins

## 7. Monitoring and Maintenance

### 7.1 Logging Setup
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

### 7.2 Health Checks
```javascript
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

### 7.3 Database Backups
Set up automated backups in Supabase:
1. Go to Settings > Database
2. Enable automated backups
3. Configure backup retention period
4. Set up backup notifications

## 8. Testing

### 8.1 API Testing
```javascript
// Example test with Jest and Supertest
const request = require('supertest');
const app = require('../server');

describe('Authentication', () => {
  test('POST /api/auth/register', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        userType: 'customer'
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('user');
  });
});
```

### 8.2 Frontend Testing
```typescript
// Example test with React Testing Library
import { render, screen } from '@testing-library/react';
import { ParkingSpotCard } from '../components/ParkingSpotCard';

test('renders parking spot card', () => {
  const mockSpot = {
    id: '1',
    name: 'Test Parking',
    address: '123 Test St',
    price: 25,
    priceType: 'hour',
    // ... other properties
  };

  render(<ParkingSpotCard spot={mockSpot} />);
  
  expect(screen.getByText('Test Parking')).toBeInTheDocument();
  expect(screen.getByText('$25/hour')).toBeInTheDocument();
});
```

## 9. Performance Optimization

### 9.1 Database Optimization
- Implement connection pooling
- Add database indexes for frequently queried columns
- Use database views for complex queries
- Implement caching with Redis

### 9.2 Frontend Optimization
- Implement code splitting
- Use React.memo for expensive components
- Optimize images with next-gen formats
- Implement service workers for caching

### 9.3 API Optimization
- Implement response caching
- Use compression middleware
- Optimize database queries
- Implement pagination for large datasets

This setup guide provides a comprehensive foundation for deploying ParkPass with all the features outlined in the application. Follow each section carefully and adapt the configurations to your specific requirements.