# ParkPass Backend API

A comprehensive backend system for the ParkPass parking booking application built with Node.js, Express, TypeScript, and PostgreSQL.

## Features

### Core Functionality
- **User Authentication & Authorization** - JWT-based auth with role-based access control
- **Parking Spot Management** - CRUD operations for parking spots with geolocation
- **Smart Booking System** - Automatic 1-hour buffer, extension capabilities, QR/PIN validation
- **Real-time Availability** - Live slot tracking with automatic expiration handling
- **Payment Integration** - Ready for Stripe/payment gateway integration
- **Review & Rating System** - Customer feedback and ratings
- **Notification System** - Real-time notifications with Socket.IO
- **Geolocation Services** - Distance calculation and "near me" functionality

### Advanced Features
- **Automated Cron Jobs** - Expired booking cleanup, reminders, notifications
- **Entry Validation** - QR code and PIN-based entry system for parking owners
- **Availability Management** - Time slot blocking for maintenance/events
- **Comprehensive Logging** - Winston-based logging system
- **Rate Limiting** - API protection against abuse
- **Data Validation** - Joi schema validation for all endpoints
- **Error Handling** - Centralized error handling with proper HTTP status codes

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Authentication**: JWT
- **Validation**: Joi
- **File Upload**: Multer + Cloudinary
- **Real-time**: Socket.IO
- **Logging**: Winston
- **Cron Jobs**: node-cron
- **Testing**: Jest (ready for implementation)

## Project Structure

```
backend/
├── src/
│   ├── config/          # Database and Redis configuration
│   ├── middleware/      # Authentication, validation, error handling
│   ├── routes/          # API route definitions
│   ├── schemas/         # Joi validation schemas
│   ├── services/        # Business logic services
│   └── utils/           # Utility functions
├── prisma/
│   ├── migrations/      # Database migrations
│   ├── schema.prisma    # Database schema
│   └── seed.ts         # Database seeding
└── logs/               # Application logs
```

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- Redis (v6 or higher)

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/parkpass_db"
JWT_SECRET="your-super-secret-jwt-key-here"
REDIS_URL="redis://localhost:6379"
PORT=3000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

### 3. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run migrate

# Seed database with sample data
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh JWT token

### Parking Spots
- `GET /api/parking-spots` - Get all spots with filters
- `GET /api/parking-spots/:id` - Get spot details
- `POST /api/parking-spots` - Create spot (Owner only)
- `PUT /api/parking-spots/:id` - Update spot (Owner only)
- `DELETE /api/parking-spots/:id` - Delete spot (Owner only)
- `GET /api/parking-spots/owner/my-spots` - Get owner's spots

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings` - Get user bookings
- `GET /api/bookings/:id` - Get booking details
- `POST /api/bookings/:id/extend` - Extend booking (1 hour max)
- `POST /api/bookings/:id/cancel` - Cancel booking
- `POST /api/bookings/validate-entry` - Validate QR/PIN entry
- `POST /api/bookings/:id/exit` - Process exit

### Users & Vehicles
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/vehicles` - Add vehicle
- `PUT /api/users/vehicles/:id` - Update vehicle
- `DELETE /api/users/vehicles/:id` - Delete vehicle

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/spot/:spotId` - Get spot reviews
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

## Database Schema

### Key Tables
- **users** - User accounts with role-based access
- **parking_spots** - Parking location data with geolocation
- **bookings** - Booking records with QR/PIN codes
- **vehicles** - User vehicle information
- **payments** - Payment transaction records
- **reviews** - Customer reviews and ratings
- **notifications** - System notifications
- **entry_logs** - Entry/exit tracking logs

### Key Features
- **Automatic Timestamps** - Created/updated timestamps on all records
- **Soft Deletes** - User deactivation instead of deletion
- **Referential Integrity** - Proper foreign key relationships
- **Indexing** - Optimized queries for geolocation and search
- **JSON Fields** - Flexible data storage for amenities and metadata

## Business Logic

### Booking System
1. **Reservation Buffer**: Every booking automatically reserves an additional 1-hour buffer
2. **Extension Policy**: Users can extend bookings by exactly 1 hour (once only)
3. **Auto-Expiration**: Expired reservations are automatically released via cron jobs
4. **Entry Validation**: QR codes and PINs are validated for parking entry
5. **Real-time Updates**: Slot availability updates in real-time

### Security Features
- **JWT Authentication** - Secure token-based authentication
- **Role-based Access** - Customer, Owner, and Admin roles
- **Rate Limiting** - API abuse protection
- **Input Validation** - Comprehensive request validation
- **SQL Injection Protection** - Prisma ORM prevents SQL injection
- **CORS Configuration** - Proper cross-origin request handling

## Testing Accounts

The seed script creates test accounts:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| Admin | admin@parkpass.com | admin123 | System administrator |
| Owner | owner1@parkpass.com | owner123 | Parking spot owner |
| Owner | owner2@parkpass.com | owner123 | Parking spot owner |
| Customer | customer1@parkpass.com | customer123 | Regular user |
| Customer | customer2@parkpass.com | customer123 | Regular user |

## Production Deployment

### Environment Variables
Ensure all production environment variables are set:
- Database connection string
- JWT secret (use a strong, random key)
- Redis connection
- Email service credentials
- Payment gateway keys
- Cloudinary credentials

### Database Migration
```bash
npm run migrate:prod
```

### Build & Start
```bash
npm run build
npm start
```

### Monitoring
- Logs are written to `logs/` directory
- Health check endpoint: `GET /health`
- Database connection monitoring via Prisma
- Redis connection monitoring

## Integration with Frontend

The backend is designed to work seamlessly with the React frontend:

1. **Authentication**: JWT tokens for session management
2. **Real-time Updates**: Socket.IO for live notifications
3. **File Uploads**: Cloudinary integration for images
4. **Geolocation**: Distance calculation for "near me" features
5. **QR Codes**: Generated QR codes for parking entry

## Development Guidelines

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Prisma for database operations
- Joi for input validation
- Winston for logging

### Error Handling
- Centralized error handling middleware
- Proper HTTP status codes
- Detailed error logging
- User-friendly error messages

### Performance
- Database query optimization
- Redis caching for frequently accessed data
- Pagination for large datasets
- Efficient geolocation queries

## Support

For questions or issues:
1. Check the logs in `logs/` directory
2. Verify database connections
3. Ensure all environment variables are set
4. Check Redis connectivity
5. Review API documentation for proper request formats