const express = require('express');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const { createHash, randomUUID, timingSafeEqual } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { setTimeout: delay } = require('node:timers/promises');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

const CAPACITY = 1000;
const FIELDS = ['name', 'email', 'age', 'course'];
const COLUMNS = ['id', ...FIELDS, 'createdAt', 'updatedAt'];
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validateStudent(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Provide a JSON object.' };
  }
  if (Object.keys(body).some((field) => !FIELDS.includes(field))) {
    return { error: 'Only name, email, age, and course are accepted.' };
  }
  const student = {};
  for (const field of ['name', 'email', 'course']) {
    const maximum = field === 'email' ? 254 : 100;
    if (typeof body[field] !== 'string' || !body[field].trim() || body[field].trim().length > maximum) {
      return { error: `${field} must contain 1 to ${maximum} characters.` };
    }
    student[field] = body[field].trim();
    if (/^[=+@-]/.test(student[field]) || /[\x00-\x1f\x7f]/.test(student[field])) {
      return { error: `${field} contains unsupported control characters or a spreadsheet formula prefix.` };
    }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) {
    return { error: 'email must be a valid email address.' };
  }
  if (!Number.isInteger(body.age) || body.age < 3 || body.age > 120) {
    return { error: 'age must be an integer from 3 to 120.' };
  }
  student.age = body.age;
  return { student };
}

async function createStore(filename) {
  const file = path.resolve(filename);
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
  const lock = `${file}.lock`;
  const descriptor = fs.openSync(lock, 'wx', 0o600);
  let rows = [];
  let closed = false;
  let pending = Promise.resolve();

  async function close() {
    if (closed) return;
    closed = true;
    await pending;
    fs.closeSync(descriptor);
    fs.unlinkSync(lock);
  }

  function mutate(operation) {
    if (closed) return Promise.reject(new Error('Store is closed.'));
    const result = pending.then(operation);
    pending = result.catch(() => {});
    return result;
  }

  async function commit(nextRows) {
    const temporary = `${file}.${randomUUID()}.tmp`;
    try {
      await fs.promises.writeFile(temporary, stringify(nextRows, { header: true, columns: COLUMNS }), { mode: 0o600 });
      for (let attempt = 0; ; attempt += 1) {
        try {
          await fs.promises.rename(temporary, file);
          break;
        } catch (error) {
          if (process.platform !== 'win32' || !['EPERM', 'EACCES', 'EBUSY'].includes(error.code) || attempt >= 5) throw error;
          await delay(20 * (attempt + 1));
        }
      }
      rows = nextRows;
    } finally {
      if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
    }
  }

  try {
    if (fs.existsSync(file)) {
      const contents = parse(fs.readFileSync(file, 'utf8'), { bom: true, skip_empty_lines: true });
      const headers = contents.shift();
      if (!headers || JSON.stringify(headers) !== JSON.stringify(COLUMNS)) {
        throw new Error('Invalid CSV header.');
      }
      const identifiers = new Set();
      rows = contents.map((values) => {
        const row = Object.fromEntries(COLUMNS.map((column, index) => [column, values[index]]));
        row.age = Number(row.age);
        const input = Object.fromEntries(FIELDS.map((field) => [field, row[field]]));
        if (!UUID_PATTERN.test(row.id) || identifiers.has(row.id) || validateStudent(input).error ||
            !Number.isFinite(Date.parse(row.createdAt)) || !Number.isFinite(Date.parse(row.updatedAt))) {
          throw new Error('Invalid CSV record.');
        }
        identifiers.add(row.id);
        return row;
      });
      rows.sort((first, second) => Date.parse(first.createdAt) - Date.parse(second.createdAt));
      if (rows.length > CAPACITY) await commit(rows.slice(-CAPACITY));
    } else {
      await commit([]);
    }
  } catch (error) {
    await close();
    throw error;
  }

  return {
    close,
    list() { return rows.toReversed().map((row) => ({ ...row })); },
    get(id) { const row = rows.find((student) => student.id === id); return row ? { ...row } : undefined; },
    create(student) {
      return mutate(async () => {
        const timestamp = new Date().toISOString();
        const row = { ...student, id: randomUUID(), createdAt: timestamp, updatedAt: timestamp };
        await commit([...rows, row].slice(-CAPACITY));
        return { ...row };
      });
    },
    update(id, student) {
      return mutate(async () => {
        const existing = rows.find((row) => row.id === id);
        if (!existing) return undefined;
        const updated = { ...existing, ...student, updatedAt: new Date().toISOString() };
        await commit(rows.map((row) => row.id === id ? updated : row));
        return { ...updated };
      });
    },
    delete(id) {
      return mutate(async () => {
        if (!rows.some((row) => row.id === id)) return false;
        await commit(rows.filter((row) => row.id !== id));
        return true;
      });
    }
  };
}

