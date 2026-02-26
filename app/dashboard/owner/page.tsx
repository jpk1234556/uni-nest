"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Building, 
  Calendar, 
  MapPin, 
  Star, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Users,
  Bed,
  DollarSign,
  Phone,
  Mail,
  Settings,
  LogOut,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  Home,
  Shield,
  Wifi,
  Droplet,
  Zap
} from "lucide-react"

interface Hostel {
  id: string
  name: string
  description: string
  address: string
  isActive: boolean
  averageRating: number
  reviewCount: number
  createdAt: string
  university?: {
    id: string
    name: string
    shortCode: string
  }
  roomTypes: Array<{
    id: string
    name: string
    capacity: number
    pricePerMonth: number
    availableCount: number
    totalCount: number
  }>
  images: Array<{
    id: string
    imageUrl: string
    order: number
  }>
  _count: {
    bookings: number
    reviews: number
  }
}

interface Booking {
  id: string
  status: "pending" | "confirmed" | "cancelled" | "completed"
  totalPrice: number
  startDate: string
  endDate: string
  message?: string
  createdAt: string
  student: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
  hostel: {
    id: string
    name: string
    address: string
  }
  roomType: {
    id: string
    name: string
    capacity: number
    pricePerMonth: number
  }
}

interface Review {
  id: string
  rating: number
  comment?: string
  createdAt: string
  student: {
    firstName: string
    lastName: string
  }
  hostel: {
    id: string
    name: string
  }
}

