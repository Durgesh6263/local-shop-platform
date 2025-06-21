// Booking functionality

let selectedShop = null
const bookingData = {}

document.addEventListener("DOMContentLoaded", () => {
  initializeBookingPage()
})

function initializeBookingPage() {
  loadSelectedShop()
  setupBookingForm()
  setupServiceLocationToggle()
  updateBookingSummary()
}

function loadSelectedShop() {
  const shopId = localStorage.getItem("selectedShopId")
  if (!shopId) {
    window.ShopConnect.showNotification("No shop selected", "error")
    window.location.href = "customer.html"
    return
  }

  const shops = JSON.parse(localStorage.getItem("shops")) || []
  selectedShop = shops.find((shop) => shop.id === shopId)

  if (!selectedShop) {
    window.ShopConnect.showNotification("Shop not found", "error")
    window.location.href = "customer.html"
    return
  }

  displayShopInfo()
  populateServiceOptions()
}

function displayShopInfo() {
  const shopInfoCard = document.getElementById("shopInfoCard")
  if (!shopInfoCard || !selectedShop) return

  shopInfoCard.innerHTML = `
        <div class="shop-info-header">
            <div class="shop-info-icon">
                <i class="fas fa-${window.ShopConnect.getShopIcon(selectedShop.category)}"></i>
            </div>
            <div class="shop-info-details">
                <h3>${selectedShop.name}</h3>
                <span class="shop-info-category">${selectedShop.category}</span>
            </div>
        </div>
        <div class="shop-info-rating">
            <div class="stars">${"★".repeat(Math.floor(selectedShop.rating))}${"☆".repeat(5 - Math.floor(selectedShop.rating))}</div>
            <span>(${selectedShop.reviews} reviews)</span>
        </div>
        <ul class="shop-info-list">
            <li>
                <i class="fas fa-map-marker-alt"></i>
                <span>${selectedShop.address}</span>
            </li>
            <li>
                <i class="fas fa-clock"></i>
                <span>${selectedShop.timings}</span>
            </li>
            <li>
                <i class="fas fa-phone"></i>
                <span>${selectedShop.phone}</span>
            </li>
            ${selectedShop.homeService ? '<li><i class="fas fa-home"></i><span>Home Service Available</span></li>' : ""}
            ${selectedShop.onlinePayment ? '<li><i class="fas fa-credit-card"></i><span>Online Payment Accepted</span></li>' : ""}
        </ul>
    `
}

function populateServiceOptions() {
  const serviceTypeSelect = document.getElementById("serviceType")
  if (!serviceTypeSelect || !selectedShop) return

  // Clear existing options except the first one
  serviceTypeSelect.innerHTML = '<option value="">Select Service</option>'

  // Add services based on shop category
  const services = getServicesByCategory(selectedShop.category)
  services.forEach((service) => {
    const option = document.createElement("option")
    option.value = service.id
    option.textContent = service.name
    option.dataset.price = service.price
    serviceTypeSelect.appendChild(option)
  })

  // Add custom services if shop has them
  if (selectedShop.services && selectedShop.services.length > 0) {
    selectedShop.services.forEach((service) => {
      const option = document.createElement("option")
      option.value = service.name.toLowerCase().replace(/\s+/g, "-")
      option.textContent = service.name
      option.dataset.price = service.price
      serviceTypeSelect.appendChild(option)
    })
  }
}

