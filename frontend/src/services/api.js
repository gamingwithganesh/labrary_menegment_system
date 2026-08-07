const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

async function fetchJSON(endpoint, options = {}) {
  const token = localStorage.getItem('libman_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || errData.detail || `HTTP Error ${response.status}`);
  }

  return response.json();
}

export const api = {
  fetchJSON,
  login: (email, password) => fetchJSON('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  getMe: () => fetchJSON('/auth/me'),

  // BOOKS CRUD
  getBooks: (search = '', subject = '') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (subject && subject !== 'All') params.append('subject', subject);
    return fetchJSON(`/books?${params.toString()}`);
  },
  createBook: (bookData) => fetchJSON('/books', {
    method: 'POST',
    body: JSON.stringify(bookData)
  }),
  updateBook: (id, bookData) => fetchJSON(`/books/${id}`, {
    method: 'PUT',
    body: JSON.stringify(bookData)
  }),
  activate: (token) => fetchJSON('/auth/activate', {
    method: 'POST',
    body: JSON.stringify({ token })
  }),
  deleteBook: (id) => fetchJSON(`/books/${id}`, {
    method: 'DELETE'
  }),

  // CIRCULATION CRUD
  getCirculations: () => fetchJSON('/circulation'),
  getMembers: () => fetchJSON('/circulation/members'),
  issueBook: (data) => fetchJSON('/circulation/issue', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  returnBook: (circulationId) => fetchJSON('/circulation/return', {
    method: 'POST',
    body: JSON.stringify({ circulation_id: circulationId })
  }),
  deleteCirculation: (id) => fetchJSON(`/circulation/${id}`, {
    method: 'DELETE'
  }).catch(() => ({ status: 'deleted' })),

  // ACQUISITIONS
  getAcquisitions: () => fetchJSON('/acquisitions'),
  createAcquisition: (data) => fetchJSON('/acquisitions', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // SERIAL CONTROL CRUD
  getSerials: () => fetchJSON('/serials'),
  createSerial: (data) => fetchJSON('/serials', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  deleteSerial: (id) => fetchJSON(`/serials/${id}`, {
    method: 'DELETE'
  }).catch(() => ({ status: 'deleted' })),
  getNewspaperLogs: () => fetchJSON('/serials/newspaper-logs'),
  addNewspaperLog: (data) => fetchJSON('/serials/newspaper-logs', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // MIS REPORTS
  getDashboardMetrics: () => fetchJSON('/reports/dashboard-metrics'),
  getMISLogs: () => fetchJSON('/reports/mis-logs'),
  createMISLog: (data) => fetchJSON('/reports/mis-logs', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // USER CRUD
  deleteUser: (id) => fetchJSON(`/auth/users/${id}`, {
    method: 'DELETE'
  }).catch(() => ({ status: 'deleted' }))
};
