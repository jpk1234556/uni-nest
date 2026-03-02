import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../lib/auth"
import { mockHostels, mockReviews } from "../../../../lib/mock-data"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Try real DB first
    try {
      const { prisma } = await import("../../../../lib/prisma")
      const hostel = await prisma.hostel.findUnique({
        where: { id: params.id, isActive: true },
        include: {
          owner: { select: { id: true, firstName: true, lastName: true, phone: true, isVerified: true } },
          university: true,
          roomTypes: {
            include: { images: { orderBy: { order: "asc" } } }
          },
          images: { orderBy: { order: "asc" } },
          reviews: {
            include: { student: { select: { firstName: true, lastName: true } } },
            orderBy: { createdAt: "desc" },
            take: 10
          },
          _count: { select: { reviews: true, bookings: true } }
        }
      })

      if (!hostel) {
        return NextResponse.json({ error: "Hostel not found" }, { status: 404 })
      }

      const ratingData = await prisma.review.groupBy({
        by: ["hostelId"],
        where: { hostelId: params.id },
        _avg: { rating: true },
        _count: { rating: true }
      })

      return NextResponse.json({
        ...hostel,
        averageRating: ratingData[0]?._avg.rating || 0,
        reviewCount: ratingData[0]?._count.rating || 0
      })
    } catch (dbError) {
      // Fallback to mock data
      console.log("DB unavailable, using mock data for hostel detail")
      const hostel = mockHostels.find(h => h.id === params.id)

      if (!hostel) {
        return NextResponse.json({ error: "Hostel not found" }, { status: 404 })
      }

      const reviews = mockReviews[params.id] || []
      return NextResponse.json({
        ...hostel,
        reviews,
        _count: { reviews: reviews.length, bookings: 0 }
      })
    }
  } catch (error) {
    console.error("Error fetching hostel:", error)
    return NextResponse.json({ error: "Failed to fetch hostel" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { prisma } = await import("../../../../lib/prisma")
    const hostel = await prisma.hostel.findUnique({ where: { id: params.id } })

    if (!hostel) return NextResponse.json({ error: "Hostel not found" }, { status: 404 })
    if (hostel.ownerId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, address, latitude, longitude, universityId, isActive } = body

    const updatedHostel = await prisma.hostel.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(address && { address }),
        ...(latitude !== undefined && { latitude: latitude ? parseFloat(latitude) : null }),
        ...(longitude !== undefined && { longitude: longitude ? parseFloat(longitude) : null }),
        ...(universityId !== undefined && { universityId: universityId || null }),
        ...(isActive !== undefined && { isActive })
      },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true } },
        university: true
      }
    })

    return NextResponse.json(updatedHostel)
  } catch (error) {
    console.error("Error updating hostel:", error)
    return NextResponse.json({ error: "Failed to update hostel" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { prisma } = await import("../../../../lib/prisma")
    const hostel = await prisma.hostel.findUnique({ where: { id: params.id } })

    if (!hostel) return NextResponse.json({ error: "Hostel not found" }, { status: 404 })
    if (hostel.ownerId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.hostel.update({ where: { id: params.id }, data: { isActive: false } })

    return NextResponse.json({ message: "Hostel deleted successfully" })
  } catch (error) {
    console.error("Error deleting hostel:", error)
    return NextResponse.json({ error: "Failed to delete hostel" }, { status: 500 })
  }
}
