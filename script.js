// Global variables
let currentLocation = null
let shops = []
let pendingShops = []

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
  loadSampleData()
  setupEventListeners()
})

function initializeApp() {
  // Load data from localStorage
  shops = JSON.parse(localStorage.getItem("shops")) || []
  pendingShops = JSON.parse(localStorage.getItem("pendingShops")) || []

  // Update UI
  updateShopsDisplay()
  updateAdminDashboard()
  updateUserDashboard()
}

function setupEventListeners() {
  // Navigation toggle for mobile
  const navToggle = document.getElementById("navToggle")
  const navMenu = document.querySelector(".nav-menu")

  navToggle.addEventListener("click", () => {
    navMenu.classList.toggle("active")
  })

  // Form submissions
  document.getElementById("shopForm").addEventListener("submit", handleShopRegistration)
  document.getElementById("bookingForm").addEventListener("submit", handleServiceBooking)

  // Search functionality
  document.getElementById("categoryFilter").addEventListener("change", searchShops)
  document.getElementById("rangeFilter").addEventListener("change", searchShops)

  // WhatsApp message input
  document.getElementById("whatsappMessageInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendWhatsAppMessage()
    }
  })
}

// Navigation functions
function showSection(sectionId) {
  // Check authentication for protected sections
  if (sectionId === "admin" && !requireAuth("admin")) {
    return
  }

  if (sectionId === "dashboard" && !requireAuth()) {
    return
  }

  // Hide all sections
  document.querySelectorAll(".section").forEach((section) => {
    section.classList.remove("active")
  })

  // Show selected section
  document.getElementById(sectionId).classList.add("active")

  // Update navigation
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active")
  })

  if (event && event.target) {
    event.target.classList.add("active")
  }

  // Close mobile menu
  document.querySelector(".nav-menu").classList.remove("active")

  // Update dashboard content based on user role
  if (sectionId === "dashboard") {
    updateUserDashboard()
  }
}

// Location functions
function getCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }

        // Reverse geocoding (simplified)
        document.getElementById("locationInput").value =
          `Lat: ${currentLocation.lat.toFixed(4)}, Lng: ${currentLocation.lng.toFixed(4)}`

        searchShops()
        showNotification("Location detected successfully!", "success")
      },
      (error) => {
        showNotification("Unable to get your location. Please enter manually.", "error")
      },
    )
  } else {
    showNotification("Geolocation is not supported by this browser.", "error")
  }
}

// Shop search and display functions
function searchShops() {
  const category = document.getElementById("categoryFilter").value
  const range = Number.parseInt(document.getElementById("rangeFilter").value)
  const location = document.getElementById("locationInput").value

  let filteredShops = shops.filter((shop) => shop.status === "approved")

  // Filter by category
  if (category) {
    filteredShops = filteredShops.filter((shop) => shop.category === category)
  }

  // Filter by range (simplified - in real app, you'd use proper distance calculation)
  if (currentLocation && range) {
    filteredShops = filteredShops.filter((shop) => {
      const distance = calculateDistance(currentLocation, shop.location)
      return distance <= range
    })
  }

  updateShopsDisplay(filteredShops)
}