function getServicesByCategory(category) {
  const servicesByCategory = {
    electronics: [
      { id: "mobile-repair", name: "Mobile Phone Repair", price: 500 },
      { id: "laptop-repair", name: "Laptop Repair", price: 1500 },
      { id: "tv-repair", name: "TV Repair", price: 1000 },
      { id: "screen-replacement", name: "Screen Replacement", price: 2000 },
    ],
    kirana: [
      { id: "grocery-delivery", name: "Grocery Delivery", price: 50 },
      { id: "bulk-order", name: "Bulk Order", price: 100 },
      { id: "monthly-subscription", name: "Monthly Subscription", price: 200 },
    ],
    repair: [
      { id: "ac-repair", name: "AC Repair", price: 800 },
      { id: "washing-machine", name: "Washing Machine Repair", price: 600 },
      { id: "refrigerator", name: "Refrigerator Repair", price: 1000 },
      { id: "microwave", name: "Microwave Repair", price: 400 },
    ],
    tailor: [
      { id: "alteration", name: "Clothing Alteration", price: 200 },
      { id: "stitching", name: "Custom Stitching", price: 800 },
      { id: "repair", name: "Clothing Repair", price: 150 },
    ],
    medical: [
      { id: "consultation", name: "Medical Consultation", price: 300 },
      { id: "home-visit", name: "Home Visit", price: 500 },
      { id: "medicine-delivery", name: "Medicine Delivery", price: 50 },
    ],
    restaurant: [
      { id: "catering", name: "Catering Service", price: 2000 },
      { id: "home-delivery", name: "Home Delivery", price: 100 },
      { id: "bulk-order", name: "Bulk Food Order", price: 1500 },
    ],
  }

  return servicesByCategory[category] || []
}

function setupBookingForm() {
  const form = document.getElementById("bookingForm")
  if (!form) return

  form.addEventListener("submit", (event) => {
    event.preventDefault()
    submitBooking()
  })

  // Setup form field listeners
  const serviceTypeSelect = document.getElementById("serviceType")
  serviceTypeSelect?.addEventListener("change", () => {
    updateEstimatedCost()
    updateBookingSummary()
  })

  const serviceDateInput = document.getElementById("serviceDate")
  serviceDateInput?.addEventListener("change", updateBookingSummary)

  const serviceTimeSelect = document.getElementById("serviceTime")
  serviceTimeSelect?.addEventListener("change", updateBookingSummary)

  const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]')
  paymentRadios.forEach((radio) => {
    radio.addEventListener("change", updateBookingSummary)
  })

  // Set minimum date to today
  if (serviceDateInput) {
    const today = new Date().toISOString().split("T")[0]
    serviceDateInput.min = today
  }
}

function setupServiceLocationToggle() {
  const locationRadios = document.querySelectorAll('input[name="serviceLocation"]')
  locationRadios.forEach((radio) => {
    radio.addEventListener("change", toggleLocationFields)
  })
}

function toggleLocationFields() {
  const homeAddressSection = document.getElementById("homeAddressSection")
  const homeServiceRadio = document.querySelector('input[name="serviceLocation"][value="home"]')

  if (homeAddressSection && homeServiceRadio) {
    if (homeServiceRadio.checked) {
      homeAddressSection.style.display = "block"
      // Make address fields required
      const addressField = document.getElementById("serviceAddress")
      if (addressField) {
        addressField.required = true
      }
    } else {
      homeAddressSection.style.display = "none"
      // Remove required attribute
      const addressField = document.getElementById("serviceAddress")
      if (addressField) {
        addressField.required = false
      }
    }
  }

  updateBookingSummary()
}

function updateEstimatedCost() {
  const serviceTypeSelect = document.getElementById("serviceType")
  const estimatedCostElement = document.getElementById("estimatedCost")

  if (!serviceTypeSelect || !estimatedCostElement) return

  const selectedOption = serviceTypeSelect.options[serviceTypeSelect.selectedIndex]
  if (selectedOption && selectedOption.dataset.price) {
    const price = Number.parseInt(selectedOption.dataset.price)
    estimatedCostElement.textContent = `₹ ${price}`
  } else {
    estimatedCostElement.textContent = "₹ --"
  }
}

