const loginPage      = document.getElementById('loginPage');
const chatPage       = document.getElementById('chatPage');
const loginForm      = document.getElementById('loginForm');
const chatForm       = document.getElementById('chatForm');
const chatBox        = document.getElementById('chatBox');
const messageInput   = document.getElementById('messageInput');
const userTitle      = document.getElementById('userTitle');
const errorMsg       = document.getElementById('errorMsg');
const toggleToolsBtn = document.getElementById('toggleToolsBtn');
const toolsPanel     = document.getElementById('toolsPanel');

const photoInput     = document.getElementById('photoInput');
const fileInput      = document.getElementById('fileInput');

const users = {
  alice: '1234',
  chit:   'love',
  zaw:   'love'
};

let username = '';
const messagesRef = db.ref('messages');

// Login form submit handler
loginForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('username').value.trim().toLowerCase();
  const pass = document.getElementById('password').value.trim();

  if (!users[name] || users[name] !== pass) {
    errorMsg.textContent = 'Invalid username or password.';
    return;
  }

  username = name;
  errorMsg.textContent = '';
  loginPage.style.display = 'none';
  chatPage.style.display = 'flex';
  userTitle.textContent = `Lover Chat — ${username}`;

  // Request notification permission if not already granted/denied
  if (Notification.permission === 'default') {
    Notification.requestPermission();
  }

  startListeningMessages();
});

// Listen for new messages in real-time
function startListeningMessages() {
  chatBox.innerHTML = '';
  messagesRef.off();
  messagesRef.on('child_added', snapshot => {
    const data = snapshot.val();
    appendMessage(data);

    // Show notification only if the message is from other users
    if (data.name !== username && Notification.permission === 'granted') {
      let notifText = '';
      switch (data.type) {
        case 'text':
          notifText = data.message;
          break;
        case 'photo':
          notifText = 'Sent a photo 📷';
          break;
        case 'file':
          notifText = 'Sent a file 📁';
          break;
        case 'location':
          notifText = 'Shared location 📍';
          break;
        case 'gift':
          notifText = 'Sent a gift 🎁';
          break;
        default:
          notifText = 'Sent a message';
      }
      new Notification(`${data.name}: ${notifText}`);
    }
  });
}

function appendMessage(data) {
  const msg = document.createElement('div');
  msg.className = 'msg';
  if (data.name === username) {
    msg.classList.add('mine');
  }
  if (data.type === 'text' || !data.type) {
    msg.innerHTML = `<strong>${escapeHtml(data.name)}:</strong> ${escapeHtml(data.message)}`;
  } else if (data.type === 'photo') {
    msg.innerHTML = `<strong>${escapeHtml(data.name)}:</strong><br><img src="${data.url}" alt="Photo" style="max-width:250px; border-radius: 12px;">`;
  } else if (data.type === 'file') {
    msg.innerHTML = `<strong>${escapeHtml(data.name)}:</strong><br><a href="${data.url}" target="_blank" rel="noopener noreferrer" style="color:${data.name === username ? '#fff' : '#000'}; text-decoration: underline;">📁 ${escapeHtml(data.fileName)}</a>`;
  } else if (data.type === 'location') {
    msg.innerHTML = `<strong>${escapeHtml(data.name)}:</strong><br><a href="https://maps.google.com/?q=${data.latitude},${data.longitude}" target="_blank" rel="noopener noreferrer">📍 Shared Location</a>`;
  } else if (data.type === 'gift') {
    msg.innerHTML = `<strong>${escapeHtml(data.name)}:</strong><br><span style="font-size:40px;">${escapeHtml(data.gift)}</span>`;
  }
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, m => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[m]));
}

// Send text message
chatForm.addEventListener('submit', e => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;
  sendMessage({ type: 'text', message: text });
  messageInput.value = '';
  toolsPanel.style.display = 'none';
});

function sendMessage(data) {
  messagesRef.push({ name: username, ts: Date.now(), ...data });
}

// Toggle tools panel
toggleToolsBtn.addEventListener('click', () => {
  toolsPanel.style.display = toolsPanel.style.display === 'none' ? 'flex' : 'none';
});

// Send photo
document.getElementById('sendPhotoBtn').onclick = () => {
  photoInput.click();
};
photoInput.addEventListener('change', () => {
  const file = photoInput.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file.');
    return;
  }
  const reader = new FileReader();
  reader.onload = e => {
    sendMessage({ type: 'photo', url: e.target.result });
  };
  reader.readAsDataURL(file);
  photoInput.value = '';
  toolsPanel.style.display = 'none';
});

// Send file
document.getElementById('sendFileBtn').onclick = () => {
  fileInput.click();
};
fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    sendMessage({ type: 'file', url: e.target.result, fileName: file.name });
  };
  reader.readAsDataURL(file);
  fileInput.value = '';
  toolsPanel.style.display = 'none';
});

// Send location
document.getElementById('sendLocationBtn').onclick = () => {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser');
    return;
  }
  toolsPanel.style.display = 'none';
  navigator.geolocation.getCurrentPosition(
    pos => {
      sendMessage({ type: 'location', latitude: pos.coords.latitude, longitude: pos.coords.longitude });
    },
    () => alert('Unable to get your location.')
  );
};

// Emoji picker (simple prompt)
document.getElementById('emojiBtn').onclick = () => {
  const emoji = prompt('Select emoji: 😀 😃 😄 😁 😆 😂 🥰 😎 😉 😊 🤗 🤩 😍 😜 🤔');
  if (emoji) {
    messageInput.value += emoji.trim();
    messageInput.focus();
  }
  toolsPanel.style.display = 'none';
};

// Gift picker (simple prompt)
document.getElementById('giftBtn').onclick = () => {
  const gift = prompt('Send a gift emoji (e.g. 🎁 🎉 🎂 🌹 💎 🧸 🍫 🍰)');
  if (gift) {
    sendMessage({ type: 'gift', gift: gift.trim() });
  }
  toolsPanel.style.display = 'none';
};

// Voice/video call placeholders
function startVoiceCall() {
  alert('Voice Call feature coming soon.');
}
function startVideoCall() {
  alert('Video Call feature coming soon.');
}
function logout() {
  location.reload();
}