function updateShopsDisplay(shopsToShow = null) {
  const shopsGrid = document.getElementById("shopsGrid")
  const displayShops = shopsToShow || shops.filter((shop) => shop.status === "approved")

  if (displayShops.length === 0) {
    shopsGrid.innerHTML =
      '<div class="no-results"><p>No shops found in your area. Try expanding your search range.</p></div>'
    return
  }

  shopsGrid.innerHTML = displayShops
    .map(
      (shop) => `
        <div class="shop-card">
            <div class="shop-image">
                <i class="fas fa-${getShopIcon(shop.category)}"></i>
            </div>
            <div class="shop-info">
                <div class="shop-header">
                    <h3 class="shop-name">${shop.name}</h3>
                    <span class="shop-category">${shop.category}</span>
                </div>
                <div class="shop-rating">
                    <div class="stars">
                        ${"★".repeat(Math.floor(shop.rating))}${"☆".repeat(5 - Math.floor(shop.rating))}
                    </div>
                    <span>(${shop.reviews} reviews)</span>
                </div>
                <p class="shop-description">${shop.description}</p>
                <div class="shop-details">
                    <span><i class="fas fa-map-marker-alt"></i> ${shop.distance || "2.5"} km away</span>
                    <span><i class="fas fa-clock"></i> ${shop.timings}</span>
                </div>
                <div class="shop-actions">
                    <button class="btn btn-primary btn-small" onclick="viewShopDetails('${shop.id}')">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    <button class="btn btn-secondary btn-small" onclick="openBookingModal('${shop.id}')">
                        <i class="fas fa-calendar"></i> Book Service
                    </button>
                    ${
                      shop.whatsappNumber
                        ? `
                    <button class="btn btn-success btn-small" onclick="contactShop('whatsapp', '${shop.whatsappNumber}', '${shop.id}')">
                        <i class="fab fa-whatsapp"></i> WhatsApp
                    </button>
                    `
                        : ""
                    }
                </div>
            </div>
        </div>
    `,
    )
    .join("")
}

function getShopIcon(category) {
  const icons = {
    electronics: "tv",
    kirana: "shopping-basket",
    repair: "tools",
    tailor: "cut",
    mobile: "mobile-alt",
    medical: "pills",
    restaurant: "utensils",
  }
  return icons[category] || "store"
}

// Shop registration
function handleShopRegistration(e) {
  e.preventDefault()

  if (!requireAuth("shop_owner")) {
    return
  }

  const currentUser = authManager.getCurrentUser()
  const shopData = {
    id: generateId(),
    name: document.getElementById("shopName").value,
    category: document.getElementById("shopCategory").value,
    description: document.getElementById("shopDescription").value,
    owner: document.getElementById("ownerName").value,
    phone: document.getElementById("phoneNumber").value,
    whatsappNumber: document.getElementById("whatsappNumber").value,
    address: document.getElementById("shopAddress").value,
    pinCode: document.getElementById("pinCode").value,
    city: document.getElementById("city").value,
    timings: document.getElementById("shopTimings").value,
    homeService: document.getElementById("homeService").checked,
    onlinePayments: document.getElementById("onlinePayments").checked,
    status: "pending",
    ownerId: currentUser.id,
    registeredAt: new Date().toISOString(),
    rating: 4 + Math.random(),
    reviews: Math.floor(Math.random() * 50) + 5,
    location: {
      lat: 28.6139 + (Math.random() - 0.5) * 0.1,
      lng: 77.209 + (Math.random() - 0.5) * 0.1,
    },
  }

  pendingShops.push(shopData)
  localStorage.setItem("pendingShops", JSON.stringify(pendingShops))

  showNotification(
    "Shop registration submitted successfully! We will review and approve it within 24 hours.",
    "success",
  )
  document.getElementById("shopForm").reset()
  updateAdminDashboard()

  // Send notification to admin
  notificationManager.addNotification({
    title: "New Shop Registration",
    message: `${shopData.name} has registered for approval`,
    type: "shop",
    userId: "admin1", // Admin user ID
  })
}

// Service booking
function openBookingModal(shopId) {
  if (!requireAuth()) {
    return
  }

  const shop = shops.find((s) => s.id === shopId)
  if (shop) {
    document.getElementById("serviceType").value = shop.category
    document.getElementById("bookingModal").style.display = "block"
    document.getElementById("bookingModal").dataset.shopId = shopId

    // Pre-fill customer details if logged in
    const currentUser = authManager.getCurrentUser()
    if (currentUser) {
      document.getElementById("customerName").value = currentUser.name
      document.getElementById("customerPhone").value = currentUser.phone
    }
  }
}

function closeBookingModal() {
  document.getElementById("bookingModal").style.display = "none"
}

