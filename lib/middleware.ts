import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const { pathname } = request.nextUrl

  // Protected routes that require authentication
  const protectedRoutes = [
    "/dashboard",
    "/hostels/create",
    "/hostels/edit",
    "/hostels/dashboard",
    "/bookings",
    "/profile",
    "/admin"
  ]

  // Admin-only routes
  const adminRoutes = [
    "/admin"
  ]

  // Hostel owner-only routes
  const ownerRoutes = [
    "/hostels/create",
    "/hostels/edit",
    "/hostels/dashboard"
  ]

  // Check if the path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  const isAdminRoute = adminRoutes.some(route => 
    pathname.startsWith(route)
  )

  const isOwnerRoute = ownerRoutes.some(route => 
    pathname.startsWith(route)
  )

  // If trying to access protected route without authentication
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/auth/signin", request.url))
  }

  // If trying to access admin route without admin role
  if (isAdminRoute && token?.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // If trying to access owner route without owner role
  if (isOwnerRoute && token?.role !== "hostel_owner") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Redirect authenticated users away from auth pages
  if (token && (pathname.startsWith("/auth/"))) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
