import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

// Lazy prisma import to avoid crashing on startup when DB is unavailable
async function getPrisma() {
  try {
    const { prisma } = await import("./prisma")
    return prisma
  } catch {
    return null
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const prisma = await getPrisma()
          if (!prisma) return null

          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            },
            include: {
              studentProfile: {
                include: {
                  university: true
                }
              }
            }
          })

          if (!user) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            isVerified: user.isVerified,
            studentProfile: user.studentProfile
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.phone = user.phone
        token.isVerified = user.isVerified
        token.studentProfile = user.studentProfile
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as any
        session.user.firstName = token.firstName as string
        session.user.lastName = token.lastName as string
        session.user.phone = token.phone as string
        session.user.isVerified = token.isVerified as boolean
        session.user.studentProfile = token.studentProfile as any
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin"
  }
}
