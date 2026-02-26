# Uni-Nest Deployment Guide

## Vercel Deployment

### Prerequisites
- Vercel account
- PostgreSQL database (Vercel Postgres or external)
- GitHub repository

### Environment Variables

#### Required Environment Variables:
```bash
# Database
DATABASE_URL="postgresql://username:password@host:5432/database"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-min-32-characters"
NEXTAUTH_URL="https://your-domain.vercel.app"
```

#### Optional Environment Variables:
```bash
# Google Maps (if using)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# File Upload (if using Cloudinary)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables

3. **Configure Database**
   - Use Vercel Postgres or external PostgreSQL
   - Update `DATABASE_URL` environment variable
   - Run database migrations:
   ```bash
   npx prisma migrate deploy
   ```

4. **Deploy**
   - Vercel will automatically build and deploy
   - Your app will be available at `https://your-domain.vercel.app`

### Post-Deployment Setup

1. **Seed Database** (optional)
   ```bash
   npx prisma db seed
   ```

2. **Verify Authentication**
   - Test user registration
   - Test login functionality
   - Verify role-based access

3. **Test API Endpoints**
   - Test hostel search
   - Test booking creation
   - Test review system

### Performance Optimization

#### Vercel Configuration (vercel.json)
- **Regions**: Hong Kong (hkg1) and Singapore (sin1) for African users
- **Function Timeout**: 30 seconds for API routes
- **Caching Headers**: Optimized for static assets and API responses
- **Security Headers**: XSS protection, frame options, content type options

#### Build Optimization
- Next.js 14 with App Router
- Static generation where possible
- Image optimization enabled
- Bundle size optimization

### Monitoring

#### Vercel Analytics
- Page views and user analytics
- Performance metrics
- Error tracking

#### Database Monitoring
- Query performance
- Connection limits
- Storage usage

### Scaling Considerations

#### Database Scaling
- Connection pooling
- Read replicas for high traffic
- Index optimization

#### Application Scaling
- Edge functions for global distribution
- CDN for static assets
- Load balancing

### Troubleshooting

#### Common Issues
1. **Database Connection Errors**
   - Verify DATABASE_URL format
   - Check database credentials
   - Ensure database is accessible

2. **Authentication Issues**
   - Verify NEXTAUTH_SECRET is set
   - Check NEXTAUTH_URL matches deployment URL
   - Clear browser cookies

3. **Build Errors**
   - Check package.json scripts
   - Verify all dependencies are installed
   - Check TypeScript errors

#### Debug Commands
```bash
# Check build locally
npm run build

# Test environment variables
npm run dev

# Database connection test
npx prisma db pull
```

### Security Checklist

- [ ] Environment variables are set
- [ ] Database is not publicly accessible
- [ ] HTTPS is enabled
- [ ] Security headers are configured
- [ ] Rate limiting is implemented
- [ ] Input validation is in place
- [ ] Authentication is properly configured

### Backup Strategy

#### Database Backups
- Enable automatic backups
- Export regular backups
- Test restore procedures

#### Code Backups
- Git version control
- Branch protection
- Deployment rollback capability
