// Shop profile page functionality

let currentShop = null
let currentProfileTab = "overview"

document.addEventListener("DOMContentLoaded", () => {
  initializeShopProfile()
})

function initializeShopProfile() {
  loadShopProfile()
  setupProfileTabs()
  setupProfileEventListeners()
}

function loadShopProfile() {
  const shopId = localStorage.getItem("selectedShopId")
  if (!shopId) {
    window.ShopConnect.showNotification("No shop selected", "error")
    window.location.href = "customer.html"
    return
  }

  const shops = JSON.parse(localStorage.getItem("shops")) || []
  currentShop = shops.find((shop) => shop.id === shopId)

  if (!currentShop) {
    window.ShopConnect.showNotification("Shop not found", "error")
    window.location.href = "customer.html"
    return
  }

  displayShopProfile()
}

function displayShopProfile() {
  const container = document.getElementById("shopProfileContainer")
  if (!container || !currentShop) return

  container.innerHTML = createShopProfileHTML()

  // Initialize tabs after content is loaded
  setupProfileTabs()
  showProfileTab("overview")
}

function createShopProfileHTML() {
  const shop = currentShop

  return `
        <!-- Shop Profile Header -->
        <div class="shop-profile-header">
            <div class="shop-header-content">
                <div class="shop-profile-icon">
                    <i class="fas fa-${window.ShopConnect.getShopIcon(shop.category || shop.shopCategory)}"></i>
                </div>
                <div class="shop-header-info">
                    <h1>${shop.name || shop.shopName}</h1>
                    <div class="shop-header-meta">
                        <span class="shop-category-badge">${shop.category || shop.shopCategory}</span>
                        <div class="shop-rating-display">
                            <div class="stars">${"★".repeat(Math.floor(shop.rating || 0))}${"☆".repeat(5 - Math.floor(shop.rating || 0))}</div>
                            <span>(${shop.reviews || 0} reviews)</span>
                        </div>
                    </div>
                </div>
                <div class="shop-header-actions">
                    <button class="btn btn-primary" onclick="bookService('${shop.id}')">
                        <i class="fas fa-calendar"></i> Book Service
                    </button>
                    <button class="btn btn-success" onclick="openContactModal()">
                        <i class="fas fa-phone"></i> Contact
                    </button>
                    <button class="btn btn-secondary" onclick="openReviewModal()">
                        <i class="fas fa-star"></i> Write Review
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Shop Profile Content -->
        <div class="shop-profile-content">
            <!-- Profile Tabs -->
            <div class="profile-tabs">
                <button class="profile-tab active" onclick="showProfileTab('overview')">Overview</button>
                <button class="profile-tab" onclick="showProfileTab('services')">Services</button>
                <button class="profile-tab" onclick="showProfileTab('reviews')">Reviews</button>
                <button class="profile-tab" onclick="showProfileTab('gallery')">Gallery</button>
                <button class="profile-tab" onclick="showProfileTab('contact')">Contact</button>
            </div>
            
            <!-- Tab Contents -->
            ${createOverviewTab()}
            ${createServicesTab()}
            ${createReviewsTab()}
            ${createGalleryTab()}
            ${createContactTab()}
        </div>
    `
}

function createOverviewTab() {
  const shop = currentShop

  return `
        <div class="profile-tab-content active" id="overviewTab">
            <div class="shop-overview">
                <div class="shop-description-section">
                    <h3>About ${shop.name || shop.shopName}</h3>
                    <p>${shop.description || shop.servicesOffered || "Professional services with quality and reliability."}</p>
                    
                    <div class="shop-features">
                        ${shop.homeService ? '<div class="feature-item"><i class="fas fa-home"></i><span>Home Service Available</span></div>' : ""}
                        ${shop.onlinePayment ? '<div class="feature-item"><i class="fas fa-credit-card"></i><span>Online Payment Accepted</span></div>' : ""}
                        ${shop.deliveryService ? '<div class="feature-item"><i class="fas fa-truck"></i><span>Delivery Service</span></div>' : ""}
                        ${shop.emergencyService ? '<div class="feature-item"><i class="fas fa-clock"></i><span>Emergency Service</span></div>' : ""}
                    </div>
                </div>
                
                <div class="shop-quick-info">
                    <h3>Quick Information</h3>
                    <ul class="quick-info-list">
                        <li>
                            <i class="fas fa-clock"></i>
                            <strong>Timings:</strong>
                            <span>${shop.timings || shop.shopTimings}</span>
                        </li>
                        <li>
                            <i class="fas fa-map-marker-alt"></i>
                            <strong>Address:</strong>
                            <span>${shop.address || shop.shopAddress}</span>
                        </li>
                        <li>
                            <i class="fas fa-phone"></i>
                            <strong>Phone:</strong>
                            <span>${shop.phone || shop.phoneNumber}</span>
                        </li>
                        ${
                          shop.email
                            ? `
                            <li>
                                <i class="fas fa-envelope"></i>
                                <strong>Email:</strong>
                                <span>${shop.email}</span>
                            </li>
                        `
                            : ""
                        }
                        ${
                          shop.whatsapp || shop.whatsappNumber
                            ? `
                            <li>
                                <i class="fab fa-whatsapp"></i>
                                <strong>WhatsApp:</strong>
                                <span>${shop.whatsapp || shop.whatsappNumber}</span>
                            </li>
                        `
                            : ""
                        }
                        <li>
                            <i class="fas fa-star"></i>
                            <strong>Rating:</strong>
                            <span>${shop.rating || 0}/5 (${shop.reviews || 0} reviews)</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    `
}

