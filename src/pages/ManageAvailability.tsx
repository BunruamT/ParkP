
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Calendar, Clock, Car, Save, ArrowLeft } from 'lucide-react';
import { database } from '../data/database';
import { useAuth } from '../context/AuthContext';
import { ParkingSpot, Booking } from '../types';
import { useToast } from '../hooks/use-toast';

export const ManageAvailability: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [spot, setSpot] = useState<ParkingSpot | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availableSlots, setAvailableSlots] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [id, user]);

  const loadData = async () => {
    if (!id || !user) return;
    
    setIsLoading(true);
    try {
      const spotData = await database.getParkingSpotById(id);
      const spotBookings = spotData ? await database.getBookingsBySpotId(spotData.id) : [];
      
      setSpot(spotData || null);
      setBookings(spotBookings);
      setAvailableSlots(spotData?.availableSlots || 0);
    } catch (error) {
      console.error('Error loading availability data:', error);
      toast({
        title: "Error",
        description: "Failed to load availability information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAvailability = async () => {
    if (!spot || !user) return;
    
    setIsSaving(true);
    try {
      await database.updateParkingSpot(spot.id, { availableSlots });
      
      toast({
        title: "Success",
        description: "Availability updated successfully",
      });
      
      navigate('/app/admin');
    } catch (error) {
      console.error('Error updating availability:', error);
      toast({
        title: "Error",
        description: "Failed to update availability",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getActiveBookings = () => {
    const now = new Date();
    return bookings.filter(booking => 
      booking.status === 'active' && 
      new Date(booking.startTime) <= now && 
      new Date(booking.endTime) >= now
    );
  };

  const getUpcomingBookings = () => {
    const now = new Date();
    return bookings.filter(booking => 
      booking.status === 'pending' && 
      new Date(booking.startTime) > now
    );
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

  const activeBookings = getActiveBookings();
  const upcomingBookings = getUpcomingBookings();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/app/admin')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">{spot.name}</h1>
          <p className="text-gray-600">{spot.address}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Availability Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Car className="h-5 w-5 text-blue-600" />
                <span>Manage Availability</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Total Slots</Label>
                  <Input
                    type="number"
                    value={spot.totalSlots}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="availableSlots">Available Slots</Label>
                  <Input
                    id="availableSlots"
                    type="number"
                    value={availableSlots}
                    onChange={(e) => setAvailableSlots(parseInt(e.target.value) || 0)}
                    min={0}
                    max={spot.totalSlots}
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Current Status</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Slots:</span>
                    <span className="font-medium">{spot.totalSlots}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Available Slots:</span>
                    <span className="font-medium text-green-600">{availableSlots}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Occupied Slots:</span>
                    <span className="font-medium text-red-600">{spot.totalSlots - availableSlots}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Occupancy Rate:</span>
                    <span className="font-medium">
                      {((spot.totalSlots - availableSlots) / spot.totalSlots * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSaveAvailability}
                disabled={isSaving}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>

          {/* Current Bookings */}
          <div className="space-y-6">
            {/* Active Bookings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  <span>Active Bookings ({activeBookings.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeBookings.length > 0 ? (
                  <div className="space-y-3">
                    {activeBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">Booking #{booking.id.slice(0, 8)}</p>
                          <p className="text-xs text-gray-600">
                            {new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleString()}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Active
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No active bookings</p>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Bookings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span>Upcoming Bookings ({upcomingBookings.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingBookings.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingBookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">Booking #{booking.id.slice(0, 8)}</p>
                          <p className="text-xs text-gray-600">
                            {new Date(booking.startTime).toLocaleString()}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Pending
                        </span>
                      </div>
                    ))}
                    {upcomingBookings.length > 5 && (
                      <p className="text-sm text-gray-500 text-center">
                        +{upcomingBookings.length - 5} more bookings
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No upcoming bookings</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
