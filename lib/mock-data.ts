// Mock data for demo mode (when no database is available)
export const mockUniversities = [
  {
    id: "uni-mak",
    name: "Makerere University",
    shortCode: "MUK",
    address: "University Road, Kampala",
    latitude: 0.3350,
    longitude: 32.5690,
    logoUrl: null,
    _count: { hostels: 12, studentProfiles: 450 }
  },
  {
    id: "uni-kyu",
    name: "Kyambogo University",
    shortCode: "KYU",
    address: "Kyambogo Hill, Kampala",
    latitude: 0.3480,
    longitude: 32.6320,
    logoUrl: null,
    _count: { hostels: 8, studentProfiles: 280 }
  },
  {
    id: "uni-mubs",
    name: "Makerere University Business School",
    shortCode: "MUBS",
    address: "Nakawa, Kampala",
    latitude: 0.3270,
    longitude: 32.6150,
    logoUrl: null,
    _count: { hostels: 6, studentProfiles: 190 }
  },
  {
    id: "uni-kiu",
    name: "Kampala International University",
    shortCode: "KIU",
    address: "Ggaba Road, Kampala",
    latitude: 0.2850,
    longitude: 32.6010,
    logoUrl: null,
    _count: { hostels: 5, studentProfiles: 160 }
  },
  {
    id: "uni-ucu",
    name: "Uganda Christian University",
    shortCode: "UCU",
    address: "Bishop Tucker Road, Mukono",
    latitude: 0.3530,
    longitude: 32.7560,
    logoUrl: null,
    _count: { hostels: 4, studentProfiles: 120 }
  }
]