function createServicesTab() {
  const shop = currentShop
  const services = getShopServices(shop)

  return `
        <div class="profile-tab-content" id="servicesTab">
            <div class="services-grid">
                ${services
                  .map(
                    (service) => `
                    <div class="service-card">
                        <h4><i class="fas fa-${getServiceIcon(service.name)}"></i> ${service.name}</h4>
                        <p>${service.description || "Professional service with quality guarantee"}</p>
                        <div class="service-price">Starting from ₹${service.price}</div>
                    </div>
                `,
                  )
                  .join("")}
            </div>
        </div>
    `
}

function createReviewsTab() {
  const shop = currentShop
  const reviews = generateSampleReviews(shop)

  return `
        <div class="profile-tab-content" id="reviewsTab">
            <div class="reviews-header">
                <div class="reviews-summary">
                    <div class="overall-rating">
                        <div class="rating-number">${shop.rating || 0}</div>
                        <div class="stars">${"★".repeat(Math.floor(shop.rating || 0))}${"☆".repeat(5 - Math.floor(shop.rating || 0))}</div>
                        <div class="total-reviews">${shop.reviews || 0} reviews</div>
                    </div>
                    <div class="rating-breakdown">
                        ${[5, 4, 3, 2, 1]
                          .map((rating) => {
                            const count = Math.floor(Math.random() * 10)
                            const percentage = shop.reviews ? (count / shop.reviews) * 100 : 0
                            return `
                                <div class="rating-bar">
                                    <span>${rating}</span>
                                    <div class="rating-progress">
                                        <div class="rating-fill" style="width: ${percentage}%"></div>
                                    </div>
                                    <span class="rating-count">${count}</span>
                                </div>
                            `
                          })
                          .join("")}
                    </div>
                </div>
                <button class="btn btn-primary" onclick="openReviewModal()">
                    <i class="fas fa-star"></i> Write Review
                </button>
            </div>
            
            <div class="reviews-list">
                ${reviews
                  .map(
                    (review) => `
                    <div class="review-card">
                        <div class="review-header">
                            <div class="reviewer-info">
                                <div class="reviewer-avatar">${review.name.charAt(0)}</div>
                                <div class="reviewer-details">
                                    <h5>${review.name}</h5>
                                    <div class="review-date">${window.ShopConnect.formatDate(review.date)}</div>
                                </div>
                            </div>
                            <div class="review-rating">
                                <div class="stars">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</div>
                            </div>
                        </div>
                        <p class="review-text">${review.text}</p>
                    </div>
                `,
                  )
                  .join("")}
            </div>
        </div>
    `
}

function createGalleryTab() {
  return `
        <div class="profile-tab-content" id="galleryTab">
            <div class="shop-gallery">
                ${Array.from(
                  { length: 6 },
                  (_, i) => `
                    <div class="gallery-item">
                        <div class="gallery-placeholder">
                            <i class="fas fa-image"></i>
                        </div>
                    </div>
                `,
                ).join("")}
            </div>
        </div>
    `
}

