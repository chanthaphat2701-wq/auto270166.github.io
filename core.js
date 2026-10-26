// ===== SARABUN SYSTEM - CORE JS =====
// Storage keys
const STORAGE = {
  settings: 'saraban_settings',
  users: 'saraban_users',
  received: 'saraban_received',
  sent: 'saraban_sent',
  orders: 'saraban_orders',
  memos: 'saraban_memos',
  session: 'saraban_session'
};

// Default settings
const DEFAULT_SETTINGS = {
  schoolName: 'โรงเรียน............',
  logoUrl: '',
  systemName: 'ระบบงานสารบรรณ รับ-ส่ง-คำสั่ง-บันทึกข้อความ'
};

// Default admin user
const DEFAULT_USERS = [
  { id: 'admin', username: 'admin', password: '270166', role: 'admin', name: 'ผู้ดูแลระบบ', department: 'ฝ่ายบริหาร' }
];

// ===== STORAGE HELPERS =====
function getStorage(key, def = []) {
  try { return JSON.parse(localStorage.getItem(key)) || def; } catch { return def; }
}
function setStorage(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

// ===== INIT APP =====
function initApp() {
  // Init settings
  if (!localStorage.getItem(STORAGE.settings)) {
    setStorage(STORAGE.settings, DEFAULT_SETTINGS);
  }
  // Init users
  if (!localStorage.getItem(STORAGE.users)) {
    setStorage(STORAGE.users, DEFAULT_USERS);
  }
}

// ===== GET SETTINGS =====
function getSettings() {
  return getStorage(STORAGE.settings, DEFAULT_SETTINGS);
}

// ===== SESSION =====
function getSession() {
  return getStorage(STORAGE.session, null);
}
function setSession(user) {
  setStorage(STORAGE.session, user);
}
function clearSession() {
  localStorage.removeItem(STORAGE.session);
}

// ===== LOADING SPINNER =====
function showLoading(text = 'กำลังดำเนินการ...') {
  const el = document.getElementById('loadingOverlay');
  if (el) {
    el.querySelector('.loading-text').textContent = text;
    el.classList.add('active');
  }
}
function hideLoading() {
  const el = document.getElementById('loadingOverlay');
  if (el) el.classList.remove('active');
}
function withLoading(fn, text = 'กำลังดำเนินการ...', delay = 600) {
  showLoading(text);
  return new Promise(resolve => {
    setTimeout(() => {
      try { fn(); } catch(e) { console.error(e); }
      hideLoading();
      resolve();
    }, delay);
  });
}

// ===== TOAST NOTIFICATIONS =====
function showToast(title, message, type = 'success') {
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type]}</span>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      ${message ? `<div class="toast-msg">${message}</div>` : ''}
    </div>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('hiding');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ===== SWEET CONFIRM =====
function sweetConfirm(title, message, icon = '🗑️') {
  return new Promise(resolve => {
    const overlay = document.getElementById('sweetOverlay');
    overlay.querySelector('.sweet-icon').textContent = icon;
    overlay.querySelector('.sweet-title').textContent = title;
    overlay.querySelector('.sweet-message').textContent = message;
    overlay.classList.add('active');

    const btnConfirm = overlay.querySelector('#sweetConfirm');
    const btnCancel = overlay.querySelector('#sweetCancel');

    const cleanup = (result) => {
      overlay.classList.remove('active');
      btnConfirm.replaceWith(btnConfirm.cloneNode(true));
      btnCancel.replaceWith(btnCancel.cloneNode(true));
      resolve(result);
    };
    overlay.querySelector('#sweetConfirm').addEventListener('click', () => cleanup(true));
    overlay.querySelector('#sweetCancel').addEventListener('click', () => cleanup(false));
  });
}

// ===== MODAL HELPERS =====
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('active');
}

// ===== FORMAT DATE =====
function formatDate(str) {
  if (!str) return '-';
  try {
    const d = new Date(str);
    return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return str; }
}

// ===== GENERATE ID =====
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// ===== FILE HANDLING =====
function handleFiles(input, listEl) {
  if (!listEl) return;
  const files = Array.from(input.files);
  listEl.innerHTML = '';
  files.forEach((file, i) => {
    const item = document.createElement('div');
    item.className = 'file-item';
    item.innerHTML = `📎 <span>${file.name}</span> <span class="file-item-remove" data-i="${i}">✕</span>`;
    listEl.appendChild(item);
  });
  listEl.querySelectorAll('.file-item-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      // Can't truly remove from FileList, just show visual
      btn.closest('.file-item').remove();
    });
  });
}

// ===== UPDATE NAVBAR =====
function updateNavbar() {
  const settings = getSettings();
  const session = getSession();

  // Update school name everywhere
  document.querySelectorAll('.school-name-display').forEach(el => {
    el.textContent = settings.schoolName;
  });
  // Update logo everywhere
  document.querySelectorAll('.logo-display').forEach(el => {
    if (settings.logoUrl) {
      el.innerHTML = `<img src="${settings.logoUrl}" alt="logo" class="navbar-logo">`;
    } else {
      el.innerHTML = `<div class="navbar-logo-placeholder">🏫</div>`;
    }
  });
  // Update login logo
  const loginLogoEl = document.getElementById('loginLogoDisplay');
  if (loginLogoEl) {
    if (settings.logoUrl) {
      loginLogoEl.innerHTML = `<img src="${settings.logoUrl}" alt="logo" class="login-logo-img">`;
    } else {
      loginLogoEl.innerHTML = `<div class="login-logo-placeholder">🏫</div>`;
    }
  }
  const loginSchoolEl = document.getElementById('loginSchoolName');
  if (loginSchoolEl) loginSchoolEl.textContent = settings.schoolName;

  // User info
  if (session) {
    const roleNames = { admin: '👑 ผู้ดูแลระบบ', teacher: '👨‍🏫 ครู', officer: '👷 เจ้าหน้าที่' };
    document.querySelectorAll('.nav-user-name').forEach(el => el.textContent = session.name);
    document.querySelectorAll('.nav-user-role').forEach(el => el.textContent = roleNames[session.role] || session.role);
  }
}
