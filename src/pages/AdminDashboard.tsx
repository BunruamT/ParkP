import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  QrCode, 
  MapPin, 
  Calendar, 
  Star, 
  DollarSign,
  Users,
  Car,
  Plus,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  ToggleLeft,
  ToggleRight,
  Bell,
  Download,
  Search,
  Filter,
  MoreHorizontal,
  Settings,
  FileText,
  PieChart,
  CalendarDays
} from 'lucide-react';
import { EntryValidationSystem } from '../components/EntryValidationSystem';
import { useAppStore } from '../store/AppStore';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'dashboard' | 'spots' | 'bookings' | 'reviews' | 'reports' | 'settings'>('home');
  const [showValidationSystem, setShowValidationSystem] = useState(false);
  
  const { parkingSpots, bookings, user } = useAppStore();
  
  // Filter spots owned by current user
  const mySpots = parkingSpots.filter(spot => spot.ownerId === user?.id);
  const myBookings = bookings.filter(booking => 
    mySpots.some(spot => spot.id === booking.spotId)
  );

  const stats = [
    { 
      label: 'Today\'s Revenue', 
      value: `$${myBookings.reduce((sum, booking) => sum + booking.totalCost, 0)}`, 
      change: '+15%', 
      icon: DollarSign, 
      color: 'text-green-600' 
    },
    { 
      label: 'Active Bookings', 
      value: myBookings.filter(b => b.status === 'active').length.toString(), 
      change: '+8%', 
      icon: Calendar, 
      color: 'text-blue-600' 
    },
    { 
      label: 'Total Spots', 
      value: mySpots.length.toString(), 
      change: '0%', 
      icon: MapPin, 
      color: 'text-purple-600' 
    },
    { 
      label: 'Avg Rating', 
      value: mySpots.length > 0 ? (mySpots.reduce((sum, spot) => sum + spot.rating, 0) / mySpots.length).toFixed(1) : '0', 
      change: '+0.2', 
      icon: Star, 
      color: 'text-yellow-600' 
    },
  ];

  const todayBookings = myBookings.filter(booking => {
    const today = new Date().toDateString();
    const bookingDate = new Date(booking.startTime).toDateString();
    return bookingDate === today;
  });

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
            onClick={() => setShowValidationSystem(true)}
            className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg"
          >
            Open Scanner
          </button>
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
              const spot = mySpots.find(s => s.id === booking.spotId);
              return (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-gray-900">Booking {booking.id}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'active' ? 'bg-green-100 text-green-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {spot?.name} • {new Date(booking.startTime).toLocaleTimeString()} - {new Date(booking.endTime).toLocaleTimeString()} • ${booking.totalCost}
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
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No bookings for today</p>
          </div>
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
            <AlertTriangle className="h-6 w-6 text-orange-600" />
            <span className="font-medium">Report Issue</span>
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
              <p className="text-sm text-gray-400 mt-1">
                Total Revenue: ${myBookings.reduce((sum, booking) => sum + booking.totalCost, 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Distribution</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Booking distribution chart</p>
              <p className="text-sm text-gray-400 mt-1">
                Total Bookings: {myBookings.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {myBookings.slice(0, 4).map((booking, index) => {
            const spot = mySpots.find(s => s.id === booking.spotId);
            return (
              <div key={booking.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  booking.status === 'active' ? 'bg-green-600' :
                  booking.status === 'pending' ? 'bg-yellow-600' :
                  'bg-gray-600'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    New booking at {spot?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(booking.createdAt).toLocaleString()} • ${booking.totalCost}
                  </p>
                </div>
              </div>
            );
          })}
          {myBookings.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No recent activity</p>
            </div>
          )}
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

        {mySpots.length > 0 ? (
          <div className="space-y-4">
            {mySpots.map((spot) => {
              const spotBookings = myBookings.filter(b => b.spotId === spot.id);
              const revenue = spotBookings.reduce((sum, booking) => sum + booking.totalCost, 0);
              
              return (
                <div key={spot.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{spot.name}</h4>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{spot.address}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{spot.availableSlots}/{spot.totalSlots} available</span>
                        <span>•</span>
                        <span>${revenue} total revenue</span>
                        <span>•</span>
                        <span>{spotBookings.length} bookings</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/spot/${spot.id}`}
                        className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/admin/edit-spot/${spot.id}`}
                        className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                        title="Edit Spot"
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
                        <ToggleRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No parking spots yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first parking spot to start earning revenue
            </p>
            <Link
              to="/admin/add-spot"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Add Your First Spot
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  const BookingsSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Booking Management</h3>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <button className="flex items-center space-x-2 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>
        
        {myBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Booking ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Spot</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Date & Time</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {myBookings.map((booking) => {
                  const spot = mySpots.find(s => s.id === booking.spotId);
                  return (
                    <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm">{booking.id}</td>
                      <td className="py-3 px-4 text-gray-900">{spot?.name}</td>
                      <td className="py-3 px-4 text-gray-600">
                        <div>{new Date(booking.startTime).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(booking.startTime).toLocaleTimeString()} - {new Date(booking.endTime).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'active' ? 'bg-green-100 text-green-800' :
                          booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900">${booking.totalCost}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1">
                          <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                            <Eye className="h-4 w-4 text-gray-500" />
                          </button>
                          {booking.status === 'active' && (
                            <button className="p-1 hover:bg-red-100 rounded transition-colors">
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No bookings yet
            </h3>
            <p className="text-gray-600">
              Bookings for your parking spots will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const ReviewsSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Reviews & Feedback</h3>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {mySpots.length > 0 ? (mySpots.reduce((sum, spot) => sum + spot.rating, 0) / mySpots.length).toFixed(1) : '0.0'}
              </div>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                ))}
              </div>
              <div className="text-sm text-gray-500">
                {mySpots.reduce((sum, spot) => sum + spot.reviewCount, 0)} reviews
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center py-12">
          <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No reviews yet
          </h3>
          <p className="text-gray-600">
            Customer reviews for your parking spots will appear here
          </p>
        </div>
      </div>
    </div>
  );

  const ReportsSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Reports & Analytics</h3>
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-900">Revenue</span>
            </div>
            <div className="text-2xl font-bold text-green-900">
              ${myBookings.reduce((sum, booking) => sum + booking.totalCost, 0)}
            </div>
            <div className="text-sm text-green-700">Total earned</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">Bookings</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">{myBookings.length}</div>
            <div className="text-sm text-blue-700">Total bookings</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-purple-900">Spots</span>
            </div>
            <div className="text-2xl font-bold text-purple-900">{mySpots.length}</div>
            <div className="text-sm text-purple-700">Active spots</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Revenue by Spot</h4>
            <div className="space-y-2">
              {mySpots.map((spot) => {
                const spotBookings = myBookings.filter(b => b.spotId === spot.id);
                const revenue = spotBookings.reduce((sum, booking) => sum + booking.totalCost, 0);
                const maxRevenue = Math.max(...mySpots.map(s => 
                  myBookings.filter(b => b.spotId === s.id).reduce((sum, booking) => sum + booking.totalCost, 0)
                ), 1);
                const percentage = (revenue / maxRevenue) * 100;
                
                return (
                  <div key={spot.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">{spot.name}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="font-semibold text-gray-900 w-16 text-right">${revenue}</span>
                    </div>
                  </div>
                );
              })}
              {mySpots.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No data available</p>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Booking Status Distribution</h4>
            <div className="space-y-2">
              {['active', 'pending', 'completed', 'cancelled'].map((status) => {
                const count = myBookings.filter(b => b.status === status).length;
                const percentage = myBookings.length > 0 ? (count / myBookings.length) * 100 : 0;
                
                return (
                  <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 capitalize">{status}</div>
                      <div className="text-sm text-gray-600">{count} bookings</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const SettingsSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Settings</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Owner Information</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  defaultValue={user?.name || ''} 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  defaultValue={user?.email || ''} 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Notification Preferences</h4>
            <div className="space-y-3">
              {[
                { label: 'New Bookings', description: 'Get notified when customers make new bookings' },
                { label: 'Payment Received', description: 'Receive alerts when payments are processed' },
                { label: 'Customer Reviews', description: 'Be notified of new customer reviews' },
                { label: 'System Updates', description: 'Important system and feature updates' },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">{item.label}</p>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomeSection />;
      case 'dashboard': return <DashboardSection />;
      case 'spots': return <SpotsSection />;
      case 'bookings': return <BookingsSection />;
      case 'reviews': return <ReviewsSection />;
      case 'reports': return <ReportsSection />;
      case 'settings': return <SettingsSection />;
      default: return <HomeSection />;
    }
  };

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
              { id: 'bookings', label: 'Bookings', icon: Calendar },
              { id: 'reviews', label: 'Reviews', icon: Star },
              { id: 'reports', label: 'Reports', icon: FileText },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
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

        {/* Entry Validation System Modal */}
        {showValidationSystem && (
          <EntryValidationSystem
            onClose={() => setShowValidationSystem(false)}
          />
        )}
      </div>
    </div>
  );
};