// ============================================================
// HRMS Practice App – Direct Data Layer
// Runs in page context. No Service Worker dependency.
// Same IndexedDB as sw.js — fully compatible.
// ============================================================
const HrmsData = (() => {
  // ── Constants ────────────────────────────────────────────
  const DB_NAME = 'hrms_practice_db';
  const DB_VERSION = 1;
  const MAX_EMPLOYEES = 400;
  const MAX_USERS = 100;
  const SESSION_TTL = 24 * 60 * 60 * 1000;

  // ── Seed arrays ──────────────────────────────────────────
  const FN = ['Emma','Liam','Olivia','Noah','Ava','William','Sophia','James','Isabella','Oliver',
    'Mia','Benjamin','Charlotte','Elijah','Amelia','Lucas','Harper','Mason','Evelyn','Logan',
    'Abigail','Alexander','Emily','Ethan','Elizabeth','Jacob','Mila','Michael','Ella','Daniel',
    'Avery','Henry','Sofia','Jackson','Camila','Sebastian','Aria','Aiden','Scarlett','Matthew',
    'Victoria','Samuel','Madison','David','Luna','Joseph','Grace','Carter','Chloe','Owen',
    'Penelope','Wyatt','Layla','John','Riley','Jack','Zoey','Luke','Nora','Jayden','Lily',
    'Dylan','Grayson','Hannah','Levi','Lillian','Isaac','Addison','Gabriel','Aubrey','Stella'];
  const LN = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis',
    'Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas',
    'Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White','Harris','Sanchez',
    'Clark','Ramirez','Lewis','Robinson','Walker','Young','Allen','King','Wright','Scott',
    'Torres','Nguyen','Hill','Flores','Green','Adams','Nelson','Baker','Hall','Rivera',
    'Campbell','Mitchell','Carter','Roberts','Chen','Kumar','Patel','Kim','Wang','Li'];
  const DEPTS = ['Engineering','Human Resources','Finance','Marketing','Sales',
    'Operations','Legal','Design','Product','Customer Support'];
  const TITLES = {
    'Engineering':      ['Software Engineer','Senior Engineer','Tech Lead','DevOps Engineer','QA Engineer','Frontend Developer','Backend Developer'],
    'Human Resources':  ['HR Manager','HR Specialist','Recruiter','HR Business Partner'],
    'Finance':          ['Financial Analyst','Accountant','Finance Manager','Payroll Specialist'],
    'Marketing':        ['Marketing Manager','Content Writer','SEO Specialist','Brand Manager'],
    'Sales':            ['Sales Representative','Account Executive','Sales Manager'],
    'Operations':       ['Operations Manager','Project Manager','Business Analyst'],
    'Legal':            ['Legal Counsel','Paralegal','Compliance Officer'],
    'Design':           ['UX Designer','UI Designer','Graphic Designer','Design Lead'],
    'Product':          ['Product Manager','Product Owner','Scrum Master'],
    'Customer Support': ['Support Specialist','Customer Success Manager','Support Lead']
  };
  const COUNTRIES = ['USA','United Kingdom','Canada','Australia','Germany','France','India','Singapore','Netherlands','Spain'];
  const CITIES = {
    'USA':['New York','San Francisco','Chicago','Austin','Seattle','Boston'],
    'United Kingdom':['London','Manchester','Birmingham','Leeds'],
    'Canada':['Toronto','Vancouver','Montreal','Calgary'],
    'Australia':['Sydney','Melbourne','Brisbane','Perth'],
    'Germany':['Berlin','Munich','Hamburg','Frankfurt'],
    'France':['Paris','Lyon','Marseille'],
    'India':['Mumbai','Bangalore','Delhi','Hyderabad'],
    'Singapore':['Singapore'],
    'Netherlands':['Amsterdam','Rotterdam'],
    'Spain':['Madrid','Barcelona','Valencia']
  };
  const SKILLS = ['JavaScript','TypeScript','Python','Java','C#','React','Angular','Vue.js',
    'Node.js','SQL','PostgreSQL','MongoDB','AWS','Azure','Docker','Kubernetes','Git',
    'Agile','Scrum','Machine Learning','Data Analysis','Excel','REST APIs','CI/CD'];
  const EMP_TYPES = ['Full-time','Part-time','Contract','Intern'];
  const STATUSES  = ['Active','Active','Active','Inactive','On Leave'];
  const GENDERS   = ['Male','Female','Non-binary','Prefer not to say'];
  const COLORS    = ['#1976d2','#388e3c','#f57c00','#7b1fa2','#c62828','#00838f','#37474f','#5c6bc0'];

  function sr(seed) { let s = seed; return () => { s = (s*9301+49297)%233280; return s/233280; }; }
  function pick(a, r) { return a[Math.floor(r()*a.length)]; }
  function sample(a, n, r) { const c=[...a],o=[]; for(let i=0;i<Math.min(n,c.length);i++){const x=Math.floor(r()*c.length);o.push(c.splice(x,1)[0]);}return o; }
  function pad2(n) { return String(n).padStart(2,'0'); }
  function pad4(n) { return String(n).padStart(4,'0'); }

  function generateSeedEmployees() {
    const rng = sr(42);
    return Array.from({ length: 400 }, (_, idx) => {
      const i = idx + 1;
      const fn = pick(FN,rng), ln = pick(LN,rng), dept = pick(DEPTS,rng);
      const title = pick(TITLES[dept]||TITLES['Engineering'], rng);
      const country = pick(COUNTRIES,rng);
      const city    = pick(CITIES[country]||['Unknown'], rng);
      const bY=1968+Math.floor(rng()*30),bM=1+Math.floor(rng()*12),bD=1+Math.floor(rng()*28);
      const hY=2012+Math.floor(rng()*13),hM=1+Math.floor(rng()*12),hD=1+Math.floor(rng()*28);
      const now = new Date(hY,hM-1,hD).toISOString();
      return {
        id:`EMP-${pad4(i)}`, firstName:fn, lastName:ln,
        email:`${fn.toLowerCase()}.${ln.toLowerCase()}${i}@hrms-practice.com`,
        phone:`+1-${Math.floor(rng()*900+100)}-${Math.floor(rng()*900+100)}-${Math.floor(rng()*9000+1000)}`,
        department:dept, jobTitle:title,
        salary:38000+Math.floor(rng()*120000),
        hireDate:`${hY}-${pad2(hM)}-${pad2(hD)}`,
        dateOfBirth:`${bY}-${pad2(bM)}-${pad2(bD)}`,
        gender:pick(GENDERS,rng), employmentType:pick(EMP_TYPES,rng),
        status:STATUSES[Math.floor(rng()*STATUSES.length)],
        address:`${Math.floor(rng()*999+1)} ${pick(LN,rng)} St`,
        city, country,
        skills:sample(SKILLS,2+Math.floor(rng()*4),rng),
        benefits:['Health Insurance','401(k)'],
        manager:i>10?`${pick(FN,rng)} ${pick(LN,rng)}`:'Direct Report',
        profileColor:pick(COLORS,rng),
        experience:Math.floor(rng()*22),
        linkedinUrl:`https://linkedin.com/in/${fn.toLowerCase()}-${ln.toLowerCase()}-${i}`,
        notes:'', performanceRating:1+Math.floor(rng()*5),
        tags:[dept==='Engineering'?'Tech':dept==='Sales'?'Revenue':'Operations'],
        shiftStart:`${pad2(6+Math.floor(rng()*4))}:${rng()>0.5?'00':'30'}`,
        startMonth:`${hY}-${pad2(hM)}`,
        createdAt:now, updatedAt:now
      };
    });
  }

  // ── IndexedDB helpers ─────────────────────────────────────
  let _db = null;
  function openDB() {
    if (_db) return Promise.resolve(_db);
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('employees')) {
          const es = db.createObjectStore('employees', { keyPath: 'id' });
          es.createIndex('email','email',{unique:true});
          es.createIndex('department','department',{unique:false});
          es.createIndex('status','status',{unique:false});
        }
        if (!db.objectStoreNames.contains('users')) {
          const us = db.createObjectStore('users', { keyPath: 'id' });
          us.createIndex('username','username',{unique:true});
          us.createIndex('email','email',{unique:false});
        }
        if (!db.objectStoreNames.contains('sessions')) {
          const ss = db.createObjectStore('sessions', { keyPath: 'token' });
          ss.createIndex('userId','userId',{unique:false});
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
      const t = db.transaction(store, mode);
      const r = fn(t.objectStore(store));
      r.onsuccess = () => res(r.result);
      r.onerror   = () => rej(r.error);
    }));
  }
  const dbGet    = (s,k) => tx(s,'readonly',  st=>st.get(k));
  const dbGetAll = s     => tx(s,'readonly',  st=>st.getAll());
  const dbPut    = (s,v) => tx(s,'readwrite', st=>st.put(v));
  const dbDel    = (s,k) => tx(s,'readwrite', st=>st.delete(k));
  const dbCount  = s     => tx(s,'readonly',  st=>st.count());
  const dbIdx    = (s,idx,v) => openDB().then(db => new Promise((res, rej) => {
    const r = db.transaction(s,'readonly').objectStore(s).index(idx).get(v);
    r.onsuccess = () => res(r.result);
    r.onerror   = () => rej(r.error);
  }));

  async function initData() {
    const meta = await dbGet('meta','initialized');
    if (meta) return;
    const db = await openDB();
    const emps = generateSeedEmployees();
    await new Promise((res, rej) => {
      const t = db.transaction('employees','readwrite');
      const s = t.objectStore('employees');
      emps.forEach(e => s.put(e));
      t.oncomplete = res; t.onerror = rej;
    });
    await dbPut('users',{
      id:'USR-0000', username:'admin', password:'admin',
      email:'admin@hrms-practice.com', firstName:'Admin', lastName:'User',
      role:'admin', department:'IT', isActive:true, isAdmin:true,
      createdAt:new Date().toISOString(), lastLogin:null
    });
    await dbPut('meta',{ key:'initialized', value:true });
  }

  // ── Token helpers ─────────────────────────────────────────
  function genToken() {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      return 'tk_' + [...crypto.getRandomValues(new Uint8Array(16))].map(b=>b.toString(16).padStart(2,'0')).join('');
    }
    return 'tk_' + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  }

  async function validateSession(token) {
    if (!token) throw Object.assign(new Error('Unauthorized'), { status: 401 });
    const s = await dbGet('sessions', token);
    if (!s || Date.now() - s.createdAt > SESSION_TTL) {
      await dbDel('sessions', token).catch(()=>{});
      throw Object.assign(new Error('Unauthorized'), { status: 401 });
    }
    return s;
  }

  // ── Auth operations ───────────────────────────────────────
  async function authLogin(username, password) {
    if (!username || !password) throw new Error('Username and password required');
    const user = await dbIdx('users','username', username);
    if (!user || user.password !== password) throw new Error('Invalid credentials');
    if (!user.isActive) throw new Error('Account inactive');
    const token = genToken();
    await dbPut('sessions',{ token, userId:user.id, createdAt:Date.now() });
    user.lastLogin = new Date().toISOString();
    await dbPut('users', user);
    const { password:_, ...safe } = user;
    return { token, user: safe };
  }

  async function authLogout(token) {
    if (token) await dbDel('sessions', token).catch(()=>{});
    return { success: true };
  }

  async function authMe(token) {
    const s = await validateSession(token);
    const u = await dbGet('users', s.userId);
    if (!u) throw new Error('User not found');
    const { password:_, ...safe } = u;
    return safe;
  }

  async function authRegister(payload) {
    const required = ['username','password','email','firstName','lastName'];
    for (const f of required) if (!payload[f]) throw new Error(`'${f}' is required`);
    const ex = await dbIdx('users','username', payload.username);
    if (ex) throw new Error('Username already taken');
    const allUsers = await dbGetAll('users');
    const nonAdmins = allUsers.filter(u => !u.isAdmin);
    if (nonAdmins.length >= MAX_USERS) {
      const oldest = nonAdmins.sort((a,b) => a.createdAt.localeCompare(b.createdAt))[0];
      await dbDel('users', oldest.id);
    }
    const now = new Date().toISOString();
    const newUser = {
      id:`USR-${pad4(allUsers.length+1)}`,
      username:payload.username, password:payload.password,
      email:payload.email, firstName:payload.firstName, lastName:payload.lastName,
      role:payload.role||'employee', department:payload.department||'',
      phone:payload.phone||'', dateOfBirth:payload.dateOfBirth||'',
      gender:payload.gender||'', address:payload.address||'',
      city:payload.city||'', country:payload.country||'',
      profileColor:payload.profileColor||'#1976d2',
      skills:payload.skills||[], isActive:true, isAdmin:false,
      createdAt:now, lastLogin:null,
      employmentType:payload.employmentType||'Full-time',
      linkedinUrl:payload.linkedinUrl||'', experience:payload.experience||0,
      shiftStart:payload.shiftStart||'', notes:payload.notes||'',
      benefits:payload.benefits||[], performanceRating:payload.performanceRating||0,
      tags:payload.tags||[], startMonth:payload.startMonth||''
    };
    await dbPut('users', newUser);
    const { password:_, ...safe } = newUser;
    return safe;
  }

  // ── Employee operations ───────────────────────────────────
  async function employeeList(params = {}) {
    const page   = parseInt(params.page  || 1);
    const limit  = parseInt(params.limit || 20);
    const search = (params.search     || '').toLowerCase().trim();
    const dept   = params.department  || '';
    const status = params.status      || '';
    const empType= params.employmentType || '';
    const sort   = params.sort        || 'firstName';
    const order  = params.order       || 'asc';
    let all = await dbGetAll('employees');
    if (search) all = all.filter(e =>
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(search) ||
      e.email.toLowerCase().includes(search) ||
      e.id.toLowerCase().includes(search) ||
      (e.jobTitle||'').toLowerCase().includes(search) ||
      (e.department||'').toLowerCase().includes(search));
    if (dept)    all = all.filter(e => e.department === dept);
    if (status)  all = all.filter(e => e.status === status);
    if (empType) all = all.filter(e => e.employmentType === empType);
    all.sort((a,b) => {
      let av=(a[sort]||''), bv=(b[sort]||'');
      if (typeof av==='string') av=av.toLowerCase();
      if (typeof bv==='string') bv=bv.toLowerCase();
      return order==='asc'?(av<bv?-1:av>bv?1:0):(av>bv?-1:av<bv?1:0);
    });
    const total = all.length;
    return { data:all.slice((page-1)*limit,page*limit), pagination:{ page,limit,total,pages:Math.ceil(total/limit) } };
  }

  async function employeeGet(id) {
    const e = await dbGet('employees', id);
    if (!e) throw new Error('Employee not found');
    return e;
  }

  async function employeeCreate(token, body) {
    await validateSession(token);
    if (!body.firstName||!body.lastName||!body.email||!body.department)
      throw new Error('firstName, lastName, email, department required');
    const ex = await dbIdx('employees','email', body.email);
    if (ex) throw new Error('Email already exists');
    const cnt = await dbCount('employees');
    if (cnt >= MAX_EMPLOYEES) {
      const all = await dbGetAll('employees');
      const old = all.sort((a,b)=>a.createdAt.localeCompare(b.createdAt))[0];
      await dbDel('employees', old.id);
    }
    const all = await dbGetAll('employees');
    const maxN = all.reduce((m,e)=>{ const n=parseInt(e.id.replace('EMP-','')||'0'); return n>m?n:m; },400);
    const now  = new Date().toISOString();
    const emp  = {
      id:`EMP-${pad4(maxN+1)}`,
      firstName:body.firstName, lastName:body.lastName, email:body.email,
      phone:body.phone||'', department:body.department, jobTitle:body.jobTitle||'',
      salary:body.salary||0, hireDate:body.hireDate||now.slice(0,10),
      dateOfBirth:body.dateOfBirth||'', gender:body.gender||'',
      employmentType:body.employmentType||'Full-time', status:body.status||'Active',
      address:body.address||'', city:body.city||'', country:body.country||'',
      skills:body.skills||[], manager:body.manager||'', profileColor:body.profileColor||'#1976d2',
      experience:body.experience||0, linkedinUrl:body.linkedinUrl||'',
      notes:body.notes||'', benefits:body.benefits||[], performanceRating:body.performanceRating||0,
      tags:body.tags||[], shiftStart:body.shiftStart||'09:00', startMonth:body.startMonth||'',
      createdAt:now, updatedAt:now
    };
    await dbPut('employees', emp);
    return emp;
  }

  async function employeeUpdate(token, id, body) {
    await validateSession(token);
    const e = await dbGet('employees', id);
    if (!e) throw new Error('Employee not found');
    delete body.id; delete body.createdAt;
    const updated = { ...e, ...body, id:e.id, updatedAt:new Date().toISOString() };
    await dbPut('employees', updated);
    return updated;
  }

  async function employeeDelete(token, id) {
    await validateSession(token);
    const e = await dbGet('employees', id);
    if (!e) throw new Error('Employee not found');
    await dbDel('employees', id);
    return { success:true, message:`Employee ${id} deleted` };
  }

  async function exportCSV() {
    const all  = await dbGetAll('employees');
    const cols = ['id','firstName','lastName','email','phone','department','jobTitle',
      'salary','hireDate','dateOfBirth','gender','employmentType','status',
      'city','country','experience','performanceRating','manager','skills','benefits'];
    const rows = all.map(e => cols.map(h => {
      const v = e[h];
      if (Array.isArray(v)) return `"${v.join(';')}"`;
      if (typeof v==='string'&&(v.includes(',')||v.includes('"'))) return `"${v.replace(/"/g,'""')}"`;
      return v ?? '';
    }).join(','));
    return [cols.join(','), ...rows].join('\n');
  }

  // ── Meta ──────────────────────────────────────────────────
  async function getStats() {
    const [empCount, userCount, emps] = await Promise.all([dbCount('employees'),dbCount('users'),dbGetAll('employees')]);
    const byDept={}, byStatus={};
    emps.forEach(e => {
      byDept[e.department]=(byDept[e.department]||0)+1;
      byStatus[e.status]=(byStatus[e.status]||0)+1;
    });
    const avgSalary = emps.length?Math.round(emps.reduce((s,e)=>s+(e.salary||0),0)/emps.length):0;
    return { employeeCount:emps.length, userCount, byDept, byStatus, avgSalary };
  }

  function getDepartments() { return Promise.resolve(DEPTS); }

  async function getUsers(token) {
    const s = await validateSession(token);
    const u = await dbGet('users', s.userId);
    if (!u||u.role!=='admin') throw Object.assign(new Error('Forbidden'), { status:403 });
    const all = await dbGetAll('users');
    return { data:all.map(({password:_,...u})=>u), total:all.length };
  }

  return {
    init: initData,
    authLogin, authLogout, authMe, authRegister,
    employeeList, employeeGet, employeeCreate, employeeUpdate, employeeDelete, exportCSV,
    getStats, getDepartments, getUsers
  };
})();
