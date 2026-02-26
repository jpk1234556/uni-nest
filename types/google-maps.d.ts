declare global {
  interface Window {
    google: any
    initGoogleMaps?: () => void
  }
}

declare namespace google.maps {
  class Map {
    constructor(element: HTMLElement, options: MapOptions)
  }

  interface MapOptions {
    zoom: number
    center: LatLng | LatLngLiteral
    mapTypeControl?: boolean
    streetViewControl?: boolean
    fullscreenControl?: boolean
    styles?: MapTypeStyle[]
  }

  class Marker {
    constructor(options: MarkerOptions)
  }

  interface MarkerOptions {
    position: LatLng | LatLngLiteral
    map?: Map
    title?: string
    animation?: Animation
  }

  class LatLng {
    constructor(lat: number, lng: number)
  }

  interface LatLngLiteral {
    lat: number
    lng: number
  }

  enum Animation {
    DROP = 1,
    BOUNCE = 2
  }

  interface MapTypeStyle {
    featureType?: string
    elementType?: string
    stylers: Array<{ [key: string]: any }>
  }

  namespace places {
    class AutocompleteService {
      getPlacePredictions(request: AutocompletionRequest, callback: (predictions: AutocompletePrediction[] | null, status: PlacesServiceStatus) => void): void
    }

    interface AutocompletionRequest {
      input: string
      types?: string[]
      componentRestrictions?: { country: string }
    }

    interface AutocompletePrediction {
      place_id: string
      description: string
      structured_formatting: {
        main_text: string
        secondary_text: string
      }
    }

    class Autocomplete {
      constructor(inputField: HTMLInputElement, options: AutocompleteOptions)
      addListener(eventName: string, listener: () => void): void
      getPlace(): PlaceResult
    }

    interface AutocompleteOptions {
      types?: string[]
      componentRestrictions?: { country: string }
      fields?: string[]
    }

    class PlacesService {
      constructor(mapContainer: HTMLDivElement)
      getDetails(request: PlaceDetailsRequest, callback: (result: PlaceResult | null, status: PlacesServiceStatus) => void): void
    }

    interface PlaceDetailsRequest {
      placeId: string
    }

    interface PlaceResult {
      place_id: string
      formatted_address?: string
      name?: string
      geometry?: {
        location: LatLng
      }
    }

    enum PlacesServiceStatus {
      OK = "OK"
    }
  }

  class Geocoder {
    geocode(request: GeocoderRequest, callback: (results: GeocoderResult[] | null, status: GeocoderStatus) => void): void
  }

  interface GeocoderRequest {
    address?: string
    location?: LatLng | LatLngLiteral
  }

  interface GeocoderResult {
    formatted_address: string
    place_id: string
    geometry: {
      location: LatLng
    }
  }

  enum GeocoderStatus {
    OK = "OK"
  }

  namespace event {
    function clearInstanceListeners(instance: any): void
  }
}

export {}
