// WhatsApp Business API Integration
class WhatsAppManager {
  constructor() {
    this.apiUrl = "https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages"
    this.accessToken = "YOUR_WHATSAPP_ACCESS_TOKEN" // Demo token
    this.conversations = JSON.parse(localStorage.getItem("whatsapp_conversations")) || {}
  }

  sendMessage(to, message, shopId = null) {
    // In production, this would make an actual API call to WhatsApp Business API
    // For demo purposes, we'll simulate the functionality

    const messageData = {
      messaging_product: "whatsapp",
      to: to,
      type: "text",
      text: {
        body: message,
      },
    }

    // Simulate API call
    this.simulateMessageSend(to, message, shopId)

    return Promise.resolve({
      success: true,
      messageId: this.generateId(),
    })
  }

  simulateMessageSend(to, message, shopId) {
    const conversationId = shopId || to

    if (!this.conversations[conversationId]) {
      this.conversations[conversationId] = []
    }

    this.conversations[conversationId].push({
      id: this.generateId(),
      from: "business",
      to: to,
      message: message,
      timestamp: new Date().toISOString(),
      status: "sent",
    })

    localStorage.setItem("whatsapp_conversations", JSON.stringify(this.conversations))

    // Simulate auto-reply after 2 seconds
    setTimeout(() => {
      this.simulateCustomerReply(conversationId, to)
    }, 2000)
  }

  simulateCustomerReply(conversationId, from) {
    const replies = [
      "Thank you for the message!",
      "I'll get back to you soon.",
      "Can you provide more details?",
      "What are your available timings?",
      "How much will it cost?",
    ]

    const randomReply = replies[Math.floor(Math.random() * replies.length)]

    this.conversations[conversationId].push({
      id: this.generateId(),
      from: from,
      to: "business",
      message: randomReply,
      timestamp: new Date().toISOString(),
      status: "received",
    })

    localStorage.setItem("whatsapp_conversations", JSON.stringify(this.conversations))

    // Update UI if chat widget is open
    if (document.getElementById("whatsappWidget").style.display !== "none") {
      this.updateChatWidget(conversationId)
    }
  }

  openWhatsAppChat(shopId, phoneNumber) {
    const widget = document.getElementById("whatsappWidget")
    widget.style.display = "block"
    widget.dataset.shopId = shopId
    widget.dataset.phoneNumber = phoneNumber

    this.updateChatWidget(shopId)
  }

  updateChatWidget(conversationId) {
    const messagesDiv = document.getElementById("whatsappMessages")
    const conversation = this.conversations[conversationId] || []

    messagesDiv.innerHTML = conversation
      .map(
        (msg) => `
      <div class="whatsapp-message ${msg.from === "business" ? "sent" : "received"}">
        ${msg.message}
        <div class="message-time">${new Date(msg.timestamp).toLocaleTimeString()}</div>
      </div>
    `,
      )
      .join("")

    messagesDiv.scrollTop = messagesDiv.scrollHeight
  }

  sendTemplateMessage(to, templateName, parameters = []) {
    const messageData = {
      messaging_product: "whatsapp",
      to: to,
      type: "template",
      template: {
        name: templateName,
        language: {
          code: "en",
        },
        components: [
          {
            type: "body",
            parameters: parameters.map((param) => ({
              type: "text",
              text: param,
            })),
          },
        ],
      },
    }

    // Simulate template message
    const templateMessages = {
      booking_confirmation: `Hello {{1}}, your booking for {{2}} on {{3}} has been confirmed. Thank you for choosing LocalConnect!`,
      payment_received: `Hi {{1}}, we have received your payment of ₹{{2}} for booking #{{3}}. Your service is confirmed.`,
      service_reminder: `Hello {{1}}, this is a reminder for your {{2}} service scheduled for {{3}} at {{4}}.`,
    }

    let message = templateMessages[templateName] || "Template message"
    parameters.forEach((param, index) => {
      message = message.replace(`{{${index + 1}}}`, param)
    })

    return this.sendMessage(to, message)
  }

  getConversation(conversationId) {
    return this.conversations[conversationId] || []
  }

  getAllConversations() {
    return this.conversations
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9)
  }
}

// Initialize WhatsApp manager
const whatsAppManager = new WhatsAppManager()
const shops = [] // Declare shops variable here

function openWhatsAppWidget(shopId, phoneNumber) {
  whatsAppManager.openWhatsAppChat(shopId, phoneNumber)
}

function closeWhatsAppWidget() {
  document.getElementById("whatsappWidget").style.display = "none"
}

function sendWhatsAppMessage() {
  const input = document.getElementById("whatsappMessageInput")
  const message = input.value.trim()

  if (!message) return

  const widget = document.getElementById("whatsappWidget")
  const shopId = widget.dataset.shopId
  const phoneNumber = widget.dataset.phoneNumber

  whatsAppManager.sendMessage(phoneNumber, message, shopId)
  input.value = ""
}

// Enhanced contact shop function with WhatsApp integration
function contactShop(method, phone, shopId = null) {
  if (method === "call") {
    window.open(`tel:${phone}`)
  } else if (method === "whatsapp") {
    if (shopId) {
      openWhatsAppWidget(shopId, phone)
    } else {
      // Direct WhatsApp web link
      const message = encodeURIComponent(
        "Hi, I'm interested in your services. Can you please provide more information?",
      )
      window.open(`https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${message}`)
    }
  }
}

// Send automated WhatsApp notifications
function sendBookingConfirmation(booking) {
  const shop = shops.find((s) => s.id === booking.shopId)
  if (shop && shop.whatsappNumber) {
    whatsAppManager.sendTemplateMessage(booking.customerPhone, "booking_confirmation", [
      booking.customerName,
      booking.serviceType,
      booking.date,
    ])
  }
}

function sendPaymentConfirmation(payment, booking) {
  const shop = shops.find((s) => s.id === booking.shopId)
  if (shop && shop.whatsappNumber) {
    whatsAppManager.sendTemplateMessage(booking.customerPhone, "payment_received", [
      booking.customerName,
      payment.amount.toString(),
      booking.id,
    ])
  }
}
