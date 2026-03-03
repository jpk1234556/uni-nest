# Uni-Nest 🏠

**Uganda's Premier Student Hostel Booking Platform**

> *Connecting Ugandan students with safe, affordable, and verified hostels near their universities*

---

## 🎯 **Our Vision**

Uni-Nest is the **Airbnb for Ugandan student accommodation** - a dedicated platform that solves the housing challenges faced by thousands of university students across Uganda.

---

## 🌍 **Focus: Kampala Metropolitan Area (Phase 1)**

We're starting with Uganda's education hub:

### 🏛️ **Target Universities:**
- **Makerere University (MUK)** - Uganda's premier university
- **Kyambogo University (KYU)** - Leading in technology & education  
- **MUBS** - Uganda's top business school
- **KIU** - International standard education

---

## 🚀 **Core Features**

### 👩‍🎓 **For Students:**
- 🔍 **Smart Search** - Filter by university, price, distance, amenities
- 🗺️ **Map View** - See exact distances from campus
- 📱 **Mobile-First** - Optimized for Ugandan students' phones
- 💰 **Transparent Pricing** - Clear UGX pricing, no hidden fees
- ⭐ **Verified Reviews** - Real feedback from fellow students
- 📝 **Simple Booking** - 3-step booking process

### 🏠 **For Hostel Owners:**
- 📋 **Easy Listing** - Add hostels in minutes
- 📊 **Management Dashboard** - Track bookings & revenue
- 💸 **Multiple Revenue Streams** - Listing fees + featured placements
- 📱 **Mobile Management** - Manage on-the-go

### 🏫 **For Universities:**
- ✅ **Verified Hostels** - Approved accommodation partners
- 📈 **Housing Analytics** - Monitor student accommodation trends
- 🔗 **Direct Integration** - Seamless student experience

---

## 💰 **Ugandan Market Pricing**

### **Realistic Room Pricing (UGX/month):**
- **Budget Rooms:** 120K - 180K (shared facilities)
- **Standard Rooms:** 200K - 300K (some private facilities)
- **Premium Rooms:** 350K+ (self-contained, extra amenities)

### **Key Amenities Ugandan Students Want:**
- ✅ **WiFi** - Essential for studies
- ✅ **Security** - 24/7 protection
- ✅ **Water Supply** - Reliable water access
- ✅ **Power Backup** - Handle load shedding
- ✅ **Study Areas** - Quiet spaces for learning

---

## 🛠 **Technology Stack**

### **Frontend:**
- **Next.js 14** - Modern React framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Mobile-first styling
- **Google Maps API** - Location services

### **Backend:**
- **Next.js API Routes** - Serverless backend
- **Prisma ORM** - Type-safe database access
- **PostgreSQL** - Robust database
- **NextAuth.js** - Secure authentication

### **Infrastructure:**
- **Vercel** - Frontend hosting
- **Vercel Postgres** - Database hosting
- **Cloudinary** - Image storage

---

## 📱 **Mobile-First Design**

Optimized for how Ugandan students actually use their phones:
- 📱 **Touch-friendly** interfaces
- ⚡ **Fast loading** on 3G/4G
- 🎨 **Clean, simple** UI
- 💾 **Low data usage**

---

## 🚀 **Getting Started**

### **Prerequisites:**
- Node.js 18+
- PostgreSQL database
- Google Maps API key

### **Installation:**

```bash
# Clone the repository
git clone https://github.com/jpk1234556/uni-nest.git
cd uni-nest

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your credentials

# Generate Prisma client
npx prisma generate

# Set up database
npx prisma db push
npx prisma db seed

# Start development server
npm run dev
```

### **Environment Variables:**
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-maps-key"
```

---

## 🎯 **Business Model**

### **Revenue Streams:**
1. **🏠 Hostel Listing Fees** - Monthly subscription (UGX 50K-200K)
2. **⭐ Featured Listings** - Priority placement (UGX 100K/month)
3. **💰 Booking Commission** - 5-10% per successful booking
4. **📱 Student Services Ads** - WiFi, moving, furniture services

---

## 📊 **Market Opportunity**

### **The Problem:**
- **10,000+** students need housing annually in Kampala
- **500+** hostels across major universities
- **No centralized platform** for discovery
- **Trust issues** with current offline booking
- **Information asymmetry** - students don't know options

### **Our Solution:**
- **Trust:** Verified hostels with authentic reviews
- **Convenience:** One-stop platform for housing needs
- **Transparency:** Clear pricing and detailed information
- **Accessibility:** Mobile-friendly for Ugandan students

---

## 🗺️ **Development Roadmap**

### **✅ Phase 1 - MVP (Current)**
- [x] University selector (MUK, KYU, MUBS, KIU)
- [x] Hostel listings with search/filters
- [x] Hostel detail pages
- [x] Student booking requests
- [x] Hostel owner dashboard
- [x] Mobile-responsive design

### **🔄 Phase 2 - Enhancement**
- [ ] Real-time availability
- [ ] Online payments (Mobile Money integration)
- [ ] Review and rating system
- [ ] Advanced analytics dashboard

### **🚀 Phase 3 - Scale**
- [ ] Mobile apps (iOS/Android)
- [ ] Expand to other Ugandan universities
- [ ] AI hostel recommendations
- [ ] University partnership program

---

## 🔐 **Admin Access**

**Login Credentials:**
- **Email:** `pjulius793@gmail.com`
- **Password:** `Juliuspaul793$`

---

## 🤝 **Contributing**

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 **Contact**

- **📧 Email:** info@uni-nest.ug
- **📱 Phone:** +256 123 456 789
- **📍 Address:** Kampala, Uganda

---

## 🎉 **Why Uni-Nest?**

### **For Ugandan Students:**
✅ **Find housing faster** - No more walking around campus looking for hostels  
✅ **Compare options easily** - See all choices in one place  
✅ **Trust the platform** - Verified hostels with real reviews  
✅ **Save money** - Compare prices and find best deals  

### **For Hostel Owners:**
✅ **More bookings** - Reach thousands of students online  
✅ **Easy management** - Digital booking system  
✅ **Better visibility** - Featured listings and marketing  
✅ **Steady income** - Predictable occupancy rates  

---

**🚀 Ready to transform Uganda's student accommodation market!**

---

*Made with ❤️ for Ugandan students, by people who understand the local context.*
