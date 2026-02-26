"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Building, 
  MapPin, 
  Users, 
  Bed, 
  DollarSign, 
  Wifi, 
  Droplet, 
  Zap, 
  Plus, 
  X, 
  ChevronLeft,
  Save,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import ImageUpload from "../../../components/upload/ImageUpload"
import LocationSearch from "../../../components/maps/LocationSearch"

interface RoomType {
  name: string
  description: string
  capacity: number
  pricePerMonth: number
  totalCount: number
  amenities: string[]
}

interface University {
  id: string
  name: string
  shortCode: string
}

export default function NewHostelPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [universities, setUniversities] = useState<University[]>([])
  
  // Hostel form data
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    latitude: 0,
    longitude: 0,
    universityId: "",
    images: [] as Array<{ url: string; altText?: string; file?: File }>
  })
  
  // Room types
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([
    {
      name: "",
      description: "",
      capacity: 1,
      pricePerMonth: 0,
      totalCount: 1,
      amenities: []
    }
  ])

  const availableAmenities = ["wifi", "water", "power", "parking", "security", "laundry", "kitchen", "study_area"]

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

    fetchUniversities()
  }, [session, status, router])

  const fetchUniversities = async () => {
    try {
      const response = await fetch("/api/universities")
      const data = await response.json()
      setUniversities(data)
    } catch (error) {
      console.error("Error fetching universities:", error)
    }
  }

  const handleLocationSelect = (location: {
    address: string
    latitude: number
    longitude: number
  }) => {
    setFormData(prev => ({
      ...prev,
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude
    }))
  }

  const addRoomType = () => {
    setRoomTypes([...roomTypes, {
      name: "",
      description: "",
      capacity: 1,
      pricePerMonth: 0,
      totalCount: 1,
      amenities: []
    }])
  }

  const removeRoomType = (index: number) => {
    if (roomTypes.length > 1) {
      setRoomTypes(roomTypes.filter((_, i) => i !== index))
    }
  }

  const updateRoomType = (index: number, field: keyof RoomType, value: any) => {
    const updated = [...roomTypes]
    updated[index] = { ...updated[index], [field]: value }
    setRoomTypes(updated)
  }

  const toggleAmenity = (roomIndex: number, amenity: string) => {
    const updated = [...roomTypes]
    const amenities = updated[roomIndex].amenities
    if (amenities.includes(amenity)) {
      updated[roomIndex].amenities = amenities.filter(a => a !== amenity)
    } else {
      updated[roomIndex].amenities = [...amenities, amenity]
    }
    setRoomTypes(updated)
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Hostel name is required")
      return false
    }
    
    if (!formData.description.trim()) {
      setError("Description is required")
      return false
    }
    
    if (!formData.address.trim()) {
      setError("Address is required")
      return false
    }
    
    if (!formData.universityId) {
      setError("University is required")
      return false
    }
    
    if (formData.images.length === 0) {
      setError("At least one image is required")
      return false
    }
    
    // Validate room types
    for (let i = 0; i < roomTypes.length; i++) {
      const room = roomTypes[i]
      if (!room.name.trim()) {
        setError(`Room type ${i + 1} name is required`)
        return false
      }
      if (room.capacity < 1) {
        setError(`Room type ${i + 1} capacity must be at least 1`)
        return false
      }
      if (room.pricePerMonth < 0) {
        setError(`Room type ${i + 1} price must be positive`)
        return false
      }
      if (room.totalCount < 1) {
        setError(`Room type ${i + 1} total count must be at least 1`)
        return false
      }
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    setError("")

    try {
      // First create the hostel
      const hostelResponse = await fetch("/api/hostels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          address: formData.address,
          latitude: formData.latitude,
          longitude: formData.longitude,
          universityId: formData.universityId
        }),
      })

      if (!hostelResponse.ok) {
        const errorData = await hostelResponse.json()
        throw new Error(errorData.error || "Failed to create hostel")
      }

      const hostel = await hostelResponse.json()

      // Upload images
      const uploadedImages = []
      for (const image of formData.images) {
        if (image.file) {
          const formData = new FormData()
          formData.append("file", image.file)
          formData.append("altText", image.altText || "")
          formData.append("hostelId", hostel.id)

          const uploadResponse = await fetch("/api/upload", {
            method: "POST",
            body: formData
          })

          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json()
            uploadedImages.push({
              imageUrl: uploadResult.url,
              altText: uploadResult.altText,
              order: uploadedImages.length
            })
          }
        }
      }

      // Create room types
      for (const roomType of roomTypes) {
        await fetch("/api/room-types", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            hostelId: hostel.id,
            name: roomType.name,
            description: roomType.description,
            capacity: roomType.capacity,
            pricePerMonth: roomType.pricePerMonth,
            totalCount: roomType.totalCount,
            availableCount: roomType.totalCount,
            amenities: roomType.amenities
          }),
        })
      }

      setSuccess(true)
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/dashboard/owner")
      }, 2000)

    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create hostel")
      console.error("Error creating hostel:", error)
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Hostel Created Successfully!</h1>
          <p className="text-gray-600 mb-6">
            Your hostel has been listed and is now available for students to book.
          </p>
          <Link
            href="/dashboard/owner"
            className="block w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
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
            <Link href="/dashboard/owner" className="flex items-center text-blue-600 hover:text-blue-700">
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back to Dashboard
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">List New Hostel</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hostel Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter hostel name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  University *
                </label>
                <select
                  value={formData.universityId}
                  onChange={(e) => setFormData(prev => ({ ...prev, universityId: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select University</option>
                  {universities.map((uni) => (
                    <option key={uni.id} value={uni.id}>
                      {uni.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your hostel, facilities, and what makes it special..."
                required
              />
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Location</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <LocationSearch
                  onLocationSelect={handleLocationSelect}
                  placeholder="Enter hostel address..."
                  initialValue={formData.address}
                />
              </div>

              {(formData.latitude !== 0 || formData.longitude !== 0) && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    Location selected: {formData.address}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Coordinates: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Photos</h2>
            
            <ImageUpload
              images={formData.images}
              onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
              maxImages={10}
              maxSize={5}
            />
          </div>

          {/* Room Types */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Room Types</h2>
              <button
                type="button"
                onClick={addRoomType}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add Room Type
              </button>
            </div>

            <div className="space-y-6">
              {roomTypes.map((room, index) => (
                <div key={index} className="border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Room Type {index + 1}</h3>
                    {roomTypes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRoomType(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Room Name *
                      </label>
                      <input
                        type="text"
                        value={room.name}
                        onChange={(e) => updateRoomType(index, "name", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Single Room, Double Room"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monthly Price (UGX) *
                      </label>
                      <input
                        type="number"
                        value={room.pricePerMonth}
                        onChange={(e) => updateRoomType(index, "pricePerMonth", parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                        min="0"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Capacity *
                      </label>
                      <input
                        type="number"
                        value={room.capacity}
                        onChange={(e) => updateRoomType(index, "capacity", parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="1"
                        min="1"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Rooms *
                      </label>
                      <input
                        type="number"
                        value={room.totalCount}
                        onChange={(e) => updateRoomType(index, "totalCount", parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="1"
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={room.description}
                      onChange={(e) => updateRoomType(index, "description", e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe this room type..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amenities
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {availableAmenities.map((amenity) => (
                        <button
                          key={amenity}
                          type="button"
                          onClick={() => toggleAmenity(index, amenity)}
                          className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                            room.amenities.includes(amenity)
                              ? "bg-blue-50 border-blue-200 text-blue-700"
                              : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {amenity.replace("_", " ").charAt(0).toUpperCase() + amenity.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link
              href="/dashboard/owner"
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating Hostel...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Create Hostel
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
