const path = require('node:path');
const { once } = require('node:events');
const swaggerUi = require('swagger-ui-express');
const { createApp, createStore } = require('./app');
const specification = require('./openapi');

function mountDocumentation(app) {
  app.get('/', (request, response) => response.redirect('/docs/'));
  app.get('/openapi.json', (request, response) => response.json(specification));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(specification, {
    customSiteTitle: 'Student Records API',
    customCss: '.swagger-ui .topbar { display: none; }',
    swaggerOptions: {
      validatorUrl: null,
      persistAuthorization: false,
      displayRequestDuration: true,
      defaultModelsExpandDepth: -1,
      supportedSubmitMethods: ['get', 'post', 'put', 'delete'],
      queryConfigEnabled: false
    }
  }));
  app.use((request, response) => response.status(404).json({ error: 'Route not found.' }));
}

async function main() {
  const username = process.env.STUDENT_API_USER;
  const password = process.env.STUDENT_API_PASSWORD;
  delete process.env.STUDENT_API_USER;
  delete process.env.STUDENT_API_PASSWORD;
  const port = Number(process.env.STUDENT_API_PORT || 3100);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid port configuration.');
  if (!username?.trim() || username.includes(':') || !password?.trim()) {
    throw new Error('Missing private credential configuration.');
  }
  const store = await createStore(process.env.STUDENT_API_DATA_FILE || path.join(__dirname, 'data', 'students.csv'));
  let server;
  try {
    const application = createApp({ store, username, password });
    mountDocumentation(application);
    server = application.listen(port, '127.0.0.1');
    await once(server, 'listening');
  } catch (error) {
    await store.close();
    throw error;
  }
  console.log(`Student API and Swagger: http://127.0.0.1:${port}/docs/`);
  let stopping = false;
  const stop = () => {
    if (stopping) return;
    stopping = true;
    server.close(async () => {
      try { await store.close(); } catch { process.exitCode = 1; }
    });
    server.closeIdleConnections();
  };
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
}

if (require.main === module) {
  main().catch((error) => {
    const reason = error.code === 'EADDRINUSE' ? 'Port is in use; choose another STUDENT_API_PORT.' :
      error.code === 'EEXIST' ? 'CSV is locked. Stop the other writer before restarting.' :
      'Check private credential configuration, port, and CSV permissions/format.';
    console.error(`Student API could not start. ${reason}`);
    process.exitCode = 1;
  });
}

module.exports = { mountDocumentation };