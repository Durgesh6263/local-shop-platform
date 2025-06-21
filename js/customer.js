// Customer page functionality

let filteredShops = []
let currentView = "grid"
const currentFilters = {
  category: "",
  range: 5,
  sort: "distance",
  quick: "all",
}

document.addEventListener("DOMContentLoaded", () => {
  initializeCustomerPage()
})

function initializeCustomerPage() {
  // Check if there's a selected category from home page
  const selectedCategory = localStorage.getItem("selectedCategory")
  if (selectedCategory) {
    document.getElementById("categoryFilter").value = selectedCategory
    localStorage.removeItem("selectedCategory")
  }

  // Load shops and display
  loadShops()
  setupCustomerEventListeners()

  // Try to get user's location
  getCurrentLocation()
}

function setupCustomerEventListeners() {
  // Filter change events
  document.getElementById("categoryFilter")?.addEventListener("change", filterShops)
  document.getElementById("rangeFilter")?.addEventListener("change", filterShops)
  document.getElementById("sortFilter")?.addEventListener("change", filterShops)

  // Search button
  const searchBtn = document.querySelector(".search-btn")
  searchBtn?.addEventListener("click", searchShops)

  // Location input enter key
  const locationInput = document.getElementById("locationInput")
  locationInput?.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      searchShops()
    }
  })
}

function loadShops() {
  const shops = JSON.parse(localStorage.getItem("shops")) || []
  filteredShops = shops.filter((shop) => shop.status === "approved")
  displayShops()
  updateResultsCount()
}

function getCurrentLocation() {
  const locationBtn = document.querySelector(".location-btn")
  if (locationBtn) {
    locationBtn.addEventListener("click", function () {
      if (navigator.geolocation) {
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'

        navigator.geolocation.getCurrentPosition(
          (position) => {
            window.ShopConnect.currentLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }

            // Update location input with coordinates (in real app, use reverse geocoding)
            document.getElementById("locationInput").value =
              `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`

            this.innerHTML = '<i class="fas fa-check"></i>'
            window.ShopConnect.showNotification("Location detected successfully!", "success")

            // Filter shops by location
            filterShops()

            setTimeout(() => {
              this.innerHTML = '<i class="fas fa-crosshairs"></i>'
            }, 2000)
          },
          (error) => {
            this.innerHTML = '<i class="fas fa-crosshairs"></i>'
            window.ShopConnect.showNotification("Unable to get location. Please enter manually.", "error")
          },
        )
      } else {
        window.ShopConnect.showNotification("Geolocation is not supported by this browser.", "error")
      }
    })
  }
}

function searchShops() {
  const location = document.getElementById("locationInput")?.value

  if (!location.trim()) {
    window.ShopConnect.showNotification("Please enter your location", "warning")
    return
  }

  // Show loading state
  showLoadingState()

  // Simulate search delay
  setTimeout(() => {
    filterShops()
    hideLoadingState()
  }, 1000)
}

function filterShops() {
  const category = document.getElementById("categoryFilter")?.value || ""
  const range = Number.parseInt(document.getElementById("rangeFilter")?.value || "5")
  const sort = document.getElementById("sortFilter")?.value || "distance"

  // Get all approved shops
  let shops = JSON.parse(localStorage.getItem("shops")) || []
  shops = shops.filter((shop) => shop.status === "approved")

  // Apply category filter
  if (category) {
    shops = shops.filter((shop) => shop.category === category)
  }

  // Apply quick filters
  if (currentFilters.quick !== "all") {
    shops = applyQuickFilter(shops, currentFilters.quick)
  }

  // Apply location filter (simplified)
  if (window.ShopConnect.currentLocation && range) {
    shops = shops.filter((shop) => {
      const distance = window.ShopConnect.calculateDistance(
        window.ShopConnect.currentLocation.lat,
        window.ShopConnect.currentLocation.lng,
        shop.location.lat,
        shop.location.lng,
      )
      shop.distance = distance.toFixed(1)
      return distance <= range
    })
  } else {
    // Add random distances for demo
    shops.forEach((shop) => {
      shop.distance = (Math.random() * range).toFixed(1)
    })
  }

  // Apply sorting
  shops = sortShops(shops, sort)

  filteredShops = shops
  displayShops()
  updateResultsCount()
}

function applyQuickFilter(shops, filter) {
  switch (filter) {
    case "open":
      // Filter shops that are currently open (simplified)
      return shops.filter((shop) => {
        const now = new Date()
        const hour = now.getHours()
        return hour >= 9 && hour <= 20 // Assume most shops open 9-8
      })
    case "home-service":
      return shops.filter((shop) => shop.homeService)
    case "top-rated":
      return shops.filter((shop) => shop.rating >= 4.0)
    case "offers":
      // Simulate shops with offers
      return shops.filter(() => Math.random() > 0.7)
    default:
      return shops
  }
}

function sortShops(shops, sortBy) {
  switch (sortBy) {
    case "rating":
      return shops.sort((a, b) => b.rating - a.rating)
    case "reviews":
      return shops.sort((a, b) => b.reviews - a.reviews)
    case "newest":
      return shops.sort((a, b) => new Date(b.registeredAt || 0) - new Date(a.registeredAt || 0))
    case "distance":
    default:
      return shops.sort((a, b) => Number.parseFloat(a.distance || 0) - Number.parseFloat(b.distance || 0))
  }
}

