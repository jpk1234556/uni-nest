# Uni-Nest System Architecture

## High-Level Architecture

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
         │                       │                       │
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  External APIs  │
                    │                 │
                    │ - Google Maps   │
                    │ - Email Service │
                    │ - Payment API   │
                    │ - File Storage  │
                    └─────────────────┘
```

## Technology Stack

### Frontend (Next.js 14)
```
├── Framework: Next.js 14 (App Router)
├── Language: TypeScript
├── Styling: Tailwind CSS + shadcn/ui
├── State Management: React Context + Zustand
├── Forms: React Hook Form + Zod
├── Maps: Google Maps JavaScript API
├── Icons: Lucide React
├── HTTP Client: Axios
└── Deployment: Vercel
```

### Backend (Node.js + Express)
```
├── Runtime: Node.js 18+
├── Framework: Express.js
├── Language: TypeScript
├── Database: PostgreSQL + Prisma ORM
├── Authentication: JWT + bcrypt
├── File Upload: Multer + Cloudinary
├── Email: Nodemailer + SendGrid
├── Validation: Joi
├── API Documentation: Swagger
└── Deployment: Render/Railway
```

### Database (PostgreSQL)
```
├── Primary DB: PostgreSQL 15+
├── ORM: Prisma
├── Migrations: Prisma Migrate
├── Seeding: Custom seed scripts
└── Backup: pg_dump + cron jobs
```

## API Architecture

### RESTful API Endpoints

#### Authentication
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/profile
PUT  /api/auth/profile
```

#### Universities
```
GET  /api/universities
GET  /api/universities/:id
```

#### Hostels
```
GET  /api/hostels
GET  /api/hostels/:id
POST /api/hostels (hostel_owner)
PUT  /api/hostels/:id (hostel_owner)
DELETE /api/hostels/:id (hostel_owner)
GET  /api/hostels/search
GET  /api/hostels/nearby
```

#### Room Types
```
GET  /api/hostels/:id/rooms
POST /api/hostels/:id/rooms (hostel_owner)
PUT  /api/rooms/:id (hostel_owner)
DELETE /api/rooms/:id (hostel_owner)
```

#### Bookings
```
GET  /api/bookings
POST /api/bookings
PUT  /api/bookings/:id
DELETE /api/bookings/:id
GET  /api/bookings/my-bookings
```

#### Reviews
```
GET  /api/hostels/:id/reviews
POST /api/hostels/:id/reviews
PUT  /api/reviews/:id
DELETE /api/reviews/:id
```

## Frontend Architecture

### Directory Structure
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/
│   │   ├── student/
│   │   ├── owner/
│   │   └── admin/
│   ├── hostels/
│   │   ├── [id]/
│   │   └── search/
│   └── layout.tsx
├── components/
│   ├── ui/
│   ├── forms/
│   ├── maps/
│   └── layout/
├── lib/
│   ├── api/
│   ├── auth/
│   ├── utils/
│   └── validations/
├── hooks/
├── store/
└── types/
```

### Component Architecture

#### Shared Components
```
├── Layout/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Sidebar.tsx
│   └── Navigation.tsx
├── UI/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   └── Badge.tsx
├── Forms/
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   ├── HostelForm.tsx
│   └── BookingForm.tsx
└── Maps/
    ├── HostelMap.tsx
    ├── MapMarker.tsx
    └── LocationPicker.tsx
```

#### Page Components
```
├── Home/
│   ├── Hero.tsx
│   ├── Features.tsx
│   └── FeaturedHostels.tsx
├── Hostels/
│   ├── HostelList.tsx
│   ├── HostelCard.tsx
│   ├── HostelDetail.tsx
│   └── SearchFilters.tsx
└── Dashboard/
    ├── StudentDashboard.tsx
    ├── OwnerDashboard.tsx
    └── AdminDashboard.tsx
```

## Security Architecture

### Authentication & Authorization
```
├── JWT Tokens (Access + Refresh)
├── Role-Based Access Control (RBAC)
├── Password Hashing (bcrypt)
├── Rate Limiting
├── CORS Configuration
└── Input Validation & Sanitization
```

### Data Protection
```
├── Environment Variables (.env)
├── Database Encryption (TLS)
├── API HTTPS Only
├── File Upload Security
└── XSS & CSRF Protection
```

## Performance Architecture

### Frontend Optimization
```
├── Code Splitting (Next.js)
├── Image Optimization (next/image)
├── Lazy Loading
├── Caching (React Query)
└── Bundle Analysis
```

### Backend Optimization
```
├── Database Indexing
├── Redis Caching
├── API Response Caching
├── Database Connection Pooling
└── CDN for Static Assets
```

## Deployment Architecture

### Frontend (Vercel)
```
├── Automatic Deployments
├── Preview Environments
├── Edge Functions
├── Custom Domain
└── SSL Certificate
```

### Backend (Render/Railway)
```
├── Docker Container
├── Environment Variables
├── Health Checks
├── Auto-scaling
└── Database as a Service
```

### Monitoring & Logging
```
├── Application Monitoring (Sentry)
├── Performance Monitoring
├── Error Tracking
├── User Analytics
└── Server Logs
```

## Development Workflow

### Git Workflow
```
├── Main Branch (Production)
├── Develop Branch (Staging)
├── Feature Branches
├── Pull Requests
└── Code Reviews
```

### Development Environment
```
├── Local Development (Docker)
├── Database Migrations
├── Seed Data
├── API Documentation
└── Testing (Jest + Cypress)
```

## Scalability Considerations

### Horizontal Scaling
```
├── Load Balancing
├── Database Replication
├── Microservices (Future)
└── CDN Distribution
```

### Vertical Scaling
```
├── Server Resources
├── Database Performance
├── Caching Layers
└── Memory Optimization
```
