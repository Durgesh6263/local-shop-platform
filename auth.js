// Authentication System
class AuthManager {
  constructor() {
    this.currentUser = null
    this.users = JSON.parse(localStorage.getItem("users")) || []
    this.init()
  }

  init() {
    // Check if user is already logged in
    const savedUser = localStorage.getItem("currentUser")
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser)
      this.updateUI()
    }

    // Add default admin user if none exists
    if (!this.users.find((user) => user.role === "admin")) {
      this.users.push({
        id: "admin1",
        name: "Admin User",
        email: "admin@localconnect.com",
        phone: "+91-9999999999",
        password: "admin123",
        role: "admin",
        createdAt: new Date().toISOString(),
      })
      localStorage.setItem("users", JSON.stringify(this.users))
    }
  }

  login(email, password, role) {
    const user = this.users.find((u) => u.email === email && u.password === password && u.role === role)

    if (user) {
      this.currentUser = user
      localStorage.setItem("currentUser", JSON.stringify(user))
      this.updateUI()
      closeAuthModal()
      window.showNotification("Login successful!", "success")

      // Redirect based on role
      if (role === "admin") {
        window.showSection("admin")
      } else {
        window.showSection("dashboard")
      }

      return true
    } else {
      window.showNotification("Invalid credentials or role!", "error")
      return false
    }
  }

  signup(userData) {
    // Check if user already exists
    if (this.users.find((u) => u.email === userData.email)) {
      window.showNotification("User with this email already exists!", "error")
      return false
    }

    const newUser = {
      id: window.generateId(),
      ...userData,
      createdAt: new Date().toISOString(),
    }

    this.users.push(newUser)
    localStorage.setItem("users", JSON.stringify(this.users))

    window.showNotification("Account created successfully! Please login.", "success")
    showAuthTab("login")
    return true
  }

  logout() {
    this.currentUser = null
    localStorage.removeItem("currentUser")
    this.updateUI()
    window.showSection("home")
    window.showNotification("Logged out successfully!", "success")
  }

  updateUI() {
    const loginBtn = document.getElementById("loginBtn")
    const userInfo = document.getElementById("userInfo")
    const userName = document.getElementById("userName")
    const adminLink = document.getElementById("adminLink")
    const dashboardLink = document.getElementById("dashboardLink")

    if (this.currentUser) {
      loginBtn.style.display = "none"
      userInfo.style.display = "flex"
      userName.textContent = this.currentUser.name

      // Show/hide navigation based on role
      if (this.currentUser.role === "admin") {
        adminLink.style.display = "block"
        dashboardLink.style.display = "none"
      } else {
        adminLink.style.display = "none"
        dashboardLink.style.display = "block"
      }
    } else {
      loginBtn.style.display = "block"
      userInfo.style.display = "none"
      adminLink.style.display = "none"
      dashboardLink.style.display = "none"
    }
  }

  getCurrentUser() {
    return this.currentUser
  }

  isLoggedIn() {
    return this.currentUser !== null
  }

  hasRole(role) {
    return this.currentUser && this.currentUser.role === role
  }

  getAllUsers() {
    return this.users
  }
}

// Initialize auth manager
const authManager = new AuthManager()

// Auth modal functions
function openAuthModal() {
  document.getElementById("authModal").style.display = "block"
}

function closeAuthModal() {
  document.getElementById("authModal").style.display = "none"
}

function showAuthTab(tabName) {
  // Hide all forms
  document.querySelectorAll(".auth-form").forEach((form) => {
    form.classList.remove("active")
  })

  // Show selected form
  document.getElementById(tabName + "Form").classList.add("active")

  // Update tab buttons
  document.querySelectorAll(".auth-tab").forEach((tab) => {
    tab.classList.remove("active")
  })
  event.target.classList.add("active")
}

function handleLogin(event) {
  event.preventDefault()

  const email = document.getElementById("loginEmail").value
  const password = document.getElementById("loginPassword").value
  const role = document.getElementById("loginRole").value

  authManager.login(email, password, role)
}

function handleSignup(event) {
  event.preventDefault()

  const userData = {
    name: document.getElementById("signupName").value,
    email: document.getElementById("signupEmail").value,
    phone: document.getElementById("signupPhone").value,
    password: document.getElementById("signupPassword").value,
    role: document.getElementById("signupRole").value,
  }

  if (authManager.signup(userData)) {
    document.getElementById("signupForm").reset()
  }
}

function logout() {
  authManager.logout()
}

// Protect admin routes
function requireAuth(role = null) {
  if (!authManager.isLoggedIn()) {
    window.showNotification("Please login to access this feature!", "error")
    openAuthModal()
    return false
  }

  if (role && !authManager.hasRole(role)) {
    window.showNotification("You do not have permission to access this feature!", "error")
    return false
  }

  return true
}

// Declare global functions
window.showNotification = (message, type) => {
  console.log(`Notification: ${message} (Type: ${type})`)
}

window.showSection = (sectionName) => {
  console.log(`Showing section: ${sectionName}`)
}

window.generateId = () => Math.random().toString(36).substr(2, 9)
