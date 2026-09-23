const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { once } = require('node:events');
const { spawnSync } = require('node:child_process');
const { parse } = require('csv-parse/sync');
const { createApp, createStore } = require('./app');
const { mountDocumentation } = require('./server');

const sample = { name: 'Taylor, "TJ" Morgan', email: 'taylor@example.test', age: 21, course: 'API Testing' };

async function fixture(context) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'student-api-'));
  const file = path.join(directory, 'students.csv');
  const store = await createStore(file);
  context.after(async () => {
    await store.close();
    fs.rmSync(directory, { recursive: true, force: true });
  });
  return { directory, file, store };
}

test('authenticated CRUD, validation, pagination, and private file boundaries', async (context) => {
  const { store } = await fixture(context);
  const username = randomUUID();
  const password = randomUUID();
  const application = createApp({ store, username, password });
  mountDocumentation(application);
  const server = application.listen(0, '127.0.0.1');
  await once(server, 'listening');
  context.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const authorization = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
  const request = (url, method = 'GET', body) => fetch(`${base}${url}`, {
    method, headers: { authorization, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  const specification = await (await fetch(`${base}/openapi.json`)).json();
  assert.equal(specification.openapi, '3.0.3');
  assert.equal(specification.components.securitySchemes.administratorAuth.scheme, 'basic');
  assert.equal(Object.keys(specification.paths).length, 2);
  for (const url of ['/docs/', '/docs/swagger-ui-init.js', '/openapi.json']) {
    const result = await fetch(`${base}${url}`);
    assert.equal(result.status, 200);
    const text = await result.text();
    assert.ok(!text.includes(username));
    assert.ok(!text.includes(password));
    if (url.endsWith('init.js')) assert.match(text, /"persistAuthorization": false/);
  }

  for (const [method, url] of [['GET', '/api/students'], ['POST', '/api/students'],
    ['GET', `/api/students/${randomUUID()}`], ['PUT', `/api/students/${randomUUID()}`],
    ['DELETE', `/api/students/${randomUUID()}`]]) {
    assert.equal((await fetch(`${base}${url}`, { method })).status, 401);
  }
  const wrongCredentials = await fetch(`${base}/api/students`, {
    headers: { authorization: `Basic ${Buffer.from(`${username}:incorrect`).toString('base64')}` }
  });
  assert.equal(wrongCredentials.status, 401);
  assert.equal(wrongCredentials.headers.get('cache-control'), 'no-store');
  assert.ok(!(await wrongCredentials.text()).includes(username));
  assert.equal((await request('/api/students', 'POST', {})).status, 400);
  assert.equal((await request('/api/students', 'POST', { ...sample, age: '21' })).status, 400);
  assert.equal((await request('/api/students', 'POST', { ...sample, id: randomUUID() })).status, 400);
  assert.equal((await request('/api/students', 'POST', { ...sample, name: '=HYPERLINK("test")' })).status, 400);
  assert.equal((await fetch(`${base}/api/students`, {
    method: 'POST', headers: { authorization, 'Content-Type': 'application/json' }, body: '{'
  })).status, 400);
  assert.equal((await fetch(`${base}/api/students`, {
    method: 'POST', headers: { authorization, 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'a'.repeat(20000) })
  })).status, 413);

  const created = await request('/api/students', 'POST', sample);
  assert.equal(created.status, 201);
  const student = await created.json();
  assert.equal(created.headers.get('location'), `/api/students/${student.id}`);
  assert.equal(student.name, sample.name);
  assert.deepEqual(await (await request(`/api/students/${student.id}`)).json(), student);
  const updatedResponse = await request(`/api/students/${student.id}`, 'PUT', { ...sample, course: 'Playwright' });
  assert.equal(updatedResponse.status, 200);
  const updated = await updatedResponse.json();
  assert.equal(updated.course, 'Playwright');
  assert.equal(updated.createdAt, student.createdAt);
  const listed = await (await request('/api/students?page=1&limit=1')).json();
  assert.equal(listed.total, 1);
  assert.equal(listed.data[0].id, student.id);
  assert.equal((await request('/api/students?page=0')).status, 400);
  assert.equal((await request('/api/students?limit=1001')).status, 400);
  assert.equal((await request('/api/students?limit=1&limit=2')).status, 400);
  assert.equal((await request('/api/students/invalid')).status, 400);
  assert.equal((await request(`/api/students/${student.id}`, 'DELETE')).status, 204);
  assert.equal((await request(`/api/students/${student.id}`)).status, 404);
  assert.equal((await request(`/api/students/${student.id}`, 'PUT', sample)).status, 404);
  assert.equal((await request(`/api/students/${student.id}`, 'DELETE')).status, 404);
  for (const url of ['/data/students.csv', '/student-api/data/students.csv', '/.env', '/server.js']) {
    assert.equal((await request(url)).status, 404);
  }
});

test('CSV quoting, restart persistence, and exclusive writer lock', async (context) => {
  const { file, store } = await fixture(context);
  const student = await store.create(sample);
  await assert.rejects(createStore(file), { code: 'EEXIST' });
  await store.close();
  const reopened = await createStore(file);
  try {
    assert.deepEqual(reopened.get(student.id), student);
    assert.equal(parse(fs.readFileSync(file), { columns: true })[0].name, sample.name);
    await reopened.delete(student.id);
    assert.equal(parse(fs.readFileSync(file), { columns: true }).length, 0);
  } finally {
    await reopened.close();
  }
});

test('CSV retains the latest 1000 creations; updates do not change retention order', async (context) => {
  const { file, store } = await fixture(context);
  const oldest = await store.create(sample);
  const second = await store.create(sample);
  await Promise.all(Array.from({ length: 998 }, (_, index) => store.create({ ...sample, name: `Student ${index}` })));
  await store.update(oldest.id, { ...sample, course: 'Recently updated' });
  const newest = await store.create(sample);
  assert.equal(store.list().length, 1000);
  assert.equal(store.list()[0].id, newest.id);
  assert.equal(store.get(oldest.id), undefined);
  assert.ok(store.get(second.id));
  const records = parse(fs.readFileSync(file), { columns: true });
  assert.equal(records.length, 1000);
  assert.equal(records[0].id, second.id);
  assert.equal(records.at(-1).id, newest.id);
});

test('failed writes preserve existing records and corrupt CSV is not overwritten', async (context) => {
  const { directory, file, store } = await fixture(context);
  const student = await store.create(sample);
  const original = fs.readFileSync(file, 'utf8');
  fs.renameSync(file, `${file}.backup`);
  fs.mkdirSync(file);
  await assert.rejects(store.update(student.id, { ...sample, course: 'Should not persist' }));
  assert.equal(store.get(student.id).course, sample.course);
  assert.equal(fs.readdirSync(directory).filter((entry) => entry.endsWith('.tmp')).length, 0);
  fs.rmdirSync(file);
  fs.renameSync(`${file}.backup`, file);
  assert.equal(fs.readFileSync(file, 'utf8'), original);
  await store.close();
  fs.writeFileSync(file, 'invalid,header\n');
  await assert.rejects(createStore(file), /Invalid CSV header/);
  assert.equal(fs.readFileSync(file, 'utf8'), 'invalid,header\n');
  assert.equal(fs.existsSync(`${file}.lock`), false);
});

test('missing credentials fail closed', () => {
  assert.throws(() => createApp({ store: {}, username: '', password: '' }), /supplied privately/);
  const result = spawnSync(process.execPath, [path.join(__dirname, 'server.js')], {
    env: { ...process.env, STUDENT_API_USER: '', STUDENT_API_PASSWORD: '' }, encoding: 'utf8'
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /could not start/);
  assert.equal(result.stdout, '');
});

test('repeated failed authentication is rate limited', async (context) => {
  const { store } = await fixture(context);
  const server = createApp({ store, username: randomUUID(), password: randomUUID() }).listen(0, '127.0.0.1');
  await once(server, 'listening');
  context.after(() => new Promise((resolve) => server.close(resolve)));
  const url = `http://127.0.0.1:${server.address().port}/api/students`;
  for (let attempt = 0; attempt < 20; attempt += 1) assert.equal((await fetch(url)).status, 401);
  const blocked = await fetch(url);
  assert.equal(blocked.status, 429);
  assert.ok(blocked.headers.get('retry-after'));
});