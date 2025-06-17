
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { MapPin, Star, Car, Clock, Phone, Wifi, Camera, Zap, Shield, Users } from 'lucide-react';
import { database } from '../data/database';
import { ParkingSpot, Review } from '../types';

export const ParkingSpotDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [spot, setSpot] = useState<ParkingSpot | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    loadSpotDetails();
  }, [id]);

  const loadSpotDetails = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const spotData = await database.getParkingSpotById(id);
      const reviewsData = await database.getReviewsBySpotId(id);
      
      setSpot(spotData || null);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading spot details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'security camera':
      case 'security':
        return <Camera className="h-4 w-4" />;
      case 'ev charging':
        return <Zap className="h-4 w-4" />;
      case 'wifi':
        return <Wifi className="h-4 w-4" />;
      case 'covered':
        return <Shield className="h-4 w-4" />;
      case '24/7 access':
        return <Clock className="h-4 w-4" />;
      default:
        return <Car className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!spot) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Spot Not Found</h2>
          <p className="text-gray-600">The parking spot you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card>
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={spot.images[selectedImageIndex]}
                    alt={spot.name}
                    className="w-full h-96 object-cover rounded-t-lg"
                  />
                  {spot.images.length > 1 && (
                    <div className="absolute bottom-4 left-4 flex space-x-2">
                      {spot.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`w-3 h-3 rounded-full ${
                            index === selectedImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Spot Details */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{spot.name}</CardTitle>
                    <div className="flex items-center space-x-1 text-yellow-500 mt-2">
                      {renderStars(spot.rating)}
                      <span className="text-gray-600 ml-2">
                        {spot.rating} ({spot.reviewCount} reviews)
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">
                      ${spot.price}
                    </div>
                    <div className="text-gray-500">per {spot.priceType}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="h-5 w-5" />
                  <span>{spot.address}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Car className="h-5 w-5 text-gray-600" />
                    <span className="text-gray-700">
                      {spot.availableSlots}/{spot.totalSlots} spots available
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-gray-600" />
                    <span className="text-gray-700">{spot.openingHours}</span>
                  </div>
                  {spot.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-5 w-5 text-gray-600" />
                      <span className="text-gray-700">{spot.phone}</span>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-700">{spot.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {spot.amenities.map((amenity, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                        {getAmenityIcon(amenity)}
                        <span>{amenity}</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Reviews ({reviews.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{review.userName}</h4>
                            <div className="flex items-center space-x-2">
                              {renderStars(review.rating)}
                              <span className="text-sm text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No reviews yet. Be the first to review this spot!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6 space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    ${spot.price}
                  </div>
                  <div className="text-gray-500">per {spot.priceType}</div>
                </div>

                <div className={`p-4 rounded-lg text-center ${
                  spot.availableSlots > 10
                    ? 'bg-green-50 text-green-800'
                    : spot.availableSlots > 5
                    ? 'bg-yellow-50 text-yellow-800'
                    : spot.availableSlots > 0
                    ? 'bg-orange-50 text-orange-800'
                    : 'bg-red-50 text-red-800'
                }`}>
                  <div className="font-semibold">
                    {spot.availableSlots > 0 
                      ? `${spot.availableSlots} spots available`
                      : 'Currently full'
                    }
                  </div>
                  <div className="text-sm mt-1">
                    {spot.availableSlots > 10 
                      ? 'Plenty of space' 
                      : spot.availableSlots > 0 
                      ? 'Limited availability' 
                      : 'Check back later'
                    }
                  </div>
                </div>

                <Link to={`/app/book/${spot.id}`} className="block">
                  <Button 
                    className="w-full" 
                    size="lg"
                    disabled={spot.availableSlots === 0}
                  >
                    {spot.availableSlots > 0 ? 'Book Now' : 'Not Available'}
                  </Button>
                </Link>

                <div className="text-xs text-gray-500 text-center">
                  You won't be charged until your booking is confirmed
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
