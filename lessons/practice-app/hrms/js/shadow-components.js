// ============================================================
// HRMS Practice App – Shadow DOM & Custom Web Components
// Practice targets: Shadow DOM, custom controls, web components
// ============================================================

// ── 1. Profile Card (Shadow DOM) ─────────────────────────────
class HrmsProfileCard extends HTMLElement {
  static get observedAttributes() {
    return ['first-name','last-name','job-title','department','email','phone','status','color','rating'];
  }
  constructor() {
    super();
    this._root = this.attachShadow({ mode: 'open' });
  }
  connectedCallback() { this._render(); }
  attributeChangedCallback() { this._render(); }

  _render() {
    const fn   = this.getAttribute('first-name') || 'First';
    const ln   = this.getAttribute('last-name')  || 'Last';
    const jt   = this.getAttribute('job-title')  || 'Employee';
    const dept = this.getAttribute('department') || '';
    const email= this.getAttribute('email')      || '';
    const phone= this.getAttribute('phone')      || '';
    const stat = this.getAttribute('status')     || 'Active';
    const col  = this.getAttribute('color')      || '#1976d2';
    const rat  = parseInt(this.getAttribute('rating') || '0');
    const initials = ((fn[0]||'?') + (ln[0]||'?')).toUpperCase();
    const stars = '★'.repeat(rat) + '☆'.repeat(5 - rat);
    const statColor = stat === 'Active' ? '#2e7d32' : stat === 'Inactive' ? '#c62828' : '#e65100';
    const statBg    = stat === 'Active' ? '#e8f5e9' : stat === 'Inactive' ? '#ffebee' : '#fff3e0';

    this._root.innerHTML = `
      <style>
        :host { display: block; }
        .card {
          font-family: 'Segoe UI', system-ui, sans-serif;
          border-radius: 14px;
          box-shadow: 0 3px 18px rgba(0,0,0,0.11);
          overflow: hidden; background: #fff; max-width: 300px;
        }
        .card-banner { height: 72px; background: ${col}; }
        .card-body { padding: 0 20px 20px; }
        .avatar-wrap { margin-top: -30px; margin-bottom: 10px; }
        .avatar {
          width: 60px; height: 60px; border-radius: 50%;
          background: ${col}; color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 1.3rem;
          border: 3px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .name { font-size: 1.05rem; font-weight: 700; color: #1a2332; margin: 0; }
        .title { font-size: 0.82rem; color: #546e7a; margin: 3px 0 8px; }
        .badge {
          display: inline-block; padding: 2px 10px; border-radius: 10px;
          font-size: 0.72rem; font-weight: 600;
          background: ${statBg}; color: ${statColor};
          margin-bottom: 10px;
        }
        .dept-chip {
          display: inline-block; padding: 2px 9px; border-radius: 10px;
          background: #e3f2fd; color: #0d47a1;
          font-size: 0.72rem; font-weight: 500; margin-left: 5px;
        }
        .info-row { display: flex; align-items: center; gap: 7px; margin: 5px 0; font-size: 0.8rem; color: #546e7a; }
        .info-row .ico { font-size: 0.9rem; width: 18px; text-align: center; }
        .stars { color: #ffa000; font-size: 1rem; letter-spacing: 1px; }
        hr { border: none; border-top: 1px solid #eceff1; margin: 10px 0; }
        a { color: #1976d2; text-decoration: none; font-size: 0.8rem; }
        a:hover { text-decoration: underline; }
      </style>
      <div class="card" data-testid="profile-card">
        <div class="card-banner"></div>
        <div class="card-body">
          <div class="avatar-wrap">
            <div class="avatar">${initials}</div>
          </div>
          <p class="name">${fn} ${ln}</p>
          <p class="title">${jt}</p>
          <span class="badge">${stat}</span>
          ${dept ? `<span class="dept-chip">${dept}</span>` : ''}
          <hr>
          ${email ? `<div class="info-row"><span class="ico">✉️</span><a href="mailto:${email}">${email}</a></div>` : ''}
          ${phone ? `<div class="info-row"><span class="ico">📞</span><span>${phone}</span></div>` : ''}
          ${rat > 0 ? `<div class="info-row"><span class="ico">⭐</span><span class="stars">${stars}</span></div>` : ''}
        </div>
      </div>`;
  }
}
customElements.define('hrms-profile-card', HrmsProfileCard);