function createApp({ store, username, password }) {
  if (typeof username !== 'string' || !username.trim() || username.includes(':') ||
      typeof password !== 'string' || !password.trim()) {
    throw new Error('Administrator credentials must be supplied privately.');
  }
  const digest = (value) => createHash('sha256').update(value).digest();
  const expectedUser = digest(username);
  const expectedPassword = digest(password);
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet({ contentSecurityPolicy: {
    directives: {
      'script-src': ["'self'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:'],
      'upgrade-insecure-requests': null
    }
  } }));
  app.use((request, response, next) => {
    response.set('Cache-Control', 'no-store');
    next();
  });
  app.use('/api', rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    skipSuccessfulRequests: true,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Too many failed requests. Try again later.' }
  }));
  app.use('/api', (request, response, next) => {
    const authorization = request.get('authorization') || '';
    const match = /^Basic ([A-Za-z0-9+/]+={0,2})$/i.exec(authorization);
    const decoded = match ? Buffer.from(match[1], 'base64').toString('utf8') : '';
    const separator = decoded.indexOf(':');
    const userMatches = timingSafeEqual(digest(decoded.slice(0, separator)), expectedUser);
    const passwordMatches = timingSafeEqual(digest(decoded.slice(separator + 1)), expectedPassword);
    if (!match || separator < 0 || !userMatches || !passwordMatches) {
      response.set('WWW-Authenticate', 'Basic realm="Student API", charset="UTF-8"');
      return response.status(401).json({ error: 'Authentication required.' });
    }
    next();
  });
  app.use('/api', express.json({ limit: '16kb' }));

  app.get('/api/students', (request, response) => {
    const { page = '1', limit = '25' } = request.query;
    if (typeof page !== 'string' || typeof limit !== 'string' || !/^[1-9]\d*$/.test(page) ||
        !/^[1-9]\d*$/.test(limit) || !Number.isSafeInteger(Number(page)) || Number(limit) > 1000) {
      return response.status(400).json({ error: 'page must be a positive integer; limit must be 1 to 1000.' });
    }
    const students = store.list();
    const start = (Number(page) - 1) * Number(limit);
    response.json({ data: students.slice(start, start + Number(limit)), total: students.length,
      page: Number(page), limit: Number(limit), capacity: CAPACITY });
  });
  app.post('/api/students', async (request, response) => {
    const result = validateStudent(request.body);
    if (result.error) return response.status(400).json({ error: result.error });
    const student = await store.create(result.student);
    response.location(`/api/students/${student.id}`).status(201).json(student);
  });
  app.param('id', (request, response, next, id) => {
    if (!UUID_PATTERN.test(id)) return response.status(400).json({ error: 'id must be a valid student UUID.' });
    next();
  });
  app.get('/api/students/:id', (request, response) => {
    const student = store.get(request.params.id);
    if (!student) return response.status(404).json({ error: 'Student not found.' });
    response.json(student);
  });
  app.put('/api/students/:id', async (request, response) => {
    const result = validateStudent(request.body);
    if (result.error) return response.status(400).json({ error: result.error });
    const student = await store.update(request.params.id, result.student);
    if (!student) return response.status(404).json({ error: 'Student not found.' });
    response.json(student);
  });
  app.delete('/api/students/:id', async (request, response) => {
    if (!await store.delete(request.params.id)) return response.status(404).json({ error: 'Student not found.' });
    response.status(204).end();
  });
  app.use((error, request, response, next) => {
    if (response.headersSent) return next(error);
    const status = error.type === 'entity.too.large' ? 413 : error.type === 'entity.parse.failed' ? 400 : 500;
    const message = status === 413 ? 'Request body is too large.' : status === 400 ? 'Invalid JSON body.' : 'Unable to complete the request.';
    response.status(status).json({ error: message });
  });
  return app;
}

module.exports = { createApp, createStore };