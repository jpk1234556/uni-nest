import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../lib/auth"
import { mockHostels } from "../../../lib/mock-data"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const universityId = searchParams.get("universityId")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")

    // Try real DB first
    try {
      const { prisma } = await import("../../../lib/prisma")
      const skip = (page - 1) * limit

      const where: any = {
        isActive: true,
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
            owner: { select: { id: true, firstName: true, lastName: true, phone: true } },
            university: { select: { id: true, name: true, shortCode: true } },
            roomTypes: {
              where: { availableCount: { gt: 0 } },
              select: { id: true, name: true, capacity: true, pricePerMonth: true, availableCount: true, amenities: true }
            },
            images: { select: { id: true, imageUrl: true, altText: true, order: true }, orderBy: { order: "asc" } },
            _count: { select: { reviews: true, bookings: true } }
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit
        }),
        prisma.hostel.count({ where })
      ])

      const hostelsWithRatings = await Promise.all(
        hostels.map(async (hostel) => {
          const reviews = await prisma.review.groupBy({
            by: ["hostelId"],
            where: { hostelId: hostel.id },
            _avg: { rating: true },
            _count: { rating: true }
          })
          return {
            ...hostel,
            averageRating: reviews[0]?._avg.rating || 0,
            reviewCount: reviews[0]?._count.rating || 0
          }
        })
      )

      return NextResponse.json({
        hostels: hostelsWithRatings,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      })
    } catch (dbError) {
      // Fallback to mock data
      console.log("DB unavailable, using mock data for hostels")
      let filtered = [...mockHostels]

      if (search) {
        const q = search.toLowerCase()
        filtered = filtered.filter(h =>
          h.name.toLowerCase().includes(q) ||
          h.description.toLowerCase().includes(q) ||
          h.address.toLowerCase().includes(q)
        )
      }
      if (universityId) {
        filtered = filtered.filter(h => h.universityId === universityId)
      }
      if (minPrice) {
        filtered = filtered.filter(h =>
          h.roomTypes.some(rt => rt.pricePerMonth >= parseFloat(minPrice))
        )
      }
      if (maxPrice) {
        filtered = filtered.filter(h =>
          h.roomTypes.some(rt => rt.pricePerMonth <= parseFloat(maxPrice))
        )
      }

      const total = filtered.length
      const skip = (page - 1) * limit
      const paged = filtered.slice(skip, skip + limit)

      return NextResponse.json({
        hostels: paged,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      })
    }
  } catch (error) {
    console.error("Error fetching hostels:", error)
    return NextResponse.json({ error: "Failed to fetch hostels" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "hostel_owner") {
      return NextResponse.json({ error: "Only hostel owners can create hostels" }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, address, latitude, longitude, universityId, images } = body

    if (!name || !address) {
      return NextResponse.json({ error: "Name and address are required" }, { status: 400 })
    }

    const { prisma } = await import("../../../lib/prisma")
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
        owner: { select: { id: true, firstName: true, lastName: true } },
        university: true
      }
    })

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
    return NextResponse.json({ error: "Failed to create hostel" }, { status: 500 })
  }
}
