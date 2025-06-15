import React, { useState } from 'react';
import { ParkingSpotCard } from '../components/ParkingSpotCard';
import { SearchFilters } from '../components/SearchFilters';
import { useAppStore } from '../store/AppStore';
import { Map, Grid, MapPin } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { filteredSpots } = useAppStore();
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const handleFindNearMe = () => {
    // In a real app, this would use GPS to find nearby spots
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('User location:', position.coords);
          alert(`Found your location! Latitude: ${position.coords.latitude.toFixed(4)}, Longitude: ${position.coords.longitude.toFixed(4)}\n\nIn a real app, this would filter parking spots by distance.`);
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to get your location. Please enable location services or search manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Find Perfect Parking Spots
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Discover and book parking spaces near you with ease
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Instant Booking</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>24/7 Support</span>
            </div>
          </div>
        </div>

        <SearchFilters onFindNearMe={handleFindNearMe} />

        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-gray-600">
              Found <span className="font-semibold text-gray-900">{filteredSpots.length}</span> parking spots
            </span>
            {filteredSpots.length === 0 && (
              <p className="text-sm text-gray-500 mt-1">
                Try adjusting your filters or search terms
              </p>
            )}
          </div>
          
          <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Grid className="h-4 w-4" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'map'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Map className="h-4 w-4" />
              <span>Map</span>
            </button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          filteredSpots.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSpots.map((spot) => (
                <ParkingSpotCard key={spot.id} spot={spot} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No parking spots found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria or filters
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Reset Search
              </button>
            </div>
          )
        ) : (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <Map className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Interactive Map View
            </h3>
            <p className="text-gray-600 mb-4">
              Map integration would be implemented here using Google Maps API
            </p>
            <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center relative overflow-hidden">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                <span className="text-gray-500 font-medium">Google Maps Integration</span>
                <p className="text-sm text-gray-400 mt-2">
                  Interactive map showing all {filteredSpots.length} parking spots
                </p>
              </div>
              
              {/* Mock map pins */}
              <div className="absolute top-4 left-4 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
              <div className="absolute top-12 right-8 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
              <div className="absolute bottom-8 left-12 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
              <div className="absolute bottom-4 right-4 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};