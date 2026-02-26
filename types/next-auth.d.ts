import { DefaultSession } from "next-auth"
import { UserRole, StudentProfile } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
      firstName: string
      lastName: string
      phone?: string
      isVerified: boolean
      studentProfile?: StudentProfile & {
        university: {
          name: string
          shortCode: string
        }
      }
    } & DefaultSession["user"]
  }

  interface User {
    role: UserRole
    firstName: string
    lastName: string
    phone?: string
    isVerified: boolean
    studentProfile?: StudentProfile & {
      university: {
        name: string
        shortCode: string
      }
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole
    firstName: string
    lastName: string
    phone?: string
    isVerified: boolean
    studentProfile?: StudentProfile & {
      university: {
        name: string
        shortCode: string
      }
    }
  }
}
