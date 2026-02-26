"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Menu, 
  X, 
  Home, 
  Search, 
  Calendar, 
  User, 
  Settings, 
  LogOut,
  Building,
  ChevronDown,
  Bell
} from "lucide-react"

interface MobileNavigationProps {
  userRole?: "student" | "hostel_owner" | "admin"
}

export default function MobileNavigation({ userRole }: MobileNavigationProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
    setActiveDropdown(null)
  }

  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown)
  }

  const handleLogout = () => {
    router.push("/")
    setIsOpen(false)
  }

  const getDashboardLink = () => {
    if (!session?.user?.role) return "/"
    switch (session.user.role) {
      case "student": return "/dashboard/student"
      case "hostel_owner": return "/dashboard/owner"
      case "admin": return "/dashboard/admin"
      default: return "/"
    }
  }

  const menuItems = [
    {
      icon: Home,
      label: "Home",
      href: "/",
      badge: null
    },
    {
      icon: Search,
      label: "Search",
      href: "/search",
      badge: null
    },
    {
      icon: Calendar,
      label: "Bookings",
      href: session?.user?.role === "student" ? "/dashboard/student?tab=bookings" : "/dashboard/owner?tab=bookings",
      badge: session?.user?.role ? "🔔" : null
    },
    {
      icon: User,
      label: "Profile",
      href: getDashboardLink(),
      badge: null
    }
  ]

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center">
            <Building className="w-6 h-6 text-blue-600 mr-2" />
            <span className="font-bold text-gray-900">Uni-Nest</span>
          </Link>

          <div className="flex items-center gap-3">
            {session && (
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <Bell className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={toggleMenu}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl">
            {/* Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  {session?.user?.firstName?.[0] || "U"}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {session?.user?.firstName} {session?.user?.lastName}
                  </p>
                  <p className="text-sm text-gray-500 capitalize">
                    {session?.user?.role?.replace("_", " ")}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleMenu}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto">
              {/* Main Navigation */}
              <div className="p-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Navigation
                </h3>
                <div className="space-y-1">
                  {menuItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={toggleMenu}
                      className="flex items-center justify-between p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center">
                        <item.icon className="w-5 h-5 mr-3" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-xs">{item.badge}</span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Role-specific Actions */}
              {session && (
                <div className="p-4 border-t border-gray-200">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Actions
                  </h3>
                  <div className="space-y-1">
                    {session.user.role === "student" && (
                      <>
                        <Link
                          href="/search"
                          onClick={toggleMenu}
                          className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Search className="w-5 h-5 mr-3" />
                          Find Hostels
                        </Link>
                        <Link
                          href="/bookings/new"
                          onClick={toggleMenu}
                          className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Calendar className="w-5 h-5 mr-3" />
                          Book a Room
                        </Link>
                      </>
                    )}
                    
                    {session.user.role === "hostel_owner" && (
                      <>
                        <Link
                          href="/hostels/new"
                          onClick={toggleMenu}
                          className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Building className="w-5 h-5 mr-3" />
                          Add Hostel
                        </Link>
                        <Link
                          href="/dashboard/owner"
                          onClick={toggleMenu}
                          className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Calendar className="w-5 h-5 mr-3" />
                          Manage Bookings
                        </Link>
                      </>
                    )}

                    {session.user.role === "admin" && (
                      <>
                        <Link
                          href="/dashboard/admin"
                          onClick={toggleMenu}
                          className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <User className="w-5 h-5 mr-3" />
                          Manage Users
                        </Link>
                        <Link
                          href="/dashboard/admin"
                          onClick={toggleMenu}
                          className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Building className="w-5 h-5 mr-3" />
                          Manage Hostels
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Settings */}
              <div className="p-4 border-t border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Settings
                </h3>
                <div className="space-y-1">
                  <button className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors w-full">
                    <Settings className="w-5 h-5 mr-3" />
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Logout
                  </button>
                </div>
              </div>

              {/* App Info */}
              <div className="p-4 border-t border-gray-200">
                <div className="text-center text-sm text-gray-500">
                  <p>Uni-Nest v1.0.0</p>
                  <p className="text-xs mt-1">Your trusted hostel finder</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
