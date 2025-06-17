
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Calendar, Clock, MapPin, Car, CreditCard, Shield } from 'lucide-react';
import { database } from '../data/database';
import { useAuth } from '../context/AuthContext';
import { ParkingSpot, User, Vehicle, Booking } from '../types';
import { useToast } from '../hooks/use-toast';

export const BookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [spot, setSpot] = useState<ParkingSpot | null>(null);
  const [owner, setOwner] = useState<User | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    loadData();
  }, [id, user]);

  const loadData = async () => {
    if (!id || !user) return;
    
    setIsLoading(true);
    try {
      const spotData = await database.getParkingSpotById(id);
      const ownerData = spotData ? await database.getUserById(spotData.ownerId) : null;
      const userVehicles = await database.getVehiclesByUserId(user.id);
      
      setSpot(spotData || null);
      setOwner(ownerData || null);
      setVehicles(userVehicles);
    } catch (error) {
      console.error('Error loading booking data:', error);
      toast({
        title: "Error",
        description: "Failed to load booking information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateCost = () => {
    if (!spot || !startDate || !startTime || !endDate || !endTime) return 0;
    
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    const diffInHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    if (spot.priceType === 'hour') {
      return Math.ceil(diffInHours) * spot.price;
    } else if (spot.priceType === 'day') {
      const diffInDays = Math.ceil(diffInHours / 24);
      return diffInDays * spot.price;
    } else if (spot.priceType === 'month') {
      const diffInMonths = Math.ceil(diffInHours / (24 * 30));
      return diffInMonths * spot.price;
    }
    
    return 0;
  };

  const handleBooking = async () => {
    if (!spot || !user || !selectedVehicle || !startDate || !startTime || !endDate || !endTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);
    try {
      const startDateTime = new Date(`${startDate}T${startTime}`).toISOString();
      const endDateTime = new Date(`${endDate}T${endTime}`).toISOString();
      const totalCost = calculateCost();
      
      const bookingData: Omit<Booking, 'id' | 'createdAt'> = {
        spotId: spot.id,
        userId: user.id,
        vehicleId: selectedVehicle,
        startTime: startDateTime,
        endTime: endDateTime,
        totalCost,
        status: 'pending',
        qrCode: `QR_${spot.id}_${user.id}_${Date.now()}`,
        pin: Math.floor(1000 + Math.random() * 9000).toString(),
      };

      await database.createBooking(bookingData);
      
      toast({
        title: "Booking Confirmed!",
        description: "Your parking spot has been successfully booked",
      });
      
      navigate('/app/bookings');
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Booking Failed",
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
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

  const totalCost = calculateCost();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Spot Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span>{spot.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <img 
                src={spot.images[0]} 
                alt={spot.name}
                className="w-full h-48 object-cover rounded-lg"
              />
              
              <div className="space-y-2">
                <p className="text-gray-600">{spot.address}</p>
                <p className="text-gray-600">{spot.description}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {spot.openingHours}
                  </span>
                  <span className="flex items-center">
                    <Car className="h-4 w-4 mr-1" />
                    {spot.availableSlots}/{spot.totalSlots} available
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {spot.amenities.map((amenity, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Price</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${spot.price}/{spot.priceType}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-green-600" />
                <span>Book This Spot</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Vehicle Selection */}
              <div>
                <Label htmlFor="vehicle">Select Vehicle</Label>
                <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date/Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
              </div>

              {/* End Date/Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              {/* Cost Summary */}
              {totalCost > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Cost</span>
                    <span className="text-2xl font-bold text-green-600">${totalCost.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Security Notice */}
              <div className="flex items-start space-x-2 p-4 bg-blue-50 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Secure Booking</p>
                  <p>Your booking is protected and you'll receive a QR code for entry.</p>
                </div>
              </div>

              {/* Book Button */}
              <Button
                onClick={handleBooking}
                disabled={isBooking || !selectedVehicle || !startDate || !startTime || !endDate || !endTime}
                className="w-full"
                size="lg"
              >
                {isBooking ? 'Processing...' : `Book Now - $${totalCost.toFixed(2)}`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
