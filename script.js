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
  bob:   'abcd',
  zaw:   'love'
};

let username = '';
const messagesRef = db.ref('messages');

// -------- Login --------
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
  chatPage.style.display  = 'flex';
  userTitle.textContent   = `Lover Chat — ${username}`;

  if (Notification.permission === 'default') Notification.requestPermission();

  // Load existing messages once user logs in
  loadMessages();
});

function loadMessages() {
  chatBox.innerHTML = '';
  messagesRef.off(); // detach previous listeners
  messagesRef.on('child_added', snapshot => {
    const data = snapshot.val();
    appendMessage(data);
  });
}

// -------- Append message UI --------
function appendMessage(data) {
  const msg = document.createElement('div');
  msg.className = 'msg';
  msg.classList.toggle('mine', data.name === username);

  if (data.type === 'text') {
    msg.innerHTML = `<strong>${data.name}:</strong> ${escapeHtml(data.message)}`;
  } else if (data.type === 'photo') {
    msg.innerHTML = `<strong>${data.name}:</strong><br><img src="${data.url}" alt="Photo message" style="max-width:250px; border-radius: 12px;" />`;
  } else if (data.type === 'file') {
    msg.innerHTML = `<strong>${data.name}:</strong><br><a href="${data.url}" target="_blank" rel="noopener noreferrer" style="color:${data.name === username ? '#fff' : '#000'}; text-decoration: underline;">📁 ${escapeHtml(data.fileName)}</a>`;
  } else if (data.type === 'location') {
    msg.innerHTML = `<strong>${data.name}:</strong><br><a href="https://maps.google.com/?q=${data.latitude},${data.longitude}" target="_blank" rel="noopener noreferrer">📍 Shared Location</a>`;
  } else if (data.type === 'gift') {
    msg.innerHTML = `<strong>${data.name}:</strong><br><span style="font-size: 40px;">${data.gift}</span>`;
  }
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;

  if (data.name !== username && Notification.permission === 'granted') {
    const notifMsg = data.type === 'text' ? data.message : (data.type === 'gift' ? 'Sent a gift 🎁' : `Sent a ${data.type}`);
    new Notification(`${data.name}: ${notifMsg}`);
  }
}

// Escape HTML helper
function escapeHtml(text) {
  return text.replace(/[&<>"']/g, m => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[m]));
}

// -------- Send Text Message --------
chatForm.addEventListener('submit', e => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;
  sendMessage({ type: 'text', message: text });
  messageInput.value = '';
  toolsPanel.style.display = 'none';
});

function sendMessage(data) {
  const msgData = { name: username, ts: Date.now(), ...data };
  messagesRef.push(msgData);
}

// -------- Toggle tools panel --------
toggleToolsBtn.addEventListener('click', () => {
  toolsPanel.style.display = toolsPanel.style.display === 'none' ? 'flex' : 'none';
});

// -------- Send Photo --------
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

// -------- Send File --------
document.getElementById('sendFileBtn').onclick = () => {
  fileInput.click();
};
fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (!file) return;

  // Read file as base64 URL to store (not ideal for big files, but demo)
  const reader = new FileReader();
  reader.onload = e => {
    // We store base64 URL for demo, you might want to upload to storage instead
    sendMessage({
      type: 'file',
      url: e.target.result,
      fileName: file.name
    });
  };
  reader.readAsDataURL(file);
  fileInput.value = '';
  toolsPanel.style.display = 'none';
});

// -------- Send Location --------
document.getElementById('sendLocationBtn').onclick = () => {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser');
    return;
  }
  toolsPanel.style.display = 'none';
  navigator.geolocation.getCurrentPosition(pos => {
    sendMessage({
      type: 'location',
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude
    });
  }, () => alert('Unable to get your location.'));
};

// -------- Emoji --------
document.getElementById('emojiBtn').onclick = () => {
  const emoji = prompt('Select emoji: 😀 😃 😄 😁 😆 😂 🥰 😎 😉 😊 🤗 🤩 😍 😜 🤔');
  if (emoji) {
    messageInput.value += emoji.trim();
    messageInput.focus();
  }
  toolsPanel.style.display = 'none';
};

// -------- Gift --------
document.getElementById('giftBtn').onclick = () => {
  const gift = prompt('Send a gift emoji (e.g. 🎁 🎉 🎂 🌹 💎 🧸 🍫 🍰)');
  if (gift) {
    sendMessage({ type: 'gift', gift: gift.trim() });
  }
  toolsPanel.style.display = 'none';
};

// -------- Voice / Video Call placeholders --------
function startVoiceCall() { alert("Voice Call feature coming soon."); }
function startVideoCall() { alert("Video Call feature coming soon."); }
function logout() { location.reload(); }
