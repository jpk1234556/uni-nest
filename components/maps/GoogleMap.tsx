"use client"

import { useEffect, useRef, useState } from "react"

interface GoogleMapProps {
  latitude?: number
  longitude?: number
  address?: string
  zoom?: number
  markers?: Array<{
    latitude: number
    longitude: number
    title?: string
    description?: string
  }>
  className?: string
  height?: string
}

declare global {
  interface Window {
    google: any
  }
}

export default function GoogleMap({ 
  latitude, 
  longitude, 
  address, 
  zoom = 15, 
  markers = [], 
  className = "", 
  height = "400px" 
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google) {
        setIsLoaded(true)
        return
      }

      const script = document.createElement("script")
      script.async = true
      script.defer = true
      
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (!apiKey) {
        setError("Google Maps API key is not configured")
        return
      }

      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`
      
      window.initGoogleMaps = () => {
        setIsLoaded(true)
      }

      script.onerror = () => {
        setError("Failed to load Google Maps")
      }

      document.head.appendChild(script)

      return () => {
        document.head.removeChild(script)
        delete window.initGoogleMaps
      }
    }

    loadGoogleMaps()
  }, [])

  useEffect(() => {
    if (!isLoaded || !mapRef.current) return

    const mapOptions = {
      zoom,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ]
    }

    let map: any

    if (latitude && longitude) {
      map = new window.google.maps.Map(mapRef.current, {
        ...mapOptions,
        center: { lat: latitude, lng: longitude }
      })

      // Add main marker
      new window.google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map,
        title: "Hostel Location",
        animation: window.google.maps.Animation.DROP
      })
    } else if (address) {
      const geocoder = new window.google.maps.Geocoder()
      
      geocoder.geocode({ address }, (results: any, status: any) => {
        if (status === "OK" && results[0]) {
          map = new window.google.maps.Map(mapRef.current, {
            ...mapOptions,
            center: results[0].geometry.location
          })

          new window.google.maps.Marker({
            position: results[0].geometry.location,
            map,
            title: "Hostel Location",
            animation: window.google.maps.Animation.DROP
          })
        } else {
          setError("Could not find location for the provided address")
        }
      })
    } else {
      // Default center (Uganda)
      map = new window.google.maps.Map(mapRef.current, {
        ...mapOptions,
        center: { lat: 0.3476, lng: 32.5825 }
      })
    }

    // Add additional markers
    markers.forEach(marker => {
      new window.google.maps.Marker({
        position: { lat: marker.latitude, lng: marker.longitude },
        map,
        title: marker.title,
        animation: window.google.maps.Animation.DROP
      })
    })

  }, [isLoaded, latitude, longitude, address, zoom, markers])

  if (error) {
    return (
      <div 
        className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center text-gray-500">
          <div className="w-12 h-12 mx-auto mb-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <p className="text-sm">Map unavailable</p>
          <p className="text-xs mt-1">{error}</p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div 
        className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={mapRef} 
      className={`rounded-lg overflow-hidden ${className}`}
      style={{ height }}
    />
  )
}
