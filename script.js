// --- Users with username:password ---
const users = {
  "Ko": "achitkalay",
  "Chit": "achitkalay"
};

// --- DOM Elements ---
const loginForm = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");
const chatPage = document.getElementById("chatPage");
const loginPage = document.getElementById("loginPage");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const chatBox = document.getElementById("chatBox");
const userTitle = document.getElementById("userTitle");

let currentUser = localStorage.getItem("chatUser");
let lastMessageCount = 0;

// --- Sound (optional) ---
const notificationSound = new Audio("https://www.soundjay.com/button/beep-07.wav");

// --- Login handler ---
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (users[username] === password) {
    switchToChat(username);
  } else {
    errorMsg.textContent = "Invalid username or password.";
  }
});

// --- Switch to chat view ---
function switchToChat(user) {
  currentUser = user;
  localStorage.setItem("chatUser", user);
  userTitle.textContent = "Chat as " + user;
  loginPage.style.display = "none";
  chatPage.style.display = "flex";
  loadMessages();
}

// --- Send message handler ---
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;

  const messages = JSON.parse(localStorage.getItem("messages") || "[]");
  messages.push({ sender: currentUser, text });
  localStorage.setItem("messages", JSON.stringify(messages));

  messageInput.value = "";
  loadMessages();
});

// --- Load and display messages ---
function loadMessages() {
  const messages = JSON.parse(localStorage.getItem("messages") || "[]");

  // Show notification if new message from other user
  if (messages.length > lastMessageCount) {
    const newMessages = messages.slice(lastMessageCount);
    newMessages.forEach(msg => {
      if (msg.sender !== currentUser && Notification.permission === "granted") {
        showNotification(msg);
        playSound();
      }
    });
  }
  lastMessageCount = messages.length;

  // Render messages
  chatBox.innerHTML = "";
  messages.forEach(msg => {
    const div = document.createElement("div");
    div.className = "chat-message " + (msg.sender === currentUser ? "you" : "them");
    div.textContent = `${msg.sender}: ${msg.text}`;
    chatBox.appendChild(div);
  });

  chatBox.scrollTop = chatBox.scrollHeight;
}

// --- Show browser notification ---
function showNotification(msg) {
  new Notification(`New message from ${msg.sender}`, {
    body: msg.text,
    icon: 'https://cdn-icons-png.flaticon.com/512/124/124034.png'
  });
}

// --- Play sound notification ---
function playSound() {
  notificationSound.play().catch(() => {}); // handle autoplay block silently
}

// --- Logout function ---
function logout() {
  localStorage.removeItem("chatUser");
  location.reload();
}

// --- Placeholder voice/video features ---
function startVoiceCall() {
  alert("📞 Voice call feature coming soon!");
}

function startVideoCall() {
  alert("🎥 Video call feature coming soon!");
}

// --- Request notification permission on load ---
if ("Notification" in window && Notification.permission === "default") {
  Notification.requestPermission();
}

// --- Auto-login ---
if (currentUser && users[currentUser]) {
  switchToChat(currentUser);
}

// --- Refresh chat every second ---
setInterval(() => {
  if (currentUser) loadMessages();
}, 1000);
const toggleToolsBtn = document.getElementById("toggleToolsBtn");
const toolsPanel = document.getElementById("toolsPanel");
const photoInput = document.getElementById("photoInput");
const fileInput = document.getElementById("fileInput");
const sendPhotoBtn = document.getElementById("sendPhotoBtn");
const sendFileBtn = document.getElementById("sendFileBtn");
const sendLocationBtn = document.getElementById("sendLocationBtn");
const emojiBtn = document.getElementById("emojiBtn");
const giftBtn = document.getElementById("giftBtn");

// Toggle tools panel
toggleToolsBtn.addEventListener("click", () => {
  if (toolsPanel.style.display === "flex") {
    toolsPanel.style.display = "none";
  } else {
    toolsPanel.style.display = "flex";
  }
});

// Send photo button click triggers hidden file input
sendPhotoBtn.addEventListener("click", () => {
  photoInput.click();
});

// When photo file selected, read it and send as base64 message
photoInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    sendMessage("[Photo]", reader.result);
  };
  reader.readAsDataURL(file);

  e.target.value = ""; // reset input
  toolsPanel.style.display = "none";
});

// Send file button click triggers file input
sendFileBtn.addEventListener("click", () => {
  fileInput.click();
});

// When file selected, read it and send as base64 message with filename
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    sendMessage(`[File: ${file.name}]`, reader.result);
  };
  reader.readAsDataURL(file);

  e.target.value = ""; // reset input
  toolsPanel.style.display = "none";
});

// Send location button - use Geolocation API
sendLocationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser");
    return;
  }
  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    const locationUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
    sendMessage("[Location]", locationUrl);
  }, () => {
    alert("Unable to retrieve your location");
  });
  toolsPanel.style.display = "none";
});

// Emoji picker (basic example with prompt)
emojiBtn.addEventListener("click", () => {
  // For demo: simple prompt to insert emoji by unicode
  const emoji = prompt("Enter emoji to insert (or leave empty to cancel):");
  if (emoji) {
    messageInput.value += emoji;
    messageInput.focus();
  }
  toolsPanel.style.display = "none";
});

// Gift button (demo alert)
giftBtn.addEventListener("click", () => {
  const gift = prompt("Type your gift message (like 🎉, ❤️, 🌹):");
  if (gift) {
    sendMessage("[Gift]", gift);
  }
  toolsPanel.style.display = "none";
});

// Helper function to send message (text or base64)
function sendMessage(label, content) {
  const messages = JSON.parse(localStorage.getItem("messages") || "[]");

  // Compose message text
  let textToSend = "";
  if (label === "[Photo]") {
    textToSend = `📷 Photo: ${content}`; // content is base64 image data URI
  } else if (label === "[File]") {
    textToSend = `📁 File: ${content}`; // content is base64 file data URI
  } else if (label === "[Location]") {
    textToSend = `📍 Location: ${content}`; // content is URL
  } else if (label === "[Gift]") {
    textToSend = `🎁 Gift: ${content}`; // content is text emoji or message
  } else {
    textToSend = content;
  }

  messages.push({ sender: currentUser, text: textToSend });
  localStorage.setItem("messages", JSON.stringify(messages));
  loadMessages();
}
