import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../lib/auth"
import { prisma } from "../../../../lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const search = searchParams.get("search")
    const isActive = searchParams.get("isActive")
    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive"
          }
        },
        {
          address: {
            contains: search,
            mode: "insensitive"
          }
        }
      ]
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === "true"
    }

    const hostels = await prisma.hostel.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            isVerified: true
          }
        },
        university: {
          select: {
            id: true,
            name: true,
            shortCode: true
          }
        },
        _count: {
          select: {
            bookings: true,
            reviews: true,
            roomTypes: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    })

    const total = await prisma.hostel.count({ where })

    return NextResponse.json({
      hostels,
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { isActive } = body

    const hostel = await prisma.hostel.update({
      where: { id: params.id },
      data: { isActive },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            isVerified: true
          }
        },
        university: {
          select: {
            id: true,
            name: true,
            shortCode: true
          }
        },
        _count: {
          select: {
            bookings: true,
            reviews: true,
            roomTypes: true
          }
        }
      }
    })

    return NextResponse.json(hostel)

  } catch (error) {
    console.error("Error updating hostel:", error)
    return NextResponse.json(
      { error: "Failed to update hostel" },
      { status: 500 }
    )
  }
}
