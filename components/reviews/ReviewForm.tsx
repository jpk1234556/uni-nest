"use client"

import { useState } from "react"
import { Star, X, AlertCircle, CheckCircle } from "lucide-react"

interface ReviewFormProps {
  hostelId: string
  bookingId?: string
  initialRating?: number
  initialComment?: string
  onSubmit: (data: { rating: number; comment: string }) => void
  onCancel?: () => void
  isEditing?: boolean
  isLoading?: boolean
}

export default function ReviewForm({
  hostelId,
  bookingId,
  initialRating = 0,
  initialComment = "",
  onSubmit,
  onCancel,
  isEditing = false,
  isLoading = false
}: ReviewFormProps) {
  const [rating, setRating] = useState(initialRating)
  const [comment, setComment] = useState(initialComment)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [error, setError] = useState("")
  const [touched, setTouched] = useState(false)

  const ratingLabels = [
    "Terrible",
    "Poor", 
    "Average",
    "Good",
    "Excellent"
  ]

  const validateForm = () => {
    if (rating === 0) {
      setError("Please select a rating")
      return false
    }

    if (comment.trim().length < 10) {
      setError("Please provide at least 10 characters for your review")
      return false
    }

    if (comment.trim().length > 1000) {
      setError("Review must be less than 1000 characters")
      return false
    }

    setError("")
    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)

    if (!validateForm()) return

    onSubmit({
      rating,
      comment: comment.trim()
    })
  }

  const renderStars = (interactive: boolean = false) => {
    return Array.from({ length: 5 }, (_, i) => {
      const starValue = i + 1
      const isFilled = starValue <= (interactive ? (hoveredStar || rating) : rating)
      
      return (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && setRating(starValue)}
          onMouseEnter={() => interactive && setHoveredStar(starValue)}
          onMouseLeave={() => interactive && setHoveredStar(0)}
          className={`transition-colors ${
            interactive ? "cursor-pointer hover:scale-110" : "cursor-default"
          }`}
        >
          <Star
            className={`w-8 h-8 ${
              isFilled
                ? "text-yellow-400 fill-current"
                : "text-gray-300"
            }`}
          />
        </button>
      )
    })
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {isEditing ? "Edit Review" : "Write a Review"}
        </h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Your Rating *
          </label>
          <div className="flex items-center gap-2 mb-2">
            {renderStars(true)}
          </div>
          {rating > 0 && (
            <p className="text-sm text-gray-600">
              {ratingLabels[rating - 1]}
            </p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Review *
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this hostel. What did you like? What could be improved?"
            rows={4}
            maxLength={1000}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-gray-500">
              Minimum 10 characters
            </p>
            <p className="text-xs text-gray-500">
              {comment.length}/1000
            </p>
          </div>
        </div>

        {/* Review Guidelines */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Review Guidelines</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Be honest and factual in your review</li>
            <li>• Focus on your personal experience</li>
            <li>• Avoid offensive language or personal attacks</li>
            <li>• Mention specific aspects (cleanliness, staff, amenities, etc.)</li>
            <li>• Your review helps other students make informed decisions</li>
          </ul>
        </div>

        {/* Error Display */}
        {touched && error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Success Message (for editing) */}
        {isEditing && !error && !touched && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Make your changes and save to update your review</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {isEditing ? "Updating..." : "Submitting..."}
              </>
            ) : (
              <>
                {isEditing ? "Update Review" : "Submit Review"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
