function getApiBaseUrl() {
  if (typeof window !== 'undefined') {
    const envUrl = (process.env.NEXT_PUBLIC_API_URL || '').trim();
    if (!envUrl || envUrl === '/') return '/api';

    // When running on a custom domain (e.g. apn-lms.zintech04.com),
    // prioritize same-origin relative /api to prevent CORS blocks and improve response speed
    if (envUrl.startsWith('http')) {
      try {
        const parsed = new URL(envUrl);
        if (parsed.host === window.location.host || (parsed.host.includes('vercel.app') && !window.location.host.includes('vercel.app'))) {
          return '/api';
        }
      } catch {}
    }
    return envUrl.replace(/\/$/, '');
  }

  const envUrl = (process.env.NEXT_PUBLIC_API_URL || '').trim();
  if (!envUrl || envUrl === '/') {
    return '/api';
  }
  return envUrl.replace(/\/$/, '');
}

const API_BASE_URL = getApiBaseUrl();

async function request(endpoint, options = {}) {
  const token = typeof window !== 'undefined' ? (sessionStorage.getItem('libman_token') || localStorage.getItem('libman_token')) : null;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  let url;
  if (endpoint.startsWith('http')) {
    url = endpoint;
  } else {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    if (cleanEndpoint.startsWith('/api/')) {
      url = cleanEndpoint;
    } else {
      const base = API_BASE_URL || '/api';
      url = base.endsWith('/api') ? `${base}${cleanEndpoint}` : `${base}/api${cleanEndpoint}`;
    }
  }


  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    let data;
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    if (!res.ok) {
      const errorMsg = data?.message || data?.error?.message || data?.error || `Request failed with status ${res.status}`;
      const err = new Error(errorMsg);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    // Extract standardized { success, message, data } format
    if (data && typeof data === 'object' && 'data' in data) {
      return data.data;
    }

    return data;
  } catch (err) {
    // Only warn if not a standard handled API error
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`API [${endpoint}]:`, err.message);
    }
    throw err;
  }
}

