"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Search, Filter, MapPin, Star, Wifi, Droplet, Zap, Users, Bed, DollarSign, X, Building } from "lucide-react"
import Link from "next/link"

interface Hostel {
  id: string
  name: string
  description: string
  address: string
  distanceFromUniversity?: number
  averageRating: number
  reviewCount: number
  roomTypes: Array<{
    id: string
    name: string
    capacity: number
    pricePerMonth: number
    availableCount: number
    amenities: string[]
  }>
  images: Array<{
    id: string
    imageUrl: string
    altText?: string
    order: number
  }>
  owner: {
    firstName: string
    lastName: string
    phone?: string
  }
  university?: {
    id: string
    name: string
    shortCode: string
  }
}

interface University {
  id: string
  name: string
  shortCode: string
  _count: {
    hostels: number
  }
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [hostels, setHostels] = useState<Hostel[]>([])
  const [universities, setUniversities] = useState<University[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  })

  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [selectedUniversity, setSelectedUniversity] = useState(searchParams.get("universityId") || "")
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "")
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "")
  const [sortBy, setSortBy] = useState("newest")

  useEffect(() => {
    fetchUniversities()
    fetchHostels()
  }, [searchQuery, selectedUniversity, minPrice, maxPrice, sortBy])

  const fetchUniversities = async () => {
    try {
      const response = await fetch("/api/universities")
      const data = await response.json()
      setUniversities(data)
    } catch (error) {
      console.error("Error fetching universities:", error)
    }
  }

  const fetchHostels = async (page = 1) => {
    setLoading(true)
    setError("")

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(selectedUniversity && { universityId: selectedUniversity }),
        ...(minPrice && { minPrice }),
        ...(maxPrice && { maxPrice })
      })

      const response = await fetch(`/api/hostels?${params}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch hostels")
      }

      const data = await response.json()
      setHostels(data.hostels)
      setPagination(data.pagination)
    } catch (error) {
      setError("Failed to load hostels. Please try again.")
      console.error("Error fetching hostels:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchHostels(1)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedUniversity("")
    setMinPrice("")
    setMaxPrice("")
    setSortBy("newest")
  }

  const getLowestPrice = (hostel: Hostel) => {
    if (hostel.roomTypes.length === 0) return 0
    return Math.min(...hostel.roomTypes.map(room => room.pricePerMonth))
  }

  const getAvailableRooms = (hostel: Hostel) => {
    return hostel.roomTypes.reduce((total, room) => total + room.availableCount, 0)
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center text-blue-600 hover:text-blue-700">
              ← Back to Home
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Search Hostels</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded"
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>

              <div className={`${showFilters ? "block" : "hidden lg:block"}`}>
                {/* Search Form */}
                <form onSubmit={handleSearch} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Hostel name, location..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* University Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      University
                    </label>
                    <select
                      value={selectedUniversity}
                      onChange={(e) => setSelectedUniversity(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Universities</option>
                      {universities.map((uni) => (
                        <option key={uni.id} value={uni.id}>
                          {uni.name} ({uni._count.hostels} hostels)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Range (UGX/month)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        placeholder="Min"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        placeholder="Max"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="newest">Newest First</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
                    >
                      Apply Filters
                    </button>
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Clear
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {pagination.total} Hostels Found
                </h2>
                <p className="text-gray-600">
                  {searchQuery && `Searching for "${searchQuery}"`}
                  {selectedUniversity && universities.find(u => u.id === selectedUniversity)?.name}
                </p>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="w-5 h-5" />
                Filters
              </button>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-6 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Results Grid */}
            {!loading && !error && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {hostels.map((hostel) => (
                    <div key={hostel.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                      {/* Image */}
                      <div className="h-48 bg-gray-200 rounded-t-lg relative">
                        {hostel.images.length > 0 ? (
                          <img
                            src={hostel.images[0].imageUrl}
                            alt={hostel.images[0].altText || hostel.name}
                            className="w-full h-full object-cover rounded-t-lg"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Building className="w-12 h-12" />
                          </div>
                        )}
                        {getAvailableRooms(hostel) > 0 && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                            {getAvailableRooms(hostel)} rooms available
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                          {hostel.name}
                        </h3>
                        
                        <div className="flex items-center text-gray-600 mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="text-sm line-clamp-1">{hostel.address}</span>
                        </div>

                        {hostel.university && (
                          <div className="text-sm text-blue-600 mb-2">
                            {hostel.university.name}
                          </div>
                        )}

                        <div className="flex items-center mb-3">
                          {renderStars(hostel.averageRating)}
                          <span className="text-sm text-gray-600 ml-2">
                            {hostel.averageRating.toFixed(1)} ({hostel.reviewCount})
                          </span>
                        </div>

                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="text-2xl font-bold text-blue-600">
                              UGX {getLowestPrice(hostel).toLocaleString()}
                            </span>
                            <span className="text-sm text-gray-600">/month</span>
                          </div>
                        </div>

                        {/* Amenities */}
                        {hostel.roomTypes.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {hostel.roomTypes[0].amenities.slice(0, 3).map((amenity, index) => (
                              <div key={index} className="flex items-center text-xs text-gray-600">
                                {amenity === "wifi" && <Wifi className="w-3 h-3 mr-1" />}
                                {amenity === "water" && <Droplet className="w-3 h-3 mr-1" />}
                                {amenity === "power" && <Zap className="w-3 h-3 mr-1" />}
                                {amenity}
                              </div>
                            ))}
                          </div>
                        )}

                        <Link
                          href={`/hostels/${hostel.id}`}
                          className="block w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-center"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => fetchHostels(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    <span className="text-gray-600">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    
                    <button
                      onClick={() => fetchHostels(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
