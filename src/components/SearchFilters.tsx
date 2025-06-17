import React, { useState } from 'react';
import { Search, Filter, MapPin, X } from 'lucide-react';

interface SearchFiltersProps {
  onSearch: (query: string) => void;
  onFilter: (filters: FilterOptions) => void;
  onFindNearMe: () => void;
}

interface FilterOptions {
  priceRange: [number, number];
  parkingType: string;
  amenities: string[];
  sortBy: string;
  availableOnly: boolean;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  onSearch,
  onFilter,
  onFindNearMe
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [0, 500],
    parkingType: 'all',
    amenities: [],
    sortBy: 'distance',
    availableOnly: false
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilter(updatedFilters);
  };

  const toggleAmenity = (amenity: string) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity];
    
    handleFilterChange({ amenities: newAmenities });
  };

  const clearFilters = () => {
    const defaultFilters: FilterOptions = {
      priceRange: [0, 500],
      parkingType: 'all',
      amenities: [],
      sortBy: 'distance',
      availableOnly: false
    };
    setFilters(defaultFilters);
    onFilter(defaultFilters);
  };

  const availableAmenities = [
    'EV Charging',
    'CCTV Security', 
    'Covered Parking',
    'Valet Service',
    'Car Wash',
    'Elevator Access',
    '24/7 Access',
    'Disabled Access'
  ];

  const hasActiveFilters = 
    filters.priceRange[1] < 500 ||
    filters.parkingType !== 'all' ||
    filters.amenities.length > 0 ||
    filters.sortBy !== 'distance' ||
    filters.availableOnly;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by location, address, or parking spot name..."
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
              <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {filters.amenities.length + 
                 (filters.priceRange[1] < 500 ? 1 : 0) + 
                 (filters.parkingType !== 'all' ? 1 : 0) +
                 (filters.sortBy !== 'distance' ? 1 : 0) +
                 (filters.availableOnly ? 1 : 0)}
              </span>
            )}
          </button>
        </div>
      </form>

      {showFilters && (
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filter Options</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Price Range (per hour)
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={filters.priceRange[1]}
                  onChange={(e) => handleFilterChange({
                    priceRange: [0, parseInt(e.target.value)]
                  })}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>$0</span>
                  <span>${filters.priceRange[1]}</span>
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
                onChange={(e) => handleFilterChange({ parkingType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">All Types</option>
                <option value="covered">Covered</option>
                <option value="open">Open Air</option>
                <option value="valet">Valet Service</option>
                <option value="garage">Garage</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="distance">Distance</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="availability">Most Available</option>
              </select>
            </div>

            {/* Available Only */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Availability
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.availableOnly}
                  onChange={(e) => handleFilterChange({ availableOnly: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Available spots only</span>
              </label>
            </div>
          </div>

          {/* Amenities */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Amenities
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {availableAmenities.map((amenity) => {
                const isSelected = filters.amenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`flex items-center justify-between p-3 border-2 rounded-lg transition-colors text-sm ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <span>{amenity}</span>
                    {isSelected && (
                      <X className="h-4 w-4 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Active Filters:</h4>
              <div className="flex flex-wrap gap-2">
                {filters.priceRange[1] < 500 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Price: $0-${filters.priceRange[1]}
                  </span>
                )}
                {filters.parkingType !== 'all' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Type: {filters.parkingType}
                  </span>
                )}
                {filters.sortBy !== 'distance' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Sort: {filters.sortBy.replace('_', ' ')}
                  </span>
                )}
                {filters.availableOnly && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Available only
                  </span>
                )}
                {filters.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {amenity}
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