function handleServiceBooking(e) {
  e.preventDefault()

  const shopId = document.getElementById("bookingModal").dataset.shopId
  const currentUser = authManager.getCurrentUser()

  const bookingData = {
    id: generateId(),
    shopId: shopId,
    serviceType: document.getElementById("serviceType").value,
    date: document.getElementById("bookingDate").value,
    time: document.getElementById("bookingTime").value,
    customerName: document.getElementById("customerName").value,
    customerPhone: document.getElementById("customerPhone").value,
    notes: document.getElementById("bookingNotes").value,
    amount: Number.parseFloat(document.getElementById("serviceAmount").value) || 0,
    status: "pending",
    paymentStatus: "pending",
    userId: currentUser.id,
    bookedAt: new Date().toISOString(),
  }

  // Save booking
  const bookings = JSON.parse(localStorage.getItem("bookings")) || []
  bookings.push(bookingData)
  localStorage.setItem("bookings", JSON.stringify(bookings))

  showNotification("Service booked successfully! The shop owner will contact you soon.", "success")
  closeBookingModal()
  document.getElementById("bookingForm").reset()

  // Send notifications
  const shop = shops.find((s) => s.id === shopId)
  if (shop) {
    // Notify shop owner
    notificationManager.addNotification({
      title: "New Booking Received",
      message: `New ${bookingData.serviceType} booking from ${bookingData.customerName}`,
      type: "booking",
      userId: shop.ownerId,
    })

    // Send WhatsApp confirmation
    sendBookingConfirmation(bookingData)
  }

  updateUserDashboard()
}

// Shop details modal
function viewShopDetails(shopId) {
  const shop = shops.find((s) => s.id === shopId)
  if (shop) {
    document.getElementById("shopDetails").innerHTML = `
            <h2>${shop.name}</h2>
            <div class="shop-detail-content">
                <div class="shop-detail-image">
                    <i class="fas fa-${getShopIcon(shop.category)}"></i>
                </div>
                <div class="shop-detail-info">
                    <p><strong>Category:</strong> ${shop.category}</p>
                    <p><strong>Owner:</strong> ${shop.owner}</p>
                    <p><strong>Phone:</strong> ${shop.phone}</p>
                    <p><strong>Address:</strong> ${shop.address}, ${shop.city} - ${shop.pinCode}</p>
                    <p><strong>Timings:</strong> ${shop.timings}</p>
                    <p><strong>Home Service:</strong> ${shop.homeService ? "Available" : "Not Available"}</p>
                    <p><strong>Online Payments:</strong> ${shop.onlinePayments ? "Accepted" : "Not Available"}</p>
                    <p><strong>Description:</strong> ${shop.description}</p>
                    <div class="contact-buttons">
                        <button class="btn btn-primary" onclick="contactShop('call', '${shop.phone}')">
                            <i class="fas fa-phone"></i> Call
                        </button>
                        ${
                          shop.whatsappNumber
                            ? `
                        <button class="btn btn-success" onclick="contactShop('whatsapp', '${shop.whatsappNumber}', '${shop.id}')">
                            <i class="fab fa-whatsapp"></i> WhatsApp
                        </button>
                        `
                            : ""
                        }
                    </div>
                </div>
            </div>
        `
    document.getElementById("shopModal").style.display = "block"
  }
}

function closeModal() {
  document.getElementById("shopModal").style.display = "none"
}

// User Dashboard
function updateUserDashboard() {
  const currentUser = authManager.getCurrentUser()
  if (!currentUser) return

  const dashboardTitle = document.getElementById("dashboardTitle")
  const dashboardSubtitle = document.getElementById("dashboardSubtitle")
  const customerDashboard = document.getElementById("customerDashboard")
  const shopOwnerDashboard = document.getElementById("shopOwnerDashboard")

  // Hide all dashboard content
  customerDashboard.classList.remove("active")
  shopOwnerDashboard.classList.remove("active")

  if (currentUser.role === "customer") {
    dashboardTitle.textContent = "Customer Dashboard"
    dashboardSubtitle.textContent = "Manage your bookings and favorite shops"
    customerDashboard.classList.add("active")
    updateCustomerDashboard()
  } else if (currentUser.role === "shop_owner") {
    dashboardTitle.textContent = "Shop Owner Dashboard"
    dashboardSubtitle.textContent = "Manage your shop and bookings"
    shopOwnerDashboard.classList.add("active")
    updateShopOwnerDashboard()
  }
}

