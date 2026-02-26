import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create universities
  const makerere = await prisma.university.create({
    data: {
      name: 'Makerere University',
      shortCode: 'MUK',
      address: 'P.O. Box 7062, Kampala, Uganda',
      latitude: 0.3176,
      longitude: 32.5724,
    },
  })

  const kyambogo = await prisma.university.create({
    data: {
      name: 'Kyambogo University',
      shortCode: 'KYU',
      address: 'P.O. Box 1, Kyambogo, Kampala, Uganda',
      latitude: 0.3531,
      longitude: 32.6030,
    },
  })

  const muni = await prisma.university.create({
    data: {
      name: 'Muni University',
      shortCode: 'MUNI',
      address: 'P.O. Box 725, Arua, Uganda',
      latitude: 3.0225,
      longitude: 31.1506,
    },
  })

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@uni-nest.ug',
      passwordHash: '$2b$10$example_hash_change_in_production',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isVerified: true,
    },
  })

  // Create hostel owner
  const owner = await prisma.user.create({
    data: {
      email: 'owner@hostel1.com',
      passwordHash: '$2b$10$example_hash_change_in_production',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+256777123456',
      role: 'hostel_owner',
      isVerified: true,
    },
  })

  // Create hostels
  const hostel1 = await prisma.hostel.create({
    data: {
      name: 'University Heights Hostel',
      description: 'Modern hostel with excellent facilities near Makerere University',
      address: 'Plot 123, Makerere Hill Road, Kampala',
      latitude: 0.3180,
      longitude: 32.5720,
      distanceFromUniversity: 0.5,
      ownerId: owner.id,
      universityId: makerere.id,
    },
  })

  const hostel2 = await prisma.hostel.create({
    data: {
      name: 'Student Paradise Hostel',
      description: 'Affordable accommodation with great amenities',
      address: 'Plot 456, Kyambogo Road, Kampala',
      latitude: 0.3535,
      longitude: 32.6035,
      distanceFromUniversity: 0.3,
      ownerId: owner.id,
      universityId: kyambogo.id,
    },
  })

  // Create room types
  await prisma.roomType.createMany({
    data: [
      {
        hostelId: hostel1.id,
        name: 'Single Room',
        description: 'Private single room with shared bathroom',
        capacity: 1,
        pricePerMonth: 250000,
        availableCount: 10,
        totalCount: 15,
        amenities: ['wifi', 'study_table', 'wardrobe', 'fan'],
      },
      {
        hostelId: hostel1.id,
        name: 'Double Room',
        description: 'Shared room for two students',
        capacity: 2,
        pricePerMonth: 150000,
        availableCount: 5,
        totalCount: 8,
        amenities: ['wifi', 'study_table', 'wardrobe', 'fan', 'balcony'],
      },
      {
        hostelId: hostel2.id,
        name: 'Standard Single',
        description: 'Comfortable single room',
        capacity: 1,
        pricePerMonth: 200000,
        availableCount: 8,
        totalCount: 12,
        amenities: ['wifi', 'study_table', 'wardrobe'],
      },
    ],
  })

  // Create student users
  const student1 = await prisma.user.create({
    data: {
      email: 'student1@makerere.ac.ug',
      passwordHash: '$2b$10$example_hash_change_in_production',
      firstName: 'Alice',
      lastName: 'Nakato',
      phone: '+256712345678',
      role: 'student',
      isVerified: true,
    },
  })

  const student2 = await prisma.user.create({
    data: {
      email: 'student2@kyambogo.ac.ug',
      passwordHash: '$2b$10$example_hash_change_in_production',
      firstName: 'Bob',
      lastName: 'Mugisha',
      phone: '+256713456789',
      role: 'student',
      isVerified: true,
    },
  })

  // Create student profiles
  await prisma.studentProfile.createMany({
    data: [
      {
        userId: student1.id,
        universityId: makerere.id,
        studentId: 'MUK/2023/12345',
        yearOfStudy: 2,
        course: 'Bachelor of Computer Science',
        preferences: {
          budget: 250000,
          roomType: 'single',
          amenities: ['wifi', 'study_table'],
        },
      },
      {
        userId: student2.id,
        universityId: kyambogo.id,
        studentId: 'KYU/2023/67890',
        yearOfStudy: 1,
        course: 'Bachelor of Education',
        preferences: {
          budget: 200000,
          roomType: 'single',
          amenities: ['wifi'],
        },
      },
    ],
  })

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
