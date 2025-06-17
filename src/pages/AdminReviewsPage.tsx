
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Star, Calendar, User } from 'lucide-react';
import { database } from '../data/database';
import { useAuth } from '../context/AuthContext';
import { Review, ParkingSpot, User as UserType } from '../types';

export const AdminReviewsPage: React.FC = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [customers, setCustomers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSpot, setSelectedSpot] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Get owner's spots
      const ownerSpots = await database.getParkingSpotsByOwner(user.id);
      setSpots(ownerSpots);

      // Get all reviews for owner's spots
      const allReviews: Review[] = [];
      for (const spot of ownerSpots) {
        const spotReviews = await database.getReviewsBySpotId(spot.id);
        allReviews.push(...spotReviews);
      }
      setReviews(allReviews);

      // Get customer information
      const allUsers = await database.getAllUsers();
      setCustomers(allUsers.filter((u: UserType) => u.userType === 'customer'));
    } catch (error) {
      console.error('Error loading reviews:', error);
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

  const handleReplyUpdate = async (reviewId: string, reply: string) => {
    try {
      await database.updateReview(reviewId, { comment: reply });
      loadData(); // Refresh the data
    } catch (error) {
      console.error('Error updating review reply:', error);
    }
  };

  const filteredReviews = reviews.filter(review => 
    selectedSpot === 'all' || review.spotId === selectedSpot
  );

  const averageRating = filteredReviews.length > 0 
    ? filteredReviews.reduce((sum, review) => sum + review.rating, 0) / filteredReviews.length 
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="grid gap-6">
        {/* Overview Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <User className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredReviews.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredReviews.filter(r => 
                      new Date(r.createdAt).getMonth() === new Date().getMonth()
                    ).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reviews Management */}
        <Card>
          <CardHeader>
            <CardTitle>Reviews & Feedback</CardTitle>
            <div className="flex gap-4 mt-4">
              <select
                value={selectedSpot}
                onChange={(e) => setSelectedSpot(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Spots</option>
                {spots.map((spot) => (
                  <option key={spot.id} value={spot.id}>
                    {spot.name}
                  </option>
                ))}
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {filteredReviews.length > 0 ? (
              <div className="space-y-6">
                {filteredReviews.map((review) => {
                  const spot = spots.find(s => s.id === review.spotId);
                  const customer = customers.find(c => c.id === review.userId);
                  
                  return (
                    <div key={review.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{review.userName || customer?.name || 'Anonymous'}</h4>
                            <p className="text-sm text-gray-500">{spot?.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {renderStars(review.rating)}
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                      
                      {/* Reply Section - Owner can respond to reviews */}
                      <div className="border-t border-gray-100 pt-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <textarea
                              placeholder="Reply to this review..."
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                              rows={2}
                            />
                            <div className="flex justify-end mt-2">
                              <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                                Reply
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No reviews yet
                </h3>
                <p className="text-gray-600">
                  {selectedSpot !== 'all' ? 'No reviews for the selected spot' : 'Reviews will appear here once customers start rating your spots'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
