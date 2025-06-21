// Real-time Notifications System
class NotificationManager {
  constructor() {
    this.notifications = JSON.parse(localStorage.getItem("notifications")) || []
    this.unreadCount = 0
    this.init()
  }

  init() {
    this.updateNotificationCount()
    this.startRealTimeUpdates()
  }

  // Simulate real-time updates (in production, use WebSocket or Server-Sent Events)
  startRealTimeUpdates() {
    setInterval(() => {
      this.checkForNewNotifications()
    }, 30000) // Check every 30 seconds
  }

  checkForNewNotifications() {
    const currentUser = window.authManager.getCurrentUser() // Declare authManager
    if (!currentUser) return

    // Simulate receiving notifications based on user activity
    const bookings = JSON.parse(localStorage.getItem("bookings")) || []
    const recentBookings = bookings.filter((booking) => {
      const bookingTime = new Date(booking.bookedAt)
      const now = new Date()
      return now - bookingTime < 60000 // Last minute
    })

    recentBookings.forEach((booking) => {
      if (currentUser.role === "shop_owner") {
        // Notify shop owner of new bookings
        this.addNotification({
          title: "New Booking Received",
          message: `New service booking from ${booking.customerName}`,
          type: "booking",
          userId: currentUser.id,
        })
      }
    })
  }

  addNotification(notification) {
    const newNotification = {
      id: window.generateId(), // Declare generateId
      ...notification,
      timestamp: new Date().toISOString(),
      read: false,
    }

    this.notifications.unshift(newNotification)
    localStorage.setItem("notifications", JSON.stringify(this.notifications))

    this.updateNotificationCount()
    this.showNotificationPopup(newNotification)
  }

  showNotificationPopup(notification) {
    const container = document.getElementById("notificationContainer")
    const notificationElement = document.createElement("div")
    notificationElement.className = `notification ${notification.type || "info"}`

    notificationElement.innerHTML = `
      <div class="notification-header">
        <span class="notification-title">${notification.title}</span>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
      </div>
      <div class="notification-message">${notification.message}</div>
    `

    container.appendChild(notificationElement)

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notificationElement.parentNode) {
        notificationElement.remove()
      }
    }, 5000)
  }

  updateNotificationCount() {
    const currentUser = window.authManager.getCurrentUser() // Declare authManager
    if (!currentUser) return

    const userNotifications = this.notifications.filter((n) => n.userId === currentUser.id && !n.read)

    this.unreadCount = userNotifications.length
    const badge = document.getElementById("notificationCount")
    if (badge) {
      badge.textContent = this.unreadCount
      badge.style.display = this.unreadCount > 0 ? "flex" : "none"
    }
  }

  markAsRead(notificationId) {
    const notification = this.notifications.find((n) => n.id === notificationId)
    if (notification) {
      notification.read = true
      localStorage.setItem("notifications", JSON.stringify(this.notifications))
      this.updateNotificationCount()
    }
  }

  getUserNotifications(userId) {
    return this.notifications.filter((n) => n.userId === userId)
  }
}

// Initialize notification manager
const notificationManager = new NotificationManager()

// Global notification function
function showNotification(message, type = "info", title = "Notification") {
  notificationManager.showNotificationPopup({
    title: title,
    message: message,
    type: type,
  })
}

function toggleNotifications() {
  // This would show a dropdown with all notifications
  // For now, just show a simple alert
  const currentUser = window.authManager.getCurrentUser() // Declare authManager
  if (!currentUser) return

  const userNotifications = notificationManager.getUserNotifications(currentUser.id)
  if (userNotifications.length === 0) {
    showNotification("No notifications", "info")
  } else {
    // In a real app, this would show a dropdown
    showNotification(`You have ${userNotifications.length} notifications`, "info")
  }
}

// Declare authManager and generateId globally
window.authManager = {
  getCurrentUser: () => {
    // Simulate getting current user
    return { id: 1, role: "shop_owner" }
  },
}

window.generateId = () => {
  // Simulate generating a unique ID
  return Math.random().toString(36).substr(2, 9)
}
