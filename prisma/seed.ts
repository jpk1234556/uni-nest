import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Focus on Kampala universities first (Phase 1)
  const makerere = await prisma.university.create({
    data: {
      name: 'Makerere University',
      shortCode: 'MUK',
      address: 'P.O. Box 7062, Kampala, Uganda',
      latitude: 0.3176,
      longitude: 32.5724,
      description: 'Uganda\'s premier university - The Makerere',
      isFeatured: true,
    },
  })

  const kyambogo = await prisma.university.create({
    data: {
      name: 'Kyambogo University',
      shortCode: 'KYU',
      address: 'P.O. Box 1, Kyambogo, Kampala, Uganda',
      latitude: 0.3531,
      longitude: 32.6030,
      description: 'Leading university in technology and education',
      isFeatured: true,
    },
  })

  const mubs = await prisma.university.create({
    data: {
      name: 'Makerere University Business School',
      shortCode: 'MUBS',
      address: 'P.O. Box 1337, Kampala, Uganda',
      latitude: 0.3190,
      longitude: 32.5750,
      description: 'Uganda\'s leading business school',
      isFeatured: true,
    },
  })

  const kiu = await prisma.university.create({
    data: {
      name: 'Kampala International University',
      shortCode: 'KIU',
      address: 'P.O. Box 23887, Kampala, Uganda',
      latitude: 0.3400,
      longitude: 32.5800,
      description: 'International standard education in Uganda',
      isFeatured: true,
    },
  })

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@uni-nest.ug',
      passwordHash: '$2b$10$9.eyjOs5yauoYXo7/Q6zIurXIC/ZObZOP1UlD6/opj0jOSvootBBK',
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

  // Create realistic Kampala hostels
  const hostel1 = await prisma.hostel.create({
    data: {
      name: 'Makerere Heights Hostel',
      description: 'Premium hostel just 2 minutes from Makerere University main gate. 24/7 security, WiFi, and backup water.',
      address: 'Plot 23, Makerere Hill Road, Kampala',
      latitude: 0.3180,
      longitude: 32.5720,
      distanceFromUniversity: 0.2,
      ownerId: owner.id,
      universityId: makerere.id,
      amenities: ['wifi', 'security', 'water', 'power_backup'],
      rules: ['No visitors after 10PM', 'Quiet hours 8PM-6AM', 'No smoking in rooms'],
      caretakerPhone: '+256777123456',
    },
  })

  const hostel2 = await prisma.hostel.create({
    data: {
      name: 'Kyambogo Student Paradise',
      description: 'Affordable accommodation near Kyambogo University with great amenities and friendly atmosphere.',
      address: 'Plot 45, Kyambogo Road, Kampala',
      latitude: 0.3535,
      longitude: 32.6035,
      distanceFromUniversity: 0.3,
      ownerId: owner.id,
      universityId: kyambogo.id,
      amenities: ['wifi', 'security', 'water'],
      rules: ['No loud music', 'Clean common areas', 'Respect quiet hours'],
      caretakerPhone: '+256755987654',
    },
  })

  const hostel3 = await prisma.hostel.create({
    data: {
      name: 'MUBS Business Lodge',
      description: 'Modern hostel designed for business students with study areas and high-speed internet.',
      address: 'Plot 89, Jinja Road, Kampala',
      latitude: 0.3190,
      longitude: 32.5750,
      distanceFromUniversity: 0.5,
      ownerId: owner.id,
      universityId: mubs.id,
      amenities: ['wifi', 'security', 'power_backup', 'study_room'],
      rules: ['Business casual dress code', '24/7 study access', 'No parties'],
      caretakerPhone: '+256789456123',
    },
  })

  const hostel4 = await prisma.hostel.create({
    data: {
      name: 'KIU International Suites',
      description: 'International standard accommodation with modern facilities for KIU students.',
      address: 'Plot 156, Kansanga, Kampala',
      latitude: 0.3400,
      longitude: 32.5800,
      distanceFromUniversity: 0.8,
      ownerId: owner.id,
      universityId: kiu.id,
      amenities: ['wifi', 'security', 'water', 'power_backup', 'gym'],
      rules: ['International student friendly', 'Mixed gender floors', 'Cultural respect'],
      caretakerPhone: '+256700246813',
    },
  })

  // Create realistic room types for Ugandan student market
  await prisma.roomType.createMany({
    data: [
      // Makerere Heights - Premium pricing
      {
        hostelId: hostel1.id,
        name: 'Single Self-Contained',
        description: 'Private room with ensuite bathroom and balcony',
        capacity: 1,
        pricePerMonth: 350000,
        availableCount: 8,
        totalCount: 10,
        amenities: ['wifi', 'private_bathroom', 'balcony', 'study_table', 'wardrobe'],
      },
      {
        hostelId: hostel1.id,
        name: 'Single Shared Bathroom',
        description: 'Private room with shared bathroom',
        capacity: 1,
        pricePerMonth: 250000,
        availableCount: 12,
        totalCount: 15,
        amenities: ['wifi', 'study_table', 'wardrobe', 'fan'],
      },
      {
        hostelId: hostel1.id,
        name: 'Double Room',
        description: 'Shared room for two students',
        capacity: 2,
        pricePerMonth: 180000,
        availableCount: 5,
        totalCount: 8,
        amenities: ['wifi', 'study_table', 'wardrobe', 'fan', 'balcony'],
      },
      // Kyambogo Student Paradise - Budget friendly
      {
        hostelId: hostel2.id,
        name: 'Standard Single',
        description: 'Basic single room, perfect for budget-conscious students',
        capacity: 1,
        pricePerMonth: 150000,
        availableCount: 10,
        totalCount: 12,
        amenities: ['wifi', 'study_table', 'wardrobe'],
      },
      {
        hostelId: hostel2.id,
        name: 'Double Room',
        description: 'Affordable shared room',
        capacity: 2,
        pricePerMonth: 120000,
        availableCount: 8,
        totalCount: 10,
        amenities: ['wifi', 'study_table', 'wardrobe'],
      },
      // MUBS Business Lodge - Professional
      {
        hostelId: hostel3.id,
        name: 'Executive Single',
        description: 'Premium room for business students with extra space',
        capacity: 1,
        pricePerMonth: 400000,
        availableCount: 6,
        totalCount: 8,
        amenities: ['wifi', 'private_bathroom', 'study_area', 'mini_fridge', 'air_conditioning'],
      },
      {
        hostelId: hostel3.id,
        name: 'Business Double',
        description: 'Shared room for business students',
        capacity: 2,
        pricePerMonth: 220000,
        availableCount: 4,
        totalCount: 6,
        amenities: ['wifi', 'study_area', 'wardrobe', 'air_conditioning'],
      },
      // KIU International Suites - Mixed
      {
        hostelId: hostel4.id,
        name: 'International Single',
        description: 'Modern room for international students',
        capacity: 1,
        pricePerMonth: 320000,
        availableCount: 8,
        totalCount: 12,
        amenities: ['wifi', 'private_bathroom', 'kitchenette', 'study_area'],
      },
      {
        hostelId: hostel4.id,
        name: 'Standard Double',
        description: 'Comfortable shared room',
        capacity: 2,
        pricePerMonth: 200000,
        availableCount: 6,
        totalCount: 8,
        amenities: ['wifi', 'study_area', 'wardrobe'],
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
