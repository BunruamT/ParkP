
import { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { MapPin, Star, Clock, Car, Wifi, Camera, Shield } from 'lucide-react';
import { useParkingSpots } from '../hooks/useSupabase';
import { ParkingSpot } from '../services/supabaseService';

export const HomePage = () => {
  const { spots, loading, error } = useParkingSpots();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  const filteredSpots = spots.filter(spot => 
    spot.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    spot.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSpotTypeIcon = (type: string) => {
    switch (type) {
      case 'garage': return '🏠';
      case 'driveway': return '🚗';
      case 'street': return '🛣️';
      case 'lot': return '🅿️';
      case 'covered': return '☂️';
      default: return '🅿️';
    }
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi': return <Wifi className="w-4 h-4" />;
      case 'security camera': return <Camera className="w-4 h-4" />;
      case 'cctv': return <Camera className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      default: return <Car className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading parking spots...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-600">Error loading parking spots: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Your Perfect Parking Spot
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Book private parking spaces from local hosts in your area
            </p>
            
            {/* Search Bar */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Where</label>
                    <Input
                      placeholder="Enter location"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Search</label>
                    <Input
                      placeholder="Search parking spots..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Search
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Available Parking Spots
          </h2>
          <p className="text-gray-600">
            {filteredSpots.length} spot{filteredSpots.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Parking Spots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpots.map((spot: ParkingSpot) => (
            <Card key={spot.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                {spot.images && spot.images.length > 0 ? (
                  <img
                    src={spot.images[0]}
                    alt={spot.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-4xl">{getSpotTypeIcon(spot.spot_type)}</span>
                  </div>
                )}
                {spot.is_available ? (
                  <Badge className="absolute top-2 right-2 bg-green-500">
                    Available
                  </Badge>
                ) : (
                  <Badge className="absolute top-2 right-2 bg-red-500">
                    Unavailable
                  </Badge>
                )}
              </div>
              
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {spot.title}
                    </h3>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">{spot.address}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-blue-600">
                        ${spot.hourly_rate}
                      </span>
                      <span className="text-gray-600">/hour</span>
                    </div>
                    {spot.daily_rate && (
                      <div className="text-sm text-gray-600">
                        ${spot.daily_rate}/day
                      </div>
                    )}
                  </div>

                  {spot.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {spot.description}
                    </p>
                  )}

                  {/* Amenities */}
                  {spot.amenities && spot.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {spot.amenities.slice(0, 3).map((amenity, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          <span className="mr-1">{getAmenityIcon(amenity)}</span>
                          {amenity}
                        </Badge>
                      ))}
                      {spot.amenities.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{spot.amenities.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={!spot.is_available}
                  >
                    {spot.is_available ? 'Book Now' : 'Unavailable'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSpots.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <MapPin className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No parking spots found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or check back later for new listings.
            </p>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold mb-4">
            Have a parking space to rent?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Start earning money by sharing your unused parking space with others.
          </p>
          <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
            List Your Space
          </Button>
        </div>
      </div>
    </div>
  );
};
