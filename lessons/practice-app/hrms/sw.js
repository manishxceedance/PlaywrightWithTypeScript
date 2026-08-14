// ============================================================
// HRMS Practice App – Service Worker (Mock REST API Backend)
// All data persisted in IndexedDB within the SW scope
// ============================================================
const SW_VERSION = '2.0.0';
const DB_NAME = 'hrms_practice_db';
const DB_VERSION = 1;
const MAX_EMPLOYEES = 400;
const MAX_USERS = 100;
const SESSION_TTL = 24 * 60 * 60 * 1000;

// ── Seed data arrays ─────────────────────────────────────────
const FN = ['Emma','Liam','Olivia','Noah','Ava','William','Sophia','James','Isabella','Oliver',
  'Mia','Benjamin','Charlotte','Elijah','Amelia','Lucas','Harper','Mason','Evelyn','Logan',
  'Abigail','Alexander','Emily','Ethan','Elizabeth','Jacob','Mila','Michael','Ella','Daniel',
  'Avery','Henry','Sofia','Jackson','Camila','Sebastian','Aria','Aiden','Scarlett','Matthew',
  'Victoria','Samuel','Madison','David','Luna','Joseph','Grace','Carter','Chloe','Owen',
  'Penelope','Wyatt','Layla','John','Riley','Jack','Zoey','Luke','Nora','Jayden','Lily',
  'Dylan','Grayson','Hannah','Levi','Lillian','Isaac','Addison','Gabriel','Aubrey','Stella',
  'Ryan','Natalie','Tyler','Leah','Connor','Savannah','Aaron','Zoe','Eli','Audrey'];

const LN = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis',
  'Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas',
  'Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White','Harris','Sanchez',
  'Clark','Ramirez','Lewis','Robinson','Walker','Young','Allen','King','Wright','Scott',
  'Torres','Nguyen','Hill','Flores','Green','Adams','Nelson','Baker','Hall','Rivera',
  'Campbell','Mitchell','Carter','Roberts','Chen','Kumar','Patel','Kim','Wang','Li'];

const DEPTS = ['Engineering','Human Resources','Finance','Marketing','Sales',
  'Operations','Legal','Design','Product','Customer Support'];

const TITLES = {
  'Engineering':       ['Software Engineer','Senior Engineer','Tech Lead','DevOps Engineer','QA Engineer','Frontend Developer','Backend Developer'],
  'Human Resources':   ['HR Manager','HR Specialist','Recruiter','HR Business Partner','Training Coordinator'],
  'Finance':           ['Financial Analyst','Accountant','Finance Manager','Budget Analyst','Payroll Specialist'],
  'Marketing':         ['Marketing Manager','Content Writer','SEO Specialist','Brand Manager','Digital Marketer'],
  'Sales':             ['Sales Representative','Account Executive','Sales Manager','Business Development Rep'],
  'Operations':        ['Operations Manager','Project Manager','Business Analyst','Process Improvement Specialist'],
  'Legal':             ['Legal Counsel','Paralegal','Compliance Officer','Contract Manager'],
  'Design':            ['UX Designer','UI Designer','Graphic Designer','Design Lead','Product Designer'],
  'Product':           ['Product Manager','Product Owner','Scrum Master','Program Manager'],
  'Customer Support':  ['Support Specialist','Customer Success Manager','Support Lead','Technical Support Engineer']
};