function updateCustomerDashboard() {
  const currentUser = authManager.getCurrentUser()
  const bookings = JSON.parse(localStorage.getItem("bookings")) || []
  const userBookings = bookings.filter((b) => b.userId === currentUser.id)

  const customerBookingsDiv = document.getElementById("customerBookings")
  if (userBookings.length === 0) {
    customerBookingsDiv.innerHTML =
      '<p>No bookings yet. <a href="#" onclick="showSection(\'customer\')">Find shops</a> to book services.</p>'
  } else {
    customerBookingsDiv.innerHTML = userBookings
      .map((booking) => {
        const shop = shops.find((s) => s.id === booking.shopId)
        return `
        <div class="booking-item">
          <h4>${booking.serviceType}</h4>
          <p><strong>Shop:</strong> ${shop ? shop.name : "Unknown"}</p>
          <p><strong>Date:</strong> ${booking.date} at ${booking.time}</p>
          <p><strong>Status:</strong> <span class="status-${booking.status}">${booking.status}</span></p>
          ${booking.amount > 0 ? `<p><strong>Amount:</strong> ₹${booking.amount}</p>` : ""}
        </div>
      `
      })
      .join("")
  }
}

function updateShopOwnerDashboard() {
  const currentUser = authManager.getCurrentUser()
  const userShops = shops.filter((s) => s.ownerId === currentUser.id)
  const bookings = JSON.parse(localStorage.getItem("bookings")) || []

  if (userShops.length === 0) {
    document.getElementById("shopViews").textContent = "0"
    document.getElementById("shopBookings").textContent = "0"
    document.getElementById("shopRevenue").textContent = "₹0"
    document.getElementById("recentBookings").innerHTML =
      '<p>No shop registered yet. <a href="#" onclick="showSection(\'shop-register\')">Register your shop</a></p>'
    return
  }

  const shopIds = userShops.map((s) => s.id)
  const shopBookings = bookings.filter((b) => shopIds.includes(b.shopId))
  const totalRevenue = shopBookings.reduce((sum, booking) => sum + (booking.amount || 0), 0)

  // Update stats
  document.getElementById("shopViews").textContent = Math.floor(Math.random() * 1000) + 100
  document.getElementById("shopBookings").textContent = shopBookings.length
  document.getElementById("shopRevenue").textContent = `₹${totalRevenue}`

  // Update recent bookings
  const recentBookings = shopBookings.slice(-5).reverse()
  const recentBookingsDiv = document.getElementById("recentBookings")

  if (recentBookings.length === 0) {
    recentBookingsDiv.innerHTML = "<p>No bookings yet.</p>"
  } else {
    recentBookingsDiv.innerHTML = recentBookings
      .map(
        (booking) => `
      <div class="booking-item">
        <h4>${booking.serviceType}</h4>
        <p><strong>Customer:</strong> ${booking.customerName}</p>
        <p><strong>Date:</strong> ${booking.date} at ${booking.time}</p>
        <p><strong>Status:</strong> <span class="status-${booking.status}">${booking.status}</span></p>
        <div class="booking-actions">
          <button class="btn btn-success btn-small" onclick="updateBookingStatus('${booking.id}', 'confirmed')">Confirm</button>
          <button class="btn btn-primary btn-small" onclick="contactCustomer('${booking.customerPhone}')">Contact</button>
        </div>
      </div>
    `,
      )
      .join("")
  }
}

function updateBookingStatus(bookingId, status) {
  const bookings = JSON.parse(localStorage.getItem("bookings")) || []
  const booking = bookings.find((b) => b.id === bookingId)

  if (booking) {
    booking.status = status
    localStorage.setItem("bookings", JSON.stringify(bookings))

    // Send notification to customer
    notificationManager.addNotification({
      title: "Booking Status Updated",
      message: `Your booking for ${booking.serviceType} has been ${status}`,
      type: "booking",
      userId: booking.userId,
    })

    updateUserDashboard()
    showNotification(`Booking ${status} successfully!`, "success")
  }
}