function createContactTab() {
  const shop = currentShop

  return `
        <div class="profile-tab-content" id="contactTab">
            <div class="contact-info-grid">
                <div class="contact-card">
                    <i class="fas fa-phone"></i>
                    <h4>Call Us</h4>
                    <p>Speak directly with our team</p>
                    <button class="btn btn-primary" onclick="makeCall()">
                        <i class="fas fa-phone"></i> ${shop.phone || shop.phoneNumber}
                    </button>
                </div>
                
                ${
                  shop.whatsapp || shop.whatsappNumber
                    ? `
                    <div class="contact-card">
                        <i class="fab fa-whatsapp"></i>
                        <h4>WhatsApp</h4>
                        <p>Quick messaging and support</p>
                        <button class="btn btn-success" onclick="openWhatsApp()">
                            <i class="fab fa-whatsapp"></i> WhatsApp
                        </button>
                    </div>
                `
                    : ""
                }
                
                ${
                  shop.email
                    ? `
                    <div class="contact-card">
                        <i class="fas fa-envelope"></i>
                        <h4>Email</h4>
                        <p>Send us your inquiries</p>
                        <button class="btn btn-secondary" onclick="sendEmail()">
                            <i class="fas fa-envelope"></i> ${shop.email}
                        </button>
                    </div>
                `
                    : ""
                }
            </div>
            
            <div class="map-section">
                <h3>Location</h3>
                <div class="map-placeholder">
                    <i class="fas fa-map"></i>
                    <p>Interactive map would be displayed here</p>
                    <p><strong>Address:</strong> ${shop.address || shop.shopAddress}</p>
                </div>
            </div>
        </div>
    `
}

function setupProfileTabs() {
  const tabs = document.querySelectorAll(".profile-tab")
  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      const tabName = this.onclick.toString().match(/showProfileTab$$'(.+?)'$$/)[1]
      showProfileTab(tabName)
    })
  })
}

function setupProfileEventListeners() {
  // Star rating for review modal
  const stars = document.querySelectorAll(".star-rating .star")
  stars.forEach((star, index) => {
    star.addEventListener("click", () => {
      const rating = index + 1
      updateStarRating(rating)
    })

    star.addEventListener("mouseover", () => {
      highlightStars(index + 1)
    })
  })

  // Review form submission
  const reviewForm = document.getElementById("reviewForm")
  reviewForm?.addEventListener("submit", (event) => {
    event.preventDefault()
    submitReview()
  })
}

function showProfileTab(tabName) {
  currentProfileTab = tabName

  // Update tab buttons
  document.querySelectorAll(".profile-tab").forEach((tab) => {
    tab.classList.remove("active")
  })
  event?.target?.classList.add("active")

  // Update tab content
  document.querySelectorAll(".profile-tab-content").forEach((content) => {
    content.classList.remove("active")
  })

  const targetTab = document.getElementById(`${tabName}Tab`)
  if (targetTab) {
    targetTab.classList.add("active")
  }
}

function getShopServices(shop) {
  // Return shop-specific services or default services based on category
  if (shop.services && shop.services.length > 0) {
    return shop.services
  }

  const defaultServices = {
    electronics: [
      { name: "Mobile Repair", price: 500, description: "Screen replacement, battery change, software issues" },
      { name: "Laptop Repair", price: 1500, description: "Hardware diagnostics, software installation, virus removal" },
      { name: "TV Repair", price: 1000, description: "Display issues, sound problems, remote control setup" },
    ],
    kirana: [
      { name: "Home Delivery", price: 50, description: "Free delivery for orders above ₹500" },
      { name: "Bulk Orders", price: 100, description: "Special rates for bulk purchases" },
      { name: "Monthly Subscription", price: 200, description: "Regular delivery of essential items" },
    ],
    repair: [
      { name: "AC Service", price: 800, description: "Cleaning, gas refilling, general maintenance" },
      { name: "Washing Machine Repair", price: 600, description: "All brands, on-site service available" },
      { name: "Refrigerator Repair", price: 1000, description: "Cooling issues, compressor problems, door sealing" },
    ],
  }

  return (
    defaultServices[shop.category || shop.shopCategory] || [
      { name: "General Service", price: 300, description: "Professional service with quality guarantee" },
    ]
  )
}

function getServiceIcon(serviceName) {
  const icons = {
    "Mobile Repair": "mobile-alt",
    "Laptop Repair": "laptop",
    "TV Repair": "tv",
    "Home Delivery": "truck",
    "Bulk Orders": "boxes",
    "AC Service": "snowflake",
    "Washing Machine Repair": "tshirt",
    "Refrigerator Repair": "thermometer-half",
  }

  return icons[serviceName] || "cog"
}

function generateSampleReviews(shop) {
  const sampleReviews = [
    {
      name: "Priya Sharma",
      rating: 5,
      date: "2024-01-15",
      text: "Excellent service! Very professional and quick response. Highly recommended for quality work.",
    },
    {
      name: "Rahul Kumar",
      rating: 4,
      date: "2024-01-10",
      text: "Good service and reasonable pricing. The technician was knowledgeable and fixed the issue quickly.",
    },
    {
      name: "Anjali Singh",
      rating: 5,
      date: "2024-01-05",
      text: "Outstanding experience! They went above and beyond to ensure customer satisfaction.",
    },
  ]

  return sampleReviews.slice(0, shop.reviews || 3)
}

// Contact functions
function openContactModal() {
  const modal = document.getElementById("contactModal")
  if (modal) {
    modal.style.display = "block"
  }
}

