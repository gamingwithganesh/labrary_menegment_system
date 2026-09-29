const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

async function request(endpoint, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('libman_token') : null;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }

    // Extract standardized { success, message, data } format
    if (data && typeof data === 'object' && 'data' in data) {
      return data.data;
    }

    return data;
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err.message);
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
  // BOOKS & CATALOG
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

  async returnBook(circulationId) {
    return await request('/circulation/return', {
      method: 'POST',
      body: JSON.stringify({ circulationId })
    });
  },

  // ==========================================
  // RESERVATIONS
  // ==========================================
  async createReservation(resData) {
    return await request('/reservations', {
      method: 'POST',
      body: JSON.stringify(resData)
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
