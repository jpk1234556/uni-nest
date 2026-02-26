"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Users, 
  Building, 
  Calendar, 
  Star, 
  TrendingUp, 
  DollarSign, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Settings,
  LogOut,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Shield,
  MapPin,
  Phone,
  Mail,
  Clock,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react"

interface AdminStats {
  totalUsers: number
  totalHostels: number
  totalBookings: number
  totalRevenue: number
  pendingVerifications: number
  activeBookings: number
  averageRating: number
  monthlyGrowth: number
}

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: "student" | "hostel_owner" | "admin"
  isVerified: boolean
  createdAt: string
  _count: {
    bookings: number
    reviews: number
    ownedHostels?: number
  }
}

interface Hostel {
  id: string
  name: string
  address: string
  isActive: boolean
  averageRating: number
  reviewCount: number
  createdAt: string
  owner: {
    firstName: string
    lastName: string
    isVerified: boolean
  }
  university?: {
    name: string
    shortCode: string
  }
  _count: {
    bookings: number
    reviews: number
    roomTypes: number
  }
}

interface Booking {
  id: string
  status: "pending" | "confirmed" | "cancelled" | "completed"
  totalPrice: number
  startDate: string
  endDate: string
  createdAt: string
  student: {
    firstName: string
    lastName: string
    email: string
  }
  hostel: {
    name: string
    address: string
    owner: {
      firstName: string
      lastName: string
    }
  }
  roomType: {
    name: string
    pricePerMonth: number
  }
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [hostels, setHostels] = useState<Hostel[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
      return
    }
    if (session.user.role !== "admin") {
      router.push("/")
      return
    }

