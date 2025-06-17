
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import Index from './pages/Index';
import { LandingPage } from './pages/LandingPage';
import { ParkingSpotDetail } from './pages/ParkingSpotDetail';
import { BookingPage } from './pages/BookingPage';
import { BookingsPage } from './pages/BookingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboard } from './pages/AdminDashboard';
import { LoginPage } from './pages/LoginPage';
import AddParkingSpot from './pages/AddParkingSpot';
import { EditParkingSpot } from './pages/EditParkingSpot';
import { ManageAvailability } from './pages/ManageAvailability';
import { SettingsPage } from './pages/SettingsPage';
import { AdminBookingsPage } from './pages/AdminBookingsPage';
import { AdminReviewsPage } from './pages/AdminReviewsPage';
import NotFound from './pages/NotFound';

const AppContent: React.FC = () => {
  const { user, profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route 
          path="/login" 
          element={user ? <Navigate to={profile?.user_type === 'host' ? '/admin' : '/'} replace /> : <LoginPage />} 
        />
        
        {/* Protected Routes with Navbar */}
        <Route path="/spot/:id" element={
          <ProtectedRoute>
            <Navbar />
            <div className="pt-16">
              <ParkingSpotDetail />
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/book/:id" element={
          <ProtectedRoute>
            <Navbar />
            <div className="pt-16">
              <BookingPage />
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/bookings" element={
          <ProtectedRoute>
            <Navbar />
            <div className="pt-16">
              <BookingsPage />
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <Navbar />
            <div className="pt-16">
              <ProfilePage />
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute>
            <Navbar />
            <div className="pt-16">
              <SettingsPage />
            </div>
          </ProtectedRoute>
        } />
        
        {/* Owner-only routes */}
        <Route path="/admin" element={
          <ProtectedRoute requireHost>
            <Navbar />
            <div className="pt-16">
              <AdminDashboard />
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/add-spot" element={
          <ProtectedRoute requireHost>
            <Navbar />
            <div className="pt-16">
              <AddParkingSpot />
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/edit-spot/:id" element={
          <ProtectedRoute requireHost>
            <Navbar />
            <div className="pt-16">
              <EditParkingSpot />
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/availability/:id" element={
          <ProtectedRoute requireHost>
            <Navbar />
            <div className="pt-16">
              <ManageAvailability />
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/bookings" element={
          <ProtectedRoute requireHost>
            <Navbar />
            <div className="pt-16">
              <AdminBookingsPage />
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/reviews" element={
          <ProtectedRoute requireHost>
            <Navbar />
            <div className="pt-16">
              <AdminReviewsPage />
            </div>
          </ProtectedRoute>
        } />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
