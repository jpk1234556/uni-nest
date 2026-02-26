"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { 
  Calendar, 
  MapPin, 
  Users, 
  Bed, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ChevronLeft,
  Phone,
  Mail,
  Building,
  Star,
  Wifi,
  Droplet,
  Zap
} from "lucide-react"

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
    owner: {
      id: string
      firstName: string
      lastName: string
      phone?: string
      isVerified: boolean
    }
    university?: {
      id: string
      name: string
      shortCode: string
    }
  }
  roomType: {
    id: string
    name: string
    description?: string
    capacity: number
    pricePerMonth: number
    amenities: string[]
  }
}

export default function BookingDetailPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin")
      return
    }

    fetchBooking()
  }, [session, router, params.id])

  const fetchBooking = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/bookings/${params.id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError("Booking not found")
        } else if (response.status === 403) {
          setError("You don't have permission to view this booking")
        } else {
          setError("Failed to load booking details")
        }
        return
      }

      const data = await response.json()
      setBooking(data)
    } catch (error) {
      setError("Failed to load booking details")
      console.error("Error fetching booking:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (newStatus: string) => {
    setUpdating(true)
    setError("")

    try {
      const response = await fetch(`/api/bookings/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update booking")
      }

      const updatedBooking = await response.json()
      setBooking(updatedBooking)
    } catch (error) {
      setError("Failed to update booking")
      console.error("Error updating booking:", error)
    } finally {
      setUpdating(false)
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
      case "confirmed": return <CheckCircle className="w-5 h-5" />
      case "pending": return <Clock className="w-5 h-5" />
      case "cancelled": return <XCircle className="w-5 h-5" />
      case "completed": return <CheckCircle className="w-5 h-5" />
      default: return <AlertCircle className="w-5 h-5" />
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

  const renderAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case "wifi":
        return <Wifi className="w-4 h-4" />
      case "water":
        return <Droplet className="w-4 h-4" />
      case "power":
        return <Zap className="w-4 h-4" />
      default:
        return <CheckCircle className="w-4 h-4" />
    }
  }

  const canManageBooking = () => {
    if (!session || !booking) return false
    
    // Students can only view their own bookings
    if (session.user.role === "student") {
      return booking.student.id === session.user.id
    }
    
    // Hostel owners can manage bookings for their hostels
    if (session.user.role === "hostel_owner") {
      return booking.hostel.owner.id === session.user.id
    }
    
    // Admins can manage all bookings
    return session.user.role === "admin"
  }

  const getActionButtons = () => {
    if (!canManageBooking()) return null

    const buttons = []

    if (session?.user.role === "student") {
      if (booking?.status === "confirmed") {
        buttons.push(
          <button
            key="complete"
            onClick={() => updateBookingStatus("completed")}
            disabled={updating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {updating ? "Updating..." : "Mark as Completed"}
          </button>
        )
      }
    }

    if (session?.user.role === "hostel_owner") {
      if (booking?.status === "pending") {
        buttons.push(
          <button
            key="accept"
            onClick={() => updateBookingStatus("confirmed")}
            disabled={updating}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {updating ? "Updating..." : "Accept Booking"}
          </button>,
          <button
            key="reject"
            onClick={() => updateBookingStatus("cancelled")}
            disabled={updating}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {updating ? "Updating..." : "Reject Booking"}
          </button>
        )
      }
    }

    return buttons
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking details...</p>
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
            onClick={fetchBooking}
            className="text-blue-600 hover:text-blue-700 underline mr-4"
          >
            Try Again
          </button>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 mb-4">Booking not found</div>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href={session?.user.role === "student" ? "/dashboard/student" : "/dashboard/owner"}
              className="flex items-center text-blue-600 hover:text-blue-700"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back to Dashboard
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Booking Details</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Banner */}
        <div className={`rounded-lg p-4 mb-8 ${getStatusColor(booking.status)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(booking.status)}
              <div>
                <h2 className="text-lg font-semibold capitalize">{booking.status}</h2>
                <p className="text-sm opacity-75">
                  {booking.status === "pending" && "Waiting for owner confirmation"}
                  {booking.status === "confirmed" && "Booking confirmed and active"}
                  {booking.status === "cancelled" && "Booking has been cancelled"}
                  {booking.status === "completed" && "Booking has been completed"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-75">Booking ID</p>
              <p className="font-mono text-sm">{booking.id.slice(-8)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hostel Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Hostel Information</h3>
              
              <div className="mb-4">
                <h4 className="font-semibold text-lg mb-2">{booking.hostel.name}</h4>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{booking.hostel.address}</span>
                </div>
                {booking.hostel.university && (
                  <div className="text-blue-600 mb-2">{booking.hostel.university.name}</div>
                )}
              </div>

              <div className="border-t pt-4">
                <h5 className="font-medium mb-2">Hosted by</h5>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {booking.hostel.owner.firstName} {booking.hostel.owner.lastName}
                    </p>
                    <div className="flex items-center text-sm text-gray-600">
                      {booking.hostel.owner.isVerified && (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Verified Owner
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {booking.hostel.owner.phone && (
                      <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
                        <Phone className="w-4 h-4" />
                        Call
                      </button>
                    )}
                    <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
                      <Mail className="w-4 h-4" />
                      Message
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Room Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Room Details</h3>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold">{booking.roomType.name}</h4>
                    <p className="text-gray-600">{booking.roomType.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-blue-600">
                      UGX {booking.roomType.pricePerMonth.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">/month</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{booking.roomType.capacity} guests</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {booking.roomType.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-1 text-xs text-gray-600">
                      {renderAmenityIcon(amenity)}
                      <span className="capitalize">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Booking Dates */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Booking Dates</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Check-in</p>
                  <p className="font-medium">{new Date(booking.startDate).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(booking.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Check-out</p>
                  <p className="font-medium">{new Date(booking.endDate).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(booking.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Duration: {Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30))} months
                </p>
              </div>
            </div>

            {/* Message */}
            {booking.message && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Message</h3>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">{booking.message}</p>
                </div>
              </div>
            )}

            {/* Student Information (for owners) */}
            {session?.user.role === "hostel_owner" && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Student Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">
                      {booking.student.firstName} {booking.student.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{booking.student.email}</p>
                  </div>
                  {booking.student.phone && (
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{booking.student.phone}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Rate</span>
                  <span>UGX {booking.roomType.pricePerMonth.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span>
                    {Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30))} months
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold">Total Price</span>
                    <span className="text-xl font-bold text-blue-600">
                      UGX {booking.totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {getActionButtons() && (
                <div className="border-t pt-4">
                  <div className="flex flex-wrap gap-2">
                    {getActionButtons()}
                  </div>
                </div>
              )}

              {/* Booking Info */}
              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium mb-2">Booking Information</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Booked on: {new Date(booking.createdAt).toLocaleDateString()}</p>
                  <p>Booking ID: {booking.id.slice(-8)}</p>
                </div>
              </div>

              {/* Help */}
              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium mb-2">Need Help?</h4>
                <div className="space-y-2 text-sm">
                  <button className="text-blue-600 hover:text-blue-700 underline">
                    Contact Support
                  </button>
                  <p className="text-gray-600">
                    Response time: Usually within 24 hours
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
