import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../lib/auth"
import { prisma } from "../../../lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    let where: any = {}

    // Filter based on user role
    if (session.user.role === "student") {
      where.studentId = session.user.id
    } else if (session.user.role === "hostel_owner") {
      where.hostel = {
        ownerId: session.user.id
      }
    } else if (session.user.role === "admin") {
      // Admin can see all bookings
    }

    if (status) {
      where.status = status
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        hostel: {
          select: {
            id: true,
            name: true,
            address: true,
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true
              }
            }
          }
        },
        roomType: {
          select: {
            id: true,
            name: true,
            capacity: true,
            pricePerMonth: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    })

    const total = await prisma.booking.count({ where })

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
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

    if (session.user.role !== "student") {
      return NextResponse.json(
        { error: "Only students can create bookings" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      hostelId,
      roomTypeId,
      startDate,
      endDate,
      message
    } = body

    if (!hostelId || !roomTypeId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate dates
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (start >= end) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      )
    }

    // Check if room is available
    const roomType = await prisma.roomType.findUnique({
      where: { id: roomTypeId },
      include: { hostel: true }
    })

    if (!roomType || roomType.hostelId !== hostelId) {
      return NextResponse.json(
        { error: "Invalid room type" },
        { status: 400 }
      )
    }

    if (roomType.availableCount <= 0) {
      return NextResponse.json(
        { error: "No rooms available" },
        { status: 400 }
      )
    }

    // Calculate total price
    const months = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30))
    const totalPrice = Number(roomType.pricePerMonth) * months

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        studentId: session.user.id,
        hostelId,
        roomTypeId,
        startDate: start,
        endDate: end,
        totalPrice,
        message
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        hostel: {
          select: {
            id: true,
            name: true,
            address: true
          }
        },
        roomType: {
          select: {
            id: true,
            name: true,
            capacity: true,
            pricePerMonth: true
          }
        }
      }
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    )
  }
}
