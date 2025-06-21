// Main JavaScript file for ShopConnect platform

// Global variables
const currentLocation = null
let shops = []
let currentUser = null

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
  loadSampleData()
  setupEventListeners()
})

// Initialize application
function initializeApp() {
  // Load data from localStorage
  shops = JSON.parse(localStorage.getItem("shops")) || []
  currentUser = JSON.parse(localStorage.getItem("currentUser")) || null

  // Update UI based on current state
  updateUI()

  // Set minimum date for booking forms
  setMinimumDates()
}

// Setup event listeners
function setupEventListeners() {
  // Close modals when clicking outside
  window.addEventListener("click", (event) => {
    const modals = document.querySelectorAll(".modal")
    modals.forEach((modal) => {
      if (event.target === modal) {
        modal.style.display = "none"
      }
    })
  })

  // Handle escape key for modals
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAllModals()
    }
  })

  // Handle form submissions
  const forms = document.querySelectorAll("form")
  forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      if (!validateForm(form)) {
        event.preventDefault()
      }
    })
  })
}

// Update UI based on current state
function updateUI() {
  // Update navigation if user is logged in
  updateNavigation()

  // Update any user-specific content
  updateUserContent()
}

// Update navigation based on user state
function updateNavigation() {
  // This can be expanded based on authentication state
  const navLinks = document.querySelectorAll(".nav-link")
  navLinks.forEach((link) => {
    link.addEventListener("click", function (event) {
      // Remove active class from all links
      navLinks.forEach((l) => l.classList.remove("active"))
      // Add active class to clicked link
      this.classList.add("active")
    })
  })
}

// Update user-specific content
function updateUserContent() {
  // Update any user-specific elements
  if (currentUser) {
    // Show user-specific content
    console.log("User logged in:", currentUser.name)
  }
}

// Set minimum dates for date inputs
function setMinimumDates() {
  const dateInputs = document.querySelectorAll('input[type="date"]')
  const today = new Date().toISOString().split("T")[0]

  dateInputs.forEach((input) => {
    input.min = today
  })
}

// Utility Functions

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Format date
function formatDate(date) {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
  return new Date(date).toLocaleDateString("en-IN", options)
}

// Format time
function formatTime(time) {
  const [hours, minutes] = time.split(":")
  const hour = Number.parseInt(hours)
  const ampm = hour >= 12 ? "PM" : "AM"
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

// Calculate distance between two points (simplified)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return distance
}

// Get shop icon based on category
function getShopIcon(category) {
  const icons = {
    electronics: "tv",
    kirana: "shopping-basket",
    repair: "tools",
    tailor: "cut",
    mobile: "mobile-alt",
    medical: "pills",
    restaurant: "utensils",
    beauty: "cut",
    automotive: "car",
  }
  return icons[category] || "store"
}

// Validate form
function validateForm(form) {
  const requiredFields = form.querySelectorAll("[required]")
  let isValid = true

  requiredFields.forEach((field) => {
    if (!field.value.trim()) {
      showFieldError(field, "This field is required")
      isValid = false
    } else {
      clearFieldError(field)
    }
  })

  // Validate email fields
  const emailFields = form.querySelectorAll('input[type="email"]')
  emailFields.forEach((field) => {
    if (field.value && !isValidEmail(field.value)) {
      showFieldError(field, "Please enter a valid email address")
      isValid = false
    }
  })

  // Validate phone fields
  const phoneFields = form.querySelectorAll('input[type="tel"]')
  phoneFields.forEach((field) => {
    if (field.value && !isValidPhone(field.value)) {
      showFieldError(field, "Please enter a valid phone number")
      isValid = false
    }
  })

  return isValid
}

// Show field error
function showFieldError(field, message) {
  clearFieldError(field)

  field.style.borderColor = "#ef4444"

  const errorDiv = document.createElement("div")
  errorDiv.className = "field-error"
  errorDiv.style.color = "#ef4444"
  errorDiv.style.fontSize = "0.75rem"
  errorDiv.style.marginTop = "0.25rem"
  errorDiv.textContent = message

  field.parentNode.appendChild(errorDiv)
}

// Clear field error
function clearFieldError(field) {
  field.style.borderColor = ""

  const existingError = field.parentNode.querySelector(".field-error")
  if (existingError) {
    existingError.remove()
  }
}

// Validate email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate phone
function isValidPhone(phone) {
  const phoneRegex = /^[+]?[0-9\s\-$$$$]{10,}$/
  return phoneRegex.test(phone)
}

