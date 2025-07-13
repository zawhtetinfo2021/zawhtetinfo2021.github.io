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

const users = {
  alice: '1234',
  bob:   'abcd',
  zaw:   'love'
};

let username = '';
const messagesRef = db.ref('messages');

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
});

chatForm.addEventListener('submit', e => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;
  messagesRef.push({ name: username, message: text, ts: Date.now() });
  messageInput.value = '';
});

messagesRef.on('child_added', snapshot => {
  const data = snapshot.val();
  const msg = document.createElement('div');
  msg.className = 'msg';
  if (data.name === username) msg.classList.add('mine');
  msg.innerHTML = `<strong>${data.name}:</strong> ${data.message}`;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;

  if (data.name !== username && Notification.permission === 'granted') {
    new Notification(`${data.name}: ${data.message}`);
  }
});

toggleToolsBtn.addEventListener('click', () => {
  toolsPanel.style.display = toolsPanel.style.display === 'none' ? 'flex' : 'none';
});

document.getElementById('sendPhotoBtn').onclick = () => alert("Send Photo not implemented.");
document.getElementById('sendFileBtn').onclick = () => alert("Send File not implemented.");
document.getElementById('sendLocationBtn').onclick = () => alert("Send Location not implemented.");
document.getElementById('emojiBtn').onclick = () => messageInput.value += '😀';
document.getElementById('giftBtn').onclick = () => alert("Send Gift not implemented.");

function startVoiceCall() { alert("Voice Call feature coming soon."); }
function startVideoCall() { alert("Video Call feature coming soon."); }
function logout() { location.reload(); }