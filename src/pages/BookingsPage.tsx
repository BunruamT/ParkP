
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Calendar, Clock, MapPin, Car, QrCode, Phone } from 'lucide-react';
import { QRCodeGenerator } from '../components/QRCodeGenerator';
import { PaymentSlipUpload } from '../components/PaymentSlipUpload';
import { RatingReviewModal } from '../components/RatingReviewModal';
import { database } from '../data/database';
import { useAuth } from '../context/AuthContext';
import { Booking, ParkingSpot, Vehicle } from '../types';

export const BookingsPage: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showPaymentUpload, setShowPaymentUpload] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [paymentSlip, setPaymentSlip] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (!user) {
          console.error("User not authenticated.");
          return;
        }

        const userBookings = await database.getBookingsByUserId(user.id);
        setBookings(userBookings);

        const userVehicles = await database.getVehiclesByUserId(user.id);
        setVehicles(userVehicles);

        const allSpots = await database.getParkingSpots();
        setSpots(allSpots);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  const getSpotName = (spotId: string) => {
    const spot = spots.find(spot => spot.id === spotId);
    return spot ? spot.name : 'Unknown Spot';
  };

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowQRCode(true);
  };

  const handlePaymentUploadClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowPaymentUpload(true);
  };

  const handleRatingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowRatingModal(true);
  };

  const handlePaymentSlipUpload = (file: File | null) => {
    if (file) {
      // Simulate upload and set the state
      setPaymentSlip(URL.createObjectURL(file));
      setShowPaymentUpload(false);
    }
  };

  const handleRatingSubmit = (rating: number, reviewText: string) => {
    // Implement the submission logic here
    console.log('Rating:', rating, 'Review:', reviewText);
    setShowRatingModal(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>My Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length > 0 ? (
            <div className="grid gap-4">
              {bookings.map((booking) => {
                const spot = spots.find(s => s.id === booking.spotId);
                const vehicle = vehicles.find(v => v.id === booking.vehicleId);

                return (
                  <div key={booking.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{getSpotName(booking.spotId)}</h3>
                        <div className="text-sm text-gray-500">
                          <MapPin className="h-4 w-4 inline-block mr-1" />
                          {spot?.address}
                        </div>
                      </div>
                      <Badge variant="secondary">{booking.status}</Badge>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <Calendar className="h-4 w-4 inline-block mr-1" />
                        {new Date(booking.startTime).toLocaleDateString()}
                      </div>
                      <div>
                        <Clock className="h-4 w-4 inline-block mr-1" />
                        {new Date(booking.startTime).toLocaleTimeString()} - {new Date(booking.endTime).toLocaleTimeString()}
                      </div>
                      <div>
                        <Car className="h-4 w-4 inline-block mr-1" />
                        {vehicle ? `${vehicle.make} ${vehicle.model}` : 'Vehicle info not available'}
                      </div>
                      <div>
                        <Phone className="h-4 w-4 inline-block mr-1" />
                        {spot?.phone || 'N/A'}
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end space-x-2">
                      <Button size="sm" onClick={() => handleBookingClick(booking)}>
                        <QrCode className="h-4 w-4 mr-2" />
                        View QR Code
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handlePaymentUploadClick(booking)}>
                        Upload Payment
                      </Button>
                      <Button size="sm" onClick={() => handleRatingClick(booking)}>
                        Rate & Review
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No bookings yet
              </h3>
              <p className="text-gray-600 mb-4">
                Book your parking spot now.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Code Modal */}
      {showQRCode && selectedBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Booking QR Code
              </h3>
              <div className="mt-2">
                <QRCodeGenerator value={selectedBooking.qrCode} />
                <p>Booking ID: {selectedBooking.id}</p>
                <p>PIN: {selectedBooking.pin}</p>
              </div>
              <div className="items-center px-4 py-3">
                <Button onClick={() => setShowQRCode(false)} className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md width-full shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Upload Modal */}
      {showPaymentUpload && selectedBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Upload Payment Slip
              </h3>
              <div className="mt-2">
                <PaymentSlipUpload onUpload={handlePaymentSlipUpload} />
                {paymentSlip && (
                  <img src={paymentSlip} alt="Payment Slip" className="mt-4 max-h-40 object-contain" />
                )}
              </div>
              <div className="items-center px-4 py-3">
                <Button onClick={() => setShowPaymentUpload(false)} className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md width-full shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rating and Review Modal */}
      {showRatingModal && selectedBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Rate and Review
              </h3>
              <div className="mt-2">
                <RatingReviewModal onSubmit={handleRatingSubmit} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
