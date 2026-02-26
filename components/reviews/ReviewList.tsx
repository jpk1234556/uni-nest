"use client"

import { useState, useEffect } from "react"
import { Star, Filter, SortAsc, ChevronDown, Search } from "lucide-react"
import ReviewCard from "./ReviewCard"

interface Review {
  id: string
  rating: number
  comment?: string
  createdAt: string
  student: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
  }
  hostel: {
    id: string
    name: string
    images: Array<{
      id: string
      imageUrl: string
      altText?: string
    }>
  }
  booking?: {
    id: string
    roomType: {
      name: string
    }
    startDate: string
    endDate: string
  }
  helpfulCount: number
  userHelpful?: boolean
  isVerified: boolean
}

interface ReviewListProps {
  hostelId?: string
  studentId?: string
  reviews?: Review[]
  loading?: boolean
  canWriteReview?: boolean
  onWriteReview?: () => void
  onEditReview?: (reviewId: string) => void
  onDeleteReview?: (reviewId: string) => void
  onHelpful?: (reviewId: string, helpful: boolean) => void
  onReport?: (reviewId: string) => void
  onLoadMore?: () => void
  hasMore?: boolean
}

export default function ReviewList({
  hostelId,
  studentId,
  reviews = [],
  loading = false,
  canWriteReview = false,
  onWriteReview,
  onEditReview,
  onDeleteReview,
  onHelpful,
  onReport,
  onLoadMore,
  hasMore = false
}: ReviewListProps) {
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest" | "lowest">("newest")
  const [filterRating, setFilterRating] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([])

  useEffect(() => {
    let filtered = [...reviews]

    // Filter by rating
    if (filterRating !== null) {
      filtered = filtered.filter(review => review.rating === filterRating)
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(review =>
        review.comment?.toLowerCase().includes(query) ||
        `${review.student.firstName} ${review.student.lastName}`.toLowerCase().includes(query)
      )
    }

    // Sort reviews
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "highest":
          return b.rating - a.rating
        case "lowest":
          return a.rating - b.rating
        default:
          return 0
      }
    })

    setFilteredReviews(filtered)
  }, [reviews, sortBy, filterRating, searchQuery])

  const calculateAverageRating = () => {
    if (filteredReviews.length === 0) return 0
    const total = filteredReviews.reduce((sum, review) => sum + review.rating, 0)
    return total / filteredReviews.length
  }

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0] // 5-star to 1-star
    filteredReviews.forEach(review => {
      distribution[5 - review.rating]++
    })
    return distribution
  }

  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "md") => {
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-5 h-5", 
      lg: "w-6 h-6"
    }
    
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${sizeClasses[size]} ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : i < rating
            ? "text-yellow-400 fill-current opacity-50"
            : "text-gray-300"
        }`}
      />
    ))
  }

  const averageRating = calculateAverageRating()
  const ratingDistribution = getRatingDistribution()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Reviews ({filteredReviews.length})
        </h2>
        
        {canWriteReview && (
          <button
            onClick={onWriteReview}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Rating Summary */}
      {filteredReviews.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex justify-center mb-2">
                {renderStars(averageRating, "lg")}
              </div>
              <p className="text-gray-600">
                Based on {filteredReviews.length} review{filteredReviews.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = ratingDistribution[5 - stars]
                const percentage = filteredReviews.length > 0 
                  ? (count / filteredReviews.length) * 100 
                  : 0
                
                return (
                  <div key={stars} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-12">
                      <span className="text-sm">{stars}</span>
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="w-12 text-right text-sm text-gray-600">
                      {count}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" />
              <span>Sort & Filter</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>

            {showFilters && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
                {/* Sort Options */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort by
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="highest">Highest Rating</option>
                    <option value="lowest">Lowest Rating</option>
                  </select>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Rating
                  </label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setFilterRating(null)}
                      className={`w-full px-3 py-2 text-left rounded-lg border ${
                        filterRating === null
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      All Ratings
                    </button>
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setFilterRating(rating)}
                        className={`w-full px-3 py-2 text-left rounded-lg border flex items-center gap-2 ${
                          filterRating === rating
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < rating
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span>{rating} Stars</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reviews...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-8">
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchQuery || filterRating !== null
                ? "No reviews match your filters"
                : "No reviews yet"}
            </p>
            {canWriteReview && !searchQuery && filterRating === null && (
              <button
                onClick={onWriteReview}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Be the first to write a review
              </button>
            )}
          </div>
        ) : (
          <>
            {filteredReviews.map((review) => (
              <ReviewCard
                key={review.id}
                id={review.id}
                rating={review.rating}
                comment={review.comment}
                createdAt={review.createdAt}
                student={review.student}
                hostel={review.hostel}
                booking={review.booking}
                helpfulCount={review.helpfulCount}
                isVerified={review.isVerified}
                canEdit={studentId === review.student.id}
                onHelpful={onHelpful}
                onReport={onReport}
                onEdit={onEditReview}
                onDelete={onDeleteReview}
              />
            ))}

            {/* Load More */}
            {hasMore && (
              <div className="text-center">
                <button
                  onClick={onLoadMore}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Load More Reviews
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