const COUNTRIES = ['USA','United Kingdom','Canada','Australia','Germany','France','India','Singapore','Netherlands','Spain'];
const CITIES = {
  'USA':            ['New York','San Francisco','Chicago','Austin','Seattle','Boston','Denver','Atlanta'],
  'United Kingdom': ['London','Manchester','Birmingham','Leeds','Glasgow'],
  'Canada':         ['Toronto','Vancouver','Montreal','Calgary','Ottawa'],
  'Australia':      ['Sydney','Melbourne','Brisbane','Perth','Adelaide'],
  'Germany':        ['Berlin','Munich','Hamburg','Frankfurt','Cologne'],
  'France':         ['Paris','Lyon','Marseille','Toulouse','Nice'],
  'India':          ['Mumbai','Bangalore','Delhi','Hyderabad','Pune'],
  'Singapore':      ['Singapore'],
  'Netherlands':    ['Amsterdam','Rotterdam','The Hague','Utrecht'],
  'Spain':          ['Madrid','Barcelona','Valencia','Seville','Bilbao']
};

const SKILLS = ['JavaScript','TypeScript','Python','Java','C#','React','Angular','Vue.js',
  'Node.js','SQL','PostgreSQL','MongoDB','AWS','Azure','Docker','Kubernetes','Git',
  'Agile','Scrum','Machine Learning','Data Analysis','Excel','Tableau','Salesforce',
  'Project Management','Communication','Leadership','Teamwork','REST APIs','CI/CD'];

const EMP_TYPES  = ['Full-time','Part-time','Contract','Intern'];
const STATUSES   = ['Active','Active','Active','Inactive','On Leave'];
const GENDERS    = ['Male','Female','Non-binary','Prefer not to say'];
const BENEFITS   = ['Health Insurance','Dental','Vision','401(k)','Paid Time Off','Remote Work','Gym Membership'];
const COLORS     = ['#1976d2','#388e3c','#f57c00','#7b1fa2','#c62828','#00838f','#37474f','#5c6bc0','#00695c','#6d4c41'];

function sr(seed) { /* seeded random */
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

function pick(arr, rng) { return arr[Math.floor(rng() * arr.length)]; }

function sample(arr, n, rng) {
  const copy = [...arr]; const out = [];
  for (let i = 0; i < Math.min(n, copy.length); i++) {
    const idx = Math.floor(rng() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

function pad2(n) { return String(n).padStart(2, '0'); }
function pad4(n) { return String(n).padStart(4, '0'); }

function generateSeedEmployees() {
  const rng = sr(42);
  const employees = [];
  for (let i = 1; i <= 400; i++) {
    const fn  = pick(FN, rng);
    const ln  = pick(LN, rng);
    const dept = pick(DEPTS, rng);
    const title = pick(TITLES[dept], rng);
    const country = pick(COUNTRIES, rng);
    const city    = pick(CITIES[country], rng);
    const bY = 1968 + Math.floor(rng() * 30);
    const bM = 1  + Math.floor(rng() * 12);
    const bD = 1  + Math.floor(rng() * 28);
    const hY = 2012 + Math.floor(rng() * 13);
    const hM = 1  + Math.floor(rng() * 12);
    const hD = 1  + Math.floor(rng() * 28);
    const salary = 38000 + Math.floor(rng() * 120000);
    const skills   = sample(SKILLS, 2 + Math.floor(rng() * 4), rng);
    const benefits = sample(BENEFITS, 2 + Math.floor(rng() * 3), rng);
    const hh = pad2(6 + Math.floor(rng() * 4));
    const mm = rng() > 0.5 ? '00' : '30';
    const hireISO = `${hY}-${pad2(hM)}-${pad2(hD)}`;
    employees.push({
      id: `EMP-${pad4(i)}`,
      firstName: fn, lastName: ln,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@hrms-practice.com`,
      phone: `+1-${Math.floor(rng()*900+100)}-${Math.floor(rng()*900+100)}-${Math.floor(rng()*9000+1000)}`,
      department: dept, jobTitle: title,
      salary,
      hireDate: hireISO,
      dateOfBirth: `${bY}-${pad2(bM)}-${pad2(bD)}`,
      gender: pick(GENDERS, rng),
      employmentType: pick(EMP_TYPES, rng),
      status: STATUSES[Math.floor(rng() * STATUSES.length)],
      address: `${Math.floor(rng()*999+1)} ${pick(LN, rng)} St`,
      city, country,
      skills, benefits,
      manager: i > 10 ? `${pick(FN, rng)} ${pick(LN, rng)}` : 'Direct Report',
      profileColor: pick(COLORS, rng),
      experience: Math.floor(rng() * 22),
      linkedinUrl: `https://linkedin.com/in/${fn.toLowerCase()}-${ln.toLowerCase()}-${i}`,
      notes: '',
      performanceRating: 1 + Math.floor(rng() * 5),
      tags: dept === 'Engineering' ? ['Tech','Development'] : dept === 'Sales' ? ['Revenue','Client'] : ['Operations'],
      shiftStart: `${hh}:${mm}`,
      startMonth: `${hY}-${pad2(hM)}`,
      createdAt: new Date(hY, hM-1, hD).toISOString(),
      updatedAt: new Date(hY, hM-1, hD).toISOString()
    });
  }
  return employees;
}

// ── IndexedDB helpers ─────────────────────────────────────────
let _db = null;

function openDB() {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('employees')) {
        const es = db.createObjectStore('employees', { keyPath: 'id' });
        es.createIndex('email',      'email',      { unique: true });
        es.createIndex('department', 'department', { unique: false });
        es.createIndex('status',     'status',     { unique: false });
      }
      if (!db.objectStoreNames.contains('users')) {
        const us = db.createObjectStore('users', { keyPath: 'id' });
        us.createIndex('username', 'username', { unique: true });
        us.createIndex('email',    'email',    { unique: false });
      }
      if (!db.objectStoreNames.contains('sessions')) {
        const ss = db.createObjectStore('sessions', { keyPath: 'token' });
        ss.createIndex('userId', 'userId', { unique: false });
      }
      if (!db.objectStoreNames.contains('meta')) {
        db.createObjectStore('meta', { keyPath: 'key' });
      }
    };
    req.onsuccess = e => { _db = e.target.result; resolve(_db); };
    req.onerror   = () => reject(req.error);
  });
}

