# Uni-Nest Database Schema

## Core Tables

### Users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role ENUM('student', 'hostel_owner', 'admin') NOT NULL,
    profile_image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE
);
```

### Universities
```sql
CREATE TABLE universities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    short_code VARCHAR(20) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    logo_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Hostels
```sql
CREATE TABLE hostels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    university_id UUID REFERENCES universities(id),
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone VARCHAR(20),
    email VARCHAR(255),
    images JSONB, -- Array of image URLs
    amenities JSONB, -- {wifi: true, water: true, power: true, security: true}
    rules TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3, 2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Room Types
```sql
CREATE TABLE room_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hostel_id UUID REFERENCES hostels(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- "Single Room", "Double Room", "Self-contained"
    capacity INTEGER NOT NULL,
    price_per_month DECIMAL(10, 2) NOT NULL,
    total_rooms INTEGER NOT NULL,
    available_rooms INTEGER NOT NULL,
    description TEXT,
    images JSONB,
    amenities JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Bookings
```sql
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    room_type_id UUID REFERENCES room_types(id) ON DELETE CASCADE,
    status ENUM('pending', 'approved', 'rejected', 'cancelled', 'completed') DEFAULT 'pending',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Reviews
```sql
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    hostel_id UUID REFERENCES hostels(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, hostel_id)
);
```

### Student Profiles
```sql
CREATE TABLE student_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    university_id UUID REFERENCES universities(id),
    student_id_number VARCHAR(50) UNIQUE,
    course VARCHAR(255),
    year_of_study INTEGER,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Indexes for Performance

```sql
-- Hostel search indexes
CREATE INDEX idx_hostels_university ON hostels(university_id);
CREATE INDEX idx_hostels_location ON hostels(latitude, longitude);
CREATE INDEX idx_hostels_verified ON hostels(is_verified);
CREATE INDEX idx_hostels_featured ON hostels(is_featured);

-- Room type availability
CREATE INDEX idx_room_types_available ON room_types(hostel_id, available_rooms);

-- Booking status
CREATE INDEX idx_bookings_student ON bookings(student_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- User authentication
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

## Relationships Summary

- **Users** can be Students, Hostel Owners, or Admins
- **Hostels** belong to Hostel Owners and are near Universities
- **Room Types** belong to Hostels
- **Bookings** are made by Students for specific Room Types
- **Reviews** are left by Students for Hostels they've stayed in
- **Student Profiles** extend User information for Students

## Sample Data

```sql
-- Universities
INSERT INTO universities (name, short_code, address, latitude, longitude) VALUES
('Makerere University', 'MUK', 'Makerere Hill, Kampala', 0.3292, 32.5729),
('Kyambogo University', 'KYU', 'Kyambogo, Kampala', 0.3542, 32.6234),
('MUBS', 'MUBS', 'Plot M 21, Port Bell Road, Kampala', 0.3176, 32.5932);

-- Hostel Owner
INSERT INTO users (email, password_hash, first_name, last_name, phone, role) VALUES
('owner@cityhostel.com', 'hashed_password', 'John', 'Doe', '+256772123456', 'hostel_owner');

-- Sample Hostel
INSERT INTO hostels (name, description, owner_id, university_id, address, latitude, longitude, amenities) VALUES
('City Hostel', 'Modern student accommodation near Makerere', [owner_id], [muk_id], 'Makerere Hill Road', 0.3292, 32.5729, 
'{"wifi": true, "water": true, "power": true, "security": true, "kitchen": true}');
```
