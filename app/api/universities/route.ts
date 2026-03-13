import { NextRequest, NextResponse } from "next/server"
import { mockUniversities } from "../../../lib/mock-data"

export async function GET(request: NextRequest) {
  try {
    // Try real DB first
    const { prisma } = await import("../../../lib/prisma")
    const universities = await prisma.university.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        shortCode: true,
        address: true,
        latitude: true,
        longitude: true,
        logoUrl: true,
        _count: {
          select: {
            hostels: true,
            studentProfiles: true
          }
        }
      },
      orderBy: { name: "asc" }
    })
    return NextResponse.json(universities)
  } catch (error) {
    // Fallback to mock data
    console.log("DB unavailable, using mock data for universities")
    return NextResponse.json(mockUniversities)
  }
}
