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

    // Get total users
    const totalUsers = await prisma.user.count()

    // Get total hostels
    const totalHostels = await prisma.hostel.count()

    // Get total bookings
    const totalBookings = await prisma.booking.count()

    // Get total revenue
    const bookings = await prisma.booking.findMany({
      where: {
        status: {
          in: ["confirmed", "completed"]
        }
      },
      select: {
        totalPrice: true
      }
    })
    const totalRevenue = bookings.reduce((sum, booking) => sum + Number(booking.totalPrice), 0)

    // Get pending verifications
    const pendingVerifications = await prisma.user.count({
      where: {
        isVerified: false,
        role: {
          in: ["student", "hostel_owner"]
        }
      }
    })

    // Get active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        status: "confirmed"
      }
    })

    // Get average rating
    const reviews = await prisma.review.findMany({
      select: {
        rating: true
      }
    })
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0

    // Get monthly growth (simplified - comparing current month with previous month)
    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const currentMonthUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: currentMonthStart
        }
      }
    })

    const previousMonthUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: previousMonthStart,
          lt: currentMonthStart
        }
      }
    })

    const monthlyGrowth = previousMonthUsers > 0 
      ? Math.round(((currentMonthUsers - previousMonthUsers) / previousMonthUsers) * 100)
      : 0

    const stats = {
      totalUsers,
      totalHostels,
      totalBookings,
      totalRevenue,
      pendingVerifications,
      activeBookings,
      averageRating,
      monthlyGrowth
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    )
  }
}
