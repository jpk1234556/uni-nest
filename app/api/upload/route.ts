import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../lib/auth"
import { writeFile, mkdir, unlink } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const altText = formData.get("altText") as string
    const hostelId = formData.get("hostelId") as string
    const roomTypeId = formData.get("roomTypeId") as string

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
        { status: 400 }
      )
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads")
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Directory already exists, continue
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExtension}`
    const filePath = join(uploadsDir, fileName)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    await writeFile(filePath, buffer)

    // Return the file URL and metadata
    const fileUrl = `/uploads/${fileName}`

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName,
      altText: altText || "",
      size: file.size,
      type: file.type,
      hostelId,
      roomTypeId
    })

  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get("fileName")

    if (!fileName) {
      return NextResponse.json(
        { error: "File name is required" },
        { status: 400 }
      )
    }

    // Validate file name to prevent directory traversal
    if (fileName.includes("..") || fileName.includes("/") || fileName.includes("\\")) {
      return NextResponse.json(
        { error: "Invalid file name" },
        { status: 400 }
      )
    }

    const filePath = join(process.cwd(), "public", "uploads", fileName)

    try {
      // Delete the file
      await unlink(filePath)
      
      return NextResponse.json({
        success: true,
        message: "File deleted successfully"
      })
    } catch (error) {
      // File doesn't exist or other error
      return NextResponse.json(
        { error: "Failed to delete file" },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error("Error deleting file:", error)
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    )
  }
}