function updateBookingSummary() {
  const serviceTypeSelect = document.getElementById("serviceType")
  const serviceDateInput = document.getElementById("serviceDate")
  const serviceTimeSelect = document.getElementById("serviceTime")
  const locationRadios = document.querySelectorAll('input[name="serviceLocation"]')
  const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]')

  // Update service
  const summaryService = document.getElementById("summaryService")
  if (summaryService && serviceTypeSelect) {
    const selectedOption = serviceTypeSelect.options[serviceTypeSelect.selectedIndex]
    summaryService.textContent = selectedOption.text || "--"
  }

  // Update date and time
  const summaryDateTime = document.getElementById("summaryDateTime")
  if (summaryDateTime && serviceDateInput && serviceTimeSelect) {
    const date = serviceDateInput.value ? window.ShopConnect.formatDate(serviceDateInput.value) : "--"
    const time = serviceTimeSelect.value ? window.ShopConnect.formatTime(serviceTimeSelect.value) : "--"
    summaryDateTime.textContent = `${date} at ${time}`
  }

  // Update location
  const summaryLocation = document.getElementById("summaryLocation")
  if (summaryLocation && locationRadios) {
    const selectedLocation = Array.from(locationRadios).find((radio) => radio.checked)
    if (selectedLocation) {
      summaryLocation.textContent = selectedLocation.value === "shop" ? "At Shop" : "Home Service"
    } else {
      summaryLocation.textContent = "--"
    }
  }

  // Update payment
  const summaryPayment = document.getElementById("summaryPayment")
  if (summaryPayment && paymentRadios) {
    const selectedPayment = Array.from(paymentRadios).find((radio) => radio.checked)
    if (selectedPayment) {
      summaryPayment.textContent = selectedPayment.value === "cash" ? "Cash Payment" : "Online Payment"
    } else {
      summaryPayment.textContent = "--"
    }
  }
}

function submitBooking() {
  const form = document.getElementById("bookingForm")
  if (!form) return

  // Validate form
  if (!window.ShopConnect.validateForm(form)) {
    window.ShopConnect.showNotification("Please fill all required fields correctly", "error")
    return
  }

  // Collect form data
  const formData = new FormData(form)
  const booking = {}

  for (const [key, value] of formData.entries()) {
    booking[key] = value
  }

  // Add additional data
  booking.id = window.ShopConnect.generateId()
  booking.shopId = selectedShop.id
  booking.shopName = selectedShop.name
  booking.status = "pending"
  booking.createdAt = new Date().toISOString()

  // Get service details
  const serviceTypeSelect = document.getElementById("serviceType")
  const selectedOption = serviceTypeSelect.options[serviceTypeSelect.selectedIndex]
  if (selectedOption && selectedOption.dataset.price) {
    booking.estimatedCost = Number.parseInt(selectedOption.dataset.price)
  }

  // Save booking
  const bookings = JSON.parse(localStorage.getItem("bookings")) || []
  bookings.push(booking)
  localStorage.setItem("bookings", JSON.stringify(bookings))

  // Show confirmation
  showConfirmationModal(booking)
}

function showConfirmationModal(booking) {
  const modal = document.getElementById("confirmationModal")
  const detailsContainer = document.getElementById("confirmedBookingDetails")

  if (!modal || !detailsContainer) return

  detailsContainer.innerHTML = `
        <div class="detail-item">
            <span>Booking ID:</span>
            <span>${booking.id}</span>
        </div>
        <div class="detail-item">
            <span>Shop:</span>
            <span>${booking.shopName}</span>
        </div>
        <div class="detail-item">
            <span>Service:</span>
            <span>${document.getElementById("serviceType").options[document.getElementById("serviceType").selectedIndex].text}</span>
        </div>
        <div class="detail-item">
            <span>Date & Time:</span>
            <span>${window.ShopConnect.formatDate(booking.serviceDate)} at ${window.ShopConnect.formatTime(booking.serviceTime)}</span>
        </div>
        <div class="detail-item">
            <span>Location:</span>
            <span>${booking.serviceLocation === "shop" ? "At Shop" : "Home Service"}</span>
        </div>
        <div class="detail-item">
            <span>Estimated Cost:</span>
            <span>₹ ${booking.estimatedCost || "TBD"}</span>
        </div>
    `

  modal.style.display = "block"
}

function closeConfirmationModal() {
  const modal = document.getElementById("confirmationModal")
  if (modal) {
    modal.style.display = "none"
  }

  // Clear selected shop
  localStorage.removeItem("selectedShopId")
}

function goBack() {
  window.history.back()
}
