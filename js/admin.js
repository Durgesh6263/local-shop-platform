// Admin dashboard functionality

let currentTab = "pending"
let allShops = []
let allUsers = []
let allBookings = []

document.addEventListener("DOMContentLoaded", () => {
  initializeAdminDashboard()
})

function initializeAdminDashboard() {
  loadAdminData()
  updateStatistics()
  setupAdminEventListeners()
  showTab("pending") // Show pending tab by default
}

function loadAdminData() {
  // Load shops
  allShops = JSON.parse(localStorage.getItem("shops")) || []

  // Load bookings
  allBookings = JSON.parse(localStorage.getItem("bookings")) || []

  // Generate sample users if none exist
  allUsers = JSON.parse(localStorage.getItem("users")) || generateSampleUsers()
  localStorage.setItem("users", JSON.stringify(allUsers))
}

function generateSampleUsers() {
  return [
    {
      id: "user1",
      name: "Priya Sharma",
      email: "priya@example.com",
      phone: "+91-9876543220",
      joinedAt: "2024-01-15",
      totalBookings: 5,
      status: "active",
    },
    {
      id: "user2",
      name: "Rahul Kumar",
      email: "rahul@example.com",
      phone: "+91-9876543221",
      joinedAt: "2024-02-10",
      totalBookings: 3,
      status: "active",
    },
    {
      id: "user3",
      name: "Anjali Singh",
      email: "anjali@example.com",
      phone: "+91-9876543222",
      joinedAt: "2024-03-05",
      totalBookings: 8,
      status: "active",
    },
  ]
}

function setupAdminEventListeners() {
  // Tab switching
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const tabName = this.onclick.toString().match(/showTab$$'(.+?)'$$/)[1]
      showTab(tabName)
    })
  })

  // Search and filter inputs
  const shopSearchInput = document.getElementById("shopSearchInput")
  shopSearchInput?.addEventListener("keyup", filterShops)

  const shopCategoryFilter = document.getElementById("shopCategoryFilter")
  shopCategoryFilter?.addEventListener("change", filterShops)

  const bookingStatusFilter = document.getElementById("bookingStatusFilter")
  bookingStatusFilter?.addEventListener("change", filterBookings)

  const analyticsTimeframe = document.getElementById("analyticsTimeframe")
  analyticsTimeframe?.addEventListener("change", updateAnalytics)
}

function updateStatistics() {
  // Update stat cards
  const totalShopsElement = document.getElementById("totalShops")
  if (totalShopsElement) {
    totalShopsElement.textContent = allShops.length
  }

  const pendingApprovalsElement = document.getElementById("pendingApprovals")
  if (pendingApprovalsElement) {
    const pendingCount = allShops.filter((shop) => shop.status === "pending").length
    pendingApprovalsElement.textContent = pendingCount
  }

  const totalUsersElement = document.getElementById("totalUsers")
  if (totalUsersElement) {
    totalUsersElement.textContent = allUsers.length
  }

  const totalBookingsElement = document.getElementById("totalBookings")
  if (totalBookingsElement) {
    totalBookingsElement.textContent = allBookings.length
  }
}

function showTab(tabName) {
  currentTab = tabName

  // Update tab buttons
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active")
  })
  event?.target?.classList.add("active")

  // Update tab content
  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.remove("active")
  })

  const targetTab = document.getElementById(`${tabName}Tab`)
  if (targetTab) {
    targetTab.classList.add("active")
  }

  // Load tab-specific content
  switch (tabName) {
    case "pending":
      loadPendingShops()
      break
    case "shops":
      loadAllShops()
      break
    case "users":
      loadUsers()
      break
    case "bookings":
      loadBookings()
      break
    case "analytics":
      loadAnalytics()
      break
  }
}

