"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { 
  Calendar, 
  MapPin, 
  Users, 
  Bed, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ChevronLeft,
  Phone,
  Mail,
  Building,
  Wifi,
  Droplet,
  Zap
} from "lucide-react"

interface Hostel {
  id: string
  name: string
  description: string
  address: string
  averageRating: number
  reviewCount: number
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
  caretakerPhone?: string
  rules?: string[]
}

interface RoomType {
  id: string
  name: string
  description?: string
  capacity: number
  pricePerMonth: number
  availableCount: number
  totalCount: number
  amenities: string[]
  images: Array<{
    id: string
    imageUrl: string
    altText?: string
    order: number
  }>
}

// Simplified booking for Ugandan students
const BOOKING_STEPS = [
  { id: 1, title: "Select Room", description: "Choose your preferred room type" },
  { id: 2, title: "Contact Details", description: "Add your contact information" },
  { id: 3, title: "Submit Request", description: "Send booking request to hostel" },
]

export default function NewBookingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [hostelId, setHostelId] = useState(searchParams.get("hostelId") || "")
  const [roomTypeId, setRoomTypeId] = useState(searchParams.get("roomTypeId") || "")
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  // Form data
  const [hostel, setHostel] = useState<Hostel | null>(null)
  const [roomType, setRoomType] = useState<RoomType | null>(null)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [message, setMessage] = useState("")
  const [bookingConfirmed, setBookingConfirmed] = useState(false)
  const [bookingData, setBookingData] = useState<any>(null)

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push(`/auth/signin?callbackUrl=/bookings/new?${searchParams.toString()}`)
      return
    }
    if (session.user.role !== "student") {
      router.push("/")
      return
    }

    if (hostelId && roomTypeId) {
      fetchBookingData()
    }
  }, [session, status, router, searchParams, hostelId, roomTypeId])

  const fetchBookingData = async () => {
    setLoading(true)
    setError("")

    try {
      // Fetch hostel details
      const hostelResponse = await fetch(`/api/hostels/${hostelId}`)
      if (!hostelResponse.ok) throw new Error("Failed to fetch hostel")
      const hostelData = await hostelResponse.json()
      setHostel(hostelData)

      // Find the specific room type
      const selectedRoom = hostelData.roomTypes.find((room: RoomType) => room.id === roomTypeId)
      if (!selectedRoom) {
        throw new Error("Room type not found")
      }
      setRoomType(selectedRoom)

    } catch (error) {
      setError("Failed to load booking information")
      console.error("Error fetching booking data:", error)
    } finally {
      setLoading(false)
    }
  }

  const validateDates = () => {
    if (!startDate || !endDate) {
      setError("Please select check-in and check-out dates")
      return false
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (start >= end) {
      setError("Check-out date must be after check-in date")
      return false
    }

    if (start < new Date(new Date().setHours(0, 0, 0, 0))) {
      setError("Check-in date cannot be in the past")
      return false
    }

    return true
  }

  const calculateTotalPrice = () => {
    if (!roomType || !startDate || !endDate) return 0
    
    const start = new Date(startDate)
    const end = new Date(endDate)
    const months = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30))
    
    return roomType.pricePerMonth * months
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateDates()) return

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hostelId,
          roomTypeId,
          startDate,
          endDate,
          message: message.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create booking")
      }

      const booking = await response.json()
      setBookingData(booking)
      setBookingConfirmed(true)
      setStep(3)

    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create booking")
      console.error("Error creating booking:", error)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <div
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : i < rating
            ? "text-yellow-400 fill-current opacity-50"
            : "text-gray-300"
        }`}
      >
        ★
      </div>
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

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking information...</p>
        </div>
      </div>
    )
  }

  if (error && !hostel && !roomType) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <Link href="/search" className="text-blue-600 hover:text-blue-700 underline">
            Back to Search
          </Link>
        </div>
      </div>
    )
  }

  if (bookingConfirmed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600 mb-6">
            Your booking request has been sent to the hostel owner. You will receive a notification once it's confirmed.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold mb-2">Booking Details</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Hostel:</span> {bookingData.hostel.name}</p>
              <p><span className="font-medium">Room:</span> {bookingData.roomType.name}</p>
              <p><span className="font-medium">Check-in:</span> {new Date(bookingData.startDate).toLocaleDateString()}</p>
              <p><span className="font-medium">Check-out:</span> {new Date(bookingData.endDate).toLocaleDateString()}</p>
              <p><span className="font-medium">Total:</span> UGX {bookingData.totalPrice.toLocaleString()}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Link
              href="/dashboard/student"
              className="block w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              View My Bookings
            </Link>
            <Link
              href="/search"
              className="block w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
            >
              Search More Hostels
            </Link>
          </div>
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
            <Link href="/search" className="flex items-center text-blue-600 hover:text-blue-700">
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back to Search
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Complete Your Booking</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div
                    className={`w-16 h-1 ${
                      step > stepNumber ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {hostel && roomType && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Step 1: Property Details */}
              {step === 1 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-6">Property Details</h2>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">{hostel.name}</h3>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{hostel.address}</span>
                    </div>
                    {hostel.university && (
                      <div className="text-blue-600 mb-2">{hostel.university.name}</div>
                    )}
                    <div className="flex items-center mb-4">
                      {renderStars(hostel.averageRating)}
                      <span className="ml-2 text-sm text-gray-600">
                        {hostel.averageRating.toFixed(1)} ({hostel.reviewCount} reviews)
                      </span>
                    </div>
                    <p className="text-gray-700">{hostel.description}</p>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Selected Room</h3>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold">{roomType.name}</h4>
                          <p className="text-gray-600">{roomType.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            UGX {roomType.pricePerMonth.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">/month</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{roomType.capacity} guests</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bed className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{roomType.availableCount} of {roomType.totalCount} available</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {roomType.amenities.map((amenity) => (
                          <div key={amenity} className="flex items-center gap-1 text-xs text-gray-600">
                            {renderAmenityIcon(amenity)}
                            <span className="capitalize">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={() => setStep(2)}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
                    >
                      Continue to Dates
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Booking Details */}
              {step === 2 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-6">Booking Details</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Check-in Date *
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Check-out Date *
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate || new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message to Owner (Optional)
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                        placeholder="Any special requests or questions for the hostel owner..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                      </div>
                    )}

                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 border border-gray-300 py-3 rounded-lg hover:bg-gray-50"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {loading ? "Processing..." : "Confirm Booking"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-600">Hostel</p>
                    <p className="font-medium">{hostel.name}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Room Type</p>
                    <p className="font-medium">{roomType.name}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Capacity</p>
                    <p className="font-medium">{roomType.capacity} guests</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Monthly Rate</p>
                    <p className="font-medium">UGX {roomType.pricePerMonth.toLocaleString()}</p>
                  </div>
                  
                  {startDate && endDate && (
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="font-medium">
                        {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24 * 30))} months
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold">Total Price</span>
                    <span className="text-2xl font-bold text-blue-600">
                      UGX {calculateTotalPrice().toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    <div className="flex items-center gap-1 mb-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>Payment will be made directly to the hostel owner</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Booking confirmation pending owner approval</span>
                    </div>
                  </div>
                </div>

                {/* Owner Contact */}
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium mb-2">Hosted by {hostel.owner.firstName} {hostel.owner.lastName}</h4>
                  <div className="text-sm text-gray-600">
                    {hostel.owner.isVerified && (
                      <div className="flex items-center text-green-600 mb-1">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Verified Owner
                      </div>
                    )}
                    {hostel.owner.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        <span>{hostel.owner.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
