
import React, { useState } from 'react';
import { QrCode, Hash, Check, X, AlertCircle, User, MapPin, Clock, Car } from 'lucide-react';
import { database } from '../data/database';
import { Booking, ParkingSpot } from '../services/supabaseService';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose?: () => void;
}

interface BookingDetails {
  booking: Booking;
  spot: ParkingSpot;
  customerName: string;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const [scanMode, setScanMode] = useState<'qr' | 'pin'>('qr');
  const [pinInput, setPinInput] = useState('');
  const [qrInput, setQrInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const validateAndShowBooking = async (code: string, isPin: boolean = false) => {
    setError('');
    setIsProcessing(true);

    try {
      let booking: Booking | null = null;
      
      if (isPin) {
        booking = await database.getBookingByPin(code);
      } else {
        booking = await database.getBookingByQRCode(code);
      }

      if (!booking) {
        setError('Invalid code. Please check and try again.');
        setIsProcessing(false);
        return;
      }

      if (booking.status === 'completed' || booking.status === 'cancelled') {
        setError('This booking has already been processed.');
        setIsProcessing(false);
        return;
      }

      // Get spot and customer details
      const spot = await database.getParkingSpotById(booking.spot_id);
      const customer = await database.getUserById(booking.guest_id);

      if (!spot || !customer) {
        setError('Booking details not found.');
        setIsProcessing(false);
        return;
      }

      setBookingDetails({
        booking,
        spot,
        customerName: customer.name
      });
    } catch (error) {
      setError('Error validating code. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.length === 4) {
      validateAndShowBooking(pinInput, true);
    }
  };

  const handleQRSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (qrInput.trim()) {
      validateAndShowBooking(qrInput.trim());
    }
  };

  const simulateQRScan = () => {
    setIsScanning(true);
    // Simulate scanning delay
    setTimeout(() => {
      setIsScanning(false);
      // Use a valid QR code from the database for demo
      validateAndShowBooking('QR_b1_1_1737123456789');
    }, 2000);
  };

  const confirmEntry = async () => {
    if (!bookingDetails) return;

    setIsProcessing(true);
    try {
      // Update booking status to confirmed (if it was pending) or completed
      const newStatus = bookingDetails.booking.status === 'pending' ? 'confirmed' : 'completed';
      await database.updateBookingStatus(bookingDetails.booking.id, newStatus);
      
      onScan(`QR_${bookingDetails.booking.id}`);
      setBookingDetails(null);
      if (onClose) onClose();
    } catch (error) {
      setError('Error processing entry. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (bookingDetails) {
    const startDateTime = formatDateTime(bookingDetails.booking.start_time);
    const endDateTime = formatDateTime(bookingDetails.booking.end_time);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Valid Booking Found
              </h3>
              <p className="text-green-700">
                Booking details verified successfully
              </p>
            </div>

            {/* Booking Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">Customer:</span>
                <span className="font-medium">{bookingDetails.customerName}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">Location:</span>
                <span className="font-medium">{bookingDetails.spot.title}</span>
              </div>

              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">Time:</span>
                <span className="font-medium">
                  {startDateTime.date} • {startDateTime.time} - {endDateTime.time}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Car className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  bookingDetails.booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  bookingDetails.booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {bookingDetails.booking.status.charAt(0).toUpperCase() + bookingDetails.booking.status.slice(1)}
                </span>
              </div>

              <div className="pt-2 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Amount:</span>
                  <span className="font-bold text-lg">${bookingDetails.booking.total_amount}</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-2 text-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setBookingDetails(null)}
                className="flex-1 border border-gray-200 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={confirmEntry}
                disabled={isProcessing}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? 'Processing...' : 'Confirm Entry'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Entry Validation</h3>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            )}
          </div>

          {/* Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => setScanMode('qr')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md font-medium transition-colors ${
                scanMode === 'qr'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              <QrCode className="h-4 w-4" />
              <span>QR Code</span>
            </button>
            <button
              onClick={() => setScanMode('pin')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md font-medium transition-colors ${
                scanMode === 'pin'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              <Hash className="h-4 w-4" />
              <span>PIN</span>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {scanMode === 'qr' ? (
            <div className="text-center">
              <div className="w-48 h-48 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center relative overflow-hidden">
                {isScanning ? (
                  <div className="absolute inset-0 bg-blue-600 bg-opacity-20 flex items-center justify-center">
                    <div className="animate-pulse text-blue-600">
                      <QrCode className="h-12 w-12" />
                    </div>
                  </div>
                ) : (
                  <QrCode className="h-12 w-12 text-gray-400" />
                )}
                {/* Scanning overlay */}
                <div className="absolute inset-4 border-2 border-blue-600 rounded-lg">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-600 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-600 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-600 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-600 rounded-br-lg"></div>
                </div>
              </div>
              
              <button
                onClick={simulateQRScan}
                disabled={isScanning || isProcessing}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors mb-4"
              >
                {isScanning ? 'Scanning...' : 'Simulate QR Scan'}
              </button>

              <div className="text-left">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or enter QR code manually:
                </label>
                <form onSubmit={handleQRSubmit} className="space-y-3">
                  <input
                    type="text"
                    value={qrInput}
                    onChange={(e) => setQrInput(e.target.value)}
                    placeholder="Paste QR code here"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!qrInput.trim() || isProcessing}
                    className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {isProcessing ? 'Validating...' : 'Validate Code'}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePinSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter 4-digit PIN
                </label>
                <input
                  type="text"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="1234"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  maxLength={4}
                />
              </div>
              <button
                type="submit"
                disabled={pinInput.length !== 4 || isProcessing}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? 'Validating...' : 'Validate PIN'}
              </button>
            </form>
          )}

          {/* Demo Instructions */}
          <div className="mt-6 p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Demo Instructions</h4>
            <div className="text-xs text-blue-700 space-y-1">
              <p>• Use "Simulate QR Scan" to test with demo booking</p>
              <p>• Or enter PIN: <strong>1234</strong></p>
              <p>• QR Code: <strong>QR_b1_1_1737123456789</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
