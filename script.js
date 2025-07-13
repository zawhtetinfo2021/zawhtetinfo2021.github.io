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

let username = "";
const messagesRef = db.ref('messages');

// ─────────────── Login ───────────────
loginForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('username').value.trim();
  const pass = document.getElementById('password').value.trim();
  if (!name || !pass) {
    errorMsg.textContent = 'Username and password are required.';
    return;
  }
  username = name;
  loginPage.style.display = 'none';
  chatPage.style.display  = 'block';
  userTitle.textContent   = `Lover Chat — ${username}`;

  // Ask notification permission once
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

// ─────────────── Receive new messages ───────────────
messagesRef.on('child_added', snap => {
  const { name, message } = snap.val();
  const bubble = document.createElement('div');
  bubble.className = 'msg' + (name === username ? ' mine' : '');
  bubble.innerHTML = `<strong>${name}:</strong> ${message}`;
  chatBox.appendChild(bubble);
  chatBox.scrollTop = chatBox.scrollHeight;

  if (document.hidden && name !== username && Notification.permission === 'granted') {
    new Notification(`${name}: ${message}`);
  }
});

// ─────────────── UI helpers ───────────────
toggleToolsBtn.addEventListener('click', () => {
  toolsPanel.style.display = toolsPanel.style.display === 'none' ? 'flex' : 'none';
});

['sendPhotoBtn','sendFileBtn','sendLocationBtn','emojiBtn','giftBtn'].forEach(id => {
  document.getElementById(id).onclick = () => alert(`${id} not implemented yet.`);
});

document.getElementById('emojiBtn').onclick = () => messageInput.value += '😊';

// ─────────────── Future features ───────────────
function startVoiceCall(){ alert('Voice call coming soon.'); }
function startVideoCall(){ alert('Video call coming soon.'); }
function logout(){ location.reload(); }