function loadPendingShops() {
  const container = document.getElementById("pendingShopsContainer")
  if (!container) return

  const pendingShops = allShops.filter((shop) => shop.status === "pending")

  if (pendingShops.length === 0) {
    container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-check-circle"></i>
                <h4>No Pending Approvals</h4>
                <p>All shop registrations have been reviewed</p>
            </div>
        `
    return
  }

  container.innerHTML = pendingShops.map((shop) => createPendingShopCard(shop)).join("")
}

function createPendingShopCard(shop) {
  return `
        <div class="pending-shop-card">
            <div class="pending-shop-header">
                <div class="pending-shop-info">
                    <h4>${shop.shopName}</h4>
                    <span class="pending-shop-category">${shop.shopCategory}</span>
                </div>
                <div class="pending-shop-date">
                    <small>Registered: ${window.ShopConnect.formatDate(shop.registeredAt)}</small>
                </div>
            </div>
            <div class="pending-shop-details">
                <div class="detail-item">
                    <strong>Owner:</strong>
                    <span>${shop.ownerName}</span>
                </div>
                <div class="detail-item">
                    <strong>Phone:</strong>
                    <span>${shop.phoneNumber}</span>
                </div>
                <div class="detail-item">
                    <strong>Email:</strong>
                    <span>${shop.email || "Not provided"}</span>
                </div>
                <div class="detail-item">
                    <strong>Address:</strong>
                    <span>${shop.shopAddress}, ${shop.city}, ${shop.pinCode}</span>
                </div>
                <div class="detail-item">
                    <strong>Services:</strong>
                    <span>${shop.servicesOffered}</span>
                </div>
                <div class="detail-item">
                    <strong>Timings:</strong>
                    <span>${shop.shopTimings}</span>
                </div>
            </div>
            <div class="pending-shop-actions">
                <button class="btn btn-success btn-small" onclick="approveShop('${shop.id}')">
                    <i class="fas fa-check"></i> Approve
                </button>
                <button class="btn btn-danger btn-small" onclick="rejectShop('${shop.id}')">
                    <i class="fas fa-times"></i> Reject
                </button>
                <button class="btn btn-secondary btn-small" onclick="viewShopDetails('${shop.id}')">
                    <i class="fas fa-eye"></i> View Details
                </button>
            </div>
        </div>
    `
}

function loadAllShops() {
  const container = document.getElementById("allShopsContainer")
  if (!container) return

  const approvedShops = allShops.filter((shop) => shop.status === "approved")

  if (approvedShops.length === 0) {
    container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-store"></i>
                <h4>No Approved Shops</h4>
                <p>No shops have been approved yet</p>
            </div>
        `
    return
  }

  container.innerHTML = approvedShops.map((shop) => createShopItem(shop)).join("")
}

function createShopItem(shop) {
  return `
        <div class="shop-item">
            <div class="item-header">
                <div class="item-info">
                    <h4>${shop.shopName || shop.name}</h4>
                    <span class="item-status status-active">Active</span>
                </div>
                <div class="item-meta">
                    <small>Approved: ${window.ShopConnect.formatDate(shop.approvedAt || shop.registeredAt)}</small>
                </div>
            </div>
            <div class="item-details">
                <div class="detail-item">
                    <strong>Category:</strong>
                    <span>${shop.shopCategory || shop.category}</span>
                </div>
                <div class="detail-item">
                    <strong>Owner:</strong>
                    <span>${shop.ownerName || shop.owner}</span>
                </div>
                <div class="detail-item">
                    <strong>Phone:</strong>
                    <span>${shop.phoneNumber || shop.phone}</span>
                </div>
                <div class="detail-item">
                    <strong>Rating:</strong>
                    <span>${shop.rating || 0}/5 (${shop.reviews || 0} reviews)</span>
                </div>
            </div>
            <div class="item-actions">
                <button class="btn btn-secondary btn-small" onclick="viewShopDetails('${shop.id}')">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="btn btn-primary btn-small" onclick="editShop('${shop.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger btn-small" onclick="suspendShop('${shop.id}')">
                    <i class="fas fa-ban"></i> Suspend
                </button>
            </div>
        </div>
    `
}