function tx(store, mode, fn) {
  return openDB().then(db => new Promise((res, rej) => {
    const t  = db.transaction(store, mode);
    const st = t.objectStore(store);
    const r  = fn(st);
    r.onsuccess = () => res(r.result);
    r.onerror   = () => rej(r.error);
  }));
}

const dbGet    = (s, k) => tx(s, 'readonly',  st => st.get(k));
const dbGetAll = s      => tx(s, 'readonly',  st => st.getAll());
const dbPut    = (s, v) => tx(s, 'readwrite', st => st.put(v));
const dbDel    = (s, k) => tx(s, 'readwrite', st => st.delete(k));
const dbCount  = s      => tx(s, 'readonly',  st => st.count());
const dbIdx    = (s, idx, v) => openDB().then(db => new Promise((res, rej) => {
  const t  = db.transaction(s, 'readonly');
  const r  = t.objectStore(s).index(idx).get(v);
  r.onsuccess = () => res(r.result);
  r.onerror   = () => rej(r.error);
}));

// ── Initialization ─────────────────────────────────────────
async function initData() {
  const meta = await dbGet('meta', 'initialized');
  if (meta) return;
  const employees = generateSeedEmployees();
  const db = await openDB();
  await new Promise((res, rej) => {
    const t = db.transaction('employees', 'readwrite');
    const s = t.objectStore('employees');
    employees.forEach(e => s.put(e));
    t.oncomplete = res; t.onerror = rej;
  });
  await dbPut('users', {
    id: 'USR-0000', username: 'admin', password: 'admin',
    email: 'admin@hrms-practice.com',
    firstName: 'Admin', lastName: 'User',
    role: 'admin', department: 'IT', isActive: true, isAdmin: true,
    createdAt: new Date().toISOString(), lastLogin: null
  });
  await dbPut('meta', { key: 'initialized', value: true, version: SW_VERSION });
}

