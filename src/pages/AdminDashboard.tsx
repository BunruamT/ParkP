import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  QrCode, 
  MapPin, 
  Calendar, 
  Star, 
  DollarSign,
  Plus,
  TrendingUp,
  CheckCircle,
  Eye,
  Edit,
  ToggleLeft,
  ToggleRight,
  Bell,
  MoreHorizontal,
  PieChart,
  CalendarDays,
  MessageSquare
} from 'lucide-react';
import { QRScanner } from '../components/QRScanner';
import { database } from '../data/database';
import { useAuth } from '../context/AuthContext';
import { ParkingSpot, Booking } from '../types';
import { AdminBookingsPage } from './AdminBookingsPage';
import { AdminReviewsPage } from './AdminReviewsPage';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'home' | 'dashboard' | 'spots' | 'bookings' | 'reviews'>('home');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const [ownerSpots, allBookings] = await Promise.all([
        database.getParkingSpotsByOwner(user!.id),
        database.getAllBookings()
      ]);
      
      // Filter bookings for owner's spots
      const spotIds = ownerSpots.map(spot => spot.id);
      const ownerBookings = allBookings.filter(booking => spotIds.includes(booking.spotId));
      
      setSpots(ownerSpots);
      setBookings(ownerBookings);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    { 
      label: 'Today\'s Revenue', 
      value: `$${bookings.filter(b => new Date(b.startTime).toDateString() === new Date().toDateString()).reduce((sum, b) => sum + b.totalCost, 0)}`, 
      change: '+15%', 
      icon: DollarSign, 
      color: 'text-green-600' 
    },
    { 
      label: 'Active Bookings', 
      value: bookings.filter(b => b.status === 'active').length.toString(), 
      change: '+8%', 
      icon: Calendar, 
      color: 'text-blue-600' 
    },
    { 
      label: 'Total Spots', 
      value: spots.length.toString(), 
      change: '0%', 
      icon: MapPin, 
      color: 'text-purple-600' 
    },
    { 
      label: 'Avg Rating', 
      value: spots.length > 0 ? (spots.reduce((sum, spot) => sum + spot.rating, 0) / spots.length).toFixed(1) : '0', 
      change: '+0.2', 
      icon: Star, 
      color: 'text-yellow-600' 
    },
  ];

  const todayBookings = bookings.filter(b => 
    new Date(b.startTime).toDateString() === new Date().toDateString()
  ).slice(0, 3);

  const handleQRScan = (data: string) => {
    setScanResult(data);
    setShowQRScanner(false);
    console.log('Scanned data:', data);
  };

  const HomeSection = () => (
    <div className="space-y-6">
      {/* QR Scanner Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <QrCode className="h-10 w-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Entry Validation
          </h3>
          <p className="text-gray-600 mb-6">
            Scan customer QR codes or enter PIN for parking entry validation
          </p>
          <button
            onClick={() => setShowQRScanner(true)}
            className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg"
          >
            Open Scanner
          </button>
          
          {scanResult && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center space-x-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Entry Validated</span>
              </div>
              <p className="text-sm text-green-700 mt-1">Code: {scanResult}</p>
            </div>
          )}
        </div>
      </div>

      {/* Today's Summary */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Today's Bookings</h3>
          <span className="text-sm text-gray-500">{new Date().toLocaleDateString()}</span>
        </div>
        
        {todayBookings.length > 0 ? (
          <div className="space-y-3">
            {todayBookings.map((booking) => {
              const spot = spots.find(s => s.id === booking.spotId);
              return (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-gray-900">Booking #{booking.id.slice(-6)}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'active' ? 'bg-green-100 text-green-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {spot?.name} • ${booking.totalCost}
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                    <MoreHorizontal className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No bookings today</p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4">
          <Link
            to="/admin/add-spot"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Plus className="h-6 w-6 text-blue-600" />
            <span className="font-medium">Add Parking Spot</span>
          </Link>
          <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Bell className="h-6 w-6 text-blue-600" />
            <span className="font-medium">Notifications</span>
          </button>
        </div>
      </div>
    </div>
  );

  const DashboardSection = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  stat.color === 'text-green-600' ? 'bg-green-100' :
                  stat.color === 'text-blue-600' ? 'bg-blue-100' :
                  stat.color === 'text-purple-600' ? 'bg-purple-100' :
                  'bg-yellow-100'
                }`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <span className={`text-sm font-medium ${
                  stat.change.startsWith('+') ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Revenue chart would be here</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Distribution</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Booking distribution chart</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const SpotsSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">My Parking Spots</h3>
          <Link
            to="/admin/add-spot"
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Spot</span>
          </Link>
        </div>

        {spots.length > 0 ? (
          <div className="space-y-4">
            {spots.map((spot) => (
              <div key={spot.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{spot.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        spot.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {spot.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{spot.address}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{spot.availableSlots}/{spot.totalSlots} available</span>
                      <span>•</span>
                      <span>${spot.price}/{spot.priceType}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                    <Link
                      to={`/admin/edit-spot/${spot.id}`}
                      className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <Link
                      to={`/admin/availability/${spot.id}`}
                      className="p-2 text-gray-600 hover:text-purple-600 transition-colors"
                      title="Manage Availability"
                    >
                      <CalendarDays className="h-4 w-4" />
                    </Link>
                    <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                      {spot.isActive ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No parking spots yet
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first parking spot to start earning revenue.
            </p>
            <Link
              to="/admin/add-spot"
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Add Your First Spot</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomeSection />;
      case 'dashboard': return <DashboardSection />;
      case 'spots': return <SpotsSection />;
      case 'bookings': return <AdminBookingsPage />;
      case 'reviews': return <AdminReviewsPage />;
      default: return <HomeSection />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Parking Owner Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your parking spots and monitor performance
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {[
              { id: 'home', label: 'Home', icon: QrCode },
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'spots', label: 'My Spots', icon: MapPin },
              { id: 'bookings', label: 'Bookings', icon: Calendar/* , link: '/admin/bookings'  */},
              { id: 'reviews', label: 'Reviews', icon: MessageSquare/* , link: '/admin/reviews'  */},
            ].map((tab) => {
              const Icon = tab.icon;
              /* if (tab.link) {
                return (
                  <Link
                    key={tab.id}
                    to={tab.link}
                    className="flex items-center space-x-2 py-4 px-6 font-medium text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap"
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </Link>
                );
              } */
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-6 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        {renderContent()}

        {/* QR Scanner Modal */}
        {showQRScanner && (
          <QRScanner
            onScan={handleQRScan}
            onClose={() => setShowQRScanner(false)}
          />
        )}
      </div>
    </div>
  );
};
