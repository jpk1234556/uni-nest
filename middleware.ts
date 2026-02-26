import { NextRequest, NextResponse } from 'next/server'
import { ErrorHandler, createError, ErrorType, ErrorBoundaryUtils } from './lib/error-handling'

// Rate limiting storage (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Rate limiting configuration
const RATE_LIMITS = {
  default: { requests: 100, windowMs: 15 * 60 * 1000 }, // 100 requests per 15 minutes
  auth: { requests: 5, windowMs: 15 * 60 * 1000 }, // 5 auth requests per 15 minutes
  upload: { requests: 10, windowMs: 60 * 60 * 1000 }, // 10 uploads per hour
}

// Get client IP
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const real = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || real || 'unknown'
  return ip
}

// Rate limiting middleware
function checkRateLimit(
  ip: string, 
  endpoint: string = 'default'
): { allowed: boolean; resetTime?: number } {
  const config = RATE_LIMITS[endpoint as keyof typeof RATE_LIMITS] || RATE_LIMITS.default
  const key = `${ip}:${endpoint}`
  const now = Date.now()
  
  const record = rateLimitStore.get(key)
  
  if (!record || now > record.resetTime) {
    // New window or expired window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs
    })
    return { allowed: true }
  }
  
  if (record.count >= config.requests) {
    return { allowed: false, resetTime: record.resetTime }
  }
  
  record.count++
  return { allowed: true }
}

// Security headers
function setSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY')
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // XSS Protection
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Strict Transport Security (HTTPS only)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://maps.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://maps.googleapis.com",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ')
  
  response.headers.set('Content-Security-Policy', csp)
  
  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Permissions Policy
  const permissionsPolicy = [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()'
  ].join(',')
  
  response.headers.set('Permissions-Policy', permissionsPolicy)
  
  return response
}

// CORS handling
function handleCORS(request: NextRequest, response: NextResponse): NextResponse {
  const origin = request.headers.get('origin')
  const allowedOrigins = [
    process.env.NEXTAUTH_URL,
    'http://localhost:3000',
    'https://localhost:3000',
    ...(process.env.ALLOWED_ORIGINS?.split(',') || [])
  ].filter(Boolean)
  
  if (allowedOrigins.includes(origin || '')) {
    response.headers.set('Access-Control-Allow-Origin', origin || '')
  }
  
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set('Access-Control-Max-Age', '86400') // 24 hours
  
  return response
}

// Request logging
function logRequest(request: NextRequest, response?: NextResponse, error?: Error): void {
  const timestamp = new Date().toISOString()
  const method = request.method
  const url = request.url
  const ip = getClientIP(request)
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const referer = request.headers.get('referer') || 'direct'
  
  const logData = {
    timestamp,
    method,
    url,
    ip,
    userAgent,
    referer,
    status: response?.status,
    error: error ? {
      message: error.message,
      stack: error.stack
    } : undefined
  }
  
  if (process.env.NODE_ENV === 'production') {
    // In production, send to logging service
    console.log(JSON.stringify(logData))
  } else {
    // In development, log with formatting
    console.log(`[${timestamp}] ${method} ${url} - ${ip} - ${response?.status || 'error'}`)
  }
}

// Main middleware
export async function middleware(request: NextRequest) {
  const startTime = Date.now()
  const ip = getClientIP(request)
  const pathname = request.nextUrl.pathname
  
  try {
    // Handle OPTIONS requests (CORS preflight)
    if (request.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 200 })
      return handleCORS(request, setSecurityHeaders(response))
    }
    
    // Determine rate limit category
    let rateLimitCategory = 'default'
    if (pathname.startsWith('/api/auth')) rateLimitCategory = 'auth'
    if (pathname.startsWith('/api/upload')) rateLimitCategory = 'upload'
    
    // Check rate limiting
    const rateLimitResult = checkRateLimit(ip, rateLimitCategory)
    if (!rateLimitResult.allowed) {
      const error = createError(
        ErrorType.RATE_LIMIT,
        'Too many requests',
        'RATE_LIMIT_EXCEEDED',
        { resetTime: rateLimitResult.resetTime }
      )
      
      const response = NextResponse.json(
        { error: error.message, code: (error as any).code },
        { status: 429 }
      )
      
      if (rateLimitResult.resetTime) {
        response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString())
        response.headers.set('Retry-After', Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString())
      }
      
      logRequest(request, response, error)
      return handleCORS(request, setSecurityHeaders(response))
    }
    
    // Create response
    const response = NextResponse.next()
    
    // Add security headers
    setSecurityHeaders(response)
    
    // Handle CORS
    handleCORS(request, response)
    
    // Add rate limit headers
    const rateLimitKey = `${ip}:${rateLimitCategory}`
    const record = rateLimitStore.get(rateLimitKey)
    if (record) {
      const config = RATE_LIMITS[rateLimitCategory as keyof typeof RATE_LIMITS] || RATE_LIMITS.default
      response.headers.set('X-RateLimit-Limit', config.requests.toString())
      response.headers.set('X-RateLimit-Remaining', Math.max(0, config.requests - record.count).toString())
      response.headers.set('X-RateLimit-Reset', record.resetTime.toString())
    }
    
    // Add timing header
    response.headers.set('X-Response-Time', (Date.now() - startTime).toString())
    
    // Log successful request
    logRequest(request, response)
    
    return response
    
  } catch (error) {
    // Handle unexpected errors
    const appError = ErrorHandler.getInstance().handle(error instanceof Error ? error : new Error(String(error)), {
      ip,
      path: pathname,
      method: request.method,
      userAgent: request.headers.get('user-agent') || undefined
    })
    
    const response = NextResponse.json(
      { 
        error: ErrorBoundaryUtils.getUserFriendlyMessage(appError) || 'An unexpected error occurred',
        code: (appError as any).code || 'INTERNAL_ERROR',
        timestamp: appError.timestamp
      },
      { status: appError.statusCode || 500 }
    )
    
    setSecurityHeaders(response)
    handleCORS(request, response)
    
    logRequest(request, response, error instanceof Error ? error : new Error(String(error)))
    
    return response
  }
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
