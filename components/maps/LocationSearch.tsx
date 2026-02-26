"use client"

import { useState, useEffect, useRef } from "react"

interface LocationSearchProps {
  onLocationSelect: (location: {
    address: string
    latitude: number
    longitude: number
    placeId?: string
  }) => void
  placeholder?: string
  className?: string
  initialValue?: string
}

declare global {
  interface Window {
    google: any
  }
}

export default function LocationSearch({ 
  onLocationSelect, 
  placeholder = "Enter location...", 
  className = "",
  initialValue = ""
}: LocationSearchProps) {
  const [query, setQuery] = useState(initialValue)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [isMapsLoaded, setIsMapsLoaded] = useState(false)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any>(null)

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google) {
        setIsMapsLoaded(true)
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
        setIsMapsLoaded(true)
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
    if (!isMapsLoaded || !inputRef.current) return

    // Initialize autocomplete
    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ["geocode", "establishment"],
      componentRestrictions: { country: "ug" }, // Restrict to Uganda
      fields: ["place_id", "formatted_address", "geometry", "name"]
    })

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace()
      
      if (!place.geometry || !place.geometry.location) {
        setError("Please select a valid location")
        return
      }

      const location = {
        address: place.formatted_address || place.name,
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng(),
        placeId: place.place_id
      }

      setQuery(location.address)
      setSuggestions([])
      onLocationSelect(location)
    })

    autocompleteRef.current = autocomplete

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [isMapsLoaded, onLocationSelect])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setError("")
    
    if (value.length < 2) {
      setSuggestions([])
      return
    }

    // Manual search suggestions (fallback)
    if (isMapsLoaded) {
      const service = new window.google.maps.places.AutocompleteService()
      
      service.getPlacePredictions(
        {
          input: value,
          types: ["geocode", "establishment"],
          componentRestrictions: { country: "ug" }
        },
        (predictions: any, status: any) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            setSuggestions(predictions || [])
          } else {
            setSuggestions([])
          }
        }
      )
    }
  }

  const handleSuggestionClick = (suggestion: any) => {
    setQuery(suggestion.description)
    setSuggestions([])
    
    // Get detailed place information
    if (isMapsLoaded) {
      const service = new window.google.maps.places.PlacesService(document.createElement("div"))
      
      service.getDetails(
        { placeId: suggestion.place_id },
        (place: any, status: any) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place.geometry) {
            const location = {
              address: place.formatted_address,
              latitude: place.geometry.location.lat(),
              longitude: place.geometry.location.lng(),
              placeId: place.place_id
            }
            onLocationSelect(location)
          }
        }
      )
    }
  }

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        
        if (isMapsLoaded) {
          const geocoder = new window.google.maps.Geocoder()
          
          geocoder.geocode(
            { location: { lat: latitude, lng: longitude } },
            (results: any, status: any) => {
              if (status === "OK" && results[0]) {
                const location = {
                  address: results[0].formatted_address,
                  latitude,
                  longitude,
                  placeId: results[0].place_id
                }
                setQuery(location.address)
                onLocationSelect(location)
              } else {
                // Fallback to coordinates
                const location = {
                  address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                  latitude,
                  longitude
                }
                setQuery(location.address)
                onLocationSelect(location)
              }
            }
          )
        }
      },
      (error) => {
        setError("Unable to get your location. Please enable location services.")
      }
    )
  }

  if (error) {
    return (
      <div className={`relative ${className}`}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full px-4 py-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
        <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
          title="Use current location"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Suggestions dropdown */}
      {suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.place_id}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
            >
              <div className="font-medium">{suggestion.structured_formatting.main_text}</div>
              <div className="text-sm text-gray-600">{suggestion.structured_formatting.secondary_text}</div>
            </button>
          ))}
        </div>
      )}

      {!isMapsLoaded && !error && (
        <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 text-sm">
          Loading location search...
        </div>
      )}
    </div>
  )
}