export default function OwnerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [userProfile, setUserProfile] = useState<any>(null)
  const [hostels, setHostels] = useState<Hostel[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
      return
    }
    if (session.user.role !== "hostel_owner") {
      router.push("/")
      return
    }

    fetchUserData()
  }, [session, status, router])

  const fetchUserData = async () => {
    setLoading(true)
    setError("")

    try {
      // Fetch user profile
      const profileResponse = await fetch("/api/user/profile")
      if (!profileResponse.ok) throw new Error("Failed to fetch profile")
      const profileData = await profileResponse.json()
      setUserProfile(profileData)

      // Fetch bookings
      const bookingsResponse = await fetch("/api/bookings")
      if (!bookingsResponse.ok) throw new Error("Failed to fetch bookings")
      const bookingsData = await bookingsResponse.json()
      setBookings(bookingsData.bookings)

      // Fetch reviews
      const reviewsResponse = await fetch(`/api/reviews`)
      if (!reviewsResponse.ok) throw new Error("Failed to fetch reviews")
      const reviewsData = await reviewsResponse.json()
      setReviews(reviewsData.reviews)

    } catch (error) {
      setError("Failed to load dashboard data")
      console.error("Error fetching user data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "text-green-600 bg-green-100"
      case "pending": return "text-yellow-600 bg-yellow-100"
      case "cancelled": return "text-red-600 bg-red-100"
      case "completed": return "text-blue-600 bg-blue-100"
      default: return "text-gray-600 bg-gray-100"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed": return <CheckCircle className="w-4 h-4" />
      case "pending": return <Clock className="w-4 h-4" />
      case "cancelled": return <XCircle className="w-4 h-4" />
      case "completed": return <CheckCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : i < rating
            ? "text-yellow-400 fill-current opacity-50"
            : "text-gray-300"
        }`}
      />
    ))
  }

  const handleBookingAction = async (bookingId: string, action: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: action }),
      })

      if (!response.ok) throw new Error("Failed to update booking")

      // Refresh bookings
      const bookingsResponse = await fetch("/api/bookings")
      const bookingsData = await bookingsResponse.json()
      setBookings(bookingsData.bookings)
    } catch (error) {
      console.error("Error updating booking:", error)
      setError("Failed to update booking")
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={fetchUserData}
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 mb-4">Unable to load user profile</div>
          <Link href="/" className="text-blue-600 hover:text-blue-700 underline">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center text-blue-600 hover:text-blue-700">
                <Building className="w-6 h-6 mr-2" />
                Uni-Nest
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/search" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <Search className="w-5 h-5" />
                Search
              </Link>
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <Settings className="w-5 h-5" />
                Settings
              </button>
              <button 
                onClick={() => {
                  // Handle logout
                  router.push("/")
                }}
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {userProfile.firstName}!
              </h1>
              <p className="text-gray-600">
                Manage your hostels and track bookings
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Account Status</div>
              <div className="font-medium">
                {userProfile.isVerified ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    Verified Owner
                  </span>
                ) : (
                  <span className="text-yellow-600">Pending Verification</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Hostels</p>
                <p className="text-2xl font-bold text-blue-600">
                  {userProfile.ownedHostels?.length || 0}
                </p>
              </div>
              <Building className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Bookings</p>
                <p className="text-2xl font-bold text-green-600">
                  {bookings.filter(b => b.status === "confirmed").length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {bookings.filter(b => b.status === "pending").length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-purple-600">
                  UGX {bookings
                    .filter(b => b.status === "confirmed" || b.status === "completed")
                    .reduce((total, b) => total + b.totalPrice, 0)
                    .toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b">
            <div className="flex">
              {["overview", "hostels", "bookings", "reviews"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 font-medium capitalize ${
                    activeTab === tab
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Recent Bookings */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Recent Booking Requests</h3>
                  {bookings.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No booking requests yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.slice(0, 3).map((booking) => (
                        <div key={booking.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold">{booking.student.firstName} {booking.student.lastName}</h4>
                              <p className="text-sm text-gray-600">{booking.student.email}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-sm text-gray-600">
                                  {booking.hostel.name} - {booking.roomType.name}
                                </span>
                                <span className="text-sm text-gray-600">
                                  {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                {getStatusIcon(booking.status)}
                                {booking.status}
                              </div>
                              <div className="text-sm font-medium mt-2">
                                UGX {booking.totalPrice.toLocaleString()}
                              </div>
                            </div>
                          </div>
                          {booking.status === "pending" && (
                            <div className="flex gap-2 mt-4">
                              <button
                                onClick={() => handleBookingAction(booking.id, "confirmed")}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleBookingAction(booking.id, "cancelled")}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                      href="/hostels/new"
                      className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <Plus className="w-6 h-6 text-blue-600" />
                      <div>
                        <div className="font-medium">Add New Hostel</div>
                        <div className="text-sm text-gray-600">List a new property</div>
                      </div>
                    </Link>
                    
                    <Link
                      href="/bookings"
                      className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <Calendar className="w-6 h-6 text-green-600" />
                      <div>
                        <div className="font-medium">Manage Bookings</div>
                        <div className="text-sm text-gray-600">View all requests</div>
                      </div>
                    </Link>
                    
                    <Link
                      href="/reviews"
                      className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <Star className="w-6 h-6 text-yellow-600" />
                      <div>
                        <div className="font-medium">View Reviews</div>
                        <div className="text-sm text-gray-600">Student feedback</div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "hostels" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">My Hostels</h3>
                  <Link
                    href="/hostels/new"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-5 h-5" />
                    Add Hostel
                  </Link>
                </div>
                
                {userProfile.ownedHostels?.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Building className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No hostels listed yet</p>
                    <Link href="/hostels/new" className="text-blue-600 hover:text-blue-700 underline">
                      Add your first hostel
                    </Link>
                  </div>
                ) : (
                  userProfile.ownedHostels.map((hostel: Hostel) => (
                    <div key={hostel.id} className="border rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-semibold">{hostel.name}</h4>
                          <p className="text-gray-600">{hostel.address}</p>
                          <div className="flex items-center gap-2 mt-2">
                            {renderStars(hostel.averageRating)}
                            <span className="text-sm text-gray-600">
                              {hostel.averageRating.toFixed(1)} ({hostel.reviewCount})
                            </span>
                          </div>
                        </div>
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                          hostel.isActive ? "text-green-600 bg-green-100" : "text-gray-600 bg-gray-100"
                        }`}>
                          {hostel.isActive ? "Active" : "Inactive"}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Total Bookings</p>
                          <p className="font-medium">{hostel._count.bookings}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Reviews</p>
                          <p className="font-medium">{hostel._count.reviews}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Room Types</p>
                          <p className="font-medium">{hostel.roomTypes.length}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          href={`/hostels/${hostel.id}`}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Link>
                        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </button>
                        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "bookings" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">All Bookings</h3>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                      Pending
                    </button>
                    <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                      Confirmed
                    </button>
                    <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                      All
                    </button>
                  </div>
                </div>
                
                {bookings.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No bookings found</p>
                  </div>
                ) : (
                  bookings.map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold">{booking.student.firstName} {booking.student.lastName}</h4>
                          <p className="text-gray-600">{booking.student.email}</p>
                          {booking.student.phone && (
                            <p className="text-gray-600">{booking.student.phone}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{booking.hostel.name}</span>
                          </div>
                        </div>
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          {booking.status}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Room Type</p>
                          <p className="font-medium">{booking.roomType.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Capacity</p>
                          <p className="font-medium">{booking.roomType.capacity} guests</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Check-in</p>
                          <p className="font-medium">{new Date(booking.startDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Check-out</p>
                          <p className="font-medium">{new Date(booking.endDate).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                          <p className="text-sm text-gray-600">Total Price</p>
                          <p className="text-xl font-bold text-blue-600">
                            UGX {booking.totalPrice.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {booking.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleBookingAction(booking.id, "confirmed")}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleBookingAction(booking.id, "cancelled")}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                            <Mail className="w-4 h-4 mr-1" />
                            Contact
                          </button>
                        </div>
                      </div>

                      {booking.message && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">Message from student:</p>
                          <p className="text-gray-800">{booking.message}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Reviews</h3>
                  <div className="text-sm text-gray-600">
                    Average Rating: {reviews.length > 0 ? 
                      (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 
                      "No reviews yet"
                    }
                  </div>
                </div>
                
                {reviews.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No reviews yet</p>
                    <p className="text-sm">Students will review your hostels after their stay</p>
                  </div>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold">{review.student.firstName} {review.student.lastName}</h4>
                          <p className="text-sm text-gray-600">{review.hostel.name}</p>
                          <div className="flex items-center mt-1">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-gray-700">{review.comment}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
