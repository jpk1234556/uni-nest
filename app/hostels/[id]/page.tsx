"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  MapPin, 
  Star, 
  Wifi, 
  Droplet, 
  Zap, 
  Users, 
  Bed, 
  Phone, 
  Mail, 
  Shield,
  Calendar,
  Clock,
  ChevronLeft,
  Heart,
  Share2,
  Building
} from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import GoogleMap from "../../../components/maps/GoogleMap"

interface Hostel {
  id: string
  name: string
  description: string
  address: string
  latitude?: number
  longitude?: number
  distanceFromUniversity?: number
  averageRating: number
  reviewCount: number
  createdAt: string
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
  roomTypes: Array<{
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
  }>
  images: Array<{
    id: string
    imageUrl: string
    altText?: string
    order: number
  }>
  reviews: Array<{
    id: string
    rating: number
    comment?: string
    createdAt: string
    student: {
      firstName: string
      lastName: string
    }
  }>
}

export default function HostelDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [hostel, setHostel] = useState<Hostel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedImage, setSelectedImage] = useState(0)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (params.id) {
      fetchHostel()
    }
  }, [params.id])

  const fetchHostel = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/hostels/${params.id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError("Hostel not found")
        } else {
          setError("Failed to load hostel details")
        }
        return
      }

      const data = await response.json()
      setHostel(data)
    } catch (error) {
      setError("Failed to load hostel details")
      console.error("Error fetching hostel:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleBooking = (roomTypeId: string) => {
    if (!session) {
      router.push(`/auth/signin?callbackUrl=/hostels/${params.id}`)
      return
    }
    router.push(`/bookings/new?hostelId=${params.id}&roomTypeId=${roomTypeId}`)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
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
        return <Wifi className="w-5 h-5" />
      case "water":
        return <Droplet className="w-5 h-5" />
      case "power":
        return <Zap className="w-5 h-5" />
      case "parking":
        return <Building className="w-5 h-5" />
      default:
        return <Shield className="w-5 h-5" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-lg mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !hostel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <Link
            href="/search"
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Back to Search
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
            <Link href="/search" className="flex items-center text-blue-600 hover:text-blue-700">
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back to Search
            </Link>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Heart className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-96">
                {hostel.images.length > 0 ? (
                  <img
                    src={hostel.images[selectedImage]?.imageUrl}
                    alt={hostel.images[selectedImage]?.altText || hostel.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <Building className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
              
              {hostel.images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {hostel.images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index ? "border-blue-600" : "border-gray-200"
                      }`}
                    >
                      <img
                        src={image.imageUrl}
                        alt={image.altText}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Hostel Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{hostel.name}</h1>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>{hostel.address}</span>
                  </div>
                  {hostel.university && (
                    <div className="text-blue-600 font-medium">
                      {hostel.university.name}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="flex items-center mb-2">
                    {renderStars(hostel.averageRating)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {hostel.averageRating.toFixed(1)} ({hostel.reviewCount} reviews)
                  </div>
                </div>
              </div>

              <p className="text-gray-700 mb-6">{hostel.description}</p>

              {/* Owner Info */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Hosted by {hostel.owner.firstName} {hostel.owner.lastName}</h3>
                    <div className="flex items-center text-sm text-gray-600">
                      {hostel.owner.isVerified && (
                        <div className="flex items-center text-green-600">
                          <Shield className="w-4 h-4 mr-1" />
                          Verified Owner
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {hostel.owner.phone && (
                      <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
                        <Phone className="w-4 h-4" />
                        Contact
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

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="border-b">
                <div className="flex">
                  {["overview", "rooms", "reviews"].map((tab) => (
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
                    {/* Amenities */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Amenities</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Array.from(new Set(hostel.roomTypes.flatMap(room => room.amenities))).map((amenity) => (
                          <div key={amenity} className="flex items-center gap-2">
                            {renderAmenityIcon(amenity)}
                            <span className="capitalize">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">About this hostel</h3>
                      <p className="text-gray-700">{hostel.description}</p>
                    </div>

                    {/* Location */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Location</h3>
                      <div className="h-64 rounded-lg overflow-hidden">
                        <GoogleMap
                          latitude={hostel.latitude}
                          longitude={hostel.longitude}
                          address={hostel.address}
                          zoom={15}
                          height="256px"
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "rooms" && (
                  <div className="space-y-4">
                    {hostel.roomTypes.map((room) => (
                      <div key={room.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-lg">{room.name}</h4>
                            <p className="text-gray-600">{room.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">
                              UGX {room.pricePerMonth.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">/month</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{room.capacity} guests</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Bed className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{room.availableCount} of {room.totalCount} available</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {room.amenities.map((amenity) => (
                            <div key={amenity} className="flex items-center gap-1 text-xs text-gray-600">
                              {renderAmenityIcon(amenity)}
                              <span className="capitalize">{amenity}</span>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => handleBooking(room.id)}
                          disabled={room.availableCount === 0}
                          className={`w-full py-2 rounded-lg font-medium ${
                            room.availableCount === 0
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                        >
                          {room.availableCount === 0 ? "Not Available" : "Book Now"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div className="space-y-4">
                    {hostel.reviews.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No reviews yet</p>
                        <p className="text-sm">Be the first to review this hostel</p>
                      </div>
                    ) : (
                      hostel.reviews.map((review) => (
                        <div key={review.id} className="border-b pb-4 last:border-b-0">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="font-medium">
                                {review.student.firstName} {review.student.lastName}
                              </div>
                              <div className="flex items-center">
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

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <div className="mb-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  UGX {Math.min(...hostel.roomTypes.map(room => room.pricePerMonth)).toLocaleString()}
                </div>
                <div className="text-gray-600">per month</div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Rating</span>
                  <div className="flex items-center">
                    {renderStars(hostel.averageRating)}
                    <span className="ml-2 text-sm">{hostel.averageRating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Available Rooms</span>
                  <span>{hostel.roomTypes.reduce((total, room) => total + room.availableCount, 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Location</span>
                  <span className="text-sm text-right">{hostel.address}</span>
                </div>
              </div>

              <button
                onClick={() => handleBooking(hostel.roomTypes[0]?.id)}
                disabled={hostel.roomTypes.reduce((total, room) => total + room.availableCount, 0) === 0}
                className={`w-full py-3 rounded-lg font-medium ${
                  hostel.roomTypes.reduce((total, room) => total + room.availableCount, 0) === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {hostel.roomTypes.reduce((total, room) => total + room.availableCount, 0) === 0
                  ? "No Rooms Available"
                  : "Book Now"
                }
              </button>

              <div className="text-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 inline mr-1" />
                Flexible booking dates
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