// ── 2. Status Badge (Shadow DOM) ─────────────────────────────
class HrmsStatusBadge extends HTMLElement {
  static get observedAttributes() { return ['status']; }
  constructor() { super(); this._root = this.attachShadow({ mode: 'open' }); }
  connectedCallback() { this._render(); }
  attributeChangedCallback() { this._render(); }
  _render() {
    const s = this.getAttribute('status') || 'Active';
    const map = {
      'Active':   { bg: '#e8f5e9', fg: '#2e7d32', dot: '#43a047' },
      'Inactive': { bg: '#ffebee', fg: '#c62828', dot: '#e53935' },
      'On Leave': { bg: '#fff3e0', fg: '#e65100', dot: '#fb8c00' }
    };
    const c = map[s] || map['Active'];
    this._root.innerHTML = `
      <style>
        :host { display: inline-block; }
        .badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 10px; border-radius: 10px;
          background: ${c.bg}; color: ${c.fg};
          font-family: 'Segoe UI', sans-serif; font-size: 0.75rem; font-weight: 600;
        }
        .dot { width: 7px; height: 7px; border-radius: 50%; background: ${c.dot}; }
      </style>
      <span class="badge"><span class="dot"></span>${s}</span>`;
  }
}
customElements.define('hrms-status-badge', HrmsStatusBadge);

// ── 3. Rating Widget (Shadow DOM) ────────────────────────────
class HrmsRatingWidget extends HTMLElement {
  static get observedAttributes() { return ['value','readonly']; }
  constructor() {
    super(); this._root = this.attachShadow({ mode: 'open' });
    this._value = 0;
  }
  connectedCallback() { this._value = parseInt(this.getAttribute('value')||'0'); this._render(); }
  attributeChangedCallback(n, o, v) { if (n==='value') this._value = parseInt(v)||0; this._render(); }
  get value() { return this._value; }
  set value(v) { this._value = parseInt(v)||0; this.setAttribute('value', this._value); this._render(); }

  _render() {
    const readonly = this.hasAttribute('readonly');
    this._root.innerHTML = `
      <style>
        :host { display: inline-block; }
        .stars { display: flex; gap: 3px; }
        .star {
          font-size: 1.5rem; cursor: ${readonly ? 'default' : 'pointer'};
          color: #e0e0e0; transition: color 0.15s; user-select: none;
          line-height: 1;
        }
        .star.filled { color: #ffa000; }
        .star:not(.filled):hover,
        .star:not(.filled):hover ~ .star { color: ${readonly ? '#e0e0e0' : '#ffa000'}; }
        .stars:hover .star { ${readonly ? '' : 'color: #ffa000;'} }
        .stars:hover .star:hover ~ .star { ${readonly ? '' : 'color: #e0e0e0;'} }
        .label { font-size: 0.75rem; color: #546e7a; margin-top: 3px; font-family: 'Segoe UI', sans-serif; }
      </style>
      <div class="stars" data-testid="star-rating">
        ${[1,2,3,4,5].map(i => `<span class="star ${i <= this._value ? 'filled' : ''}" data-val="${i}">★</span>`).join('')}
      </div>
      <div class="label">${this._value > 0 ? this._value + ' / 5' : 'Not rated'}</div>`;

    if (!readonly) {
      this._root.querySelectorAll('.star').forEach(s => {
        s.addEventListener('click', () => {
          this._value = parseInt(s.dataset.val);
          this.setAttribute('value', this._value);
          this._render();
          this.dispatchEvent(new CustomEvent('change', { detail: this._value, bubbles: true, composed: true }));
        });
      });
    }
  }
}
customElements.define('hrms-rating', HrmsRatingWidget);

// ── 4. Skill Tags Input (Shadow DOM) ─────────────────────────
class HrmsTagInput extends HTMLElement {
  constructor() {
    super(); this._root = this.attachShadow({ mode: 'open' });
    this._tags = [];
    this._suggestions = (this.getAttribute('suggestions')||'').split(',').filter(Boolean);
  }
  connectedCallback() {
    const init = this.getAttribute('value');
    this._tags = init ? init.split(',').filter(Boolean) : [];
    this._render();
  }
  get value() { return this._tags.join(','); }
  set value(v) { this._tags = v ? v.split(',').filter(Boolean) : []; this._render(); }
  get tags() { return [...this._tags]; }