function contactCustomer(phone) {
  contactShop("call", phone)
}

function editShopDetails() {
  showNotification("Shop editing feature coming soon!", "info")
}

function manageServices() {
  showNotification("Service management feature coming soon!", "info")
}

// Admin functions
function showAdminTab(tabName) {
  // Hide all admin content
  document.querySelectorAll(".admin-content").forEach((content) => {
    content.classList.remove("active")
  })

  // Show selected content
  document.getElementById(`admin-${tabName}`).classList.add("active")

  // Update tab buttons
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active")
  })
  event.target.classList.add("active")

  // Load specific tab data
  if (tabName === "users") {
    updateAdminUsersList()
  } else if (tabName === "bookings") {
    updateAdminBookingsList()
  } else if (tabName === "payments") {
    updateAdminPaymentsList()
  }
}

function updateAdminDashboard() {
  updatePendingShops()
  updateAdminShopsList()
  updateAnalytics()
  updateActivityFeed()
}

function updatePendingShops() {
  const pendingContainer = document.getElementById("pendingShops")

  if (pendingShops.length === 0) {
    pendingContainer.innerHTML = "<p>No pending shop approvals.</p>"
    return
  }

  pendingContainer.innerHTML = pendingShops
    .map(
      (shop) => `
        <div class="pending-shop-card">
            <h3>${shop.name}</h3>
            <p><strong>Category:</strong> ${shop.category}</p>
            <p><strong>Owner:</strong> ${shop.owner}</p>
            <p><strong>Phone:</strong> ${shop.phone}</p>
            <p><strong>Address:</strong> ${shop.address}, ${shop.city}</p>
            <p><strong>WhatsApp:</strong> ${shop.whatsappNumber || "Not provided"}</p>
            <p><strong>Home Service:</strong> ${shop.homeService ? "Yes" : "No"}</p>
            <p><strong>Online Payments:</strong> ${shop.onlinePayments ? "Yes" : "No"}</p>
            <div class="admin-actions">
                <button class="btn btn-success btn-small" onclick="approveShop('${shop.id}')">
                    <i class="fas fa-check"></i> Approve
                </button>
                <button class="btn btn-danger btn-small" onclick="rejectShop('${shop.id}')">
                    <i class="fas fa-times"></i> Reject
                </button>
            </div>
        </div>
    `,
    )
    .join("")
}

function approveShop(shopId) {
  const shopIndex = pendingShops.findIndex((shop) => shop.id === shopId)
  if (shopIndex !== -1) {
    const shop = pendingShops[shopIndex]
    shop.status = "approved"
    shop.approvedAt = new Date().toISOString()

    shops.push(shop)
    pendingShops.splice(shopIndex, 1)

    localStorage.setItem("shops", JSON.stringify(shops))
    localStorage.setItem("pendingShops", JSON.stringify(pendingShops))

    updateAdminDashboard()
    updateShopsDisplay()
    showNotification("Shop approved successfully!", "success")

    // Send notification to shop owner
    notificationManager.addNotification({
      title: "Shop Approved",
      message: `Your shop "${shop.name}" has been approved and is now live!`,
      type: "shop",
      userId: shop.ownerId,
    })
  }
}

function rejectShop(shopId) {
  const shopIndex = pendingShops.findIndex((shop) => shop.id === shopId)
  if (shopIndex !== -1) {
    const shop = pendingShops[shopIndex]

    // Send notification to shop owner
    notificationManager.addNotification({
      title: "Shop Registration Rejected",
      message: `Your shop "${shop.name}" registration has been rejected. Please contact support for more information.`,
      type: "shop",
      userId: shop.ownerId,
    })

    pendingShops.splice(shopIndex, 1)
    localStorage.setItem("pendingShops", JSON.stringify(pendingShops))

    updateAdminDashboard()
    showNotification("Shop registration rejected.", "success")
  }
}

