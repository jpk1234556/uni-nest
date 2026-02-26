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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        profileImageUrl: true,
        isVerified: true,
        createdAt: true,
        studentProfile: {
          include: {
            university: {
              select: {
                id: true,
                name: true,
                shortCode: true
              }
            }
          }
        },
        ownedHostels: {
          select: {
            id: true,
            name: true,
            isActive: true,
            _count: {
              select: {
                bookings: true,
                reviews: true
              }
            }
          }
        },
        _count: {
          select: {
            bookings: true,
            reviews: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      firstName,
      lastName,
      phone,
      profileImageUrl,
      studentProfile
    } = body

    const updateData: any = {}

    if (firstName) updateData.firstName = firstName
    if (lastName !== undefined) updateData.lastName = lastName
    if (phone !== undefined) updateData.phone = phone
    if (profileImageUrl !== undefined) updateData.profileImageUrl = profileImageUrl

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        profileImageUrl: true,
        isVerified: true,
        studentProfile: {
          include: {
            university: {
              select: {
                id: true,
                name: true,
                shortCode: true
              }
            }
          }
        }
      }
    })

    // Update student profile if provided
    if (studentProfile && session.user.role === "student") {
      const { universityId, studentId, yearOfStudy, course, preferences } = studentProfile

      await prisma.studentProfile.upsert({
        where: { userId: session.user.id },
        update: {
          ...(universityId && { universityId }),
          ...(studentId && { studentId }),
          ...(yearOfStudy && { yearOfStudy }),
          ...(course !== undefined && { course }),
          ...(preferences && { preferences })
        },
        create: {
          userId: session.user.id,
          universityId: universityId || "",
          studentId: studentId || "",
          yearOfStudy: yearOfStudy || 1,
          course,
          preferences
        }
      })
    }

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json(
      { error: "Failed to update user profile" },
      { status: 500 }
    )
  }
}
