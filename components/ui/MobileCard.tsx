"use client"

import { useState } from "react"
import { Heart, Star, MapPin, Bed, Users, ChevronRight, Eye } from "lucide-react"
import Link from "next/link"

interface MobileCardProps {
  type: "hostel" | "booking" | "review"
  data: any
  onClick?: () => void
}

export default function MobileCard({ type, data, onClick }: MobileCardProps) {
  const [isLiked, setIsLiked] = useState(false)

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLiked(!isLiked)
  }

  if (type === "hostel") {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Image */}
        <div className="relative h-48">
          {data.images?.length > 0 ? (
            <img
              src={data.images[0].imageUrl}
              alt={data.images[0].altText || data.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <div className="w-12 h-12 mx-auto mb-2">
                  <div className="w-full h-full bg-gray-300 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🏠</span>
                  </div>
                </div>
                <p className="text-sm">No image</p>
              </div>
            </div>
          )}
          
          {/* Overlay */}
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              onClick={handleLike}
              className={`p-2 rounded-full transition-colors ${
                isLiked ? "bg-red-500 text-white" : "bg-white text-gray-600"
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            </button>
          </div>

          {/* Price Badge */}
          {data.roomTypes?.[0] && (
            <div className="absolute bottom-2 left-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
              UGX {data.roomTypes[0].pricePerMonth.toLocaleString()}/mo
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{data.name}</h3>
          
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="line-clamp-1">{data.address}</span>
          </div>

          {/* Rating */}
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(data.averageRating || 0)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-1">
              {data.averageRating?.toFixed(1) || "0.0"} ({data.reviewCount || 0})
            </span>
          </div>

          {/* Features */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            {data.roomTypes?.[0] && (
              <>
                <div className="flex items-center">
                  <Bed className="w-4 h-4 mr-1" />
                  <span>{data.roomTypes[0].capacity}</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  <span>{data.roomTypes[0].availableCount} available</span>
                </div>
              </>
            )}
          </div>

          {/* Action Button */}
          <Link
            href={`/hostels/${data.id}`}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            View Details
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    )
  }

  if (type === "booking") {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-semibold text-gray-900">{data.hostel.name}</h4>
            <p className="text-sm text-gray-600">{data.hostel.address}</p>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            data.status === "confirmed" ? "bg-green-100 text-green-700" :
            data.status === "pending" ? "bg-yellow-100 text-yellow-700" :
            data.status === "cancelled" ? "bg-red-100 text-red-700" :
            "bg-blue-100 text-blue-700"
          }`}>
            {data.status}
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Room:</span>
            <span className="font-medium">{data.roomType.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Check-in:</span>
            <span className="font-medium">{new Date(data.startDate).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Check-out:</span>
            <span className="font-medium">{new Date(data.endDate).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total:</span>
            <span className="font-bold text-blue-600">UGX {data.totalPrice.toLocaleString()}</span>
          </div>
        </div>

        <Link
          href={`/bookings/${data.id}`}
          className="mt-4 w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
        >
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </Link>
      </div>
    )
  }

  if (type === "review") {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium">
              {data.student.firstName[0]}{data.student.lastName[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">
                {data.student.firstName} {data.student.lastName}
              </h4>
              <span className="text-xs text-gray-500">
                {new Date(data.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center mb-2">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(data.rating)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {data.comment && (
          <p className="text-gray-700 text-sm mb-3 line-clamp-3">{data.comment}</p>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {data.hostel.name}
          </span>
          <div className="flex items-center gap-2">
            <button className="text-gray-500 hover:text-blue-600">
              👍 {data.helpfulCount || 0}
            </button>
            <button className="text-gray-500 hover:text-red-600">
              🚩
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
