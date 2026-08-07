const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('./src/app');
const { disconnectDatabase } = require('./src/config/db');

const closeServer = (server) => new Promise((resolve, reject) => {
  server.close((error) => {
    if (error) {
      reject(error);
      return;
    }
    resolve();
  });
});

test('login returns JWT for valid credentials', async () => {
  const app = await createApp();
  const server = app.listen(0);
  const { port } = await new Promise((resolve) => server.once('listening', () => resolve(server.address())));

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@libman.edu', password: 'admin123' })
    });

    const body = await response.json();
    assert.equal(response.status, 200);
    assert.ok(body.access_token);
    assert.equal(body.user.email, 'admin@libman.edu');
  } finally {
    await closeServer(server);
    await disconnectDatabase();
  }
});

test('dashboard metrics returns the MIS payload expected by the frontend', async () => {
  const app = await createApp();
  const server = app.listen(0);
  const { port } = await new Promise((resolve) => server.once('listening', () => resolve(server.address())));

  try {
    const loginResponse = await fetch(`http://127.0.0.1:${port}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@libman.edu', password: 'admin123' })
    });
    const loginBody = await loginResponse.json();

    const response = await fetch(`http://127.0.0.1:${port}/api/v1/reports/dashboard-metrics`, {
      headers: { Authorization: `Bearer ${loginBody.access_token}` }
    });

    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(typeof body.utilization_rate_pct, 'number');
    assert.ok(Array.isArray(body.monthly_circulation_stats));
    assert.ok(Array.isArray(body.department_utilization));
  } finally {
    await closeServer(server);
    await disconnectDatabase();
  }
});
