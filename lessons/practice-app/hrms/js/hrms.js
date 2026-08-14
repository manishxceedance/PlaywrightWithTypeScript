// ============================================================
// HRMS Practice App – Core App Logic
// Uses HrmsData (direct IndexedDB) — no Service Worker needed.
// SW is registered as an optional enhancement for API-docs.
// ============================================================

const HRMS = (() => {
  // ── Service Worker – fire & forget (API docs only) ────────
  function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(() => {});
  }

  // ── Auth token helpers ────────────────────────────────────
  function getToken() { return sessionStorage.getItem('hrms_token'); }
  function setToken(t) { sessionStorage.setItem('hrms_token', t); }
  function clearToken() { sessionStorage.removeItem('hrms_token'); sessionStorage.removeItem('hrms_user'); }
  function getUser() {
    try { return JSON.parse(sessionStorage.getItem('hrms_user') || 'null'); } catch { return null; }
  }
  function setUser(u) { sessionStorage.setItem('hrms_user', JSON.stringify(u)); }

  // ── Auth API (direct IndexedDB) ───────────────────────────
  const Auth = {
    async login(username, password) {
      const data = await HrmsData.authLogin(username, password);
      setToken(data.token);
      setUser(data.user);
      return data;
    },
    async logout() {
      try { await HrmsData.authLogout(getToken()); } catch {}
      clearToken();
    },
    async me() { return HrmsData.authMe(getToken()); },
    async register(payload) { return HrmsData.authRegister(payload); },
    isLoggedIn()  { return !!getToken(); },
    currentUser() { return getUser(); },
    requireAuth() {
      if (!this.isLoggedIn()) {
        window.location.href = './login.html';
        return false;
      }
      return true;
    }
  };

  // ── Employees API (direct IndexedDB) ─────────────────────
  const Employees = {
    list(params = {})  { return HrmsData.employeeList(params); },
    get(id)            { return HrmsData.employeeGet(id); },
    create(body)       { return HrmsData.employeeCreate(getToken(), body); },
    update(id, body)   { return HrmsData.employeeUpdate(getToken(), id, body); },
    delete(id)         { return HrmsData.employeeDelete(getToken(), id); },
    async exportCSV() {
      const csv  = await HrmsData.exportCSV();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = 'hrms-employees.csv'; a.click();
      URL.revokeObjectURL(url);
    }
  };

  // ── Users API (direct IndexedDB) ─────────────────────────
  const Users = {
    list() { return HrmsData.getUsers(getToken()); }
  };

  // ── Meta (direct IndexedDB) ───────────────────────────────
  const Meta = {
    stats()       { return HrmsData.getStats(); },
    departments() { return HrmsData.getDepartments(); }
  };

  // ── apiFetch kept for api-docs "Try it" buttons ───────────
  async function apiFetch(path, opts = {}) {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (opts.body && typeof opts.body !== 'string') opts.body = JSON.stringify(opts.body);
    const res = await fetch(`./hrms-api${path}`, { ...opts, headers });
    if (res.headers.get('Content-Type')?.includes('text/csv')) return res;
    const data = await res.json().catch(() => ({ error: true, message: 'Invalid response' }));
    if (!res.ok) throw Object.assign(new Error(data.message || 'API Error'), { status: res.status, data });
    return data;
  }

  // ── Toast notifications ───────────────────────────────────
  function toast(msg, type = 'info', duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const t = document.createElement('div');
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warn: '⚠️' };
    t.className = `toast toast-${type}`;
    t.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${msg}</span>`;
    container.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.3s'; setTimeout(() => t.remove(), 300); }, duration);
  }

  // ── Modal helpers ─────────────────────────────────────────
  function openModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.add('open');
  }
  function closeModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.remove('open');
  }
  function closeAllModals() {
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
  }

  // ── Sidebar user display ──────────────────────────────────
  function renderSidebarUser() {
    const u = getUser();
    if (!u) return;
    const nameEl  = document.getElementById('sidebar-user-name');
    const roleEl  = document.getElementById('sidebar-user-role');
    const avatarEl = document.getElementById('sidebar-avatar');
    if (nameEl)  nameEl.textContent  = `${u.firstName} ${u.lastName}`;
    if (roleEl)  roleEl.textContent  = u.role || 'employee';
    if (avatarEl) {
      avatarEl.textContent = (u.firstName[0] + u.lastName[0]).toUpperCase();
      avatarEl.style.background = u.profileColor || '#1976d2';
    }
  }

  // ── Active nav item ───────────────────────────────────────
  function setActiveNav() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-item').forEach(n => {
      n.classList.toggle('active', n.getAttribute('href') === page || n.dataset.page === page);
    });
  }

  // ── Mobile sidebar ────────────────────────────────────────
  function initMobileMenu() {
    const btn = document.querySelector('.menu-toggle-btn');
    const sidebar = document.querySelector('.sidebar');
    if (!btn || !sidebar) return;
    btn.addEventListener('click', () => sidebar.classList.toggle('open'));
    document.addEventListener('click', e => {
      if (!sidebar.contains(e.target) && !btn.contains(e.target)) sidebar.classList.remove('open');
    });
  }

  // ── Logout button ─────────────────────────────────────────
  function initLogout() {
    document.querySelectorAll('[data-action="logout"]').forEach(el => {
      el.addEventListener('click', async () => {
        await Auth.logout();
        window.location.href = './login.html';
      });
    });
  }

  // ── Badge helpers ─────────────────────────────────────────
  function statusBadge(s) {
    const map = { 'Active': 'badge-active', 'Inactive': 'badge-inactive', 'On Leave': 'badge-leave' };
    return `<span class="badge ${map[s]||'badge-active'}">${s||'Active'}</span>`;
  }
  function empTypeBadge(t) {
    const map = { 'Full-time': 'badge-ft', 'Part-time': 'badge-pt', 'Contract': 'badge-ct', 'Intern': 'badge-int' };
    return `<span class="badge ${map[t]||'badge-ft'}">${t||''}</span>`;
  }
  function avatar(fn, ln, color) {
    const initials = ((fn||'?')[0] + (ln||'?')[0]).toUpperCase();
    return `<div class="avatar" style="background:${color||'#1976d2'}">${initials}</div>`;
  }

  // ── Format helpers ────────────────────────────────────────
  function fmt$  (n) { return n ? '$' + Number(n).toLocaleString() : '—'; }
  function fmtDate(d) { if (!d) return '—'; const dt = new Date(d); return isNaN(dt) ? d : dt.toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'}); }
  function escape(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  // ── Page initializer ──────────────────────────────────────
  async function init(opts = {}) {
    // Init DB directly — always works without SW
    await HrmsData.init();
    // Register SW in background for API-docs fetch interception
    registerSW();
    if (opts.requireAuth !== false) {
      if (!Auth.requireAuth()) return false;
    }
    renderSidebarUser();
    setActiveNav();
    initMobileMenu();
    initLogout();
    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(m => {
      m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); });
    });
    // Escape key closes modals
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAllModals(); });
    return true;
  }

  return { Auth, Employees, Users, Meta, toast, openModal, closeModal, closeAllModals,
    statusBadge, empTypeBadge, avatar, fmt$, fmtDate, escape, init, getUser, setUser, apiFetch };
})();

// Global convenience
window.HRMS = HRMS;
