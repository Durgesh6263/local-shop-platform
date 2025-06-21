// Location services functionality

class LocationService {
  constructor() {
    this.currentLocation = null
    this.watchId = null
  }

  // Get current position
  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"))
        return
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          }
          resolve(this.currentLocation)
        },
        (error) => {
          reject(this.handleLocationError(error))
        },
        options,
      )
    })
  }

  // Watch position changes
  watchPosition(callback) {
    if (!navigator.geolocation) {
      throw new Error("Geolocation is not supported by this browser")
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000, // 1 minute
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        }
        callback(this.currentLocation)
      },
      (error) => {
        callback(null, this.handleLocationError(error))
      },
      options,
    )

    return this.watchId
  }

  // Stop watching position
  stopWatching() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId)
      this.watchId = null
    }
  }

  // Handle location errors
  handleLocationError(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return new Error("Location access denied by user")
      case error.POSITION_UNAVAILABLE:
        return new Error("Location information is unavailable")
      case error.TIMEOUT:
        return new Error("Location request timed out")
      default:
        return new Error("An unknown error occurred while retrieving location")
    }
  }

  // Calculate distance between two points
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371 // Radius of the Earth in kilometers
    const dLat = this.toRadians(lat2 - lat1)
    const dLng = this.toRadians(lng2 - lng1)

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c

    return distance
  }

  // Convert degrees to radians
  toRadians(degrees) {
    return degrees * (Math.PI / 180)
  }

  // Get address from coordinates (mock implementation)
  async reverseGeocode(lat, lng) {
    // In a real application, you would use a geocoding service like Google Maps API
    // For demo purposes, we'll return a mock address
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockAddresses = [
          "Connaught Place, New Delhi, Delhi 110001",
          "Lajpat Nagar, New Delhi, Delhi 110024",
          "Karol Bagh, New Delhi, Delhi 110005",
          "Nehru Place, New Delhi, Delhi 110019",
          "Khan Market, New Delhi, Delhi 110003",
        ]

        const randomAddress = mockAddresses[Math.floor(Math.random() * mockAddresses.length)]
        resolve(randomAddress)
      }, 500)
    })
  }

  // Get coordinates from address (mock implementation)
  async geocode(address) {
    // In a real application, you would use a geocoding service
    // For demo purposes, we'll return mock coordinates
    return new Promise((resolve) => {
      setTimeout(() => {
        // Return coordinates around Delhi area
        const lat = 28.6139 + (Math.random() - 0.5) * 0.1
        const lng = 77.209 + (Math.random() - 0.5) * 0.1

        resolve({ lat, lng })
      }, 500)
    })
  }

  // Check if location is within service area
  isWithinServiceArea(lat, lng, serviceAreas) {
    return serviceAreas.some((area) => {
      const distance = this.calculateDistance(lat, lng, area.lat, area.lng)
      return distance <= area.radius
    })
  }

  // Get nearby shops within radius
  getNearbyShops(shops, radius = 5) {
    if (!this.currentLocation) {
      return shops
    }

    return shops
      .filter((shop) => {
        if (!shop.location) return false

        const distance = this.calculateDistance(
          this.currentLocation.lat,
          this.currentLocation.lng,
          shop.location.lat,
          shop.location.lng,
        )

        shop.distance = distance
        return distance <= radius
      })
      .sort((a, b) => a.distance - b.distance)
  }

  // Format distance for display
  formatDistance(distance) {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`
    } else {
      return `${distance.toFixed(1)} km`
    }
  }

  // Get location permission status
  async getPermissionStatus() {
    if (!navigator.permissions) {
      return "unsupported"
    }

    try {
      const permission = await navigator.permissions.query({ name: "geolocation" })
      return permission.state // 'granted', 'denied', or 'prompt'
    } catch (error) {
      return "unsupported"
    }
  }

  // Request location permission
  async requestPermission() {
    const status = await this.getPermissionStatus()

    if (status === "granted") {
      return true
    } else if (status === "denied") {
      return false
    } else {
      // Try to get location, which will prompt for permission
      try {
        await this.getCurrentPosition()
        return true
      } catch (error) {
        return false
      }
    }
  }
}

// Create global instance
window.locationService = new LocationService()

// Utility functions for location handling
window.getCurrentLocation = async () => {
  try {
    const location = await window.locationService.getCurrentPosition()
    window.ShopConnect.currentLocation = location
    return location
  } catch (error) {
    console.error("Error getting location:", error)
    throw error
  }
}

window.calculateDistance = (lat1, lng1, lat2, lng2) => window.locationService.calculateDistance(lat1, lng1, lat2, lng2)

window.formatDistance = (distance) => window.locationService.formatDistance(distance)

// Auto-detect location on page load for customer page
document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("customer.html")) {
    // Auto-request location permission and get current location
    window.locationService.requestPermission().then((granted) => {
      if (granted) {
        window
          .getCurrentLocation()
          .then((location) => {
            console.log("Location detected:", location)
            // Update location input if it exists
            const locationInput = document.getElementById("locationInput")
            if (locationInput && !locationInput.value) {
              window.locationService.reverseGeocode(location.lat, location.lng).then((address) => {
                locationInput.value = address
              })
            }
          })
          .catch((error) => {
            console.log("Could not get location:", error.message)
          })
      }
    })
  }
})