// ── Auth helpers ───────────────────────────────────────────
function genToken() {
  return 'tk_' + [...crypto.getRandomValues(new Uint8Array(16))]
    .map(b => b.toString(16).padStart(2,'0')).join('');
}

async function getSession(req) {
  const auth = req.headers.get('Authorization') || '';
  if (!auth.startsWith('Bearer ')) return null;
  const tok = auth.slice(7);
  const s   = await dbGet('sessions', tok);
  if (!s) return null;
  if (Date.now() - s.createdAt > SESSION_TTL) { await dbDel('sessions', tok); return null; }
  return s;
}

// ── Response helpers ───────────────────────────────────────
const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization', 'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS' };

const json  = (d, st=200)   => new Response(JSON.stringify(d), { status: st, headers });
const err   = (m, st=400)   => json({ error: true, message: m }, st);
const ok    = (m)           => json({ success: true, message: m });

// ── Route handlers ─────────────────────────────────────────

async function authLogin(req) {
  const { username, password } = await req.json().catch(() => ({}));
  if (!username || !password) return err('username and password required');
  const user = await dbIdx('users', 'username', username);
  if (!user || user.password !== password) return err('Invalid credentials', 401);
  if (!user.isActive) return err('Account inactive', 403);
  const token = genToken();
  await dbPut('sessions', { token, userId: user.id, createdAt: Date.now() });
  user.lastLogin = new Date().toISOString();
  await dbPut('users', user);
  const { password: _, ...safe } = user;
  return json({ token, user: safe });
}

async function authLogout(req) {
  const s = await getSession(req);
  if (s) await dbDel('sessions', s.token);
  return ok('Logged out');
}

async function authMe(req) {
  const s = await getSession(req);
  if (!s) return err('Unauthorized', 401);
  const u = await dbGet('users', s.userId);
  if (!u) return err('Not found', 404);
  const { password: _, ...safe } = u;
  return json(safe);
}

async function authRegister(req) {
  const body = await req.json().catch(() => ({}));
  const required = ['username','password','email','firstName','lastName'];
  for (const f of required) if (!body[f]) return err(`'${f}' is required`);
  const ex = await dbIdx('users', 'username', body.username);
  if (ex) return err('Username already taken');
  const allUsers = await dbGetAll('users');
  const nonAdmins = allUsers.filter(u => !u.isAdmin);
  if (nonAdmins.length >= MAX_USERS) {
    const oldest = nonAdmins.sort((a,b) => a.createdAt.localeCompare(b.createdAt))[0];
    await dbDel('users', oldest.id);
  }
  const now = new Date().toISOString();
  const newUser = {
    id: `USR-${pad4(allUsers.length + 1)}`,
    username: body.username, password: body.password,
    email: body.email, firstName: body.firstName, lastName: body.lastName,
    role: body.role || 'employee', department: body.department || '',
    phone: body.phone || '', dateOfBirth: body.dateOfBirth || '',
    gender: body.gender || '', address: body.address || '',
    city: body.city || '', country: body.country || '',
    profileColor: body.profileColor || '#1976d2',
    skills: body.skills || [], isActive: true, isAdmin: false,
    createdAt: now, lastLogin: null,
    employmentType: body.employmentType || 'Full-time',
    linkedinUrl: body.linkedinUrl || '', experience: body.experience || 0,
    shiftStart: body.shiftStart || '', notes: body.notes || '',
    benefits: body.benefits || [], performanceRating: body.performanceRating || 0,
    tags: body.tags || [], startMonth: body.startMonth || ''
  };
  await dbPut('users', newUser);
  const { password: _, ...safe } = newUser;
  return json(safe, 201);
}

