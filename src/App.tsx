import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { ParkingSpotDetail } from './pages/ParkingSpotDetail';
import { BookingPage } from './pages/BookingPage';
import { BookingsPage } from './pages/BookingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboard } from './pages/AdminDashboard';
import { LoginPage } from './pages/LoginPage';
import { AddParkingSpot } from './pages/AddParkingSpot';
import { EditParkingSpot } from './pages/EditParkingSpot';
import { ManageAvailability } from './pages/ManageAvailability';
import { useAppStore } from './store/AppStore';

function App() {
  const { isAuthenticated, userType } = useAppStore();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Auth Routes */}
          <Route 
            path="/login" 
            element={!isAuthenticated ? <LoginPage /> : <Navigate to={userType === 'admin' ? '/admin' : '/'} />} 
          />
          
          {/* Protected Routes */}
          <Route path="/*" element={
            isAuthenticated ? (
              <>
                <Navbar />
                <div className="pt-16">
                  <Routes>
                    {/* Customer Routes */}
                    {userType === 'customer' && (
                      <>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/spot/:id" element={<ParkingSpotDetail />} />
                        <Route path="/book/:id" element={<BookingPage />} />
                        <Route path="/bookings" element={<BookingsPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/admin" element={<Navigate to="/" />} />
                        <Route path="/admin/*" element={<Navigate to="/" />} />
                      </>
                    )}
                    
                    {/* Admin Routes */}
                    {userType === 'admin' && (
                      <>
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/admin/add-spot" element={<AddParkingSpot />} />
                        <Route path="/admin/edit-spot/:id" element={<EditParkingSpot />} />
                        <Route path="/admin/availability/:id" element={<ManageAvailability />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/" element={<Navigate to="/admin" />} />
                        <Route path="/spot/:id" element={<ParkingSpotDetail />} />
                        <Route path="/book/:id" element={<Navigate to="/admin" />} />
                        <Route path="/bookings" element={<Navigate to="/admin" />} />
                      </>
                    )}
                    
                    {/* Fallback */}
                    <Route path="*" element={<Navigate to={userType === 'admin' ? '/admin' : '/'} />} />
                  </Routes>
                </div>
              </>
            ) : (
              <Navigate to="/login" />
            )
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;