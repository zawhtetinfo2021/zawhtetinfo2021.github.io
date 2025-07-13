// script.js
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

/* ─── Hard‑coded demo users ─── */
const users = {
  alice: '1234',
  bob:   'abcd',
  zaw:   'love'
};

let username = '';
const messagesRef = db.ref('messages');

// ─────────────── Login ───────────────
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
  chatPage.style.display  = 'block';
  userTitle.textContent   = `Lover Chat — ${username}`;

  if (Notification.permission === 'default') Notification.requestPermission();
});

// ─────────────── Send message ───────────────
chatForm.addEventListener('submit', e => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;
  messagesRef.push({ name: username, message: text, ts: Date.now() });
  messageInput.value = '';
});

// ─────────────── Receive messages ───────────────
