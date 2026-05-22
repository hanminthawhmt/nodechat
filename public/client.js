const API = "http://localhost:3000/api/v1";

// ── STATE ──
let token = localStorage.getItem("nc_token") || null;
let currentUser = JSON.parse(localStorage.getItem("nc_user") || "null");
let socket = null;
let activeChat = null; // { type: 'room'|'dm', id, name, roomDoc? }
let myRooms = []; // rooms I'm a member of
let dmContacts = []; // DM conversations loaded from server
let authMode = "login";
let foundInviteUser = null;

// ── INIT ──
window.addEventListener("DOMContentLoaded", () => {
  if (token && currentUser) {
    showApp();
    connectSocket();
    loadMyRooms();
    loadDMContacts();
  }
});

// ── AUTH ──
function switchAuthTab(mode) {
  authMode = mode;
  document
    .querySelectorAll(".auth-tab")
    .forEach((t) => t.classList.toggle("active", t.dataset.tab === mode));
  document
    .getElementById("name-field")
    .classList.toggle("hidden", mode === "login");
  document.getElementById("auth-submit-btn").textContent =
    mode === "login" ? "Sign in" : "Create account";
  document.getElementById("auth-error").classList.add("hidden");
}

async function handleAuth() {
  const email = document.getElementById("input-email").value.trim();
  const password = document.getElementById("input-password").value.trim();
  const name = document.getElementById("input-name").value.trim();
  const errEl = document.getElementById("auth-error");

  errEl.classList.add("hidden");

  if (!email || !password)
    return showAuthError("Email and password are required");
  if (authMode === "register" && !name)
    return showAuthError("Name is required");

  const btn = document.getElementById("auth-submit-btn");
  btn.textContent = "...";
  btn.disabled = true;

  try {
    const endpoint = authMode === "login" ? "/auth/login" : "/auth/register";
    const body =
      authMode === "login" ? { email, password } : { name, email, password };
    const res = await apiFetch(endpoint, "POST", body, false);

    token = res.token;
    currentUser = res.user;
    localStorage.setItem("nc_token", token);
    localStorage.setItem("nc_user", JSON.stringify(currentUser));

    showApp();
    connectSocket();
    loadMyRooms();
    loadDMContacts();
    renderDMList();
  } catch (err) {
    showAuthError(err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = authMode === "login" ? "Sign in" : "Create account";
  }
}

function showAuthError(msg) {
  const el = document.getElementById("auth-error");
  el.textContent = msg;
  el.classList.remove("hidden");
}

function showApp() {
  document.getElementById("auth-screen").classList.add("hidden");
  document.getElementById("app-screen").classList.remove("hidden");

  if (currentUser) {
    document.getElementById("sidebar-avatar").textContent = (currentUser.name ||
      currentUser.email)[0].toUpperCase();
    document.getElementById("sidebar-name").textContent =
      currentUser.name || currentUser.email;
    document.getElementById("sidebar-email").textContent = currentUser.email;
  }
}

function logout() {
  if (socket) socket.disconnect();
  token = null;
  currentUser = null;
  socket = null;
  activeChat = null;
  myRooms = [];
  dmContacts = [];
  localStorage.removeItem("nc_token");
  localStorage.removeItem("nc_user");
  localStorage.removeItem("nc_dms");
  document.getElementById("app-screen").classList.add("hidden");
  document.getElementById("auth-screen").classList.remove("hidden");
  document.getElementById("auth-error").classList.add("hidden");
  document.getElementById("input-email").value = "";
  document.getElementById("input-password").value = "";
}

// ── SOCKET ──
function connectSocket() {
  socket = io("http://localhost:3000", { auth: { token } });

  socket.on("connect", () => {
    setConnStatus(true);
    // rejoin active chat if any
    if (activeChat?.type === "room") socket.emit("join_room", activeChat.id);
  });

  socket.on("connect_error", (err) => {
    setConnStatus(false);
    showToast("Connection error: " + err.message, "error");
  });

  socket.on("disconnect", () => setConnStatus(false));

  socket.on("receive_message", (msg) => {
    const isRoom = !!msg.room;
    const msgRoomId = msg.room?._id || msg.room; // handle both populated and raw
    const msgSenderId = msg.sender?._id || msg.sender;

    const isActive =
      activeChat &&
      ((isRoom && activeChat.type === "room" && activeChat.id === msgRoomId) ||
        (!isRoom &&
          activeChat.type === "dm" &&
          (activeChat.id === msgSenderId ||
            activeChat.id === (msg.receiver?._id || msg.receiver))));
    if (isActive) appendMessage(msg);
  });

  socket.on("user_invited", ({ room }) => {
    showToast(`You were added to "${room.name}"`, "success");
    loadMyRooms();
  });

  socket.on("error", (err) => {
    showToast(err.message || "Socket error", "error");
  });
}

function setConnStatus(connected) {
  const el = document.getElementById("conn-indicator");
  el.classList.toggle("connected", connected);
  document.getElementById("conn-label").textContent = connected
    ? "online"
    : "offline";
}

// ── ROOMS ──
async function loadMyRooms() {
  try {
    const res = await apiFetch("/rooms");
    console.log("rooms response:", res);
    const userId = currentUser?._id || currentUser?.id;
    myRooms = res.data.filter((r) =>
      r.members.some((m) => (m._id || m) === userId),
    );
    renderRoomList();
  } catch (e) {
    console.error("loadMyRooms error:", e);
  }
}

async function loadDMContacts() {
  try {
    const res = await apiFetch("/dms");
    dmContacts = res.data || [];
    renderDMList();
  } catch (e) {
    console.error("loadDMContacts error:", e);
    dmContacts = [];
  }
}

function renderRoomList() {
  const list = document.getElementById("room-list");
  list.innerHTML = "";
  myRooms.forEach((room) => {
    const item = document.createElement("div");
    item.className =
      "channel-item" + (activeChat?.id === room._id ? " active" : "");
    item.innerHTML = `
      <span class="ch-icon">#</span>
      <span class="ch-name">${esc(room.name)}</span>
      ${room.type === "private" ? '<span class="ch-badge private">private</span>' : ""}
    `;
    item.onclick = () => openRoom(room);
    list.appendChild(item);
  });
}

function renderDMList() {
  const list = document.getElementById("dm-list");
  list.innerHTML = "";
  dmContacts.forEach((contact) => {
    const contactId = contact.id || contact._id;
    const item = document.createElement("div");
    item.className =
      "channel-item" + (activeChat?.id === contactId ? " active" : "");
    item.innerHTML = `
      <div class="msg-avatar" style="width:20px;height:20px;font-size:10px;flex-shrink:0">${(contact.name || contact.email)[0].toUpperCase()}</div>
      <span class="ch-name">${esc(contact.name || contact.email)}</span>
    `;
    item.onclick = () => openDM(contact);
    list.appendChild(item);
  });
}

async function openRoom(room) {
  activeChat = { type: "room", id: room._id, name: room.name, roomDoc: room };
  renderRoomList();
  renderDMList();

  document.getElementById("empty-state").classList.add("hidden");
  document.getElementById("chat-view").classList.remove("hidden");

  document.getElementById("chat-header-avatar").textContent = "#";
  document.getElementById("chat-header-name").textContent = room.name;
  document.getElementById("chat-header-sub").textContent =
    room.type === "private"
      ? "🔒 private room"
      : `${room.members?.length || 0} members`;

  const inviteBtn = document.getElementById("invite-btn");
  inviteBtn.style.display = room.type === "private" ? "flex" : "none";

  document.getElementById("messages-area").innerHTML = "";
  document.getElementById("msg-input").focus();

  socket.emit("join_room", room._id);

  try {
    const res = await apiFetch(`/messages?room=${room._id}`);
    const area = document.getElementById("messages-area");
    area.innerHTML = "";
    if (res.message.length === 0) {
      area.innerHTML =
        '<div class="msg-system">No messages yet. Say hello!</div>';
    } else {
      res.message.forEach((m) => appendMessage(m, false));
      area.scrollTop = area.scrollHeight;
    }
  } catch (e) {
    console.log("room history error:", e);
  }
}

function openDM(contact) {
  const contactId = contact.id || contact._id;
  activeChat = {
    type: "dm",
    id: contactId,
    name: contact.name || contact.email,
    contact,
  };
  renderRoomList();
  renderDMList();

  document.getElementById("empty-state").classList.add("hidden");
  document.getElementById("chat-view").classList.remove("hidden");
  document.getElementById("invite-btn").style.display = "none";

  document.getElementById("chat-header-avatar").textContent = (contact.name ||
    contact.email)[0].toUpperCase();
  document.getElementById("chat-header-name").textContent =
    contact.name || contact.email;
  document.getElementById("chat-header-sub").textContent = contact.email;

  document.getElementById("messages-area").innerHTML = "";
  document.getElementById("msg-input").focus();

  loadDMHistory(contactId);
}

async function loadDMHistory(receiverId) {
  try {
    const res = await apiFetch(`/messages?receiverId=${receiverId}`);
    const area = document.getElementById("messages-area");
    area.innerHTML = "";
    if (res.message.length === 0) {
      area.innerHTML =
        '<div class="msg-system">No messages yet. Start the conversation!</div>';
    } else {
      res.message.forEach((m) => appendMessage(m, false));
      area.scrollTop = area.scrollHeight;
    }
  } catch (e) {
    console.log("dm history error:", e);
  }
}

// ── SEND MESSAGE ──
function sendMessage() {
  const input = document.getElementById("msg-input");
  const content = input.value.trim();
  if (!content || !activeChat || !socket) return;

  if (activeChat.type === "room") {
    socket.emit("send_message", { room: activeChat.id, content });
    appendMessage({
      content,
      sender: currentUser,
      room: activeChat.id,
      createdAt: new Date().toISOString(),
      _optimistic: true,
    });
  } else {
    socket.emit("send_message", { receiverId: activeChat.id, content });
    appendMessage({
      content,
      sender: currentUser,
      receiver: activeChat.id,
      createdAt: new Date().toISOString(),
      _optimistic: true,
    });
  }

  input.value = "";
}

function appendMessage(msg, scroll = true) {
  const area = document.getElementById("messages-area");
  const senderId = msg.sender?._id || msg.sender?.id || msg.sender;
  const isMine = senderId === currentUser._id || senderId === currentUser.id;

  // remove empty state
  const empty = area.querySelector(".msg-system");
  if (empty && area.children.length === 1) area.innerHTML = "";

  const row = document.createElement("div");
  row.className = `msg-row ${isMine ? "mine" : "theirs"}`;

  const senderName = msg.sender?.name || msg.sender?.email || "User";
  const initial = senderName[0].toUpperCase();
  const time = msg.createdAt
    ? new Date(msg.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  row.innerHTML = `
    <div class="msg-avatar">${initial}</div>
    <div class="msg-content">
      ${!isMine ? `<div class="msg-sender">${esc(senderName)}</div>` : ""}
      <div class="msg-bubble">${esc(msg.content)}</div>
      <div class="msg-time">${time}</div>
    </div>
  `;

  area.appendChild(row);
  if (scroll) area.scrollTop = area.scrollHeight;
}

// ── BROWSE ROOMS MODAL ──
async function openBrowseRooms() {
  openModal("modal-browse");
  const list = document.getElementById("browse-rooms-list");
  list.innerHTML =
    '<div style="padding:20px;text-align:center;color:var(--text-3)">Loading...</div>';

  try {
    const res = await apiFetch("/rooms/public");
    list.innerHTML = "";

    if (res.data.length === 0) {
      list.innerHTML =
        '<div style="padding:20px;text-align:center;color:var(--text-3)">No public rooms yet</div>';
      return;
    }

    res.data.forEach((room) => {
      const isMember = room.members.some(
        (m) => (m._id || m) === currentUser.id,
      );
      const card = document.createElement("div");
      card.className = "room-card";
      card.innerHTML = `
        <div class="room-card-info">
          <div class="room-card-icon">#</div>
          <div>
            <div class="room-card-name">${esc(room.name)}</div>
            <div class="room-card-meta">${room.members?.length || 0} members · ${room.type}</div>
          </div>
        </div>
        ${
          isMember
            ? `<button class="btn-sm" style="background:var(--bg-4);color:var(--text-2)" onclick="goToRoom('${room._id}')">Open</button>`
            : `<button class="btn-sm" onclick="joinRoom('${room._id}')">Join</button>`
        }
      `;
      list.appendChild(card);
    });
  } catch (e) {
    console.log("browse rooms error:", e);
    list.innerHTML =
      '<div style="padding:20px;text-align:center;color:var(--red)">Failed to load rooms</div>';
  }
}

async function joinRoom(roomId) {
  try {
    const res = await apiFetch(`/rooms/${roomId}/join`, "POST");
    showToast(`Joined ${res.room.name}!`, "success");
    await loadMyRooms();
    closeModal("modal-browse");
    openRoom(res.room);
  } catch (err) {
    showToast(err.message, "error");
  }
}

function goToRoom(roomId) {
  const room = myRooms.find((r) => r._id === roomId);
  if (room) {
    closeModal("modal-browse");
    openRoom(room);
  }
}

// ── CREATE ROOM MODAL ──
function openCreateRoom() {
  openModal("modal-create-room");
  document.getElementById("create-room-name").value = "";
  document.getElementById("create-room-error").classList.add("hidden");
}

async function createRoom() {
  const name = document.getElementById("create-room-name").value.trim();
  const type = document.querySelector('input[name="room-type"]:checked').value;
  const errEl = document.getElementById("create-room-error");

  if (!name) {
    errEl.textContent = "Room name is required";
    errEl.classList.remove("hidden");
    return;
  }

  try {
    const res = await apiFetch("/rooms", "POST", { name, type });
    showToast(`Room "${res.room.name}" created!`, "success");
    await loadMyRooms();
    closeModal("modal-create-room");
    openRoom(res.room);
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove("hidden");
  }
}

// ── DM SEARCH MODAL ──
function openDMSearch() {
  openModal("modal-dm-search");
  document.getElementById("dm-search-email").value = "";
  document.getElementById("dm-search-result").classList.add("hidden");
  document.getElementById("dm-search-error").classList.add("hidden");
}

async function searchUser() {
  const email = document.getElementById("dm-search-email").value.trim();
  const resultEl = document.getElementById("dm-search-result");
  const errEl = document.getElementById("dm-search-error");

  resultEl.classList.add("hidden");
  errEl.classList.add("hidden");

  if (!email) return;

  try {
    const res = await apiFetch(
      `/users/search?email=${encodeURIComponent(email)}`,
    );
    const user = res.data;
    resultEl.innerHTML = `
      <div class="search-result-info">
        <div class="avatar sm">${(user.name || user.email)[0].toUpperCase()}</div>
        <div>
          <div class="search-result-name">${esc(user.name || user.email)}</div>
          <div class="search-result-email">${esc(user.email)}</div>
        </div>
      </div>
      <button class="btn-sm" onclick="startDM('${user._id}', '${esc(user.name || "")}', '${esc(user.email)}')">Message</button>
    `;
    resultEl.classList.remove("hidden");
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove("hidden");
  }
}

function startDM(userId, name, email) {
  const contact = { id: userId, name, email };

  // add to dm contacts if not already there
  const exists = dmContacts.find((c) => c.id === userId || c._id === userId);
  if (!exists) {
    dmContacts.push(contact);
  }

  closeModal("modal-dm-search");
  renderDMList();
  openDM(contact);
}

// ── INVITE MODAL ──
function openInviteModal() {
  openModal("modal-invite");
  document.getElementById("invite-search-email").value = "";
  document.getElementById("invite-search-result").classList.add("hidden");
  document.getElementById("invite-error").classList.add("hidden");
  foundInviteUser = null;
}

async function searchUserForInvite() {
  const email = document.getElementById("invite-search-email").value.trim();
  const resultEl = document.getElementById("invite-search-result");
  const errEl = document.getElementById("invite-error");

  resultEl.classList.add("hidden");
  errEl.classList.add("hidden");
  foundInviteUser = null;

  if (!email) return;

  try {
    const res = await apiFetch(
      `/users/search?email=${encodeURIComponent(email)}`,
    );
    foundInviteUser = res.data;
    resultEl.innerHTML = `
      <div class="search-result-info">
        <div class="avatar sm">${(res.data.name || res.data.email)[0].toUpperCase()}</div>
        <div>
          <div class="search-result-name">${esc(res.data.name || res.data.email)}</div>
          <div class="search-result-email">${esc(res.data.email)}</div>
        </div>
      </div>
      <button class="btn-sm" onclick="inviteUser()">Invite</button>
    `;
    resultEl.classList.remove("hidden");
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove("hidden");
  }
}

async function inviteUser() {
  if (!foundInviteUser || !activeChat) return;
  const errEl = document.getElementById("invite-error");

  try {
    await apiFetch(`/rooms/${activeChat.id}/invite`, "POST", {
      inviteeId: foundInviteUser._id,
    });
    showToast(
      `${foundInviteUser.name || foundInviteUser.email} added to room!`,
      "success",
    );
    closeModal("modal-invite");
    loadMyRooms();
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove("hidden");
  }
}

// ── MODAL HELPERS ──
function openModal(id) {
  document.getElementById(id).classList.remove("hidden");
}
function closeModal(id) {
  document.getElementById(id).classList.add("hidden");
}

// ── API HELPER ──
async function apiFetch(path, method = "GET", body = null, auth = true) {
  const opts = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (auth && token) opts.headers["Authorization"] = `Bearer ${token}`;
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(API + path, opts);
  const data = await res.json();

  if (!data.success) throw new Error(data.message || "Request failed");
  return data;
}

// ── TOAST ──
function showToast(msg, type = "") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ── ESC HTML ──
function esc(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── KEYBOARD: close modals on ESC ──
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document
      .querySelectorAll(".modal-overlay:not(.hidden)")
      .forEach((m) => m.classList.add("hidden"));
  }
});