function updateAdminShopsList() {
  const shopsListContainer = document.getElementById("adminShopsList")
  const approvedShops = shops.filter((shop) => shop.status === "approved")

  if (approvedShops.length === 0) {
    shopsListContainer.innerHTML = "<p>No approved shops yet.</p>"
    return
  }

  shopsListContainer.innerHTML = approvedShops
    .map(
      (shop) => `
        <div class="admin-shop-card">
            <h3>${shop.name}</h3>
            <p><strong>Category:</strong> ${shop.category}</p>
            <p><strong>Owner:</strong> ${shop.owner}</p>
            <p><strong>Phone:</strong> ${shop.phone}</p>
            <p><strong>Rating:</strong> ${shop.rating.toFixed(1)} ⭐</p>
            <p><strong>Status:</strong> <span class="status-active">Active</span></p>
            <p><strong>Revenue:</strong> ₹${paymentManager.getRevenueByShop(shop.id)}</p>
            <div class="admin-actions">
                <button class="btn btn-secondary btn-small" onclick="toggleShopStatus('${shop.id}')">
                    <i class="fas fa-pause"></i> Suspend
                </button>
                <button class="btn btn-primary btn-small" onclick="viewShopAnalytics('${shop.id}')">
                    <i class="fas fa-chart-bar"></i> Analytics
                </button>
            </div>
        </div>
    `,
    )
    .join("")
}

function updateAdminUsersList() {
  const usersListContainer = document.getElementById("adminUsersList")
  const users = authManager.getAllUsers()

  usersListContainer.innerHTML = users
    .map(
      (user) => `
    <div class="admin-shop-card">
      <h3>${user.name}</h3>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Phone:</strong> ${user.phone}</p>
      <p><strong>Role:</strong> ${user.role}</p>
      <p><strong>Joined:</strong> ${new Date(user.createdAt).toLocaleDateString()}</p>
      <div class="admin-actions">
        <button class="btn btn-secondary btn-small" onclick="toggleUserStatus('${user.id}')">
          <i class="fas fa-ban"></i> Suspend
        </button>
      </div>
    </div>
  `,
    )
    .join("")
}

function updateAdminBookingsList() {
  const bookingsListContainer = document.getElementById("adminBookingsList")
  const bookings = JSON.parse(localStorage.getItem("bookings")) || []

  if (bookings.length === 0) {
    bookingsListContainer.innerHTML = "<p>No bookings yet.</p>"
    return
  }

  bookingsListContainer.innerHTML = bookings
    .map((booking) => {
      const shop = shops.find((s) => s.id === booking.shopId)
      return `
      <div class="admin-shop-card">
        <h3>Booking #${booking.id.substr(-6)}</h3>
        <p><strong>Service:</strong> ${booking.serviceType}</p>
        <p><strong>Shop:</strong> ${shop ? shop.name : "Unknown"}</p>
        <p><strong>Customer:</strong> ${booking.customerName}</p>
        <p><strong>Date:</strong> ${booking.date} at ${booking.time}</p>
        <p><strong>Amount:</strong> ₹${booking.amount || 0}</p>
        <p><strong>Status:</strong> <span class="status-${booking.status}">${booking.status}</span></p>
        <p><strong>Payment:</strong> <span class="status-${booking.paymentStatus}">${booking.paymentStatus}</span></p>
      </div>
    `
    })
    .join("")
}

function updateAdminPaymentsList() {
  const paymentsListContainer = document.getElementById("adminPaymentsList")
  const payments = paymentManager.payments

  if (payments.length === 0) {
    paymentsListContainer.innerHTML = "<p>No payments yet.</p>"
    return
  }

  paymentsListContainer.innerHTML = payments
    .map(
      (payment) => `
    <div class="admin-shop-card">
      <h3>Payment #${payment.id.substr(-6)}</h3>
      <p><strong>Amount:</strong> ₹${payment.amount}</p>
      <p><strong>Status:</strong> <span class="status-${payment.status}">${payment.status}</span></p>
      <p><strong>Razorpay ID:</strong> ${payment.razorpayPaymentId}</p>
      <p><strong>Date:</strong> ${new Date(payment.timestamp).toLocaleDateString()}</p>
    </div>
  `,
    )
    .join("")
}

