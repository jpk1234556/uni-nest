"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  AlertCircle,
  CheckCircle,
  Star,
  Calendar,
  MapPin,
  Building
} from "lucide-react"
import ReviewForm from "../../../components/reviews/ReviewForm"
import ReviewCard from "../../../components/reviews/ReviewCard"

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
    address: string
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

export default function ReviewDetailPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  
  const [review, setReview] = useState<Review | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin")
      return
    }

    fetchReview()
  }, [session, router, params.id])

  const fetchReview = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/reviews/${params.id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError("Review not found")
        } else if (response.status === 403) {
          setError("You don't have permission to view this review")
        } else {
          setError("Failed to load review")
        }
        return
      }

      const data = await response.json()
      setReview(data)
    } catch (error) {
      setError("Failed to load review")
      console.error("Error fetching review:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async (data: { rating: number; comment: string }) => {
    setSubmitting(true)
    setError("")

    try {
      const response = await fetch(`/api/reviews/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update review")
      }

      const updatedReview = await response.json()
      setReview(updatedReview)
      setIsEditing(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to update review")
      console.error("Error updating review:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteReview = async () => {
    if (!confirm("Are you sure you want to delete this review? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/reviews/${params.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete review")
      }

      // Redirect to user's reviews or hostel page
      router.push(session?.user?.role === "student" ? "/dashboard/student" : `/hostels/${review?.hostel.id}`)
    } catch (error) {
      setError("Failed to delete review")
      console.error("Error deleting review:", error)
    }
  }

  const handleHelpful = async (reviewId: string, helpful: boolean) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ helpful }),
      })

      if (response.ok) {
        const updatedReview = await response.json()
        setReview(updatedReview)
      }
    } catch (error) {
      console.error("Error marking review as helpful:", error)
    }
  }

  const handleReport = async () => {
    if (!confirm("Are you sure you want to report this review?")) {
      return
    }

    try {
      const response = await fetch(`/api/reviews/${params.id}/report`, {
        method: "POST",
      })

      if (response.ok) {
        alert("Review has been reported. Our team will review it shortly.")
      }
    } catch (error) {
      console.error("Error reporting review:", error)
      alert("Failed to report review. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading review...</p>
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
            onClick={fetchReview}
            className="text-blue-600 hover:text-blue-700 underline mr-4"
          >
            Try Again
          </button>
          <Link href="/" className="text-blue-600 hover:text-blue-700 underline">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  if (!review) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 mb-4">Review not found</div>
          <Link href="/" className="text-blue-600 hover:text-blue-700 underline">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const canEdit = session?.user?.id === review.student.id
  const isOwner = session?.user?.role === "hostel_owner" && review.hostel.id === session?.user?.id

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href={`/hostels/${review.hostel.id}`}
              className="flex items-center text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              Back to {review.hostel.name}
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Review Details</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hostel Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{review.hostel.name}</h2>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{review.hostel.address}</span>
              </div>
            </div>
            {review.hostel.images.length > 0 && (
              <img
                src={review.hostel.images[0].imageUrl}
                alt={review.hostel.images[0].altText || review.hostel.name}
                className="w-24 h-24 rounded-lg object-cover"
              />
            )}
          </div>
        </div>

        {/* Edit Form */}
        {isEditing && canEdit ? (
          <ReviewForm
            hostelId={review.hostel.id}
            bookingId={review.booking?.id}
            initialRating={review.rating}
            initialComment={review.comment || ""}
            onSubmit={handleSubmitReview}
            onCancel={() => setIsEditing(false)}
            isEditing={true}
            isLoading={submitting}
          />
        ) : (
          /* Review Display */
          <ReviewCard
            id={review.id}
            rating={review.rating}
            comment={review.comment}
            createdAt={review.createdAt}
            student={review.student}
            hostel={review.hostel}
            booking={review.booking}
            helpfulCount={review.helpfulCount}
            isVerified={review.isVerified}
            canEdit={canEdit}
            canReport={session?.user?.role === "student"}
            onHelpful={(reviewId, helpful) => handleHelpful(reviewId, helpful)}
            onReport={handleReport}
            onEdit={() => setIsEditing(true)}
            onDelete={canEdit ? handleDeleteReview : undefined}
          />
        )}

        {/* Actions */}
        {!isEditing && (canEdit || isOwner) && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Actions</h3>
            <div className="flex gap-4">
              {canEdit && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Review
                  </button>
                  <button
                    onClick={handleDeleteReview}
                    className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Review
                  </button>
                </>
              )}
              {isOwner && (
                <button
                  onClick={() => router.push(`/dashboard/owner`)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Building className="w-4 h-4" />
                  Manage Hostel
                </button>
              )}
            </div>
          </div>
        )}

        {/* Related Information */}
        {review.booking && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Booking Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Room Type</p>
                <p className="font-medium">{review.booking.roomType.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Stay Period</p>
                <p className="font-medium">
                  {new Date(review.booking.startDate).toLocaleDateString()} - {new Date(review.booking.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Link
                href={`/bookings/${review.booking.id}`}
                className="text-blue-600 hover:text-blue-700 underline"
              >
                View Booking Details
              </Link>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