    fetchDashboardData()
  }, [session, status, router])

  const fetchDashboardData = async () => {
    setLoading(true)
    setError("")

    try {
      // Fetch stats
      const statsResponse = await fetch("/api/admin/stats")
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Fetch users
      const usersResponse = await fetch("/api/admin/users")
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData)
      }

      // Fetch hostels
      const hostelsResponse = await fetch("/api/admin/hostels")
      if (hostelsResponse.ok) {
        const hostelsData = await hostelsResponse.json()
        setHostels(hostelsData)
      }

      // Fetch bookings
      const bookingsResponse = await fetch("/api/admin/bookings")
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json()
        setBookings(bookingsData.bookings)
      }

    } catch (error) {
      setError("Failed to load dashboard data")
      console.error("Error fetching admin data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserVerification = async (userId: string, verified: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isVerified: verified }),
      })

      if (response.ok) {
        fetchDashboardData()
      } else {
        throw new Error("Failed to update user verification")
      }
    } catch (error) {
      setError("Failed to update user verification")
      console.error("Error updating user:", error)
    }
  }

  const handleHostelStatus = async (hostelId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/hostels/${hostelId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      })

      if (response.ok) {
        fetchDashboardData()
      } else {
        throw new Error("Failed to update hostel status")
      }
    } catch (error) {
      setError("Failed to update hostel status")
      console.error("Error updating hostel:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "text-green-600 bg-green-100"
      case "pending": return "text-yellow-600 bg-yellow-100"
      case "cancelled": return "text-red-600 bg-red-100"
      case "completed": return "text-blue-600 bg-blue-100"
      case "active": return "text-green-600 bg-green-100"
      case "inactive": return "text-gray-600 bg-gray-100"
      default: return "text-gray-600 bg-gray-100"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
      case "completed":
      case "active": return <CheckCircle className="w-4 h-4" />
      case "pending": return <Clock className="w-4 h-4" />
      case "cancelled":
      case "inactive": return <XCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = filterRole === "all" || user.role === filterRole
    return matchesSearch && matchesRole
  })

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = `${booking.student.firstName} ${booking.student.lastName} ${booking.hostel.name}`.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || booking.status === filterStatus
    return matchesSearch && matchesStatus
  })

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={fetchDashboardData}
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center text-blue-600 hover:text-blue-700">
                <Building className="w-6 h-6 mr-2" />
                Uni-Nest Admin
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <Settings className="w-5 h-5" />
                Settings
              </button>
              <button 
                onClick={() => {
                  // Handle logout
                  router.push("/")
                }}
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">
                Platform overview and management
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">System Status</div>
              <div className="font-medium text-green-600 flex items-center gap-1">
                <Shield className="w-4 h-4" />
                All Systems Operational
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalUsers}</p>
                  <p className="text-xs text-green-600">+{stats.monthlyGrowth}% this month</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Hostels</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalHostels}</p>
                  <p className="text-xs text-gray-500">{stats.pendingVerifications} pending</p>
                </div>
                <Building className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalBookings}</p>
                  <p className="text-xs text-gray-500">{stats.activeBookings} active</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-orange-600">
                    UGX {stats.totalRevenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">Avg rating: {stats.averageRating.toFixed(1)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b">
            <div className="flex">
              {["overview", "users", "hostels", "bookings"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 font-medium capitalize ${
                    activeTab === tab
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Recent Activity */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {bookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            booking.status === "confirmed" ? "bg-green-500" :
                            booking.status === "pending" ? "bg-yellow-500" :
                            booking.status === "cancelled" ? "bg-red-500" : "bg-blue-500"
                          }`} />
                          <div>
                            <p className="font-medium">{booking.student.firstName} {booking.student.lastName}</p>
                            <p className="text-sm text-gray-600">
                              Booked {booking.hostel.name} - {booking.roomType.name}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">UGX {booking.totalPrice.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">{new Date(booking.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                      href="/admin/users/new"
                      className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <Users className="w-6 h-6 text-blue-600" />
                      <div>
                        <div className="font-medium">Manage Users</div>
                        <div className="text-sm text-gray-600">View and edit user accounts</div>
                      </div>
                    </Link>
                    
                    <Link
                      href="/admin/hostels/new"
                      className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <Building className="w-6 h-6 text-green-600" />
                      <div>
                        <div className="font-medium">Manage Hostels</div>
                        <div className="text-sm text-gray-600">Approve and manage listings</div>
                      </div>
                    </Link>
                    
                    <Link
                      href="/admin/analytics"
                      className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <BarChart3 className="w-6 h-6 text-purple-600" />
                      <div>
                        <div className="font-medium">View Analytics</div>
                        <div className="text-sm text-gray-600">Platform statistics</div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">User Management</h3>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Roles</option>
                      <option value="student">Students</option>
                      <option value="hostel_owner">Hostel Owners</option>
                      <option value="admin">Admins</option>
                    </select>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">User</th>
                        <th className="text-left py-3 px-4">Role</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Activity</th>
                        <th className="text-left py-3 px-4">Joined</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{user.firstName} {user.lastName}</p>
                              <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              user.role === "admin" ? "bg-purple-100 text-purple-700" :
                              user.role === "hostel_owner" ? "bg-blue-100 text-blue-700" :
                              "bg-green-100 text-green-700"
                            }`}>
                              {user.role.replace("_", " ")}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {user.isVerified ? (
                                <div className="flex items-center text-green-600">
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Verified
                                </div>
                              ) : (
                                <div className="flex items-center text-yellow-600">
                                  <AlertCircle className="w-4 h-4 mr-1" />
                                  Pending
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm">
                              <p>{user._count.bookings} bookings</p>
                              <p>{user._count.reviews} reviews</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm text-gray-600">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {!user.isVerified && (
                                <button
                                  onClick={() => handleUserVerification(user.id, true)}
                                  className="text-green-600 hover:text-green-700"
                                  title="Verify User"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              )}
                              <button className="text-blue-600 hover:text-blue-700">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="text-red-600 hover:text-red-700">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "hostels" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Hostel Management</h3>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search hostels..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {hostels.map((hostel) => (
                    <div key={hostel.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{hostel.name}</h4>
                          <p className="text-sm text-gray-600">{hostel.address}</p>
                        </div>
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          hostel.isActive ? "text-green-600 bg-green-100" : "text-gray-600 bg-gray-100"
                        }`}>
                          {getStatusIcon(hostel.isActive ? "active" : "inactive")}
                          {hostel.isActive ? "Active" : "Inactive"}
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Owner:</span>
                          <span>{hostel.owner.firstName} {hostel.owner.lastName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Rating:</span>
                          <span>{hostel.averageRating.toFixed(1)} ({hostel.reviewCount})</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Bookings:</span>
                          <span>{hostel._count.bookings}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <button className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                          <Eye className="w-4 h-4 inline mr-1" />
                          View
                        </button>
                        <button
                          onClick={() => handleHostelStatus(hostel.id, !hostel.isActive)}
                          className={`flex-1 px-3 py-1 text-sm rounded ${
                            hostel.isActive 
                              ? "bg-red-600 text-white hover:bg-red-700" 
                              : "bg-green-600 text-white hover:bg-green-700"
                          }`}
                        >
                          {hostel.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "bookings" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Booking Management</h3>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search bookings..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Student</th>
                        <th className="text-left py-3 px-4">Hostel</th>
                        <th className="text-left py-3 px-4">Room</th>
                        <th className="text-left py-3 px-4">Dates</th>
                        <th className="text-left py-3 px-4">Price</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map((booking) => (
                        <tr key={booking.id} className="border-b">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{booking.student.firstName} {booking.student.lastName}</p>
                              <p className="text-sm text-gray-600">{booking.student.email}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{booking.hostel.name}</p>
                              <p className="text-sm text-gray-600">{booking.hostel.address}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium">{booking.roomType.name}</p>
                            <p className="text-sm text-gray-600">UGX {booking.roomType.pricePerMonth.toLocaleString()}/mo</p>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm">
                              <p>{new Date(booking.startDate).toLocaleDateString()}</p>
                              <p className="text-gray-600">{new Date(booking.endDate).toLocaleDateString()}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium">UGX {booking.totalPrice.toLocaleString()}</p>
                          </td>
                          <td className="py-3 px-4">
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                              {getStatusIcon(booking.status)}
                              {booking.status}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button className="text-blue-600 hover:text-blue-700">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="text-green-600 hover:text-green-700">
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button className="text-red-600 hover:text-red-700">
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