function updateAnalytics() {
  const totalShops = shops.filter((shop) => shop.status === "approved").length
  const totalUsers = authManager.getAllUsers().length
  const totalBookings = JSON.parse(localStorage.getItem("bookings") || "[]").length
  const totalRevenue = paymentManager.getTotalRevenue()

  document.getElementById("totalShops").textContent = totalShops
  document.getElementById("totalUsers").textContent = totalUsers
  document.getElementById("totalBookings").textContent = totalBookings
  document.getElementById("totalRevenue").textContent = `₹${totalRevenue}`
}

function updateActivityFeed() {
  const activityFeed = document.getElementById("activityFeed")
  const activities = []

  // Get recent bookings
  const bookings = JSON.parse(localStorage.getItem("bookings")) || []
  bookings.slice(-5).forEach((booking) => {
    activities.push({
      type: "booking",
      title: `New booking for ${booking.serviceType}`,
      time: new Date(booking.bookedAt).toLocaleString(),
      icon: "booking",
    })
  })

  // Get recent payments
  paymentManager.payments.slice(-3).forEach((payment) => {
    activities.push({
      type: "payment",
      title: `Payment received: ₹${payment.amount}`,
      time: new Date(payment.timestamp).toLocaleString(),
      icon: "payment",
    })
  })

  // Get recent shop registrations
  shops.slice(-3).forEach((shop) => {
    activities.push({
      type: "shop",
      title: `New shop registered: ${shop.name}`,
      time: new Date(shop.registeredAt).toLocaleString(),
      icon: "shop",
    })
  })

  // Sort by time and take latest 10
  activities.sort((a, b) => new Date(b.time) - new Date(a.time))
  const recentActivities = activities.slice(0, 10)

  if (recentActivities.length === 0) {
    activityFeed.innerHTML = "<p>No recent activity.</p>"
    return
  }

  activityFeed.innerHTML = recentActivities
    .map(
      (activity) => `
    <div class="activity-item">
      <div class="activity-icon ${activity.icon}">
        <i class="fas fa-${activity.icon === "booking" ? "calendar" : activity.icon === "payment" ? "credit-card" : "store"}"></i>
      </div>
      <div class="activity-content">
        <div class="activity-title">${activity.title}</div>
        <div class="activity-time">${activity.time}</div>
      </div>
    </div>
  `,
    )
    .join("")
}

function filterShops() {
  const searchTerm = document.getElementById("shopSearchInput").value.toLowerCase()
  const statusFilter = document.getElementById("shopStatusFilter").value

  let filteredShops = shops

  if (searchTerm) {
    filteredShops = filteredShops.filter(
      (shop) =>
        shop.name.toLowerCase().includes(searchTerm) ||
        shop.category.toLowerCase().includes(searchTerm) ||
        shop.owner.toLowerCase().includes(searchTerm),
    )
  }

  if (statusFilter) {
    filteredShops = filteredShops.filter((shop) => shop.status === statusFilter)
  }

  // Update the display with filtered shops
  updateAdminShopsListWithFilter(filteredShops)
}

function updateAdminShopsListWithFilter(filteredShops) {
  const shopsListContainer = document.getElementById("adminShopsList")

  if (filteredShops.length === 0) {
    shopsListContainer.innerHTML = "<p>No shops match your criteria.</p>"
    return
  }

  shopsListContainer.innerHTML = filteredShops
    .map(
      (shop) => `
    <div class="admin-shop-card">
      <h3>${shop.name}</h3>
      <p><strong>Category:</strong> ${shop.category}</p>
      <p><strong>Owner:</strong> ${shop.owner}</p>
      <p><strong>Phone:</strong> ${shop.phone}</p>
      <p><strong>Rating:</strong> ${shop.rating.toFixed(1)} ⭐</p>
      <p><strong>Status:</strong> <span class="status-${shop.status}">${shop.status}</span></p>
      <div class="admin-actions">
        <button class="btn btn-secondary btn-small" onclick="toggleShopStatus('${shop.id}')">
          <i class="fas fa-pause"></i> ${shop.status === "active" ? "Suspend" : "Activate"}
        </button>
      </div>
    </div>
  `,
    )
    .join("")
}

