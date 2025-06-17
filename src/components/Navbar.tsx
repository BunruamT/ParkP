
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MapPin, User, Calendar, Settings, Home, LogOut, Bell, Clock, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Notification {
  id: string;
  type: 'booking_reminder' | 'extension_reminder' | 'owner_notification' | 'system';
  title: string;
  message: string;
  time: string;
  unread: boolean;
  actionUrl?: string;
}

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    // Load notifications for the current user
    loadNotifications();
    
    // Set up notification checking interval (every 30 seconds)
    const interval = setInterval(checkForNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  const loadNotifications = () => {
    // Mock notifications - in real app, fetch from API
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'booking_reminder',
        title: 'Parking Session Starting Soon',
        message: 'Your parking at Central Plaza starts in 30 minutes',
        time: '5 min ago',
        unread: true,
        actionUrl: '/bookings'
      },
      {
        id: '2',
        type: 'extension_reminder',
        title: 'Extend Your Parking?',
        message: 'Your parking session ends in 30 minutes. Would you like to extend?',
        time: '15 min ago',
        unread: true,
        actionUrl: '/bookings'
      },
      {
        id: '3',
        type: 'owner_notification',
        title: 'Extension Request',
        message: 'John Doe wants to extend parking at your Central Plaza spot',
        time: '1 hour ago',
        unread: false,
        actionUrl: '/admin/bookings'
      },
      {
        id: '4',
        type: 'system',
        title: 'Payment Receipt',
        message: 'Payment receipt for booking #12345 is now available',
        time: '2 hours ago',
        unread: false,
        actionUrl: '/profile'
      }
    ];
    
    // Filter notifications based on user type
    const filteredNotifications = mockNotifications.filter(notification => {
      if (profile?.user_type === 'host' || profile?.user_type === 'both') {
        return ['owner_notification', 'system'].includes(notification.type);
      } else {
        return ['booking_reminder', 'extension_reminder', 'system'].includes(notification.type);
      }
    });
    
    setNotifications(filteredNotifications);
  };

  const checkForNotifications = () => {
    // This function would check for new notifications
    // For demo purposes, we'll simulate checking booking times
    
    if (!user) return;
    
    // In a real app, this would:
    // 1. Check current time against user's bookings
    // 2. Send notifications 30 minutes before start/end times
    // 3. Check for owner notifications about extension requests
    
    console.log('Checking for new notifications...');
    
    // Simulate a new notification occasionally
    if (Math.random() < 0.1) { // 10% chance
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: profile?.user_type === 'host' || profile?.user_type === 'both' ? 'owner_notification' : 'booking_reminder',
        title: profile?.user_type === 'host' || profile?.user_type === 'both' ? 'New Booking' : 'Parking Reminder',
        message: profile?.user_type === 'host' || profile?.user_type === 'both'
          ? 'New booking received for your parking spot'
          : 'Don\'t forget about your upcoming parking reservation',
        time: 'Just now',
        unread: true,
        actionUrl: profile?.user_type === 'host' || profile?.user_type === 'both' ? '/admin/bookings' : '/bookings'
      };
      
      setNotifications(prev => [newNotification, ...prev]);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, unread: false }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, unread: false }))
    );
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
    setShowNotifications(false);
  };

  const handleLogout = async () => {
    await signOut();
    setShowUserMenu(false);
    setShowMobileMenu(false);
    navigate('/login');
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  // Function to close all dropdowns/menus
  const closeAllMenus = () => {
    setShowUserMenu(false);
    setShowNotifications(false);
    setShowMobileMenu(false);
  };

  // Condition to show background overlay
  const showBackgroundOverlay = showUserMenu || showNotifications || showMobileMenu;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_reminder':
      case 'extension_reminder':
        return '🚗';
      case 'owner_notification':
        return '👤';
      case 'system':
        return '📄';
      default:
        return '🔔';
    }
  };

  return (
    <>
      <nav className="fixed top-0 w-full bg-white shadow-lg border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <MapPin className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">ParkPass</span>
            </Link>

            {/* Desktop Right Side */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowUserMenu(false);
                  }}
                  className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                              notification.unread ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${notification.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                <div className="flex items-center space-x-1 mt-2">
                                  <Clock className="h-3 w-3 text-gray-400" />
                                  <span className="text-xs text-gray-500">{notification.time}</span>
                                </div>
                              </div>
                              {notification.unread && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                          <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p>No notifications yet</p>
                        </div>
                      )}
                    </div>
                    <div className="p-3 border-t border-gray-200">
                      <button 
                        onClick={() => {
                          setShowNotifications(false);
                          // In a real app, navigate to a dedicated notifications page
                          console.log('Navigate to all notifications page');
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium w-full text-center"
                      >
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowNotifications(false);
                  }}
                  className="flex items-center space-x-2 p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span className="text-sm font-medium">{profile?.full_name || 'User'}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-3 border-b border-gray-200">
                      <p className="font-semibold text-gray-900">{profile?.full_name || 'User'}</p>
                      <p className="text-sm text-gray-600">{profile?.email}</p>
                      <p className="text-xs text-blue-600 capitalize">{profile?.user_type || 'guest'}</p>
                    </div>
                    <div className="py-2">
                      <Link
                        to="/profile"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                      {(profile?.user_type === 'guest' || profile?.user_type === 'both') && (
                        <Link
                          to="/bookings"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Calendar className="h-4 w-4" />
                          <span>My Bookings</span>
                        </Link>
                      )}
                      {(profile?.user_type === 'host' || profile?.user_type === 'both') && (
                        <Link
                          to="/admin"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Settings className="h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      )}
                      <Link
                        to="/settings"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </div>
                    <div className="border-t border-gray-200 py-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              {/* Mobile Notifications Toggle */}
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowMobileMenu(false);
                }}
                className="relative p-2 text-gray-600 hover:text-blue-600 rounded-lg transition-colors"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => {
                  setShowMobileMenu(!showMobileMenu);
                  setShowNotifications(false);
                }}
                className="p-2 text-gray-700 hover:text-blue-600 rounded-lg transition-colors"
              >
                {showMobileMenu ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 bg-white fixed w-full top-16 left-0 z-50 shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* User Info */}
              <div className="px-3 py-3 border-b border-gray-200 mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{profile?.full_name || 'User'}</p>
                    <p className="text-sm text-gray-600">{profile?.email}</p>
                    <p className="text-xs text-blue-600 capitalize">{profile?.user_type || 'guest'}</p>
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              <Link
                to="/"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/')
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
                onClick={() => setShowMobileMenu(false)}
              >
                <Home className="h-5 w-5" />
                <span>Home</span>
              </Link>

              {(profile?.user_type === 'guest' || profile?.user_type === 'both') && (
                <Link
                  to="/bookings"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive('/bookings')
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  <Calendar className="h-5 w-5" />
                  <span>My Bookings</span>
                </Link>
              )}

              {(profile?.user_type === 'host' || profile?.user_type === 'both') && (
                <Link
                  to="/admin"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive('/admin')
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  <Settings className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
              )}

              <Link
                to="/profile"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                <User className="h-5 w-5" />
                <span>Profile</span>
              </Link>

              <Link
                to="/settings"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>

              {/* Logout */}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Notifications Dropdown */}
        {showNotifications && (
          <div className="md:hidden fixed left-0 right-0 top-16 bg-white border-b border-gray-200 shadow-lg z-50 max-h-80 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                      notification.unread ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${notification.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <div className="flex items-center space-x-1 mt-2">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{notification.time}</span>
                        </div>
                      </div>
                      {notification.unread && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No notifications yet</p>
                </div>
              )}
            </div>
            <div className="p-3 border-t border-gray-200">
              <button
                className="text-sm text-blue-600 hover:text-blue-800 font-medium w-full text-center"
                onClick={() => {
                  setShowNotifications(false);
                  console.log('Navigate to all notifications page');
                }}
              >
                View all notifications
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Background Overlay */}
      {showBackgroundOverlay && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40"
          onClick={closeAllMenus}
        />
      )}
    </>
  );
};
