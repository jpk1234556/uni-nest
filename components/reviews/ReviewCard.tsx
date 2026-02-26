"use client"

import { useState } from "react"
import { Star, ThumbsUp, ThumbsDown, Flag, MoreHorizontal, User, Calendar } from "lucide-react"

interface ReviewCardProps {
  id: string
  rating: number
  comment?: string
  createdAt: string
  student: {
    firstName: string
    lastName: string
    avatar?: string
  }
  hostel: {
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
  helpfulCount?: number
  isVerified?: boolean
  canEdit?: boolean
  canReport?: boolean
  onHelpful?: (reviewId: string, helpful: boolean) => void
  onReport?: (reviewId: string) => void
  onEdit?: (reviewId: string) => void
  onDelete?: (reviewId: string) => void
}

export default function ReviewCard({
  id,
  rating,
  comment,
  createdAt,
  student,
  hostel,
  booking,
  helpfulCount = 0,
  isVerified = false,
  canEdit = false,
  canReport = true,
  onHelpful,
  onReport,
  onEdit,
  onDelete
}: ReviewCardProps) {
  const [showActions, setShowActions] = useState(false)
  const [userHelpful, setUserHelpful] = useState<"helpful" | "notHelpful" | null>(null)
  const [localHelpfulCount, setLocalHelpfulCount] = useState(helpfulCount)

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

  const handleHelpful = (helpful: boolean) => {
    if (userHelpful === (helpful ? "helpful" : "notHelpful")) {
      // Remove previous vote
      setUserHelpful(null)
      setLocalHelpfulCount(prev => prev - (helpful ? 1 : -1))
    } else {
      // Add new vote
      setUserHelpful(helpful ? "helpful" : "notHelpful")
      setLocalHelpfulCount(prev => prev + (helpful ? 1 : 0))
    }
    
    onHelpful?.(id, helpful)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            {student.avatar ? (
              <img
                src={student.avatar}
                alt={`${student.firstName} ${student.lastName}`}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-gray-500" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900">
                {student.firstName} {student.lastName}
              </h4>
              {isVerified && (
                <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="flex items-center">
                {renderStars(rating)}
              </div>
              <span>•</span>
              <span>{formatDate(createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showActions && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              {canEdit && (
                <button
                  onClick={() => {
                    onEdit?.(id)
                    setShowActions(false)
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  Edit Review
                </button>
              )}
              {canReport && (
                <button
                  onClick={() => {
                    onReport?.(id)
                    setShowActions(false)
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  Report Review
                </button>
              )}
              {canEdit && onDelete && (
                <button
                  onClick={() => {
                    onDelete?.(id)
                    setShowActions(false)
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  Delete Review
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Booking Info */}
      {booking && (
        <div className="mb-3 p-2 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Stayed in {booking.roomType.name}
            </span>
            <span className="text-gray-500">
              {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}

      {/* Review Content */}
      {comment && (
        <div className="mb-4">
          <p className="text-gray-700 leading-relaxed">{comment}</p>
        </div>
      )}

      {/* Hostel Info */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          {hostel.images.length > 0 && (
            <img
              src={hostel.images[0].imageUrl}
              alt={hostel.images[0].altText || hostel.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
          )}
          <div>
            <p className="font-medium text-gray-900">{hostel.name}</p>
            <p className="text-sm text-gray-600">Reviewed this hostel</p>
          </div>
        </div>
      </div>

      {/* Helpful Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleHelpful(true)}
            className={`flex items-center gap-1 text-sm transition-colors ${
              userHelpful === "helpful"
                ? "text-green-600"
                : "text-gray-600 hover:text-green-600"
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            Helpful {localHelpfulCount > 0 && `(${localHelpfulCount})`}
          </button>
          
          <button
            onClick={() => handleHelpful(false)}
            className={`flex items-center gap-1 text-sm transition-colors ${
              userHelpful === "notHelpful"
                ? "text-red-600"
                : "text-gray-600 hover:text-red-600"
            }`}
          >
            <ThumbsDown className="w-4 h-4" />
            Not Helpful
          </button>
        </div>

        {canReport && (
          <button
            onClick={() => onReport?.(id)}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600"
          >
            <Flag className="w-4 h-4" />
            Report
          </button>
        )}
      </div>
    </div>
  )
}