function toggleShopStatus(shopId) {
  const shop = shops.find((s) => s.id === shopId)
  if (shop) {
    shop.status = shop.status === "approved" ? "suspended" : "approved"
    localStorage.setItem("shops", JSON.stringify(shops))
    updateAdminDashboard()
    showNotification(`Shop ${shop.status === "approved" ? "activated" : "suspended"} successfully!`, "success")
  }
}

function viewShopAnalytics(shopId) {
  showNotification("Shop analytics feature coming soon!", "info")
}

function toggleUserStatus(userId) {
  showNotification("User management feature coming soon!", "info")
}

// Utility functions
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

function calculateDistance(pos1, pos2) {
  // Simplified distance calculation (in real app, use Haversine formula)
  const lat1 = pos1.lat
  const lon1 = pos1.lng
  const lat2 = pos2.lat
  const lon2 = pos2.lng

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

function loadSampleData() {
  // Load sample shops if none exist
  if (shops.length === 0) {
    const sampleShops = [
      {
        id: "shop1",
        name: "Tech World Electronics",
        category: "electronics",
        description: "Latest smartphones, laptops, and electronic accessories",
        owner: "Rajesh Kumar",
        phone: "+91-9876543210",
        whatsappNumber: "+91-9876543210",
        address: "Shop 15, Electronics Market",
        city: "Delhi",
        pinCode: "110001",
        timings: "Mon-Sat: 10 AM - 8 PM",
        homeService: true,
        onlinePayments: true,
        status: "approved",
        ownerId: "owner1",
        rating: 4.5,
        reviews: 23,
        distance: "1.2",
        location: { lat: 28.6139, lng: 77.209 },
        registeredAt: new Date().toISOString(),
      },
      {
        id: "shop2",
        name: "Fresh Mart Kirana",
        category: "kirana",
        description: "Fresh groceries, vegetables, and daily essentials",
        owner: "Sunita Sharma",
        phone: "+91-9876543211",
        whatsappNumber: "+91-9876543211",
        address: "45, Main Market Road",
        city: "Delhi",
        pinCode: "110002",
        timings: "Daily: 7 AM - 10 PM",
        homeService: true,
        onlinePayments: false,
        status: "approved",
        ownerId: "owner2",
        rating: 4.2,
        reviews: 45,
        distance: "0.8",
        location: { lat: 28.6129, lng: 77.208 },
        registeredAt: new Date().toISOString(),
      },
      {
        id: "shop3",
        name: "Quick Fix Repair Center",
        category: "repair",
        description: "Mobile, laptop, and home appliance repair services",
        owner: "Amit Singh",
        phone: "+91-9876543212",
        whatsappNumber: "+91-9876543212",
        address: "12, Service Lane",
        city: "Delhi",
        pinCode: "110003",
        timings: "Mon-Sat: 9 AM - 7 PM",
        homeService: true,
        onlinePayments: true,
        status: "approved",
        ownerId: "owner3",
        rating: 4.7,
        reviews: 67,
        distance: "2.1",
        location: { lat: 28.6149, lng: 77.21 },
        registeredAt: new Date().toISOString(),
      },
    ]

    shops = sampleShops
    localStorage.setItem("shops", JSON.stringify(shops))
  }
}

// Close modals when clicking outside
window.onclick = (event) => {
  const shopModal = document.getElementById("shopModal")
  const bookingModal = document.getElementById("bookingModal")
  const authModal = document.getElementById("authModal")
  const paymentModal = document.getElementById("paymentModal")

  if (event.target === shopModal) {
    shopModal.style.display = "none"
  }
  if (event.target === bookingModal) {
    bookingModal.style.display = "none"
  }
  if (event.target === authModal) {
    authModal.style.display = "none"
  }
  if (event.target === paymentModal) {
    paymentModal.style.display = "none"
  }
}
