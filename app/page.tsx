"use client";

import Link from "next/link";
import {
  Search,
  MapPin,
  Star,
  Wifi,
  Droplet,
  Zap,
  Shield,
  Users,
  Building,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Building className="w-8 h-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">Uni-Nest</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="#featured"
                className="text-gray-700 hover:text-blue-600"
              >
                Featured Hostels
              </Link>
              <Link
                href="#how-it-works"
                className="text-gray-700 hover:text-blue-600"
              >
                How It Works
              </Link>
              <Link
                href="/search"
                className="text-gray-700 hover:text-blue-600"
              >
                Search
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {status === "loading" ? (
                <div className="animate-pulse">
                  <div className="h-8 w-24 bg-gray-200 rounded"></div>
                </div>
              ) : session ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">
                    Welcome, {session.user.firstName}!
                  </span>
                  <Link
                    href={
                      session.user.role === "student"
                        ? "/dashboard/student"
                        : session.user.role === "hostel_owner"
                          ? "/dashboard/owner"
                          : session.user.role === "admin"
                            ? "/dashboard/admin"
                            : "/"
                    }
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Dashboard
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/auth/signin"
                    className="text-gray-700 hover:text-gray-900"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Find Your Perfect Student Home in Uganda
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Safe, affordable, and verified hostels near your university
            </p>

            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-2 flex">
                <div className="flex-1 flex">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search hostels near your university..."
                      className="w-full pl-10 pr-4 py-3 text-gray-900 focus:outline-none"
                    />
                  </div>
                  <select className="px-4 py-3 text-gray-700 border-l focus:outline-none">
                    <option>All Universities</option>
                    <option>Makerere University (MUK)</option>
                    <option>Kyambogo University (KYU)</option>
                    <option>MUBS</option>
                    <option>KIU</option>
                  </select>
                </div>
                <button
                  onClick={() => router.push("/search")}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
                >
                  Search Hostels
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Hostels */}
      <section id="featured" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Featured Hostels
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">
                    University Heights Hostel
                  </h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">0.5km from Makerere</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm ml-1">4.5 (23 reviews)</span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-blue-600">
                      UGX 250K
                    </span>
                    <span className="text-sm text-gray-600">/month</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <div className="flex items-center text-xs text-gray-600">
                      <Wifi className="w-3 h-3 mr-1" />
                      WiFi
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <Droplet className="w-3 h-3 mr-1" />
                      Water
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <Zap className="w-3 h-3 mr-1" />
                      Power
                    </div>
                  </div>
                  <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                    <Link href="/hostels/1" className="block">
                      View Details
                    </Link>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: Search,
                title: "Search",
                desc: "Find hostels near your university",
              },
              {
                icon: Building,
                title: "Compare",
                desc: "Compare prices and amenities",
              },
              { icon: Shield, title: "Book", desc: "Book securely online" },
              {
                icon: Users,
                title: "Move In",
                desc: "Move into your new home",
              },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "500+", label: "Hostels Listed" },
              { number: "10K+", label: "Students Helped" },
              { number: "15+", label: "Universities" },
              { number: "4.8", label: "Average Rating" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Building className="w-8 h-8 text-blue-400 mr-2" />
                <span className="text-xl font-bold">Uni-Nest</span>
              </div>
              <p className="text-gray-400">
                Your trusted partner for student accommodation in Uganda.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/search" className="hover:text-white">
                    Search Hostels
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">For Hostel Owners</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/hostels/register" className="hover:text-white">
                    List Your Hostel
                  </Link>
                </li>
                <li>
                  <Link href="/hostels/dashboard" className="hover:text-white">
                    Owner Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Uni-Nest. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
