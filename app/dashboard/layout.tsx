"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Building, LogOut, Settings, Search } from "lucide-react"
import Link from "next/link"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
      return
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const getDashboardLink = () => {
    switch (session.user.role) {
      case "student":
        return "/dashboard/student"
      case "hostel_owner":
        return "/dashboard/owner"
      case "admin":
        return "/dashboard/admin"
      default:
        return "/"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center text-blue-600 hover:text-blue-700">
              <Building className="w-6 h-6 mr-2" />
              Uni-Nest
            </Link>
            
            <div className="flex items-center gap-4">
              <Link href="/search" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <Search className="w-5 h-5" />
                Search
              </Link>
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <Settings className="w-5 h-5" />
                Settings
              </button>
              <button className="flex items-center gap-2 text-red-600 hover:text-red-700">
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  )
}
