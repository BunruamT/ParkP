
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { User, Car, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { database } from '../data/database';
import { useAuth } from '../context/AuthContext';
import { Vehicle } from '../types';
import { useToast } from '../hooks/use-toast';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form states
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  
  // New vehicle form state
  const [newVehicle, setNewVehicle] = useState({
    make: '',
    model: '',
    licensePlate: '',
    color: ''
  });

  useEffect(() => {
    loadVehicles();
  }, [user]);

  const loadVehicles = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const userVehicles = await database.getVehiclesByUserId(user.id);
      setVehicles(userVehicles);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      const updatedUser = await database.updateUser(user.id, {
        name,
        email,
        phone: phone || undefined
      });

      if (updatedUser) {
        updateUser({
          ...user,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone
        });
        
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated",
        });
        
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const handleAddVehicle = async () => {
    if (!user || !newVehicle.make || !newVehicle.model || !newVehicle.licensePlate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const vehicleData: Omit<Vehicle, 'id'> & { user_id: string } = {
        ...newVehicle,
        user_id: user.id
      };

      // Since we don't have an addVehicle method, we'll simulate it
      const newVehicleId = `vehicle_${Date.now()}`;
      const vehicle: Vehicle = {
        id: newVehicleId,
        ...newVehicle
      };

      setVehicles([...vehicles, vehicle]);
      setNewVehicle({ make: '', model: '', licensePlate: '', color: '' });
      setIsAddingVehicle(false);
      
      toast({
        title: "Vehicle Added",
        description: "Your vehicle has been successfully added",
      });
    } catch (error) {
      console.error('Error adding vehicle:', error);
      toast({
        title: "Error",
        description: "Failed to add vehicle",
        variant: "destructive",
      });
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    try {
      setVehicles(vehicles.filter(v => v.id !== vehicleId));
      
      toast({
        title: "Vehicle Removed",
        description: "Your vehicle has been successfully removed",
      });
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast({
        title: "Error",
        description: "Failed to delete vehicle",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Profile Information</span>
              </CardTitle>
              {!isEditing ? (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSaveProfile}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!isEditing}
                  placeholder="Optional"
                />
              </div>
              <div>
                <Label>Account Type</Label>
                <div className="mt-2">
                  <Badge variant={user?.userType === 'owner' ? 'default' : 'secondary'}>
                    {user?.userType === 'owner' ? 'Parking Owner' : 'Customer'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Car className="h-5 w-5" />
                <span>My Vehicles ({vehicles?.length || 0})</span>
              </CardTitle>
              <Button onClick={() => setIsAddingVehicle(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Vehicle
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Add Vehicle Form */}
            {isAddingVehicle && (
              <div className="border rounded-lg p-4 mb-4 bg-gray-50">
                <h4 className="font-medium mb-4">Add New Vehicle</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="make">Make</Label>
                    <Input
                      id="make"
                      value={newVehicle.make}
                      onChange={(e) => setNewVehicle({...newVehicle, make: e.target.value})}
                      placeholder="e.g., Toyota"
                    />
                  </div>
                  <div>
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      value={newVehicle.model}
                      onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})}
                      placeholder="e.g., Camry"
                    />
                  </div>
                  <div>
                    <Label htmlFor="licensePlate">License Plate</Label>
                    <Input
                      id="licensePlate"
                      value={newVehicle.licensePlate}
                      onChange={(e) => setNewVehicle({...newVehicle, licensePlate: e.target.value})}
                      placeholder="e.g., ABC123"
                    />
                  </div>
                  <div>
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      value={newVehicle.color}
                      onChange={(e) => setNewVehicle({...newVehicle, color: e.target.value})}
                      placeholder="e.g., Blue"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" onClick={() => setIsAddingVehicle(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddVehicle}>
                    Add Vehicle
                  </Button>
                </div>
              </div>
            )}

            {/* Vehicle List */}
            {vehicles && vehicles.length > 0 ? (
              <div className="grid gap-4">
                {vehicles.map((vehicle, index) => (
                  <div key={vehicle.id || index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Car className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{vehicle.make} {vehicle.model}</h4>
                        <p className="text-sm text-gray-600">{vehicle.licensePlate}</p>
                        <p className="text-sm text-gray-500">{vehicle.color}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingVehicle(vehicle.id)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteVehicle(vehicle.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No vehicles added
                </h3>
                <p className="text-gray-600 mb-4">
                  Add your vehicle information to make booking easier
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
