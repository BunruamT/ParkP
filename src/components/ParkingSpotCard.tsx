
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Car, Clock, Zap } from 'lucide-react';
import { ParkingSpot } from '../services/supabaseService';

interface ParkingSpotCardProps {
  spot: ParkingSpot;
}

export const ParkingSpotCard: React.FC<ParkingSpotCardProps> = ({ spot }) => {
  const formatPrice = (price: number) => {
    return `$${price}/hour`;
  };

  return (
    <Link to={`/spot/${spot.id}`} className="block">
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
        <div className="relative">
          <img
            src={spot.images[0] || '/placeholder.svg'}
            alt={spot.title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-full text-sm font-semibold text-gray-900">
            {formatPrice(spot.hourly_rate)}
          </div>
          <div className="absolute bottom-3 left-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs">
            {spot.is_available ? 'Available' : 'Not Available'}
          </div>
        </div>
        
        <div className="p-5">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
              {spot.title}
            </h3>
            <div className="flex items-center space-x-1 text-sm">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-gray-700">4.5</span>
              <span className="text-gray-500">(12)</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 text-gray-600 mb-3">
            <MapPin className="h-4 w-4" />
            <span className="text-sm line-clamp-1">{spot.address}</span>
          </div>

          <div className="flex items-center space-x-1 text-gray-600 mb-4">
            <Clock className="h-4 w-4" />
            <span className="text-sm">24/7 Available</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Car className="h-4 w-4 text-blue-600" />
              {spot.amenities.includes('EV Charging') && (
                <Zap className="h-4 w-4 text-green-600" />
              )}
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              spot.is_available
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {spot.is_available ? 'Available' : 'Not Available'}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