export const api = {
  // ==========================================
  // AUTH
  // ==========================================
  async login(email, password) {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    return res;
  },

  async getMe() {
    return await request('/auth/me');
  },

  async logout() {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore logout network errors
    }
  },

  // ==========================================
  // BOOKS & CATALOG (Title vs Copy Model)
  // ==========================================
  async getBooks(query = '', category = '') {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (category && category !== 'All') params.append('category', category);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return await request(`/books${qs}`);
  },

  async getBookById(id) {
    return await request(`/books/${id}`);
  },

  async createBook(bookData) {
    return await request('/books', {
      method: 'POST',
      body: JSON.stringify(bookData)
    });
  },

  async updateBook(id, bookData) {
    return await request(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookData)
    });
  },

  async deleteBook(id) {
    return await request(`/books/${id}`, {
      method: 'DELETE'
    });
  },

  // ==========================================
  // CIRCULATION & LOANS
  // ==========================================
  async getCirculationRecords(filter = {}) {
    const params = new URLSearchParams();
    if (filter.memberId) params.append('memberId', filter.memberId);
    if (filter.status) params.append('status', filter.status);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return await request(`/circulation${qs}`);
  },

  async issueBook(issueData) {
    return await request('/circulation/issue', {
      method: 'POST',
      body: JSON.stringify(issueData)
    });
  },

  async returnBook(circulationId, extraData = {}) {
    return await request('/circulation/return', {
      method: 'POST',
      body: JSON.stringify({ circulationId, ...extraData })
    });
  },

  async renewBook(circulationId) {
    return await request('/circulation/renew', {
      method: 'POST',
      body: JSON.stringify({ circulationId })
    });
  },

  async deleteCirculationRecord(circulationId) {
    return await request(`/circulation?id=${circulationId}`, {
      method: 'DELETE'
    });
  },

  async clearCirculationRecords() {
    return await request('/circulation?clearAll=true', {
      method: 'DELETE'
    });
  },

  // ==========================================
  // RESERVATIONS / HOLDS & ISSUE REQUESTS
  // ==========================================
  async getReservations(filter = {}) {
    const params = new URLSearchParams();
    if (filter.memberEmail) params.append('memberEmail', filter.memberEmail);
    if (filter.bookId) params.append('bookId', filter.bookId);
    if (filter.status) params.append('status', filter.status);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return await request(`/reservations${qs}`);
  },

  async createReservation(resData) {
    return await request('/reservations', {
      method: 'POST',
      body: JSON.stringify(resData)
    });
  },

  async updateReservation(id, statusData) {
    return await request('/reservations', {
      method: 'PATCH',
      body: JSON.stringify({ id, ...statusData })
    });
  },

  async cancelReservation(id) {
    return await request(`/reservations?id=${id}`, {
      method: 'DELETE'
    });
  },

  // ==========================================
  // INVENTORY AUDIT & STOCK VERIFICATION
  // ==========================================
  async getInventoryAudits() {
    return await request('/inventory/audit');
  },

  async runInventoryAudit(scannedBarcodes) {
    return await request('/inventory/audit', {
      method: 'POST',
      body: JSON.stringify({ scannedBarcodes })
    });
  },

  // ==========================================
  // PROCUREMENT & VENDORS
  // ==========================================
  async getVendors() {
    return await request('/procurement');
  },

  async createVendor(vendorData) {
    return await request('/procurement', {
      method: 'POST',
      body: JSON.stringify(vendorData)
    });
  },

  async createPurchaseOrder(vendorId, items, invoiceNumber, totalAmount) {
    return await request('/procurement', {
      method: 'POST',
      body: JSON.stringify({ action: 'create_po', vendorId, items, invoiceNumber, totalAmount })
    });
  },

  // ==========================================
  // INSTITUTIONAL POLICIES & SETTINGS
  // ==========================================
  async getSettings() {
    return await request('/settings');
  },

  async updateSettings(settingsData) {
    return await request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData)
    });
  },

  // ==========================================
  // NOTIFICATIONS
  // ==========================================
  async getNotifications() {
    return await request('/notifications');
  },

  async sendNotification(notifData) {
    return await request('/notifications', {
      method: 'POST',
      body: JSON.stringify(notifData)
    });
  },

  // ==========================================
  // AUDIT LOGS
  // ==========================================
  async getAuditLogs() {
    return await request('/audit-logs');
  },

  // ==========================================
  // BULK IMPORT / EXPORT
  // ==========================================
  async bulkImport(type, records) {
    return await request('/import-export', {
      method: 'POST',
      body: JSON.stringify({ type, records })
    });
  },

  // ==========================================
  // SERIALS & JOURNALS
  // ==========================================
  async getSerials() {
    return await request('/serials');
  },

  async createSerial(serialData) {
    return await request('/serials', {
      method: 'POST',
      body: JSON.stringify(serialData)
    });
  },

  // ==========================================
  // USERS & CAMPUS ADMIN
  // ==========================================
  async getMembers() {
    return await request('/admin/users');
  },

  async createUser(userData) {
    return await request('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  async updateUser(id, updateData) {
    return await request(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData)
    });
  },

  async deleteUser(id) {
    return await request(`/admin/users/${id}`, {
      method: 'DELETE'
    });
  },

  // ==========================================
  // SUPER ADMIN & SAAS
  // ==========================================
  async getColleges() {
    return await request('/superadmin/colleges');
  },

  async createCollege(collegeData) {
    return await request('/superadmin/colleges', {
      method: 'POST',
      body: JSON.stringify(collegeData)
    });
  },

  async updateCollege(id, updateData) {
    return await request(`/superadmin/colleges/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  },

  async deleteCollege(id) {
    return await request(`/superadmin/colleges/${id}`, {
      method: 'DELETE'
    });
  },

  async getBroadcasts() {
    return await request('/superadmin/broadcast');
  },

  async sendBroadcast(broadcastData) {
    return await request('/superadmin/broadcast', {
      method: 'POST',
      body: JSON.stringify(broadcastData)
    });
  },

  // ==========================================
  // REPORTS & HEALTH
  // ==========================================
  async getDashboardMetrics() {
    return await request('/reports/dashboard-metrics');
  },

  async checkHealth() {
    return await request('/health');
  }
};
