import React, { useState } from 'react';
import { Search, Filter, MapPin, X } from 'lucide-react';
import { useAppStore } from '../store/AppStore';

interface SearchFiltersProps {
  onFindNearMe: () => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({ onFindNearMe }) => {
  const { 
    searchQuery, 
    filters, 
    setSearchQuery, 
    setFilters 
  } = useAppStore();
  
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled automatically by the store
  };

  const availableAmenities = [
    'CCTV Security',
    'EV Charging', 
    'Covered Parking',
    'Valet Service',
    'Car Wash',
    'Elevator Access',
    'Shopping Access',
    'Food Court Nearby'
  ];

  const clearFilters = () => {
    setFilters({
      priceRange: [0, 500],
      parkingType: 'all',
      amenities: []
    });
  };

  const toggleAmenity = (amenity: string) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity];
    
    setFilters({ amenities: newAmenities });
  };

  const hasActiveFilters = 
    filters.priceRange[1] < 500 || 
    filters.parkingType !== 'all' || 
    filters.amenities.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by location, address, or parking name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          />
        </div>
        
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onFindNearMe}
            className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap"
          >
            <MapPin className="h-5 w-5" />
            <span className="hidden md:inline">Find Near Me</span>
            <span className="md:hidden">Near Me</span>
          </button>
          
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-3 border rounded-lg font-medium transition-colors relative ${
              hasActiveFilters 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-5 w-5" />
            <span className="hidden md:inline">Filters</span>
            {hasActiveFilters && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                {filters.amenities.length + (filters.parkingType !== 'all' ? 1 : 0) + (filters.priceRange[1] < 500 ? 1 : 0)}
              </span>
            )}
          </button>
        </div>
      </form>

      {showFilters && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear All
              </button>
            )}
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Max Price per Hour
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={filters.priceRange[1]}
                  onChange={(e) => setFilters({
                    priceRange: [0, parseInt(e.target.value)]
                  })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>$0</span>
                  <span className="font-medium text-blue-600">
                    ${filters.priceRange[1]}{filters.priceRange[1] === 500 ? '+' : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Parking Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Parking Type
              </label>
              <select
                value={filters.parkingType}
                onChange={(e) => setFilters({ parkingType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">All Types</option>
                <option value="covered">Covered</option>
                <option value="open">Open Air</option>
                <option value="valet">Valet Service</option>
                <option value="security">High Security</option>
              </select>
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Amenities
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {availableAmenities.map((amenity) => (
                  <label key={amenity} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.amenities.includes(amenity)}
                      onChange={() => toggleAmenity(amenity)}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {filters.priceRange[1] < 500 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                    Max $${filters.priceRange[1]}/hr
                    <button
                      onClick={() => setFilters({ priceRange: [0, 500] })}
                      className="ml-2 hover:text-blue-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                
                {filters.parkingType !== 'all' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                    {filters.parkingType.charAt(0).toUpperCase() + filters.parkingType.slice(1)}
                    <button
                      onClick={() => setFilters({ parkingType: 'all' })}
                      className="ml-2 hover:text-blue-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                
                {filters.amenities.map((amenity) => (
                  <span key={amenity} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                    {amenity}
                    <button
                      onClick={() => toggleAmenity(amenity)}
                      className="ml-2 hover:text-blue-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};