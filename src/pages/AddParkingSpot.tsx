
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, MapPin } from 'lucide-react';
import { database } from '../data/database';

const AddParkingSpot: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState({ lat: 0, lng: 0 });
  const [totalSlots, setTotalSlots] = useState('');
  const [priceType, setPriceType] = useState<string>('hour');
  const [price, setPrice] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [openingHours, setOpeningHours] = useState('');

  const handleAmenityChange = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      // In a real application, you would upload these files to a server
      // and get back URLs to store in the uploadedImages state.
      // For this example, we'll just use the file names.
      const imageUrls = files.map(file => URL.createObjectURL(file));
      setUploadedImages(imageUrls);
    }
  };

  const handleMapPinClick = () => {
    // In a real application, you would open a map interface
    // and allow the user to select a location.
    // For this example, we'll just use a default location.
    setCoordinates({ lat: 40.7128, lng: -74.0060 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newSpot = {
      ownerId: 'owner1', // This should come from auth context
      name,
      description,
      address,
      lat: coordinates.lat,
      lng: coordinates.lng,
      totalSlots: parseInt(totalSlots),
      priceType: priceType as 'hour' | 'day' | 'month',
      price: parseFloat(price),
      phone,
      amenities: selectedAmenities,
      images: uploadedImages,
      openingHours,
      isActive: true
    };

    try {
      await database.addParkingSpot(newSpot);
      navigate('/admin');
    } catch (error) {
      console.error("Error adding parking spot:", error);
    }
  };

  return (
    <div className="container py-8">
      <Button variant="ghost" onClick={() => navigate('/admin')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Add New Parking Spot</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Coordinates</Label>
              <Button type="button" variant="outline" onClick={handleMapPinClick}>
                <MapPin className="mr-2 h-4 w-4" />
                Set Coordinates
              </Button>
              <div className="text-sm text-muted-foreground">
                Latitude: {coordinates.lat}, Longitude: {coordinates.lng}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="totalSlots">Total Slots</Label>
              <Input
                id="totalSlots"
                type="number"
                value={totalSlots}
                onChange={(e) => setTotalSlots(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priceType">Price Type</Label>
              <Select value={priceType} onValueChange={setPriceType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select price type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hour">Per Hour</SelectItem>
                  <SelectItem value="day">Per Day</SelectItem>
                  <SelectItem value="month">Per Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Amenities</Label>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="securityCamera"
                    checked={selectedAmenities.includes('Security Camera')}
                    onCheckedChange={() => handleAmenityChange('Security Camera')}
                  />
                  <Label htmlFor="securityCamera">Security Camera</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="twentyFourSevenAccess"
                    checked={selectedAmenities.includes('24/7 Access')}
                    onCheckedChange={() => handleAmenityChange('24/7 Access')}
                  />
                  <Label htmlFor="twentyFourSevenAccess">24/7 Access</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="coveredParking"
                    checked={selectedAmenities.includes('Covered Parking')}
                    onCheckedChange={() => handleAmenityChange('Covered Parking')}
                  />
                  <Label htmlFor="coveredParking">Covered Parking</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="electricVehicleCharging"
                    checked={selectedAmenities.includes('Electric Vehicle Charging')}
                    onCheckedChange={() => handleAmenityChange('Electric Vehicle Charging')}
                  />
                  <Label htmlFor="electricVehicleCharging">Electric Vehicle Charging</Label>
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="images">Images</Label>
              <Input
                id="images"
                type="file"
                multiple
                onChange={handleImageUpload}
              />
              {uploadedImages.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {uploadedImages.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Uploaded ${index + 1}`}
                      className="h-20 w-auto rounded-md"
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="openingHours">Opening Hours</Label>
              <Input
                id="openingHours"
                type="text"
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
                required
              />
            </div>
            <Button type="submit">Add Parking Spot</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddParkingSpot;
