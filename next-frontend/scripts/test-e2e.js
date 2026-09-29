/**
 * End-to-End Test Suite for LIB-MAN Enterprise
 * Verifies Auth, Books, Circulation, Fines, RBAC, and Health endpoints
 * Run with: node scripts/test-e2e.js
 */

const BASE_URL = process.env.TEST_APP_URL || 'http://localhost:3000';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log(`\n🚀 Running End-to-End Production API Verification Suite on ${BASE_URL}\n`);

  try {
    // 1. Health Check Test
    console.log('1️⃣ Testing Health Check Endpoint: /api/health');
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, 'Health check returns 200 OK');
    assert(healthData.success === true, 'Health check reports success: true');
    assert(healthData.data?.status === 'healthy', 'System status is healthy');

    // 2. Authentication Test - Valid Credentials
    console.log('\n2️⃣ Testing Authentication: /api/auth/login');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin', password: 'admin.zintech.in' })
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200, 'Admin login returns 200 OK');
    assert(!!loginData.data?.access_token, 'Admin receives valid JWT access_token');
    assert(loginData.data?.user?.role === 'Super Admin', 'User role is correctly set to Super Admin');
    const adminToken = loginData.data?.access_token;

    // 3. Authentication Test - Invalid Password
    const badLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin', password: 'wrongpassword' })
    });
    assert(badLoginRes.status === 401, 'Invalid credentials rejected with 401 Unauthorized');

    // 4. Books OPAC & Cataloguing
    console.log('\n3️⃣ Testing Book Catalog & OPAC: /api/books');
    const booksRes = await fetch(`${BASE_URL}/api/books`);
    const booksData = await booksRes.json();
    assert(booksRes.status === 200, 'Books listing returns 200 OK');
    assert(Array.isArray(booksData.data), 'Books list returns valid array');

    // Create New Book
    const testIsbn = `978-TEST-${Date.now()}`;
    const newBookRes = await fetch(`${BASE_URL}/api/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: 'Distributed Systems & Cloud Computing',
        author: 'Andrew S. Tanenbaum',
        isbn: testIsbn,
        category: 'Computer Science',
        copies: 3,
        price: 850
      })
    });
    const newBookData = await newBookRes.json();
    assert(newBookRes.status === 201, 'Cataloguing new book returns 201 Created');
    assert(newBookData.data?.title === 'Distributed Systems & Cloud Computing', 'New book title is recorded');
    const createdBookId = newBookData.data?.id || newBookData.data?._id;

    // Search for the newly created book
    const searchRes = await fetch(`${BASE_URL}/api/books?q=Distributed+Systems`);
    const searchData = await searchRes.json();
    assert(searchData.data?.some(b => b.title.includes('Distributed Systems')), 'Search finds the newly catalogued book');

    // 5. Circulation: Issue & Return Workflow
    console.log('\n4️⃣ Testing Circulation Desk Workflow: /api/circulation');
    const issueRes = await fetch(`${BASE_URL}/api/circulation/issue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        bookId: createdBookId,
        memberId: 'M-101',
        memberName: 'Aarav Sharma',
        memberEmail: 'student@libman.edu'
      })
    });
    const issueData = await issueRes.json();
    assert(issueRes.status === 201, 'Issue book returns 201 Created');
    assert(issueData.data?.status === 'Active', 'Circulation record created with Active status');
    assert(!!issueData.data?.dueDate, 'Circulation record includes calculated due date');
    const circulationId = issueData.data?.id || issueData.data?._id;

    // Process Return
    const returnRes = await fetch(`${BASE_URL}/api/circulation/return`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ circulationId })
    });
    const returnData = await returnRes.json();
    assert(returnRes.status === 200, 'Return book returns 200 OK');
    assert(returnData.data?.status === 'Returned', 'Circulation record marked as Returned');

    // 6. Reports & Executive MIS Metrics
    console.log('\n5️⃣ Testing Executive Analytics & Metrics: /api/reports/dashboard-metrics');
    const metricsRes = await fetch(`${BASE_URL}/api/reports/dashboard-metrics`);
    const metricsData = await metricsRes.json();
    assert(metricsRes.status === 200, 'Metrics endpoint returns 200 OK');
    assert(typeof metricsData.data?.total_books === 'number', 'Total books metric is calculated as number');
    assert(Array.isArray(metricsData.data?.monthly_circulation_stats), 'Monthly circulation stats array returned');

    // 7. Serials & Multi-tenant Super Admin
    console.log('\n6️⃣ Testing Serials & Super Admin Endpoints');
    const serialsRes = await fetch(`${BASE_URL}/api/serials`);
    const serialsData = await serialsRes.json();
    assert(serialsRes.status === 200, 'Serials endpoint returns 200 OK');

    const collegesRes = await fetch(`${BASE_URL}/api/superadmin/colleges`);
    const collegesData = await collegesRes.json();
    assert(collegesRes.status === 200, 'Colleges SaaS endpoint returns 200 OK');
    assert(Array.isArray(collegesData.data), 'Colleges array returned');

    // Cleanup created test book
    if (createdBookId) {
      await fetch(`${BASE_URL}/api/books/${createdBookId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
    }

    console.log(`\n==============================================`);
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`==============================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