function loadUsers() {
  const container = document.getElementById("usersContainer")
  if (!container) return

  if (allUsers.length === 0) {
    container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <h4>No Users</h4>
                <p>No users have registered yet</p>
            </div>
        `
    return
  }

  container.innerHTML = allUsers.map((user) => createUserItem(user)).join("")
}

function createUserItem(user) {
  return `
        <div class="user-item">
            <div class="item-header">
                <div class="item-info">
                    <h4>${user.name}</h4>
                    <span class="item-status status-${user.status}">${user.status}</span>
                </div>
                <div class="item-meta">
                    <small>Joined: ${window.ShopConnect.formatDate(user.joinedAt)}</small>
                </div>
            </div>
            <div class="item-details">
                <div class="detail-item">
                    <strong>Email:</strong>
                    <span>${user.email}</span>
                </div>
                <div class="detail-item">
                    <strong>Phone:</strong>
                    <span>${user.phone}</span>
                </div>
                <div class="detail-item">
                    <strong>Bookings:</strong>
                    <span>${user.totalBookings}</span>
                </div>
            </div>
            <div class="item-actions">
                <button class="btn btn-secondary btn-small" onclick="viewUserDetails('${user.id}')">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="btn btn-primary btn-small" onclick="contactUser('${user.id}')">
                    <i class="fas fa-envelope"></i> Contact
                </button>
            </div>
        </div>
    `
}

function loadBookings() {
  const container = document.getElementById("bookingsContainer")
  if (!container) return

  if (allBookings.length === 0) {
    container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar"></i>
                <h4>No Bookings</h4>
                <p>No service bookings have been made yet</p>
            </div>
        `
    return
  }

  container.innerHTML = allBookings.map((booking) => createBookingItem(booking)).join("")
}

function createBookingItem(booking) {
  return `
        <div class="booking-item">
            <div class="item-header">
                <div class="item-info">
                    <h4>Booking #${booking.id.substr(-6)}</h4>
                    <span class="item-status status-${booking.status}">${booking.status}</span>
                </div>
                <div class="item-meta">
                    <small>Created: ${window.ShopConnect.formatDate(booking.createdAt)}</small>
                </div>
            </div>
            <div class="item-details">
                <div class="detail-item">
                    <strong>Shop:</strong>
                    <span>${booking.shopName}</span>
                </div>
                <div class="detail-item">
                    <strong>Customer:</strong>
                    <span>${booking.customerName}</span>
                </div>
                <div class="detail-item">
                    <strong>Service:</strong>
                    <span>${booking.serviceType}</span>
                </div>
                <div class="detail-item">
                    <strong>Date:</strong>
                    <span>${window.ShopConnect.formatDate(booking.serviceDate)}</span>
                </div>
                <div class="detail-item">
                    <strong>Cost:</strong>
                    <span>₹ ${booking.estimatedCost || "TBD"}</span>
                </div>
            </div>
            <div class="item-actions">
                <button class="btn btn-secondary btn-small" onclick="viewBookingDetails('${booking.id}')">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="btn btn-primary btn-small" onclick="updateBookingStatus('${booking.id}')">
                    <i class="fas fa-edit"></i> Update
                </button>
            </div>
        </div>
    `
}

function loadAnalytics() {
  updateAnalytics()
  loadTopShopsTable()
}

function updateAnalytics() {
  // This would typically fetch real analytics data
  // For demo purposes, we'll show placeholder content
  console.log("Analytics updated for timeframe:", document.getElementById("analyticsTimeframe")?.value)
}