async function getEmployees(url) {
  const p = url.searchParams;
  const page   = parseInt(p.get('page')  || '1');
  const limit  = parseInt(p.get('limit') || '20');
  const search = (p.get('search')     || '').toLowerCase().trim();
  const dept   = p.get('department')  || '';
  const status = p.get('status')      || '';
  const sort   = p.get('sort')        || 'firstName';
  const order  = p.get('order')       || 'asc';
  let all = await dbGetAll('employees');
  if (search) all = all.filter(e =>
    `${e.firstName} ${e.lastName}`.toLowerCase().includes(search) ||
    e.email.toLowerCase().includes(search) ||
    e.id.toLowerCase().includes(search) ||
    (e.jobTitle||'').toLowerCase().includes(search) ||
    (e.department||'').toLowerCase().includes(search));
  if (dept)   all = all.filter(e => e.department === dept);
  if (status) all = all.filter(e => e.status === status);
  all.sort((a, b) => {
    let av = (a[sort]||''), bv = (b[sort]||'');
    if (typeof av === 'string') av = av.toLowerCase();
    if (typeof bv === 'string') bv = bv.toLowerCase();
    return order === 'asc' ? (av < bv ? -1 : av > bv ? 1 : 0) : (av > bv ? -1 : av < bv ? 1 : 0);
  });
  const total = all.length;
  const data  = all.slice((page-1)*limit, page*limit);
  return json({ data, pagination: { page, limit, total, pages: Math.ceil(total/limit) } });
}

async function createEmployee(req) {
  const s = await getSession(req);
  if (!s) return err('Unauthorized', 401);
  const body = await req.json().catch(() => ({}));
  if (!body.firstName || !body.lastName || !body.email || !body.department)
    return err('firstName, lastName, email, department required');
  const ex = await dbIdx('employees', 'email', body.email);
  if (ex) return err('Email already exists');
  const cnt = await dbCount('employees');
  if (cnt >= MAX_EMPLOYEES) {
    const all = await dbGetAll('employees');
    const old = all.sort((a,b) => a.createdAt.localeCompare(b.createdAt))[0];
    await dbDel('employees', old.id);
  }
  const all = await dbGetAll('employees');
  const maxN = all.reduce((m, e) => { const n = parseInt(e.id.replace('EMP-','')||'0'); return n > m ? n : m; }, 400);
  const now  = new Date().toISOString();
  const emp  = {
    id: `EMP-${pad4(maxN+1)}`,
    firstName: body.firstName, lastName: body.lastName, email: body.email,
    phone: body.phone||'', department: body.department, jobTitle: body.jobTitle||'',
    salary: body.salary||0, hireDate: body.hireDate||now.slice(0,10),
    dateOfBirth: body.dateOfBirth||'', gender: body.gender||'',
    employmentType: body.employmentType||'Full-time', status: body.status||'Active',
    address: body.address||'', city: body.city||'', country: body.country||'',
    skills: body.skills||[], manager: body.manager||'', profileColor: body.profileColor||'#1976d2',
    experience: body.experience||0, linkedinUrl: body.linkedinUrl||'',
    notes: body.notes||'', benefits: body.benefits||[], performanceRating: body.performanceRating||0,
    tags: body.tags||[], shiftStart: body.shiftStart||'09:00', startMonth: body.startMonth||'',
    createdAt: now, updatedAt: now
  };
  await dbPut('employees', emp);
  return json(emp, 201);
}

async function getEmployee(id) {
  const e = await dbGet('employees', id);
  return e ? json(e) : err('Employee not found', 404);
}

async function updateEmployee(req, id) {
  const s = await getSession(req);
  if (!s) return err('Unauthorized', 401);
  const e = await dbGet('employees', id);
  if (!e) return err('Employee not found', 404);
  const body = await req.json().catch(() => ({}));
  delete body.id; delete body.createdAt;
  const updated = { ...e, ...body, id: e.id, updatedAt: new Date().toISOString() };
  await dbPut('employees', updated);
  return json(updated);
}

