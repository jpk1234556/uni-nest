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
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const skip = (page - 1) * limit

    const where: any = {}

    if (status && status !== "all") {
      where.status = status
    }

    if (search) {
      where.OR = [
        {
          student: {
            OR: [
              {
                firstName: {
                  contains: search,
                  mode: "insensitive"
                }
              },
              {
                lastName: {
                  contains: search,
                  mode: "insensitive"
                }
              },
              {
                email: {
                  contains: search,
                  mode: "insensitive"
                }
              }
            ]
          }
        },
        {
          hostel: {
            OR: [
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
        }
      ]
    }

    const bookings = await prisma.booking.findMany({
      where,
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
          include: {
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        roomType: {
          select: {
            id: true,
            name: true,
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
