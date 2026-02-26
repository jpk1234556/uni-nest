"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { 
  Home, 
  Search, 
  Calendar, 
  User, 
  Plus,
  Building
} from "lucide-react"
import { useSession } from "next-auth/react"

interface MobileBottomNavProps {
  userRole?: "student" | "hostel_owner" | "admin"
}

export default function MobileBottomNav({ userRole }: MobileBottomNavProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const getNavItems = () => {
    const role = session?.user?.role || userRole

    switch (role) {
      case "student":
        return [
          { icon: Home, label: "Home", href: "/" },
          { icon: Search, label: "Search", href: "/search" },
          { icon: Plus, label: "Book", href: "/search", special: true },
          { icon: Calendar, label: "Bookings", href: "/dashboard/student?tab=bookings" },
          { icon: User, label: "Profile", href: "/dashboard/student" }
        ]
      
      case "hostel_owner":
        return [
          { icon: Home, label: "Home", href: "/" },
          { icon: Search, label: "Search", href: "/search" },
          { icon: Plus, label: "Add", href: "/hostels/new", special: true },
          { icon: Calendar, label: "Bookings", href: "/dashboard/owner?tab=bookings" },
          { icon: User, label: "Profile", href: "/dashboard/owner" }
        ]
      
      case "admin":
        return [
          { icon: Home, label: "Home", href: "/" },
          { icon: Search, label: "Search", href: "/search" },
          { icon: Building, label: "Manage", href: "/dashboard/admin", special: true },
          { icon: Calendar, label: "Activity", href: "/dashboard/admin?tab=overview" },
          { icon: User, label: "Profile", href: "/dashboard/admin" }
        ]
      
      default:
        return [
          { icon: Home, label: "Home", href: "/" },
          { icon: Search, label: "Search", href: "/search" },
          { icon: User, label: "Profile", href: "/auth/signin" }
        ]
    }
  }

  const navItems = getNavItems()

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item, index) => {
          const active = isActive(item.href)
          
          if (item.special) {
            return (
              <Link
                key={index}
                href={item.href}
                className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                  active ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  active 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-100 text-gray-600 hover:bg-blue-100"
                }`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            )
          }

          return (
            <Link
              key={index}
              href={item.href}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                active ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