async function deleteEmployee(req, id) {
  const s = await getSession(req);
  if (!s) return err('Unauthorized', 401);
  const e = await dbGet('employees', id);
  if (!e) return err('Employee not found', 404);
  await dbDel('employees', id);
  return ok(`Employee ${id} deleted`);
}

async function exportCSV() {
  const all = await dbGetAll('employees');
  const cols = ['id','firstName','lastName','email','phone','department','jobTitle',
    'salary','hireDate','dateOfBirth','gender','employmentType','status',
    'city','country','experience','performanceRating','manager','skills','benefits'];
  const rows = all.map(e => cols.map(h => {
    const v = e[h];
    if (Array.isArray(v)) return `"${v.join(';')}"`;
    if (typeof v === 'string' && (v.includes(',') || v.includes('"'))) return `"${v.replace(/"/g,'""')}"`;
    return v ?? '';
  }).join(','));
  const csv = [cols.join(','), ...rows].join('\n');
  return new Response(csv, { status: 200, headers: {
    'Content-Type': 'text/csv',
    'Content-Disposition': 'attachment; filename="hrms-employees.csv"',
    'Access-Control-Allow-Origin': '*'
  }});
}

async function getUsers(req) {
  const s = await getSession(req);
  if (!s) return err('Unauthorized', 401);
  const u = await dbGet('users', s.userId);
  if (!u || u.role !== 'admin') return err('Forbidden', 403);
  const all = await dbGetAll('users');
  return json({ data: all.map(({ password: _, ...u }) => u), total: all.length });
}

async function getStats() {
  const [empCount, userCount, emps] = await Promise.all([dbCount('employees'), dbCount('users'), dbGetAll('employees')]);
  const byDept = {}, byStatus = {};
  emps.forEach(e => {
    byDept[e.department]   = (byDept[e.department]   || 0) + 1;
    byStatus[e.status]     = (byStatus[e.status]     || 0) + 1;
  });
  const avgSalary = emps.length ? Math.round(emps.reduce((s, e) => s + (e.salary||0), 0) / emps.length) : 0;
  return json({ employeeCount: emps.length, userCount, byDept, byStatus, avgSalary });
}

async function getDepartments() { return json(DEPTS); }

// ── Fetch Router ──────────────────────────────────────────────
async function route(req, url) {
  await initData();
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  const pathAfterApi = url.pathname.split('/hrms-api')[1] || '/';
  const path = pathAfterApi.replace(/\/$/, '') || '/';
  const m = req.method;
  try {
    if (path === '/auth/login'    && m === 'POST')  return authLogin(req);
    if (path === '/auth/logout'   && m === 'POST')  return authLogout(req);
    if (path === '/auth/me'       && m === 'GET')   return authMe(req);
    if (path === '/auth/register' && m === 'POST')  return authRegister(req);
    if (path === '/employees'     && m === 'GET')   return getEmployees(url);
    if (path === '/employees'     && m === 'POST')  return createEmployee(req);
    if (path === '/employees/export' && m === 'GET') return exportCSV();
    const em = path.match(/^\/employees\/(EMP-\d+)$/);
    if (em) {
      if (m === 'GET')    return getEmployee(em[1]);
      if (m === 'PUT')    return updateEmployee(req, em[1]);
      if (m === 'DELETE') return deleteEmployee(req, em[1]);
    }
    if (path === '/users'       && m === 'GET') return getUsers(req);
    if (path === '/departments' && m === 'GET') return getDepartments();
    if (path === '/stats'       && m === 'GET') return getStats();
    return err('Endpoint not found', 404);
  } catch (e) {
    return err('Server error: ' + e.message, 500);
  }
}

self.addEventListener('install', e => e.waitUntil(initData().then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(clients.claim()));
self.addEventListener('fetch', e => {
  if (e.request.url.includes('/hrms-api/')) e.respondWith(route(e.request, new URL(e.request.url)));
});
