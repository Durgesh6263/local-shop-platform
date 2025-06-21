// Navigation functionality

document.addEventListener("DOMContentLoaded", () => {
  setupNavigation()
})

function setupNavigation() {
  const navToggle = document.getElementById("navToggle")
  const navMenu = document.querySelector(".nav-menu")

  // Mobile menu toggle
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active")

      // Animate hamburger menu
      const spans = navToggle.querySelectorAll("span")
      spans.forEach((span, index) => {
        if (navMenu.classList.contains("active")) {
          if (index === 0) span.style.transform = "rotate(45deg) translate(5px, 5px)"
          if (index === 1) span.style.opacity = "0"
          if (index === 2) span.style.transform = "rotate(-45deg) translate(7px, -6px)"
        } else {
          span.style.transform = ""
          span.style.opacity = ""
        }
      })
    })
  }

  // Close mobile menu when clicking on a link
  const navLinks = document.querySelectorAll(".nav-link")
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (navMenu) {
        navMenu.classList.remove("active")
        // Reset hamburger menu
        const spans = navToggle?.querySelectorAll("span")
        spans?.forEach((span) => {
          span.style.transform = ""
          span.style.opacity = ""
        })
      }
    })
  })

  // Close mobile menu when clicking outside
  document.addEventListener("click", (event) => {
    if (navMenu && navToggle && !navMenu.contains(event.target) && !navToggle.contains(event.target)) {
      navMenu.classList.remove("active")
      // Reset hamburger menu
      const spans = navToggle.querySelectorAll("span")
      spans.forEach((span) => {
        span.style.transform = ""
        span.style.opacity = ""
      })
    }
  })

  // Highlight current page in navigation
  highlightCurrentPage()
}

function highlightCurrentPage() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html"
  const navLinks = document.querySelectorAll(".nav-link")

  navLinks.forEach((link) => {
    const linkPage = link.getAttribute("href")
    if (linkPage === currentPage || (currentPage === "" && linkPage === "index.html")) {
      link.classList.add("active")
    } else {
      link.classList.remove("active")
    }
  })
}

// Smooth scroll for anchor links
function setupSmoothScroll() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]')

  anchorLinks.forEach((link) => {
    link.addEventListener("click", function (event) {
      const targetId = this.getAttribute("href").substring(1)
      const targetElement = document.getElementById(targetId)

      if (targetElement) {
        event.preventDefault()
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  })
}

// Initialize smooth scroll
document.addEventListener("DOMContentLoaded", setupSmoothScroll)
