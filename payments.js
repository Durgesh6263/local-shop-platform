// Payment Gateway Integration (Razorpay)
class PaymentManager {
  constructor(authManager, Razorpay, showNotification, closeBookingModal, notificationManager) {
    this.payments = JSON.parse(localStorage.getItem("payments")) || []
    this.razorpayKey = "rzp_test_1234567890" // Demo key
    this.authManager = authManager
    this.Razorpay = Razorpay
    this.showNotification = showNotification
    this.closeBookingModal = closeBookingModal
    this.notificationManager = notificationManager
  }

  processPayment(bookingData, amount) {
    const currentUser = this.authManager.getCurrentUser()
    if (!currentUser) {
      this.showNotification("Please login to make payment", "error")
      return
    }

    const options = {
      key: this.razorpayKey,
      amount: amount * 100, // Amount in paise
      currency: "INR",
      name: "LocalConnect",
      description: `Payment for ${bookingData.serviceType}`,
      image: "/favicon.ico",
      order_id: this.generateOrderId(),
      handler: (response) => {
        this.handlePaymentSuccess(response, bookingData, amount)
      },
      prefill: {
        name: currentUser.name,
        email: currentUser.email,
        contact: currentUser.phone,
      },
      notes: {
        booking_id: bookingData.id,
        service_type: bookingData.serviceType,
      },
      theme: {
        color: "#3b82f6",
      },
      modal: {
        ondismiss: () => {
          this.showNotification("Payment cancelled", "warning")
        },
      },
    }

    const rzp = new this.Razorpay(options)
    rzp.open()
  }

  handlePaymentSuccess(response, bookingData, amount) {
    const payment = {
      id: this.generateId(),
      razorpayPaymentId: response.razorpay_payment_id,
      razorpayOrderId: response.razorpay_order_id,
      razorpaySignature: response.razorpay_signature,
      bookingId: bookingData.id,
      amount: amount,
      currency: "INR",
      status: "completed",
      userId: this.authManager.getCurrentUser().id,
      timestamp: new Date().toISOString(),
    }

    this.payments.push(payment)
    localStorage.setItem("payments", JSON.stringify(this.payments))

    // Update booking status
    const bookings = JSON.parse(localStorage.getItem("bookings")) || []
    const booking = bookings.find((b) => b.id === bookingData.id)
    if (booking) {
      booking.paymentStatus = "paid"
      booking.paymentId = payment.id
      localStorage.setItem("bookings", JSON.stringify(bookings))
    }

    this.showNotification("Payment successful!", "success")
    this.closeBookingModal()

    // Send notification to shop owner
    this.notificationManager.addNotification({
      title: "Payment Received",
      message: `Payment of ₹${amount} received for booking #${bookingData.id}`,
      type: "payment",
      userId: this.getShopOwnerId(bookingData.shopId),
    })
  }

  generateOrderId() {
    return "order_" + Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  getShopOwnerId(shopId) {
    const shops = JSON.parse(localStorage.getItem("shops")) || []
    const shop = shops.find((s) => s.id === shopId)
    return shop ? shop.ownerId : null
  }

  getPaymentHistory(userId) {
    return this.payments.filter((p) => p.userId === userId)
  }

  getTotalRevenue() {
    return this.payments.filter((p) => p.status === "completed").reduce((total, payment) => total + payment.amount, 0)
  }

  getRevenueByShop(shopId) {
    const bookings = JSON.parse(localStorage.getItem("bookings")) || []
    const shopBookings = bookings.filter((b) => b.shopId === shopId && b.paymentStatus === "paid")

    return shopBookings.reduce((total, booking) => {
      const payment = this.payments.find((p) => p.bookingId === booking.id)
      return total + (payment ? payment.amount : 0)
    }, 0)
  }
}

// Initialize payment manager
const paymentManager = new PaymentManager(
  authManager,
  Razorpay,
  showNotification,
  closeBookingModal,
  notificationManager,
)

function processPayment() {
  const bookingModal = document.getElementById("bookingModal")
  const shopId = bookingModal.dataset.shopId
  const amount = Number.parseFloat(document.getElementById("serviceAmount").value)

  if (!amount || amount <= 0) {
    showNotification("Please enter a valid amount", "error")
    return
  }

  const bookingData = {
    id: generateId(),
    shopId: shopId,
    serviceType: document.getElementById("serviceType").value,
    date: document.getElementById("bookingDate").value,
    time: document.getElementById("bookingTime").value,
    customerName: document.getElementById("customerName").value,
    customerPhone: document.getElementById("customerPhone").value,
    notes: document.getElementById("bookingNotes").value,
    amount: amount,
  }

  paymentManager.processPayment(bookingData, amount)
}

function showPaymentModal(bookingId, amount) {
  const modal = document.getElementById("paymentModal")
  const detailsDiv = document.getElementById("paymentDetails")

  detailsDiv.innerHTML = `
    <div class="payment-summary">
      <h4>Payment Summary</h4>
      <div class="payment-item">
        <span>Service Amount:</span>
        <span>₹${amount}</span>
      </div>
      <div class="payment-item">
        <span>Platform Fee:</span>
        <span>₹${(amount * 0.02).toFixed(2)}</span>
      </div>
      <div class="payment-item payment-total">
        <span>Total Amount:</span>
        <span>₹${(amount * 1.02).toFixed(2)}</span>
      </div>
    </div>
    <button class="btn btn-primary btn-full" onclick="processDirectPayment('${bookingId}', ${amount * 1.02})">
      <i class="fas fa-credit-card"></i> Pay with Razorpay
    </button>
  `

  modal.style.display = "block"
}

function closePaymentModal() {
  document.getElementById("paymentModal").style.display = "none"
}

function processDirectPayment(bookingId, amount) {
  const bookings = JSON.parse(localStorage.getItem("bookings")) || []
  const booking = bookings.find((b) => b.id === bookingId)

  if (booking) {
    paymentManager.processPayment(booking, amount)
  }
}

function generateId() {
  return "_" + Math.random().toString(36).substr(2, 9)
}
