import { PrismaClient, Department, Role, CarType, CarStatus, TrackingMode } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

async function main() {
  console.log('Seeding database...');

  // Clean existing data (in development only)
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.maintenancePartUsage.deleteMany();
  await prisma.carRequestImage.deleteMany();
  await prisma.carRequest.deleteMany();
  await prisma.maintenanceRequest.deleteMany();
  await prisma.part.deleteMany();
  await prisma.purchaseRequest.deleteMany();
  await prisma.carInventoryRequest.deleteMany();
  await prisma.car.deleteMany();
  await prisma.rentalCompany.deleteMany();
  await prisma.user.deleteMany();

  console.log('Creating users...');

  // Create Super Admin
  const superAdmin = await prisma.user.create({
    data: {
      username: 'admin',
      passwordHash: await hashPassword('admin123'),
      fullName: 'مدير النظام',
      department: Department.ADMIN,
      role: Role.SUPER_ADMIN,
    },
  });
  console.log(`Created Super Admin: ${superAdmin.username}`);

  // Create Operation Operator
  const operationUser = await prisma.user.create({
    data: {
      username: 'operation',
      passwordHash: await hashPassword('operation123'),
      fullName: 'موظف العمليات',
      department: Department.OPERATION,
      role: Role.OPERATOR,
    },
  });
  console.log(`Created Operation Operator: ${operationUser.username}`);

  // Create Garage Operator
  const garageUser = await prisma.user.create({
    data: {
      username: 'garage',
      passwordHash: await hashPassword('garage123'),
      fullName: 'موظف المرآب',
      department: Department.GARAGE,
      role: Role.OPERATOR,
    },
  });
  console.log(`Created Garage Operator: ${garageUser.username}`);

  // Create Maintenance Operator
  const maintenanceUser = await prisma.user.create({
    data: {
      username: 'maintenance',
      passwordHash: await hashPassword('maintenance123'),
      fullName: 'موظف الصيانة',
      department: Department.MAINTENANCE,
      role: Role.OPERATOR,
    },
  });
  console.log(`Created Maintenance Operator: ${maintenanceUser.username}`);

  console.log('Creating rental companies...');

  // Create Rental Companies
  const rentalCompanies = await Promise.all([
    prisma.rentalCompany.create({
      data: { name: 'شركة الإيجار الأولى' },
    }),
    prisma.rentalCompany.create({
      data: { name: 'شركة التأجير المتحدة' },
    }),
    prisma.rentalCompany.create({
      data: { name: 'شركة السيارات للتأجير' },
    }),
  ]);
  console.log(`Created ${rentalCompanies.length} rental companies`);

  console.log('Creating cars...');

  // Create Cars
  const cars = await Promise.all([
    // Sedans
    prisma.car.create({
      data: {
        model: 'Toyota Camry',
        type: CarType.SEDAN,
        year: 2023,
        color: 'White',
        licensePlate: 'ABC-1234',
        vin: 'JTDKN3DU5A0123456',
        mileage: 15000,
        warrantyExpiry: new Date('2026-01-15'),
        status: CarStatus.AVAILABLE,
        maintenanceIntervalMonths: 3,
        nextMaintenanceDate: new Date('2024-04-01'),
      },
    }),
    prisma.car.create({
      data: {
        model: 'Honda Accord',
        type: CarType.SEDAN,
        year: 2022,
        color: 'Silver',
        licensePlate: 'DEF-5678',
        vin: 'JTDKN3DU5A0654321',
        mileage: 25000,
        warrantyExpiry: new Date('2025-06-20'),
        status: CarStatus.AVAILABLE,
        maintenanceIntervalMonths: 3,
        nextMaintenanceDate: new Date('2024-03-15'),
      },
    }),
    prisma.car.create({
      data: {
        model: 'Hyundai Sonata',
        type: CarType.SEDAN,
        year: 2023,
        color: 'Black',
        licensePlate: 'GHI-9012',
        vin: 'JTDKN3DU5A0789012',
        mileage: 8000,
        warrantyExpiry: new Date('2026-08-10'),
        status: CarStatus.AVAILABLE,
        maintenanceIntervalMonths: 6,
        nextMaintenanceDate: new Date('2024-06-01'),
      },
    }),
    // SUVs
    prisma.car.create({
      data: {
        model: 'Toyota Land Cruiser',
        type: CarType.SUV,
        year: 2022,
        color: 'White',
        licensePlate: 'JKL-3456',
        vin: 'JTDKN3DU5A0345678',
        mileage: 45000,
        warrantyExpiry: new Date('2025-03-25'),
        status: CarStatus.AVAILABLE,
        maintenanceIntervalMonths: 3,
        nextMaintenanceDate: new Date('2024-02-28'),
      },
    }),
    prisma.car.create({
      data: {
        model: 'Nissan Patrol',
        type: CarType.SUV,
        year: 2023,
        color: 'Gray',
        licensePlate: 'MNO-7890',
        vin: 'JTDKN3DU5A0901234',
        mileage: 12000,
        warrantyExpiry: new Date('2026-11-30'),
        status: CarStatus.AVAILABLE,
        maintenanceIntervalMonths: 6,
        nextMaintenanceDate: new Date('2024-05-15'),
      },
    }),
    // Trucks
    prisma.car.create({
      data: {
        model: 'Toyota Hilux',
        type: CarType.TRUCK,
        year: 2021,
        color: 'Red',
        licensePlate: 'PQR-1357',
        vin: 'JTDKN3DU5A0135792',
        mileage: 60000,
        warrantyExpiry: new Date('2024-09-15'),
        status: CarStatus.AVAILABLE,
        maintenanceIntervalMonths: 3,
        nextMaintenanceDate: new Date('2024-02-15'),
      },
    }),
    prisma.car.create({
      data: {
        model: 'Ford F-150',
        type: CarType.TRUCK,
        year: 2022,
        color: 'Blue',
        licensePlate: 'STU-2468',
        vin: 'JTDKN3DU5A0246813',
        mileage: 35000,
        warrantyExpiry: new Date('2025-12-01'),
        status: CarStatus.AVAILABLE,
        maintenanceIntervalMonths: 3,
        nextMaintenanceDate: new Date('2024-04-20'),
      },
    }),
  ]);
  console.log(`Created ${cars.length} cars`);

  console.log('Creating parts...');

  // Create Parts (Quantity-based)
  const quantityParts = await Promise.all([
    prisma.part.create({
      data: {
        name: 'Oil Filter',
        carType: CarType.SEDAN,
        carModel: 'Toyota Camry',
        trackingMode: TrackingMode.QUANTITY,
        quantity: 25,
      },
    }),
    prisma.part.create({
      data: {
        name: 'Air Filter',
        carType: CarType.SEDAN,
        carModel: 'Toyota Camry',
        trackingMode: TrackingMode.QUANTITY,
        quantity: 15,
      },
    }),
    prisma.part.create({
      data: {
        name: 'Brake Pads (Front)',
        carType: CarType.SUV,
        carModel: 'Toyota Land Cruiser',
        trackingMode: TrackingMode.QUANTITY,
        quantity: 8,
      },
    }),
    prisma.part.create({
      data: {
        name: 'Brake Pads (Rear)',
        carType: CarType.SUV,
        carModel: 'Toyota Land Cruiser',
        trackingMode: TrackingMode.QUANTITY,
        quantity: 6,
      },
    }),
    prisma.part.create({
      data: {
        name: 'Spark Plugs',
        carType: CarType.SEDAN,
        carModel: 'Honda Accord',
        trackingMode: TrackingMode.QUANTITY,
        quantity: 40,
      },
    }),
    prisma.part.create({
      data: {
        name: 'Windshield Wipers',
        carType: CarType.TRUCK,
        carModel: 'Toyota Hilux',
        trackingMode: TrackingMode.QUANTITY,
        quantity: 12,
      },
    }),
  ]);

  // Create Parts (Serial Number-based)
  const serialParts = await Promise.all([
    prisma.part.create({
      data: {
        name: 'Transmission Assembly',
        carType: CarType.SUV,
        carModel: 'Nissan Patrol',
        trackingMode: TrackingMode.SERIAL_NUMBER,
        serialNumber: 'TX-NP-2024-001',
      },
    }),
    prisma.part.create({
      data: {
        name: 'Engine Control Unit',
        carType: CarType.SEDAN,
        carModel: 'Hyundai Sonata',
        trackingMode: TrackingMode.SERIAL_NUMBER,
        serialNumber: 'ECU-HS-2024-001',
      },
    }),
    prisma.part.create({
      data: {
        name: 'Alternator',
        carType: CarType.TRUCK,
        carModel: 'Ford F-150',
        trackingMode: TrackingMode.SERIAL_NUMBER,
        serialNumber: 'ALT-FF-2024-001',
      },
    }),
  ]);

  console.log(`Created ${quantityParts.length + serialParts.length} parts`);

  console.log('Database seeding completed successfully!');

  // Print summary
  console.log('\n=== Seed Summary ===');
  console.log('Users:');
  console.log('  - admin / admin123 (Super Admin)');
  console.log('  - operation / operation123 (Operation Operator)');
  console.log('  - garage / garage123 (Garage Operator)');
  console.log('  - maintenance / maintenance123 (Maintenance Operator)');
  console.log(`\nRental Companies: ${rentalCompanies.length}`);
  console.log(`Cars: ${cars.length}`);
  console.log(`Parts: ${quantityParts.length + serialParts.length}`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
