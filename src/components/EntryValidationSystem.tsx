import React, { useState } from 'react';
import { QrCode, Hash, Check, X, AlertCircle, User, Car, Clock, MapPin } from 'lucide-react';
import { useAppStore } from '../store/AppStore';
import { Booking } from '../types';

interface EntryValidationSystemProps {
  onClose?: () => void;
}

export const EntryValidationSystem: React.FC<EntryValidationSystemProps> = ({ onClose }) => {
  const [scanMode, setScanMode] = useState<'qr' | 'pin'>('qr');
  const [inputValue, setInputValue] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    success: boolean;
    booking?: Booking;
    message: string;
  } | null>(null);

  const { validateEntry, parkingSpots } = useAppStore();

  const handleValidation = async (code: string) => {
    setIsValidating(true);
    
    // Simulate validation delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const booking = validateEntry(code);
    
    if (booking) {
      setValidationResult({
        success: true,
        booking,
        message: 'Entry validated successfully!'
      });
    } else {
      setValidationResult({
        success: false,
        message: 'Invalid QR code or PIN. Please check and try again.'
      });
    }
    
    setIsValidating(false);
    setInputValue('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      handleValidation(inputValue.trim());
    }
  };

  const simulateQRScan = () => {
    setIsValidating(true);
    // Simulate scanning delay
    setTimeout(() => {
      // For demo, use a mock QR code that might exist
      handleValidation('QR123456789');
    }, 2000);
  };

  const resetValidation = () => {
    setValidationResult(null);
    setInputValue('');
  };

  const getSpotName = (spotId: string) => {
    const spot = parkingSpots.find(s => s.id === spotId);
    return spot?.name || 'Unknown Parking Spot';
  };

  if (validationResult) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
          <div className="p-6">
            {/* Result Header */}
            <div className={`text-center mb-6 p-4 rounded-lg ${
              validationResult.success ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                validationResult.success ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {validationResult.success ? (
                  <Check className="h-8 w-8 text-green-600" />
                ) : (
                  <X className="h-8 w-8 text-red-600" />
                )}
              </div>
              <h3 className={`text-xl font-bold mb-2 ${
                validationResult.success ? 'text-green-900' : 'text-red-900'
              }`}>
                {validationResult.success ? 'Entry Approved' : 'Entry Denied'}
              </h3>
              <p className={`${
                validationResult.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {validationResult.message}
              </p>
            </div>

            {/* Booking Details */}
            {validationResult.success && validationResult.booking && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Booking Details</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {getSpotName(validationResult.booking.spotId)}
                      </p>
                      <p className="text-sm text-gray-600">Booking ID: {validationResult.booking.id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-900">
                        {new Date(validationResult.booking.startTime).toLocaleString()} - 
                        {new Date(validationResult.booking.endTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Car className="h-4 w-4 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-900">Vehicle ID: {validationResult.booking.vehicleId}</p>
                      <p className="text-sm text-gray-600">Total Cost: ${validationResult.booking.totalCost}</p>
                    </div>
                  </div>
                  
                  <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    validationResult.booking.status === 'active' ? 'bg-green-100 text-green-800' :
                    validationResult.booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    Status: {validationResult.booking.status.charAt(0).toUpperCase() + validationResult.booking.status.slice(1)}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={resetValidation}
                className="flex-1 border border-gray-200 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Scan Another
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              )}
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

          {scanMode === 'qr' ? (
            <div className="text-center">
              <div className="w-48 h-48 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center relative overflow-hidden">
                {isValidating ? (
                  <div className="absolute inset-0 bg-blue-600 bg-opacity-20 flex items-center justify-center">
                    <div className="animate-pulse text-blue-600">
                      <QrCode className="h-12 w-12" />
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Position QR code in frame</p>
                  </div>
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
                disabled={isValidating}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors mb-4"
              >
                {isValidating ? 'Scanning...' : 'Simulate QR Scan'}
              </button>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Or enter QR code manually:</p>
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Enter QR code"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isValidating}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    Validate
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter 4-digit PIN
                </label>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="1234"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  maxLength={4}
                />
              </div>
              <button
                type="submit"
                disabled={inputValue.length !== 4 || isValidating}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isValidating ? 'Validating...' : 'Validate PIN'}
              </button>
            </form>
          )}

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Instructions</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Scan the customer's QR code or ask for their PIN</li>
                  <li>• Valid codes will show booking details</li>
                  <li>• Check that the booking time is current</li>
                  <li>• Allow entry if validation is successful</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};