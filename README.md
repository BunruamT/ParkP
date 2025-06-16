# ParkPass - Modern Parking Management System

A comprehensive parking spot booking application built with React and Supabase, featuring real-time updates, secure authentication, and a modern user interface.

## 🚀 Features

### For Drivers (Customers)
- **Smart Search & Filters** - Find parking spots by location, price, amenities
- **Real-time Availability** - Live updates on parking spot availability
- **Instant Booking** - Quick reservation with QR codes and PIN backup
- **Vehicle Management** - Add and manage multiple vehicles
- **Booking History** - Track past and current reservations
- **Reviews & Ratings** - Rate and review parking experiences

### For Parking Owners
- **Spot Management** - Create and manage parking locations
- **Real-time Dashboard** - Monitor bookings, revenue, and occupancy
- **Entry Validation** - QR code and PIN validation system
- **Availability Control** - Block time slots for maintenance or events
- **Analytics & Reports** - Revenue tracking and booking insights

### Technical Features
- **Real-time Updates** - Powered by Supabase real-time subscriptions
- **Secure Authentication** - Row-level security and JWT tokens
- **Responsive Design** - Works seamlessly on all devices
- **Offline Support** - Progressive Web App capabilities
- **Type Safety** - Full TypeScript implementation

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time, Storage)
- **State Management**: Custom React hooks with Supabase
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Build Tool**: Vite

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- A Supabase account (free tier available)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd parkpass-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Copy `.env.example` to `.env` and fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set Up Database

1. In your Supabase dashboard, go to the SQL Editor
2. Run the migration files in order:
   - First: `supabase/migrations/20250615123043_bold_haze.sql`
   - Then: `supabase/migrations/20250615123044_update_schema_naming.sql`
3. Run the seed file: `supabase/seed.sql`

### 5. Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🗄 Database Schema

### Core Tables
- **users** - User accounts with role-based access (Customer, Owner, Admin)
- **parking_spots** - Parking locations with geolocation and amenities
- **bookings** - Reservations with QR codes and status tracking
- **vehicles** - User vehicle information
- **reviews** - Customer feedback and ratings
- **payments** - Transaction records
- **notifications** - System notifications

### Key Features
- **Row Level Security (RLS)** - Secure data access based on user roles
- **Real-time Subscriptions** - Live updates for bookings and availability
- **Geospatial Queries** - Location-based search with PostGIS
- **Automatic Timestamps** - Created/updated tracking
- **Foreign Key Constraints** - Data integrity and relationships

## 🔐 Authentication & Security

### Authentication Flow
1. **Sign Up/Sign In** - Email/password with Supabase Auth
2. **Role Assignment** - Customer, Owner, or Admin roles
3. **Session Management** - Automatic token refresh
4. **Password Reset** - Email-based password recovery

### Security Features
- **Row Level Security** - Database-level access control
- **JWT Tokens** - Secure API authentication
- **Input Validation** - Client and server-side validation
- **CORS Protection** - Secure cross-origin requests

## 📱 User Roles & Permissions

### Customer
- Search and book parking spots
- Manage vehicles and bookings
- Leave reviews and ratings
- View booking history

### Owner
- Create and manage parking spots
- View booking analytics and revenue
- Validate customer entry (QR/PIN)
- Manage availability schedules

### Admin
- Full system access
- User management
- System configuration
- Analytics and reporting

## 🎨 UI/UX Features

### Design System
- **Modern Interface** - Clean, intuitive design
- **Responsive Layout** - Mobile-first approach
- **Dark/Light Mode** - User preference support
- **Accessibility** - WCAG 2.1 compliant
- **Micro-interactions** - Smooth animations and transitions

### Key Components
- **Search & Filters** - Advanced filtering system
- **Interactive Maps** - Location visualization
- **QR Code Generation** - Entry validation system
- **Real-time Notifications** - Live updates
- **Dashboard Analytics** - Revenue and usage insights

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Deploy to Netlify
1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify
3. Configure environment variables

### Environment Variables for Production
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
VITE_APP_ENV=production
```

## 🔧 Development

### Project Structure
```
src/
├── components/          # Reusable UI components
├── hooks/              # Custom React hooks for data fetching
├── lib/                # Supabase client and utilities
├── pages/              # Route components
├── types/              # TypeScript type definitions
└── utils/              # Helper functions
```

### Key Hooks
- `useAuth()` - Authentication state and methods
- `useParkingSpots()` - Parking spot CRUD operations
- `useBookings()` - Booking management
- `useVehicles()` - Vehicle management
- `useReviews()` - Review system
- `useRealtime()` - Real-time subscriptions

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 📊 Analytics & Monitoring

### Built-in Analytics
- **Revenue Tracking** - Real-time revenue calculations
- **Occupancy Rates** - Parking utilization metrics
- **User Engagement** - Booking patterns and trends
- **Performance Metrics** - Response times and error rates

### Monitoring
- **Error Tracking** - Client-side error monitoring
- **Performance Monitoring** - Core Web Vitals tracking
- **Real-time Logs** - Supabase dashboard logs
- **Database Metrics** - Query performance and usage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Demo Accounts
The application includes demo accounts for testing:

- **Customer**: `customer1@parkpass.com` / `demo123`
- **Owner**: `owner1@parkpass.com` / `demo123`
- **Admin**: `admin@parkpass.com` / `demo123`

### Getting Help
- Check the [Issues](https://github.com/your-repo/issues) page
- Review the [Documentation](https://supabase.com/docs)
- Join our [Discord Community](https://discord.gg/your-discord)

## 🎯 Roadmap

### Upcoming Features
- [ ] Mobile app (React Native)
- [ ] Payment integration (Stripe)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Push notifications
- [ ] Loyalty program
- [ ] API for third-party integrations

### Performance Improvements
- [ ] Image optimization and CDN
- [ ] Database query optimization
- [ ] Caching strategies
- [ ] Progressive Web App features

---

Built with ❤️ using React and Supabase