import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../lib/auth"
import { mockReviews } from "../../../lib/mock-data"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hostelId = searchParams.get("hostelId")
    const studentId = searchParams.get("studentId")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    try {
      const { prisma } = await import("../../../lib/prisma")
      const skip = (page - 1) * limit
      let where: any = {}
      if (hostelId) where.hostelId = hostelId
      if (studentId) where.studentId = studentId

      const reviews = await prisma.review.findMany({
        where,
        include: {
          student: { select: { id: true, firstName: true, lastName: true } },
          hostel: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      })
      const total = await prisma.review.count({ where })
      return NextResponse.json({ reviews, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
    } catch (dbError) {
      // Fallback to mock data
      const allReviews = hostelId ? (mockReviews[hostelId] || []) : Object.values(mockReviews).flat()
      const skip = (page - 1) * limit
      const paged = allReviews.slice(skip, skip + limit)
      return NextResponse.json({
        reviews: paged,
        pagination: { page, limit, total: allReviews.length, pages: Math.ceil(allReviews.length / limit) }
      })
    }
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (session.user.role !== "student") return NextResponse.json({ error: "Only students can create reviews" }, { status: 403 })

    const body = await request.json()
    const { hostelId, rating, comment } = body

    if (!hostelId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Valid hostel ID and rating (1-5) are required" }, { status: 400 })
    }

    const { prisma } = await import("../../../lib/prisma")
    const hasBooking = await prisma.booking.findFirst({
      where: { studentId: session.user.id, hostelId, status: "confirmed" }
    })
    if (!hasBooking) return NextResponse.json({ error: "You can only review hostels you have stayed at" }, { status: 403 })

    const existingReview = await prisma.review.findFirst({ where: { studentId: session.user.id, hostelId } })
    if (existingReview) return NextResponse.json({ error: "You have already reviewed this hostel" }, { status: 400 })

    const review = await prisma.review.create({
      data: { studentId: session.user.id, hostelId, rating, comment },
      include: {
        student: { select: { id: true, firstName: true, lastName: true } },
        hostel: { select: { id: true, name: true } }
      }
    })
    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 })
  }
}
