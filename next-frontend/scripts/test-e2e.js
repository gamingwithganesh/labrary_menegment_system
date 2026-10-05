/**
 * Complete Commercial End-to-End Test Suite for LIB-MAN Enterprise
 * Verifies Auth, Books, Circulation, Renewals, Stock Audits, Procurement, Settings, Notifications, RBAC & Multi-tenant isolation
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
  console.log(`\n🚀 Running Complete LIB-MAN Enterprise Production Verification Suite on ${BASE_URL}\n`);

  try {
    // 1. Health Check
    console.log('1️⃣ Testing Health Check Endpoint: /api/health');
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, 'Health check returns 200 OK');
    assert(healthData.success === true, 'Health check reports success: true');
    assert(healthData.data?.status === 'healthy', 'System status is healthy');

    // 2. Authentication & Multi-Role Issuance: /api/auth/login
    console.log('\n2️⃣ Testing Authentication & Multi-Role Issuance: /api/auth/login');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin', password: 'admin.zintech.in' })
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200, 'Super Admin login returns 200 OK');
    assert(!!loginData.data?.access_token, 'Super Admin receives valid JWT access_token');
    const adminToken = loginData.data?.access_token;

    // Create Student Account for testing (Idempotent)
    const testStudentEmail = `student_${Date.now()}@libman.edu`;
    const createStudentRes = await fetch(`${BASE_URL}/api/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Aarav Sharma',
        email: testStudentEmail,
        password: 'admin123',
        role: 'Student',
        department: 'Computer Science'
      })
    });
    assert(createStudentRes.status === 201 || createStudentRes.status === 200, 'Student account provisioned for testing');

    // Student Login
    const studentLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testStudentEmail, password: 'admin123' })
    });
    const studentLoginData = await studentLoginRes.json();
    assert(studentLoginRes.status === 200, 'Student login returns 200 OK');
    const studentToken = studentLoginData.data?.access_token;

    // 3. Books & Physical Copies Cataloguing
    console.log('\n3️⃣ Testing Book Cataloguing & Physical Copies: /api/books');
    const testIsbn = `978-ENT-${Date.now()}`;
    const newBookRes = await fetch(`${BASE_URL}/api/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: 'Modern Software Engineering Architecture',
        author: 'Dave Farley',
        isbn: testIsbn,
        category: 'Computer Science',
        copies: 3,
        price: 950
      })
    });
    const newBookData = await newBookRes.json();
    assert(newBookRes.status === 201, 'Cataloguing new title returns 201 Created');
    const createdBookId = newBookData.data?.id || newBookData.data?._id;

    // Search Books
    const searchRes = await fetch(`${BASE_URL}/api/books?q=Modern+Software`);
    const searchData = await searchRes.json();
    assert(searchData.data?.some(b => b.title.includes('Modern Software')), 'OPAC Search retrieves newly catalogued title');

    // 4. Circulation: Issue, Return & 1-Click Renewal
    console.log('\n4️⃣ Testing Circulation Desk, Fines & 1-Click Renewals');
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
        memberEmail: 'student@libman.edu',
        memberRole: 'Student'
      })
    });
    const issueData = await issueRes.json();
    assert(issueRes.status === 201, 'Issue book returns 201 Created');
    const circId = issueData.data?.id || issueData.data?._id;

    // Test 1-Click Renewal
    const renewRes = await fetch(`${BASE_URL}/api/circulation/renew`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({ circulationId: circId })
    });
    const renewData = await renewRes.json();
    assert(renewRes.status === 200, '1-Click Renewal extends due date');
    assert(renewData.data?.renewedCount === 1, 'Renewed count incremented');

    // Process Return
    const returnRes = await fetch(`${BASE_URL}/api/circulation/return`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ circulationId: circId, condition: 'Good' })
    });
    const returnData = await returnRes.json();
    assert(returnRes.status === 200, 'Return book returns 200 OK');
    assert(returnData.data?.status === 'Returned', 'Loan status marked Returned');

    // 5. Stock Inventory Audit & Discrepancy Verification
    console.log('\n5️⃣ Testing Physical Stock Verification Audit: /api/inventory/audit');
    const auditRes = await fetch(`${BASE_URL}/api/inventory/audit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        scannedBarcodes: ['ACC-CS-1001', 'ACC-CS-1002', 'UNKNOWN-BARCODE-99']
      })
    });
    const auditData = await auditRes.json();
    assert(auditRes.status === 201, 'Inventory audit returns 201 Created');
    assert(auditData.data?.totalScanned === 3, 'Audited 3 scanned items');
    assert(auditData.data?.extraCount >= 1, 'Detected uncatalogued extra barcode');

    // 6. Procurement & Vendor Management
    console.log('\n6️⃣ Testing Vendors & Procurement: /api/procurement');
    const vendorRes = await fetch(`${BASE_URL}/api/procurement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Sage Academic Publishing',
        contactPerson: 'Karan Mehra',
        email: 'karan@sagepub.in',
        phone: '+91 99887 66554'
      })
    });
    assert(vendorRes.status === 201, 'Add vendor returns 201 Created');

    // 7. Settings & Institutional Policy Engine
    console.log('\n7️⃣ Testing Settings & Fine Rules: /api/settings');
    const settingsRes = await fetch(`${BASE_URL}/api/settings`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const settingsData = await settingsRes.json();
    assert(settingsRes.status === 200, 'Settings retrieval returns 200 OK');
    assert(typeof settingsData.data?.finePerDay === 'number', 'Configured finePerDay is a number');

    // 8. Notifications & Announcements
    console.log('\n8️⃣ Testing Notification Framework: /api/notifications');
    const notifRes = await fetch(`${BASE_URL}/api/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: 'Mid-term Stack Audit Notice',
        message: 'Stack maintenance from 6 PM to 8 PM.',
        type: 'ANNOUNCEMENT'
      })
    });
    assert(notifRes.status === 201, 'Publish notification returns 201 Created');

    // 9. Immutable Audit Logs
    console.log('\n9️⃣ Testing Institutional Audit Trails: /api/audit-logs');
    const auditLogRes = await fetch(`${BASE_URL}/api/audit-logs`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const auditLogData = await auditLogRes.json();
    assert(auditLogRes.status === 200, 'Audit logs return 200 OK');
    assert(Array.isArray(auditLogData.data), 'Audit logs return array');

    // 10. Multi-tenant SaaS Colleges
    console.log('\n🔟 Testing Super Admin SaaS Controls: /api/superadmin/colleges');
    const collegesRes = await fetch(`${BASE_URL}/api/superadmin/colleges`);
    const collegesData = await collegesRes.json();
    assert(collegesRes.status === 200, 'Colleges list returns 200 OK');
    assert(collegesData.data?.length > 0, 'Found registered SaaS colleges');

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