  _render() {
    this._root.innerHTML = `
      <style>
        :host { display: block; }
        .wrap {
          display: flex; flex-wrap: wrap; gap: 5px; align-items: center;
          min-height: 44px; padding: 6px 8px;
          border: 1.5px solid #dde3ea; border-radius: 6px; background: #fff;
          cursor: text; font-family: 'Segoe UI', sans-serif;
        }
        .wrap.focused { border-color: #1976d2; box-shadow: 0 0 0 3px rgba(25,118,210,0.12); }
        .chip {
          display: inline-flex; align-items: center; gap: 4px;
          background: #e3f2fd; color: #0d47a1;
          border-radius: 12px; padding: 2px 9px; font-size: 0.78rem; font-weight: 500;
        }
        .chip button {
          background: none; border: none; cursor: pointer; padding: 0;
          font-size: 0.9rem; color: #0d47a1; opacity: 0.6; line-height: 1;
        }
        .chip button:hover { opacity: 1; }
        input {
          border: none; outline: none; flex: 1; min-width: 100px;
          font-size: 0.88rem; padding: 2px 4px; background: transparent;
          font-family: 'Segoe UI', sans-serif;
        }
        .suggestions {
          position: absolute; background: #fff; border: 1.5px solid #dde3ea;
          border-radius: 6px; box-shadow: 0 4px 16px rgba(0,0,0,0.1);
          z-index: 9999; max-height: 150px; overflow-y: auto; min-width: 180px;
        }
        .sug-item { padding: 8px 12px; cursor: pointer; font-size: 0.85rem; }
        .sug-item:hover { background: #e3f2fd; color: #0d47a1; }
        .host-wrap { position: relative; }
      </style>
      <div class="host-wrap">
        <div class="wrap" id="wrap">
          ${this._tags.map((t,i) => `<span class="chip">${t}<button data-idx="${i}" type="button">×</button></span>`).join('')}
          <input type="text" placeholder="${this._tags.length === 0 ? 'Type and press Enter…' : 'Add tag…'}" id="inp">
        </div>
        <div class="suggestions" id="sug" style="display:none"></div>
      </div>`;

    const wrap = this._root.getElementById('wrap');
    const inp  = this._root.getElementById('inp');
    const sug  = this._root.getElementById('sug');

    this._root.querySelectorAll('.chip button').forEach(btn => {
      btn.addEventListener('click', e => {
        this._tags.splice(parseInt(e.target.dataset.idx), 1);
        this._render();
        this.dispatchEvent(new CustomEvent('change', { detail: this.value, bubbles: true, composed: true }));
      });
    });

    inp.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ',') && inp.value.trim()) {
        e.preventDefault();
        this._addTag(inp.value.trim());
        inp.value = '';
        this._showSug('', sug);
      }
      if (e.key === 'Backspace' && !inp.value && this._tags.length) {
        this._tags.pop(); this._render();
      }
    });

    inp.addEventListener('input', () => this._showSug(inp.value, sug));
    inp.addEventListener('focus', () => wrap.classList.add('focused'));
    inp.addEventListener('blur', () => { wrap.classList.remove('focused'); setTimeout(() => { sug.style.display = 'none'; }, 200); });

    sug.querySelectorAll('.sug-item').forEach(item => {
      item.addEventListener('mousedown', e => {
        e.preventDefault();
        this._addTag(item.textContent);
        inp.value = '';
        sug.style.display = 'none';
      });
    });
  }

  _addTag(t) {
    const tag = t.trim();
    if (tag && !this._tags.includes(tag)) {
      this._tags.push(tag);
      this._render();
      this.dispatchEvent(new CustomEvent('change', { detail: this.value, bubbles: true, composed: true }));
    }
  }

  _showSug(q, sug) {
    const matches = this._suggestions.filter(s => s.toLowerCase().includes(q.toLowerCase()) && !this._tags.includes(s));
    if (!q && matches.length === 0) { sug.style.display = 'none'; return; }
    if (matches.length === 0) { sug.style.display = 'none'; return; }
    sug.innerHTML = matches.slice(0,8).map(s => `<div class="sug-item">${s}</div>`).join('');
    sug.style.display = 'block';
    sug.querySelectorAll('.sug-item').forEach(item => {
      item.addEventListener('mousedown', e => {
        e.preventDefault(); this._addTag(item.textContent);
        const inp = this._root.getElementById('inp');
        if (inp) inp.value = '';
        sug.style.display = 'none';
      });
    });
  }
}
customElements.define('hrms-tag-input', HrmsTagInput);

