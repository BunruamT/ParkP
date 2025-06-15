import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@parkpass.com' },
    update: {},
    create: {
      email: 'admin@parkpass.com',
      password: adminPassword,
      name: 'Admin User',
      phone: '+1-555-0001',
      role: 'ADMIN'
    }
  });

  // Create owner users
  const ownerPassword = await bcrypt.hash('owner123', 12);
  const owner1 = await prisma.user.upsert({
    where: { email: 'owner1@parkpass.com' },
    update: {},
    create: {
      email: 'owner1@parkpass.com',
      password: ownerPassword,
      name: 'John Smith',
      phone: '+1-555-0002',
      role: 'OWNER',
      businessName: 'Downtown Parking Solutions',
      businessAddress: '123 Business Ave, Downtown'
    }
  });

  const owner2 = await prisma.user.upsert({
    where: { email: 'owner2@parkpass.com' },
    update: {},
    create: {
      email: 'owner2@parkpass.com',
      password: ownerPassword,
      name: 'Sarah Johnson',
      phone: '+1-555-0003',
      role: 'OWNER',
      businessName: 'Mall Parking Services',
      businessAddress: '456 Mall Road, Westside'
    }
  });

  // Create customer users
  const customerPassword = await bcrypt.hash('customer123', 12);
  const customer1 = await prisma.user.upsert({
    where: { email: 'customer1@parkpass.com' },
    update: {},
    create: {
      email: 'customer1@parkpass.com',
      password: customerPassword,
      name: 'Mike Wilson',
      phone: '+1-555-0004',
      role: 'CUSTOMER'
    }
  });

  const customer2 = await prisma.user.upsert({
    where: { email: 'customer2@parkpass.com' },
    update: {},
    create: {
      email: 'customer2@parkpass.com',
      password: customerPassword,
      name: 'Emily Davis',
      phone: '+1-555-0005',
      role: 'CUSTOMER'
    }
  });

  // Create vehicles for customers
  await prisma.vehicle.createMany({
    data: [
      {
        make: 'Toyota',
        model: 'Camry',
        licensePlate: 'ABC-123',
        color: 'Silver',
        userId: customer1.id
      },
      {
        make: 'Honda',
        model: 'Civic',
        licensePlate: 'XYZ-789',
        color: 'Blue',
        userId: customer1.id
      },
      {
        make: 'BMW',
        model: 'X3',
        licensePlate: 'BMW-456',
        color: 'Black',
        userId: customer2.id
      }
    ],
    skipDuplicates: true
  });

  // Create parking spots
  const spot1 = await prisma.parkingSpot.upsert({
    where: { id: 'spot-1' },
    update: {},
    create: {
      id: 'spot-1',
      name: 'Central Plaza Parking',
      description: 'Premium parking facility in the heart of downtown with state-of-the-art security and amenities.',
      address: '123 Main Street, Downtown',
      latitude: 40.7589,
      longitude: -73.9851,
      price: 25,
      priceType: 'hour',
      totalSlots: 50,
      availableSlots: 45,
      rating: 4.5,
      reviewCount: 128,
      amenities: ['CCTV Security', 'EV Charging', 'Covered Parking', 'Elevator Access'],
      images: [
        'https://images.pexels.com/photos/753876/pexels-photo-753876.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      openingHours: '24/7',
      phone: '+1-555-123-4567',
      ownerId: owner1.id
    }
  });

  const spot2 = await prisma.parkingSpot.upsert({
    where: { id: 'spot-2' },
    update: {},
    create: {
      id: 'spot-2',
      name: 'Riverside Mall Parking',
      description: 'Convenient mall parking with direct access to shopping and dining.',
      address: '456 River Road, Westside',
      latitude: 40.7505,
      longitude: -73.9934,
      price: 150,
      priceType: 'day',
      totalSlots: 200,
      availableSlots: 180,
      rating: 4.2,
      reviewCount: 89,
      amenities: ['Shopping Access', 'Food Court Nearby', 'Valet Service', 'Car Wash'],
      images: [
        'https://images.pexels.com/photos/1004409/pexels-photo-1004409.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/2199293/pexels-photo-2199293.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      openingHours: '6:00 AM - 11:00 PM',
      phone: '+1-555-987-6543',
      ownerId: owner2.id
    }
  });

  const spot3 = await prisma.parkingSpot.upsert({
    where: { id: 'spot-3' },
    update: {},
    create: {
      id: 'spot-3',
      name: 'Airport Express Parking',
      description: 'Premium airport parking with complimentary shuttle service and full-service amenities.',
      address: '789 Airport Way, Terminal District',
      latitude: 40.6413,
      longitude: -73.7781,
      price: 300,
      priceType: 'day',
      totalSlots: 800,
      availableSlots: 750,
      rating: 4.7,
      reviewCount: 342,
      amenities: ['Shuttle Service', 'Long-term Storage', 'Car Detailing', 'Luggage Assistance'],
      images: [
        'https://images.pexels.com/photos/2425567/pexels-photo-2425567.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1004409/pexels-photo-1004409.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      openingHours: '24/7',
      phone: '+1-555-456-7890',
      ownerId: owner1.id
    }
  });

  // Create sample reviews
  await prisma.review.createMany({
    data: [
      {
        spotId: spot1.id,
        userId: customer1.id,
        rating: 5,
        comment: 'Excellent parking facility with great security and easy access. Highly recommended!',
        isAnonymous: false
      },
      {
        spotId: spot1.id,
        userId: customer2.id,
        rating: 4,
        comment: 'Good location and clean facilities. The EV charging station was very convenient.',
        isAnonymous: false
      },
      {
        spotId: spot2.id,
        userId: customer1.id,
        rating: 4,
        comment: 'Perfect for shopping trips. Direct mall access is a huge plus.',
        isAnonymous: false
      }
    ],
    skipDuplicates: true
  });

  // Create system settings
  await prisma.systemSettings.createMany({
    data: [
      {
        key: 'BOOKING_BUFFER_HOURS',
        value: '1',
        description: 'Buffer time in hours added to each booking'
      },
      {
        key: 'MAX_EXTENSION_HOURS',
        value: '1',
        description: 'Maximum hours a booking can be extended'
      },
      {
        key: 'CANCELLATION_DEADLINE_HOURS',
        value: '1',
        description: 'Minimum hours before start time to allow cancellation'
      },
      {
        key: 'NOTIFICATION_REMINDER_HOURS',
        value: '1',
        description: 'Hours before booking start to send reminder'
      }
    ],
    skipDuplicates: true
  });

  console.log('Database seeded successfully!');
  console.log('Test accounts created:');
  console.log('Admin: admin@parkpass.com / admin123');
  console.log('Owner 1: owner1@parkpass.com / owner123');
  console.log('Owner 2: owner2@parkpass.com / owner123');
  console.log('Customer 1: customer1@parkpass.com / customer123');
  console.log('Customer 2: customer2@parkpass.com / customer123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });