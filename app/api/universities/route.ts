import { NextRequest, NextResponse } from "next/server"
import { prisma } from "../../../lib/prisma"

export async function GET(request: NextRequest) {
  try {
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
    console.error("Error fetching universities:", error)
    return NextResponse.json(
      { error: "Failed to fetch universities" },
      { status: 500 }
    )
  }
}
