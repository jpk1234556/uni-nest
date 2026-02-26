import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../lib/auth"
import { prisma } from "../../../lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const universityId = searchParams.get("universityId")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const where: any = {
      isActive: true,
      owner: {
        isVerified: true
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } }
      ]
    }

    if (universityId) {
      where.universityId = universityId
    }

    if (minPrice || maxPrice) {
      where.roomTypes = {
        some: {
          pricePerMonth: {
            ...(minPrice && { gte: parseFloat(minPrice) }),
            ...(maxPrice && { lte: parseFloat(maxPrice) })
          }
        }
      }
    }

    const [hostels, total] = await Promise.all([
      prisma.hostel.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true
            }
          },
          university: {
            select: {
              id: true,
              name: true,
              shortCode: true
            }
          },
          roomTypes: {
            where: { availableCount: { gt: 0 } },
            select: {
              id: true,
              name: true,
              capacity: true,
              pricePerMonth: true,
              availableCount: true,
              amenities: true
            }
          },
          images: {
            select: {
              id: true,
              imageUrl: true,
              altText: true,
              order: true
            },
            orderBy: { order: "asc" }
          },
          _count: {
            select: {
              reviews: true,
              bookings: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.hostel.count({ where })
    ])

    // Calculate average rating for each hostel
    const hostelsWithRatings = await Promise.all(
      hostels.map(async (hostel) => {
        const reviews = await prisma.review.groupBy({
          by: ["hostelId"],
          where: { hostelId: hostel.id },
          _avg: { rating: true },
          _count: { rating: true }
        })

        const avgRating = reviews[0]?._avg.rating || 0
        const reviewCount = reviews[0]?._count.rating || 0

        return {
          ...hostel,
          averageRating: avgRating,
          reviewCount
        }
      })
    )

    return NextResponse.json({
      hostels: hostelsWithRatings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching hostels:", error)
    return NextResponse.json(
      { error: "Failed to fetch hostels" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    if (session.user.role !== "hostel_owner") {
      return NextResponse.json(
        { error: "Only hostel owners can create hostels" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      name,
      description,
      address,
      latitude,
      longitude,
      universityId,
      images
    } = body

    if (!name || !address) {
      return NextResponse.json(
        { error: "Name and address are required" },
        { status: 400 }
      )
    }

    const hostel = await prisma.hostel.create({
      data: {
        name,
        description,
        address,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        ownerId: session.user.id,
        universityId: universityId || null
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        university: true
      }
    })

    // Create images if provided
    if (images && images.length > 0) {
      await prisma.hostelImage.createMany({
        data: images.map((img: any, index: number) => ({
          hostelId: hostel.id,
          imageUrl: img.imageUrl,
          altText: img.altText || `Hostel image ${index + 1}`,
          order: img.order || index
        }))
      })
    }

    return NextResponse.json(hostel, { status: 201 })
  } catch (error) {
    console.error("Error creating hostel:", error)
    return NextResponse.json(
      { error: "Failed to create hostel" },
      { status: 500 }
    )
  }
}
