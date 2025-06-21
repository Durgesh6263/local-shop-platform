// Shop registration functionality

let currentStep = 1
const totalSteps = 4
const formData = {}

document.addEventListener("DOMContentLoaded", () => {
  initializeRegistrationForm()
})

function initializeRegistrationForm() {
  setupFormValidation()
  setupFileUploads()
  setupStepNavigation()
  loadFormData()
}

function setupFormValidation() {
  const form = document.getElementById("shopRegistrationForm")
  if (!form) return

  form.addEventListener("submit", (event) => {
    event.preventDefault()
    submitRegistration()
  })

  // Real-time validation
  const inputs = form.querySelectorAll("input, select, textarea")
  inputs.forEach((input) => {
    input.addEventListener("blur", function () {
      validateField(this)
    })

    input.addEventListener("input", function () {
      clearFieldError(this)
      saveFormData()
    })
  })
}

function setupFileUploads() {
  const shopImagesInput = document.getElementById("shopImages")
  const businessDocInput = document.getElementById("businessDoc")

  if (shopImagesInput) {
    shopImagesInput.addEventListener("change", function () {
      handleImageUpload(this)
    })
  }

  if (businessDocInput) {
    businessDocInput.addEventListener("change", function () {
      handleDocUpload(this)
    })
  }
}

function setupStepNavigation() {
  updateStepDisplay()
  updateNavigationButtons()
}

function changeStep(direction) {
  if (direction === 1) {
    // Moving forward - validate current step
    if (!validateCurrentStep()) {
      return
    }

    if (currentStep < totalSteps) {
      currentStep++
    }
  } else {
    // Moving backward
    if (currentStep > 1) {
      currentStep--
    }
  }

  updateStepDisplay()
  updateNavigationButtons()
  saveFormData()
}

function validateCurrentStep() {
  const currentStepElement = document.getElementById(`step${currentStep}`)
  if (!currentStepElement) return true

  const requiredFields = currentStepElement.querySelectorAll("[required]")
  let isValid = true

  requiredFields.forEach((field) => {
    if (!validateField(field)) {
      isValid = false
    }
  })

  return isValid
}

function validateField(field) {
  const value = field.value.trim()
  let isValid = true
  let errorMessage = ""

  // Check if required field is empty
  if (field.hasAttribute("required") && !value) {
    errorMessage = "This field is required"
    isValid = false
  }
  // Validate email
  else if (field.type === "email" && value && !window.ShopConnect.isValidEmail(value)) {
    errorMessage = "Please enter a valid email address"
    isValid = false
  }
  // Validate phone
  else if (field.type === "tel" && value && !window.ShopConnect.isValidPhone(value)) {
    errorMessage = "Please enter a valid phone number"
    isValid = false
  }
  // Validate pin code
  else if (field.id === "pinCode" && value && !/^\d{6}$/.test(value)) {
    errorMessage = "Please enter a valid 6-digit pin code"
    isValid = false
  }

  if (!isValid) {
    showFieldError(field, errorMessage)
  } else {
    clearFieldError(field)
  }

  return isValid
}

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

function clearFieldError(field) {
  field.style.borderColor = ""

  const existingError = field.parentNode.querySelector(".field-error")
  if (existingError) {
    existingError.remove()
  }
}

function updateStepDisplay() {
  // Hide all steps
  for (let i = 1; i <= totalSteps; i++) {
    const step = document.getElementById(`step${i}`)
    if (step) {
      step.classList.remove("active")
    }
  }

  // Show current step
  const currentStepElement = document.getElementById(`step${currentStep}`)
  if (currentStepElement) {
    currentStepElement.classList.add("active")
  }

  // Update progress indicators
  document.querySelectorAll(".step").forEach((step, index) => {
    const stepNumber = index + 1
    step.classList.remove("active", "completed")

    if (stepNumber === currentStep) {
      step.classList.add("active")
    } else if (stepNumber < currentStep) {
      step.classList.add("completed")
    }
  })
}

function updateNavigationButtons() {
  const prevBtn = document.getElementById("prevBtn")
  const nextBtn = document.getElementById("nextBtn")
  const submitBtn = document.getElementById("submitBtn")

  if (prevBtn) {
    prevBtn.style.display = currentStep === 1 ? "none" : "inline-flex"
  }

  if (nextBtn) {
    nextBtn.style.display = currentStep === totalSteps ? "none" : "inline-flex"
  }

  if (submitBtn) {
    submitBtn.style.display = currentStep === totalSteps ? "inline-flex" : "none"
  }
}

function handleImageUpload(input) {
  const files = Array.from(input.files)
  const maxFiles = 5
  const maxSize = 5 * 1024 * 1024 // 5MB

  if (files.length > maxFiles) {
    window.ShopConnect.showNotification(`You can upload maximum ${maxFiles} images`, "error")
    input.value = ""
    return
  }

  const validFiles = files.filter((file) => {
    if (!file.type.startsWith("image/")) {
      window.ShopConnect.showNotification(`${file.name} is not a valid image file`, "error")
      return false
    }

    if (file.size > maxSize) {
      window.ShopConnect.showNotification(`${file.name} is too large. Maximum size is 5MB`, "error")
      return false
    }

    return true
  })

  if (validFiles.length !== files.length) {
    // Reset input if some files were invalid
    input.value = ""
    return
  }

  displayUploadedImages(validFiles)
}

function handleDocUpload(input) {
  const file = input.files[0]
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]

  if (!file) return

  if (!allowedTypes.includes(file.type)) {
    window.ShopConnect.showNotification("Please upload a PDF, JPG, or PNG file", "error")
    input.value = ""
    return
  }

  if (file.size > maxSize) {
    window.ShopConnect.showNotification("File is too large. Maximum size is 10MB", "error")
    input.value = ""
    return
  }

  displayUploadedDoc(file)
}