function loadTopShopsTable() {
  const tableBody = document.querySelector("#topShopsTable tbody")
  if (!tableBody) return

  // Get top shops by rating and reviews
  const topShops = allShops
    .filter((shop) => shop.status === "approved")
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 5)

  if (topShops.length === 0) {
    tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: #64748b;">No data available</td>
            </tr>
        `
    return
  }

  tableBody.innerHTML = topShops
    .map(
      (shop) => `
        <tr>
            <td>${shop.shopName || shop.name}</td>
            <td>${shop.shopCategory || shop.category}</td>
            <td>${Math.floor(Math.random() * 50) + 10}</td>
            <td>${shop.rating || 0}/5</td>
            <td>₹ ${Math.floor(Math.random() * 50000) + 10000}</td>
        </tr>
    `,
    )
    .join("")
}

// Shop management functions
function approveShop(shopId) {
  showConfirmationModal("Are you sure you want to approve this shop?", () => {
    const shopIndex = allShops.findIndex((shop) => shop.id === shopId)
    if (shopIndex !== -1) {
      allShops[shopIndex].status = "approved"
      allShops[shopIndex].approvedAt = new Date().toISOString()
      localStorage.setItem("shops", JSON.stringify(allShops))

      window.ShopConnect.showNotification("Shop approved successfully!", "success")
      updateStatistics()
      loadPendingShops()
    }
  })
}

function rejectShop(shopId) {
  showConfirmationModal("Are you sure you want to reject this shop? This action cannot be undone.", () => {
    const shopIndex = allShops.findIndex((shop) => shop.id === shopId)
    if (shopIndex !== -1) {
      allShops.splice(shopIndex, 1)
      localStorage.setItem("shops", JSON.stringify(allShops))

      window.ShopConnect.showNotification("Shop rejected and removed", "success")
      updateStatistics()
      loadPendingShops()
    }
  })
}

function suspendShop(shopId) {
  showConfirmationModal("Are you sure you want to suspend this shop?", () => {
    const shopIndex = allShops.findIndex((shop) => shop.id === shopId)
    if (shopIndex !== -1) {
      allShops[shopIndex].status = "suspended"
      localStorage.setItem("shops", JSON.stringify(allShops))

      window.ShopConnect.showNotification("Shop suspended", "success")
      loadAllShops()
    }
  })
}

function viewShopDetails(shopId) {
  const shop = allShops.find((s) => s.id === shopId)
  if (!shop) return

  const modal = document.getElementById("shopDetailModal")
  const content = document.getElementById("shopDetailContent")

  if (!modal || !content) return

  content.innerHTML = `
        <div class="shop-detail-content">
            <div class="shop-detail-header">
                <h3>${shop.shopName || shop.name}</h3>
                <span class="shop-category-badge">${shop.shopCategory || shop.category}</span>
            </div>
            
            <div class="shop-detail-grid">
                <div class="detail-section">
                    <h4>Basic Information</h4>
                    <div class="detail-list">
                        <div class="detail-item">
                            <strong>Owner:</strong>
                            <span>${shop.ownerName || shop.owner}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Phone:</strong>
                            <span>${shop.phoneNumber || shop.phone}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Email:</strong>
                            <span>${shop.email || "Not provided"}</span>
                        </div>
                        <div class="detail-item">
                            <strong>WhatsApp:</strong>
                            <span>${shop.whatsappNumber || shop.whatsapp || "Not provided"}</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>Location</h4>
                    <div class="detail-list">
                        <div class="detail-item">
                            <strong>Address:</strong>
                            <span>${shop.shopAddress || shop.address}</span>
                        </div>
                        <div class="detail-item">
                            <strong>City:</strong>
                            <span>${shop.city}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Pin Code:</strong>
                            <span>${shop.pinCode || shop.pincode}</span>
                        </div>
                        <div class="detail-item">
                            <strong>State:</strong>
                            <span>${shop.state}</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>Services</h4>
                    <div class="detail-list">
                        <div class="detail-item">
                            <strong>Services Offered:</strong>
                            <span>${shop.servicesOffered || shop.description}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Timings:</strong>
                            <span>${shop.shopTimings || shop.timings}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Closed Days:</strong>
                            <span>${shop.closedDays || "Not specified"}</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>Additional Services</h4>
                    <div class="service-badges">
                        ${shop.homeService ? '<span class="service-badge">Home Service</span>' : ""}
                        ${shop.onlinePayment ? '<span class="service-badge">Online Payment</span>' : ""}
                        ${shop.deliveryService ? '<span class="service-badge">Delivery</span>' : ""}
                        ${shop.emergencyService ? '<span class="service-badge">Emergency Service</span>' : ""}
                    </div>
                </div>
            </div>
            
            <div class="shop-detail-stats">
                <div class="stat-item">
                    <strong>Rating:</strong>
                    <span>${shop.rating || 0}/5</span>
                </div>
                <div class="stat-item">
                    <strong>Reviews:</strong>
                    <span>${shop.reviews || 0}</span>
                </div>
                <div class="stat-item">
                    <strong>Status:</strong>
                    <span class="status-badge status-${shop.status}">${shop.status}</span>
                </div>
            </div>
        </div>
    `

  modal.style.display = "block"
}

// Filter functions
function filterShops() {
  const searchTerm = document.getElementById("shopSearchInput")?.value.toLowerCase() || ""
  const categoryFilter = document.getElementById("shopCategoryFilter")?.value || ""

  let filteredShops = allShops.filter((shop) => shop.status === "approved")

  if (searchTerm) {
    filteredShops = filteredShops.filter(
      (shop) =>
        (shop.shopName || shop.name || "").toLowerCase().includes(searchTerm) ||
        (shop.ownerName || shop.owner || "").toLowerCase().includes(searchTerm),
    )
  }

  if (categoryFilter) {
    filteredShops = filteredShops.filter((shop) => (shop.shopCategory || shop.category) === categoryFilter)
  }

  const container = document.getElementById("allShopsContainer")
  if (container) {
    container.innerHTML = filteredShops.map((shop) => createShopItem(shop)).join("")
  }
}

function filterBookings() {
  const statusFilter = document.getElementById("bookingStatusFilter")?.value || ""

  let filteredBookings = allBookings

  if (statusFilter) {
    filteredBookings = filteredBookings.filter((booking) => booking.status === statusFilter)
  }

  const container = document.getElementById("bookingsContainer")
  if (container) {
    container.innerHTML = filteredBookings.map((booking) => createBookingItem(booking)).join("")
  }
}

// Utility functions
function refreshPendingShops() {
  loadAdminData()
  updateStatistics()
  loadPendingShops()
  window.ShopConnect.showNotification("Data refreshed", "success")
}

function exportUsers() {
  // In a real application, this would generate and download a CSV/Excel file
  window.ShopConnect.showNotification("User data export would start here", "info")
}

// Modal functions
function showConfirmationModal(message, onConfirm) {
  const modal = document.getElementById("confirmationModal")
  const messageElement = document.getElementById("confirmationMessage")
  const confirmBtn = document.getElementById("confirmBtn")

  if (!modal || !messageElement || !confirmBtn) return

  messageElement.textContent = message

  // Remove existing event listeners
  const newConfirmBtn = confirmBtn.cloneNode(true)
  confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn)

  // Add new event listener
  newConfirmBtn.addEventListener("click", () => {
    onConfirm()
    closeConfirmationModal()
  })

  modal.style.display = "block"
}

function closeConfirmationModal() {
  const modal = document.getElementById("confirmationModal")
  if (modal) {
    modal.style.display = "none"
  }
}

function closeShopDetailModal() {
  const modal = document.getElementById("shopDetailModal")
  if (modal) {
    modal.style.display = "none"
  }
}

// Placeholder functions for future implementation
function editShop(shopId) {
  window.ShopConnect.showNotification("Shop editing feature would open here", "info")
}

function viewUserDetails(userId) {
  window.ShopConnect.showNotification("User details would open here", "info")
}

function contactUser(userId) {
  window.ShopConnect.showNotification("User contact feature would open here", "info")
}

function viewBookingDetails(bookingId) {
  window.ShopConnect.showNotification("Booking details would open here", "info")
}

function updateBookingStatus(bookingId) {
  window.ShopConnect.showNotification("Booking status update would open here", "info")
}