// Show notification
function showNotification(message, type = "info") {
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="notification-close">&times;</button>
        </div>
    `

  // Add notification styles if not already present
  if (!document.querySelector(".notification-styles")) {
    const styles = document.createElement("style")
    styles.className = "notification-styles"
    styles.textContent = `
            .notification {
                position: fixed;
                top: 90px;
                right: 20px;
                background: white;
                border-radius: 8px;
                padding: 1rem;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                border-left: 4px solid #3b82f6;
                z-index: 2000;
                max-width: 350px;
                animation: slideIn 0.3s ease-out;
            }
            .notification.success { border-left-color: #10b981; }
            .notification.error { border-left-color: #ef4444; }
            .notification.warning { border-left-color: #f59e0b; }
            .notification-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 1rem;
            }
            .notification-close {
                background: none;
                border: none;
                font-size: 1.2rem;
                cursor: pointer;
                color: #64748b;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `
    document.head.appendChild(styles)
  }

  document.body.appendChild(notification)

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove()
    }
  }, 5000)
}

// Close all modals
function closeAllModals() {
  const modals = document.querySelectorAll(".modal")
  modals.forEach((modal) => {
    modal.style.display = "none"
  })
}

// Search by category (for home page category cards)
function searchByCategory(category) {
  // Store the selected category and redirect to customer page
  localStorage.setItem("selectedCategory", category)
  window.location.href = "customer.html"
}

// Load sample data
function loadSampleData() {
  if (shops.length === 0) {
    const sampleShops = [
      {
        id: "shop1",
        name: "Tech World Electronics",
        category: "electronics",
        description: "Latest smartphones, laptops, and electronic accessories with expert repair services",
        owner: "Rajesh Kumar",
        phone: "+91-9876543210",
        whatsapp: "+91-9876543210",
        email: "techworld@example.com",
        address: "Shop 15, Electronics Market, Nehru Place",
        city: "Delhi",
        pincode: "110019",
        state: "Delhi",
        timings: "Mon-Sat: 10 AM - 8 PM",
        homeService: true,
        onlinePayment: true,
        deliveryService: true,
        emergencyService: false,
        rating: 4.5,
        reviews: 23,
        status: "approved",
        location: { lat: 28.6139, lng: 77.209 },
        images: [],
        services: [
          { name: "Mobile Repair", price: 500 },
          { name: "Laptop Repair", price: 1500 },
          { name: "Screen Replacement", price: 2000 },
        ],
      },
      {
        id: "shop2",
        name: "Fresh Mart Kirana",
        category: "kirana",
        description: "Fresh groceries, vegetables, and daily essentials with home delivery",
        owner: "Sunita Sharma",
        phone: "+91-9876543211",
        whatsapp: "+91-9876543211",
        email: "freshmart@example.com",
        address: "45, Main Market Road, Lajpat Nagar",
        city: "Delhi",
        pincode: "110024",
        state: "Delhi",
        timings: "Daily: 7 AM - 10 PM",
        homeService: true,
        onlinePayment: false,
        deliveryService: true,
        emergencyService: true,
        rating: 4.2,
        reviews: 45,
        status: "approved",
        location: { lat: 28.6129, lng: 77.208 },
        images: [],
        services: [
          { name: "Grocery Delivery", price: 50 },
          { name: "Vegetable Delivery", price: 30 },
        ],
      },
      {
        id: "shop3",
        name: "Quick Fix Repair Center",
        category: "repair",
        description: "Professional repair services for home appliances, electronics, and more",
        owner: "Amit Singh",
        phone: "+91-9876543212",
        whatsapp: "+91-9876543212",
        email: "quickfix@example.com",
        address: "12, Service Lane, Karol Bagh",
        city: "Delhi",
        pincode: "110005",
        state: "Delhi",
        timings: "Mon-Sat: 9 AM - 7 PM",
        homeService: true,
        onlinePayment: true,
        deliveryService: false,
        emergencyService: true,
        rating: 4.7,
        reviews: 67,
        status: "approved",
        location: { lat: 28.6149, lng: 77.21 },
        images: [],
        services: [
          { name: "AC Repair", price: 800 },
          { name: "Washing Machine Repair", price: 600 },
          { name: "Refrigerator Repair", price: 1000 },
        ],
      },
    ]

    shops = sampleShops
    localStorage.setItem("shops", JSON.stringify(shops))
  }
}

// Export functions for use in other files
window.ShopConnect = {
  generateId,
  formatDate,
  formatTime,
  calculateDistance,
  getShopIcon,
  showNotification,
  validateForm,
  isValidEmail,
  isValidPhone,
  shops,
  currentUser,
  currentLocation,
}