// ── 5. Custom Dropdown (Shadow DOM) ──────────────────────────
class HrmsDropdown extends HTMLElement {
  static get observedAttributes() { return ['value','placeholder']; }
  constructor() { super(); this._root = this.attachShadow({ mode: 'open' }); this._open = false; }
  connectedCallback() {
    this._options = Array.from(this.querySelectorAll('option')).map(o => ({ value: o.value, label: o.textContent }));
    this._value   = this.getAttribute('value') || '';
    this._render();
  }
  get value() { return this._value; }
  set value(v) { this._value = v; this._render(); }

  _render() {
    const ph      = this.getAttribute('placeholder') || 'Select…';
    const current = this._options.find(o => o.value === this._value);
    this._root.innerHTML = `
      <style>
        :host { display: block; font-family: 'Segoe UI', sans-serif; }
        .dropdown { position: relative; user-select: none; }
        .selected {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 13px; border: 1.5px solid #dde3ea; border-radius: 6px;
          background: #fff; cursor: pointer; font-size: 0.9rem; color: #1a2332;
          transition: border-color 0.18s, box-shadow 0.18s;
        }
        .selected.open, .selected:focus { border-color: #1976d2; box-shadow: 0 0 0 3px rgba(25,118,210,0.12); outline: none; }
        .selected .placeholder { color: #90a4ae; }
        .arrow { font-size: 0.7rem; transition: transform 0.18s; color: #546e7a; }
        .selected.open .arrow { transform: rotate(180deg); }
        .options {
          display: none; position: absolute; top: calc(100% + 4px); left: 0; right: 0;
          background: #fff; border: 1.5px solid #1976d2; border-radius: 6px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.12); z-index: 999;
          max-height: 200px; overflow-y: auto;
        }
        .options.open { display: block; animation: drop 0.15s ease; }
        @keyframes drop { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:none; } }
        .option {
          padding: 10px 13px; cursor: pointer; font-size: 0.88rem;
          transition: background 0.15s; border-bottom: 1px solid #f5f7fa;
        }
        .option:last-child { border-bottom: none; }
        .option:hover  { background: #e3f2fd; }
        .option.active { background: #1976d2; color: #fff; font-weight: 600; }
      </style>
      <div class="dropdown" tabindex="0" id="dd" aria-haspopup="listbox" data-testid="custom-dropdown">
        <div class="selected ${this._open ? 'open' : ''}" id="sel" tabindex="-1">
          ${current
            ? `<span>${current.label}</span>`
            : `<span class="placeholder">${ph}</span>`}
          <span class="arrow">▼</span>
        </div>
        <div class="options ${this._open ? 'open' : ''}" role="listbox" id="opts">
          ${this._options.map(o => `<div class="option ${o.value === this._value ? 'active' : ''}" data-value="${o.value}" role="option">${o.label}</div>`).join('')}
        </div>
      </div>`;

    const dd   = this._root.getElementById('dd');
    const sel  = this._root.getElementById('sel');
    const opts = this._root.getElementById('opts');

    sel.addEventListener('click', e => { e.stopPropagation(); this._open = !this._open; this._render(); });
    dd.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._open = !this._open; this._render(); }
      if (e.key === 'Escape') { this._open = false; this._render(); }
    });
    dd.addEventListener('blur', () => { setTimeout(() => { this._open = false; this._render(); }, 150); });

    this._root.querySelectorAll('.option').forEach(opt => {
      opt.addEventListener('click', () => {
        this._value = opt.dataset.value;
        this._open  = false;
        this._render();
        this.dispatchEvent(new CustomEvent('change', { detail: this._value, bubbles: true, composed: true }));
      });
    });

    document.addEventListener('click', () => { if (this._open) { this._open = false; this._render(); } }, { once: true });
  }
}
customElements.define('hrms-dropdown', HrmsDropdown);