function setQuickFilter(filter) {
  currentFilters.quick = filter

  // Update active filter chip
  document.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.classList.remove("active")
  })
  event.target.classList.add("active")

  filterShops()
}

function setView(view) {
  currentView = view

  // Update view toggle buttons
  document.querySelectorAll(".view-btn").forEach((btn) => {
    btn.classList.remove("active")
  })
  event.target.classList.add("active")

  // Update grid class
  const shopsGrid = document.getElementById("shopsGrid")
  if (shopsGrid) {
    if (view === "list") {
      shopsGrid.classList.add("list-view")
    } else {
      shopsGrid.classList.remove("list-view")
    }
  }
}

function displayShops() {
  const shopsGrid = document.getElementById("shopsGrid")
  const noResults = document.getElementById("noResults")

  if (!shopsGrid) return

  if (filteredShops.length === 0) {
    shopsGrid.style.display = "none"
    if (noResults) noResults.style.display = "block"
    return
  }

  shopsGrid.style.display = "grid"
  if (noResults) noResults.style.display = "none"

  shopsGrid.innerHTML = filteredShops.map((shop) => createShopCard(shop)).join("")
}

function createShopCard(shop) {
  const badgeText = shop.homeService
    ? "Home Service"
    : shop.deliveryService
      ? "Delivery"
      : shop.emergencyService
        ? "24/7"
        : ""

  return `
        <div class="shop-card" onclick="viewShopProfile('${shop.id}')">
            <div class="shop-image">
                <i class="fas fa-${window.ShopConnect.getShopIcon(shop.category)}"></i>
                ${badgeText ? `<div class="shop-badge">${badgeText}</div>` : ""}
            </div>
            <div class="shop-info">
                <div class="shop-header">
                    <h3 class="shop-name">${shop.name}</h3>
                    <span class="shop-category">${shop.category}</span>
                </div>
                <div class="shop-rating">
                    <div class="stars">${"★".repeat(Math.floor(shop.rating))}${"☆".repeat(5 - Math.floor(shop.rating))}</div>
                    <span class="rating-text">(${shop.reviews} reviews)</span>
                </div>
                <p class="shop-description">${shop.description}</p>
                <div class="shop-details">
                    <div class="shop-detail-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${shop.distance || "2.5"} km away</span>
                    </div>
                    <div class="shop-detail-item">
                        <i class="fas fa-clock"></i>
                        <span>${shop.timings.split(":")[0]}...</span>
                    </div>
                </div>
                <div class="shop-actions">
                    <button class="btn btn-primary btn-small" onclick="event.stopPropagation(); viewShopProfile('${shop.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-secondary btn-small" onclick="event.stopPropagation(); bookService('${shop.id}')">
                        <i class="fas fa-calendar"></i> Book
                    </button>
                    ${
                      shop.whatsapp
                        ? `
                        <button class="btn btn-success btn-small" onclick="event.stopPropagation(); contactShop('whatsapp', '${shop.whatsapp}')">
                            <i class="fab fa-whatsapp"></i>
                        </button>
                    `
                        : ""
                    }
                </div>
            </div>
        </div>
    `
}

function updateResultsCount() {
  const resultsCount = document.getElementById("resultsCount")
  if (resultsCount) {
    const count = filteredShops.length
    resultsCount.textContent = `${count} shop${count !== 1 ? "s" : ""} found`
  }
}

function showLoadingState() {
  const loadingState = document.getElementById("loadingState")
  const shopsContainer = document.getElementById("shopsContainer")

  if (loadingState) loadingState.style.display = "flex"
  if (shopsContainer) shopsContainer.style.display = "none"
}

function hideLoadingState() {
  const loadingState = document.getElementById("loadingState")
  const shopsContainer = document.getElementById("shopsContainer")

  if (loadingState) loadingState.style.display = "none"
  if (shopsContainer) shopsContainer.style.display = "block"
}

function expandSearch() {
  // Increase search range
  const rangeFilter = document.getElementById("rangeFilter")
  if (rangeFilter) {
    const currentRange = Number.parseInt(rangeFilter.value)
    const newRange = Math.min(currentRange * 2, 20)
    rangeFilter.value = newRange
    filterShops()
    window.ShopConnect.showNotification(`Search expanded to ${newRange} km`, "info")
  }
}

function viewShopProfile(shopId) {
  // Store shop ID and redirect to shop profile page
  localStorage.setItem("selectedShopId", shopId)
  window.location.href = "shop-profile.html"
}

function bookService(shopId) {
  // Store shop ID and redirect to booking page
  localStorage.setItem("selectedShopId", shopId)
  window.location.href = "booking.html"
}

function contactShop(method, contact) {
  if (method === "call") {
    window.open(`tel:${contact}`)
  } else if (method === "whatsapp") {
    const message = encodeURIComponent(
      "Hi, I found your shop on ShopConnect. I would like to know more about your services.",
    )
    window.open(`https://wa.me/${contact.replace(/[^0-9]/g, "")}?text=${message}`)
  }
}

// Modal functions
function closeModal() {
  document.getElementById("shopModal").style.display = "none"
}

function closeContactModal() {
  document.getElementById("contactModal").style.display = "none"
}