export const mockHostels = [
  {
    id: "hostel-001",
    name: "University Heights Hostel",
    description: "Modern, comfortable hostel just steps from Makerere University. Clean rooms with fast WiFi, 24/7 security, and a friendly community atmosphere.",
    address: "Plot 12, University Road, Kampala",
    distanceFromUniversity: 0.5,
    isActive: true,
    universityId: "uni-mak",
    ownerId: "owner-001",
    averageRating: 4.5,
    reviewCount: 23,
    university: { id: "uni-mak", name: "Makerere University", shortCode: "MUK" },
    owner: { firstName: "James", lastName: "Okello", phone: "+256 701 234 567" },
    roomTypes: [
      { id: "rt-001", name: "Single Room", capacity: 1, pricePerMonth: 250000, availableCount: 5, amenities: ["wifi", "water", "power", "security"] },
      { id: "rt-002", name: "Double Room", capacity: 2, pricePerMonth: 180000, availableCount: 3, amenities: ["wifi", "water", "power"] }
    ],
    images: [
      { id: "img-001", imageUrl: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600", altText: "University Heights Hostel", order: 0 }
    ]
  },
  {
    id: "hostel-002",
    name: "Makerere Student Lodge",
    description: "Affordable and secure accommodation for Makerere students. Features a common room, kitchen facilities, and study areas.",
    address: "Plot 45, Wandegeya, Kampala",
    distanceFromUniversity: 0.8,
    isActive: true,
    universityId: "uni-mak",
    ownerId: "owner-002",
    averageRating: 4.2,
    reviewCount: 17,
    university: { id: "uni-mak", name: "Makerere University", shortCode: "MUK" },
    owner: { firstName: "Sarah", lastName: "Nakato", phone: "+256 702 345 678" },
    roomTypes: [
      { id: "rt-003", name: "Self-Contained", capacity: 1, pricePerMonth: 400000, availableCount: 2, amenities: ["wifi", "water", "power", "private_bathroom", "security"] },
      { id: "rt-004", name: "Single Room", capacity: 1, pricePerMonth: 220000, availableCount: 7, amenities: ["wifi", "water", "power"] }
    ],
    images: [
      { id: "img-002", imageUrl: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600", altText: "Makerere Student Lodge", order: 0 }
    ]
  },
  {
    id: "hostel-003",
    name: "Kyambogo View Residence",
    description: "Beautiful hostel with stunning views near Kyambogo University. Spacious rooms, parking, and 24/7 water supply.",
    address: "Kyambogo Hill Road, Kampala",
    distanceFromUniversity: 0.3,
    isActive: true,
    universityId: "uni-kyu",
    ownerId: "owner-003",
    averageRating: 4.7,
    reviewCount: 31,
    university: { id: "uni-kyu", name: "Kyambogo University", shortCode: "KYU" },
    owner: { firstName: "Peter", lastName: "Ssemakula", phone: "+256 703 456 789" },
    roomTypes: [
      { id: "rt-005", name: "Single Room", capacity: 1, pricePerMonth: 280000, availableCount: 4, amenities: ["wifi", "water", "power", "parking"] },
      { id: "rt-006", name: "Double Room", capacity: 2, pricePerMonth: 200000, availableCount: 6, amenities: ["wifi", "water", "power"] }
    ],
    images: [
      { id: "img-003", imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600", altText: "Kyambogo View Residence", order: 0 }
    ]
  },
  {
    id: "hostel-004",
    name: "Campus Haven MUBS",
    description: "Premium hostel for MUBS students. Located directly opposite the campus with all amenities including gym and library access.",
    address: "Industrial Area, Nakawa, Kampala",
    distanceFromUniversity: 0.2,
    isActive: true,
    universityId: "uni-mubs",
    ownerId: "owner-004",
    averageRating: 4.8,
    reviewCount: 42,
    university: { id: "uni-mubs", name: "Makerere University Business School", shortCode: "MUBS" },
    owner: { firstName: "Grace", lastName: "Auma", phone: "+256 704 567 890" },
    roomTypes: [
      { id: "rt-007", name: "Executive Single", capacity: 1, pricePerMonth: 550000, availableCount: 3, amenities: ["wifi", "water", "power", "private_bathroom", "gym", "security"] },
      { id: "rt-008", name: "Standard Single", capacity: 1, pricePerMonth: 320000, availableCount: 5, amenities: ["wifi", "water", "power", "security"] }
    ],
    images: [
      { id: "img-004", imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600", altText: "Campus Haven MUBS", order: 0 }
    ]
  },
  {
    id: "hostel-005",
    name: "KIU Students Village",
    description: "Comfortable and affordable hostel for KIU students. Features garden, common areas, and a dedicated study room.",
    address: "Ggaba Road, Kampala",
    distanceFromUniversity: 0.6,
    isActive: true,
    universityId: "uni-kiu",
    ownerId: "owner-005",
    averageRating: 4.0,
    reviewCount: 15,
    university: { id: "uni-kiu", name: "Kampala International University", shortCode: "KIU" },
    owner: { firstName: "Robert", lastName: "Kizito", phone: "+256 705 678 901" },
    roomTypes: [
      { id: "rt-009", name: "Single Room", capacity: 1, pricePerMonth: 200000, availableCount: 8, amenities: ["wifi", "water", "power"] },
      { id: "rt-010", name: "Triple Room", capacity: 3, pricePerMonth: 130000, availableCount: 4, amenities: ["water", "power"] }
    ],
    images: [
      { id: "img-005", imageUrl: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600", altText: "KIU Students Village", order: 0 }
    ]
  },
  {
    id: "hostel-006",
    name: "Wandegeya Premium Hostel",
    description: "Top-tier student accommodation in Wandegeya, serving both Makerere and nearby campuses. Features rooftop garden and modern kitchenettes.",
    address: "Wandegeya Road, Kampala",
    distanceFromUniversity: 1.0,
    isActive: true,
    universityId: "uni-mak",
    ownerId: "owner-006",
    averageRating: 4.6,
    reviewCount: 28,
    university: { id: "uni-mak", name: "Makerere University", shortCode: "MUK" },
    owner: { firstName: "Alice", lastName: "Nabirye", phone: "+256 706 789 012" },
    roomTypes: [
      { id: "rt-011", name: "Studio Apartment", capacity: 1, pricePerMonth: 650000, availableCount: 2, amenities: ["wifi", "water", "power", "kitchen", "private_bathroom", "security"] },
      { id: "rt-012", name: "Self-Contained", capacity: 1, pricePerMonth: 450000, availableCount: 4, amenities: ["wifi", "water", "power", "private_bathroom"] }
    ],
    images: [
      { id: "img-006", imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600", altText: "Wandegeya Premium Hostel", order: 0 }
    ]
  }
]

export const mockReviews: Record<string, any[]> = {
  "hostel-001": [
    { id: "rev-001", studentId: "std-001", hostelId: "hostel-001", rating: 5, comment: "Excellent hostel! Clean rooms, fast WiFi, and very friendly management. Highly recommend for Makerere students.", createdAt: new Date("2024-11-15"), student: { firstName: "Amara", lastName: "Osei" } },
    { id: "rev-002", studentId: "std-002", hostelId: "hostel-001", rating: 4, comment: "Great location and good facilities. Water supply is reliable and security is top notch.", createdAt: new Date("2024-10-20"), student: { firstName: "Tendo", lastName: "Mugisha" } },
    { id: "rev-003", studentId: "std-003", hostelId: "hostel-001", rating: 4, comment: "Nice place to stay, good value for money. Common areas could be cleaner though.", createdAt: new Date("2024-09-05"), student: { firstName: "Fatima", lastName: "Nakawesa" } }
  ],
  "hostel-002": [
    { id: "rev-004", studentId: "std-004", hostelId: "hostel-002", rating: 4, comment: "Budget-friendly with good amenities. The study area is quiet and well-maintained.", createdAt: new Date("2024-12-01"), student: { firstName: "Brian", lastName: "Ssali" } },
    { id: "rev-005", studentId: "std-005", hostelId: "hostel-002", rating: 5, comment: "Perfect for students! Kitchen facilities make it feel like home. Very safe neighbourhood.", createdAt: new Date("2024-11-08"), student: { firstName: "Caroline", lastName: "Akello" } }
  ],
  "hostel-003": [
    { id: "rev-006", studentId: "std-006", hostelId: "hostel-003", rating: 5, comment: "Best hostel near Kyambogo! The views are amazing and the rooms are very clean.", createdAt: new Date("2024-12-10"), student: { firstName: "David", lastName: "Ssebunya" } },
    { id: "rev-007", studentId: "std-007", hostelId: "hostel-003", rating: 5, comment: "Excellent management. Any maintenance issues are fixed within 24 hours. Great place!", createdAt: new Date("2024-11-25"), student: { firstName: "Esther", lastName: "Namuli" } }
  ]
}
