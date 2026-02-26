# Uni-Nest 🏠

A comprehensive hostel discovery and allocation platform for Ugandan universities.

## 🎯 The Vision

Uni-Nest connects students with safe, affordable, and verified hostels near their universities across Uganda. Think of it as the **Airbnb for student accommodation** in Uganda.

## 🚀 Features

### For Students 👩‍🎓
- **Smart Search**: Find hostels by university, location, price, and amenities
- **Detailed Listings**: View photos, room types, pricing, and facilities
- **Verified Reviews**: Read authentic reviews from fellow students
- **Online Booking**: Apply for rooms directly through the platform
- **Map Integration**: See exact distances from your university

### For Hostel Owners 🏠
- **Easy Management**: Add/update hostels and room availability
- **Booking Management**: Review and approve student applications
- **Analytics**: Track occupancy rates and revenue
- **Direct Communication**: Message with potential tenants

### For Universities 🏫
- **Verified Listings**: Approve and recommend official hostels
- **Student Housing Data**: Monitor accommodation trends
- **Allocation System**: Manage official hostel allocations

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Modern UI components
- **Lucide React** - Beautiful icons

### Backend (Planned)
- **Node.js + Express** - RESTful API
- **PostgreSQL** - Robust database
- **Prisma ORM** - Type-safe database access
- **JWT Authentication** - Secure user sessions

### External Services
- **Google Maps API** - Location services
- **Cloudinary** - Image storage
- **SendGrid** - Email notifications

## 📊 Database Schema

Our platform uses a comprehensive PostgreSQL database with the following core entities:

- **Users** (Students, Hostel Owners, Admins)
- **Universities** (Makerere, Kyambogo, MUBS, etc.)
- **Hostels** (Property listings with amenities)
- **Room Types** (Single, Double, Self-contained)
- **Bookings** (Student applications and reservations)
- **Reviews** (Student feedback and ratings)

See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for complete schema details.

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Next.js)     │◄──►│   (Node.js)     │◄──►│  (PostgreSQL)   │
│                 │    │                 │    │                 │
│ - React SPA     │    │ - REST API      │    │ - User Data     │
│ - Tailwind CSS  │    │ - Auth (JWT)    │    │ - Hostels       │
│ - Maps          │    │ - File Upload   │    │ - Bookings      │
│ - Forms         │    │ - Email Service │    │ - Reviews       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

See [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) for complete architecture details.

## 🎨 UI/UX Design

Our design system focuses on:
- **Mobile-first responsive design**
- **Accessibility compliance (WCAG AA)**
- **Modern, clean interface**
- **Intuitive navigation**
- **Fast loading times**

See [UI_UX_DESIGN.md](./UI_UX_DESIGN.md) for complete design specifications.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd uni-nest
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
# Add your environment variables
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Pages & Routes

### Public Pages
- `/` - Landing page
- `/hostels/search` - Search hostels
- `/hostels/[id]` - Hostel details
- `/universities` - Browse by university
- `/about` - About page
- `/contact` - Contact page

### Authentication
- `/login` - User login
- `/register` - User registration
- `/forgot-password` - Password reset

### Dashboard Areas
- `/dashboard/student` - Student dashboard
- `/dashboard/owner` - Hostel owner dashboard
- `/dashboard/admin` - Admin dashboard

## 🎯 MVP Features (Phase 1)

- ✅ University selector
- ✅ Hostel listings with search/filter
- ✅ Hostel detail pages
- ✅ Student booking requests
- ✅ Hostel owner dashboard
- ✅ Basic authentication

## 🗺️ Target Universities (Phase 1)

Starting with Kampala metropolitan area:
1. **Makerere University** (MUK)
2. **Kyambogo University** (KYU) 
3. **Makerere University Business School** (MUBS)
4. **Kampala International University** (KIU)
5. **Uganda Christian University** (UCU)

## 💰 Business Model

1. **Hostel Listing Fees** - Monthly subscription for hostel owners
2. **Featured Listings** - Premium placement in search results
3. **Booking Commission** - Small percentage on successful bookings
4. **Advertisement** - Targeted ads for student services

## 🔒 Security Features

- **JWT Authentication** - Secure user sessions
- **Role-Based Access Control** - Different permissions for users
- **Input Validation** - Prevent XSS and SQL injection
- **HTTPS Only** - Encrypted data transmission
- **Data Privacy** - GDPR-compliant data handling

## 📈 Scalability Considerations

- **Database Indexing** - Optimized query performance
- **CDN Integration** - Fast asset delivery
- **Load Balancing** - Handle high traffic
- **Caching Strategy** - Redis for session and data caching
- **Microservices Ready** - Future-proof architecture

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Why Uni-Nest?

### The Problem
Every year, thousands of Ugandan students struggle to find:
- Safe and affordable accommodation
- Verified hostels near their universities
- Transparent pricing and reviews
- Easy booking processes

### Our Solution
Uni-Nest provides:
- **Trust**: Verified hostels with authentic reviews
- **Convenience**: One-stop platform for all housing needs
- **Transparency**: Clear pricing and detailed information
- **Accessibility**: Mobile-friendly, easy to use

### Market Opportunity
- **10,000+** students need accommodation annually
- **500+** hostels across major universities
- **Growing** student population in Uganda
- **Untapped** digital accommodation market

## 🚀 Next Steps

1. **Complete MVP Development** (Current sprint)
2. **Beta Testing** with Makerere University students
3. **Launch** in Kampala metropolitan area
4. **Expand** to other Ugandan universities
5. **Mobile App** development
6. **AI Recommendations** engine

## 📞 Contact

- **Email**: info@uni-nest.ug
- **Phone**: +256 123 456 789
- **Address**: Kampala, Uganda

---

**Made with ❤️ for Ugandan students**