function closeContactModal() {
  const modal = document.getElementById("contactModal")
  if (modal) {
    modal.style.display = "none"
  }
}

function makeCall() {
  const phone = currentShop.phone || currentShop.phoneNumber
  if (phone) {
    window.open(`tel:${phone}`)
  }
}

function openWhatsApp() {
  const whatsapp = currentShop.whatsapp || currentShop.whatsappNumber
  if (whatsapp) {
    const message = encodeURIComponent(
      `Hi, I found your shop "${currentShop.name || currentShop.shopName}" on ShopConnect. I would like to know more about your services.`,
    )
    window.open(`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}?text=${message}`)
  }
}

function sendEmail() {
  const email = currentShop.email
  if (email) {
    const subject = encodeURIComponent(`Inquiry about ${currentShop.name || currentShop.shopName}`)
    const body = encodeURIComponent(
      `Hi,\n\nI found your shop on ShopConnect and would like to know more about your services.\n\nThank you!`,
    )
    window.open(`mailto:${email}?subject=${subject}&body=${body}`)
  }
}

function sendMessage() {
  window.ShopConnect.showNotification("Message feature would open here", "info")
}

// Review functions
function openReviewModal() {
  const modal = document.getElementById("reviewModal")
  if (modal) {
    modal.style.display = "block"
  }
}

function closeReviewModal() {
  const modal = document.getElementById("reviewModal")
  if (modal) {
    modal.style.display = "none"
  }

  // Reset form
  const form = document.getElementById("reviewForm")
  if (form) {
    form.reset()
    resetStarRating()
  }
}

function updateStarRating(rating) {
  const stars = document.querySelectorAll(".star-rating .star")
  stars.forEach((star, index) => {
    if (index < rating) {
      star.classList.add("active")
    } else {
      star.classList.remove("active")
    }
  })

  // Store rating value
  const form = document.getElementById("reviewForm")
  if (form) {
    let ratingInput = form.querySelector('input[name="rating"]')
    if (!ratingInput) {
      ratingInput = document.createElement("input")
      ratingInput.type = "hidden"
      ratingInput.name = "rating"
      form.appendChild(ratingInput)
    }
    ratingInput.value = rating
  }
}

function highlightStars(rating) {
  const stars = document.querySelectorAll(".star-rating .star")
  stars.forEach((star, index) => {
    if (index < rating) {
      star.style.color = "#fbbf24"
    } else {
      star.style.color = "#e2e8f0"
    }
  })
}

function resetStarRating() {
  const stars = document.querySelectorAll(".star-rating .star")
  stars.forEach((star) => {
    star.classList.remove("active")
    star.style.color = "#e2e8f0"
  })
}

function submitReview() {
  const form = document.getElementById("reviewForm")
  if (!form) return

  const formData = new FormData(form)
  const rating = formData.get("rating")
  const reviewText = formData.get("reviewText")
  const reviewerName = formData.get("reviewerName")

  if (!rating) {
    window.ShopConnect.showNotification("Please select a rating", "error")
    return
  }

  if (!reviewText.trim()) {
    window.ShopConnect.showNotification("Please write a review", "error")
    return
  }

  if (!reviewerName.trim()) {
    window.ShopConnect.showNotification("Please enter your name", "error")
    return
  }

  // Save review (in a real app, this would be sent to a server)
  const review = {
    id: window.ShopConnect.generateId(),
    shopId: currentShop.id,
    rating: Number.parseInt(rating),
    text: reviewText,
    reviewerName: reviewerName,
    date: new Date().toISOString(),
  }

  // Update shop rating and review count
  const shops = JSON.parse(localStorage.getItem("shops")) || []
  const shopIndex = shops.findIndex((shop) => shop.id === currentShop.id)
  if (shopIndex !== -1) {
    const currentRating = shops[shopIndex].rating || 0
    const currentReviews = shops[shopIndex].reviews || 0

    // Calculate new average rating
    const newRating = (currentRating * currentReviews + Number.parseInt(rating)) / (currentReviews + 1)

    shops[shopIndex].rating = Math.round(newRating * 10) / 10
    shops[shopIndex].reviews = currentReviews + 1

    localStorage.setItem("shops", JSON.stringify(shops))
    currentShop = shops[shopIndex]
  }

  window.ShopConnect.showNotification("Review submitted successfully!", "success")
  closeReviewModal()

  // Refresh the page to show updated rating
  setTimeout(() => {
    displayShopProfile()
  }, 1000)
}

function bookService(shopId) {
  localStorage.setItem("selectedShopId", shopId)
  window.location.href = "booking.html"
}

function goBack() {
  window.history.back()
}
