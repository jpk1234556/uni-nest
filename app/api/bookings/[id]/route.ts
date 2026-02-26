import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../lib/auth"
import { prisma } from "../../../../lib/prisma"

export async function GET(
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

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
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
            pricePerMonth: true,
            amenities: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      )
    }

    // Check access permissions
    const hasAccess =
      booking.studentId === session.user.id ||
      booking.hostel.owner.id === session.user.id ||
      session.user.role === "admin"

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error("Error fetching booking:", error)
    return NextResponse.json(
      { error: "Failed to fetch booking" },
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

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { hostel: true }
    })

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { status } = body

    // Check permissions for status updates
    if (status === "confirmed" || status === "cancelled") {
      // Only hostel owners can confirm/cancel bookings
      if (booking.hostel.ownerId !== session.user.id && session.user.role !== "admin") {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        )
      }
    } else if (status === "completed") {
      // Only students can mark as completed
      if (booking.studentId !== session.user.id && session.user.role !== "admin") {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        )
      }
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: { status },
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

    // Update room availability if booking is confirmed
    if (status === "confirmed") {
      await prisma.roomType.update({
        where: { id: booking.roomTypeId },
        data: {
          availableCount: {
            decrement: 1
          }
        }
      })
    }

    // Update room availability if booking is cancelled (was previously confirmed)
    if (status === "cancelled" && booking.status === "confirmed") {
      await prisma.roomType.update({
        where: { id: booking.roomTypeId },
        data: {
          availableCount: {
            increment: 1
          }
        }
      })
    }

    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error("Error updating booking:", error)
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    )
  }
}