function displayUploadedImages(files) {
  const container = document.getElementById("uploadedImages")
  if (!container) return

  container.innerHTML = ""

  files.forEach((file, index) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageDiv = document.createElement("div")
      imageDiv.className = "uploaded-item"
      imageDiv.innerHTML = `
                <img src="${e.target.result}" alt="Shop image ${index + 1}">
                <div class="file-name">${file.name}</div>
                <button type="button" class="remove-file" onclick="removeUploadedFile(this, 'images')">×</button>
            `
      container.appendChild(imageDiv)
    }
    reader.readAsDataURL(file)
  })
}

function displayUploadedDoc(file) {
  const container = document.getElementById("uploadedDocs")
  if (!container) return

  container.innerHTML = ""

  const docDiv = document.createElement("div")
  docDiv.className = "uploaded-item"
  docDiv.innerHTML = `
        <i class="fas fa-file-alt" style="font-size: 2rem; color: #3b82f6; margin-bottom: 0.5rem;"></i>
        <div class="file-name">${file.name}</div>
        <button type="button" class="remove-file" onclick="removeUploadedFile(this, 'doc')">×</button>
    `
  container.appendChild(docDiv)
}

function removeUploadedFile(button, type) {
  button.parentElement.remove()

  if (type === "images") {
    document.getElementById("shopImages").value = ""
  } else if (type === "doc") {
    document.getElementById("businessDoc").value = ""
  }
}

function openMapSelector() {
  // In a real application, this would open a map interface
  window.ShopConnect.showNotification(
    "Map selector would open here. For demo, coordinates will be auto-generated.",
    "info",
  )

  // Simulate map selection
  setTimeout(() => {
    const mapContainer = document.getElementById("mapContainer")
    if (mapContainer) {
      mapContainer.innerHTML = `
                <div style="background: #e0f2fe; padding: 1rem; border-radius: 8px; text-align: center;">
                    <i class="fas fa-map-marker-alt" style="color: #3b82f6; font-size: 1.5rem; margin-bottom: 0.5rem;"></i>
                    <p style="margin: 0; color: #1e293b; font-weight: 500;">Location Selected</p>
                    <small style="color: #64748b;">Lat: 28.6139, Lng: 77.2090</small>
                </div>
            `
    }
  }, 1000)
}

function saveFormData() {
  const form = document.getElementById("shopRegistrationForm")
  if (!form) return

  const formData = new FormData(form)
  const data = {}

  for (const [key, value] of formData.entries()) {
    data[key] = value
  }

  // Save checkboxes
  const checkboxes = form.querySelectorAll('input[type="checkbox"]')
  checkboxes.forEach((checkbox) => {
    data[checkbox.name] = checkbox.checked
  })

  localStorage.setItem("shopRegistrationData", JSON.stringify(data))
}

function loadFormData() {
  const savedData = localStorage.getItem("shopRegistrationData")
  if (!savedData) return

  try {
    const data = JSON.parse(savedData)
    const form = document.getElementById("shopRegistrationForm")
    if (!form) return

    // Fill form fields
    Object.keys(data).forEach((key) => {
      const field = form.querySelector(`[name="${key}"]`)
      if (field) {
        if (field.type === "checkbox") {
          field.checked = data[key]
        } else {
          field.value = data[key]
        }
      }
    })
  } catch (error) {
    console.error("Error loading form data:", error)
  }
}

function submitRegistration() {
  // Validate entire form
  if (!validateAllSteps()) {
    window.ShopConnect.showNotification("Please fill all required fields correctly", "error")
    return
  }

  // Collect form data
  const form = document.getElementById("shopRegistrationForm")
  const formData = new FormData(form)
  const shopData = {}

  for (const [key, value] of formData.entries()) {
    shopData[key] = value
  }

  // Add checkboxes
  const checkboxes = form.querySelectorAll('input[type="checkbox"]')
  checkboxes.forEach((checkbox) => {
    shopData[checkbox.name] = checkbox.checked
  })

  // Add additional data
  shopData.id = window.ShopConnect.generateId()
  shopData.status = "pending"
  shopData.registeredAt = new Date().toISOString()
  shopData.rating = 0
  shopData.reviews = 0
  shopData.location = {
    lat: 28.6139 + (Math.random() - 0.5) * 0.1,
    lng: 77.209 + (Math.random() - 0.5) * 0.1,
  }
  shopData.images = []
  shopData.services = []

  // Save to localStorage
  const shops = JSON.parse(localStorage.getItem("shops")) || []
  shops.push(shopData)
  localStorage.setItem("shops", JSON.stringify(shops))

  // Clear saved form data
  localStorage.removeItem("shopRegistrationData")

  // Show success modal
  showSuccessModal()
}

function validateAllSteps() {
  let isValid = true

  for (let step = 1; step <= totalSteps; step++) {
    const stepElement = document.getElementById(`step${step}`)
    if (!stepElement) continue

    const requiredFields = stepElement.querySelectorAll("[required]")
    requiredFields.forEach((field) => {
      if (!validateField(field)) {
        isValid = false
      }
    })
  }

  return isValid
}

function showSuccessModal() {
  const modal = document.getElementById("successModal")
  if (modal) {
    modal.style.display = "block"
  }
}

function closeSuccessModal() {
  const modal = document.getElementById("successModal")
  if (modal) {
    modal.style.display = "none"
  }

  // Reset form
  const form = document.getElementById("shopRegistrationForm")
  if (form) {
    form.reset()
  }

  // Reset to first step
  currentStep = 1
  updateStepDisplay()
  updateNavigationButtons()
}
