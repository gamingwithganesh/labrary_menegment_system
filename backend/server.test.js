const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('./server');

test('login returns JWT for valid credentials', async () => {
  const app = createApp();
  const server = app.listen(0);
  const { port } = await new Promise((resolve) => server.once('listening', () => resolve(server.address())));

  const response = await fetch(`http://127.0.0.1:${port}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@libman.edu', password: 'admin123' })
  });

  const body = await response.json();
  assert.equal(response.status, 200);
  assert.ok(body.access_token);
  assert.equal(body.user.email, 'admin@libman.edu');

  server.close();
});
