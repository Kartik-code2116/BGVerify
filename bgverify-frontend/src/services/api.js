import axios from 'axios';

export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined' && window.location.hostname && window.location.hostname !== 'localhost') {
    return `http://${window.location.hostname}:5000/api/v1`;
  }
  return 'http://localhost:5000/api/v1';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bgverify_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('bgverify_token');
      localStorage.removeItem('bgverify_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── Auth Service ────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
};

// ─── Verification Service ────────────────────────────────
export const verificationAPI = {
  create: (data) => api.post('/verifications', data),
  list: (params) => api.get('/verifications', { params }),
  getById: (id) => api.get(`/verifications/${id}`),
  update: (id, data) => api.patch(`/verifications/${id}`, data),
  getStats: () => api.get('/verifications/stats'),
  rerunBot: (id, data) => api.post(`/verifications/${id}/rerun`, data),
};

// ─── Candidate Service ───────────────────────────────────
export const candidateAPI = {
  create: (data) => api.post('/candidates', data),
  list: (params) => api.get('/candidates', { params }),
  getById: (id) => api.get(`/candidates/${id}`),
  getMyRecord: () => api.get('/candidates/me/record'),
  giveConsent: (id) => api.patch(`/candidates/${id}/consent`),
  uploadDocument: (id, data) => api.post(`/candidates/${id}/documents`, data),
  uploadSelfie: (id, data) => api.post(`/candidates/${id}/selfie`, data),
  parseResume: (data) => api.post('/candidates/parse-resume', data),
  updateHiringStage: (id, stage, notes) => api.patch(`/candidates/${id}/hiring-stage`, { stage, notes }),
  update: (id, data) => api.patch(`/candidates/${id}`, data),
  delete: (id) => api.delete(`/candidates/${id}`),
};

// ─── Sectors Management Service ──────────────────────────
export const sectorAPI = {
  list: () => api.get('/sectors'),
  create: (data) => api.post('/sectors', data),
  update: (id, data) => api.patch(`/sectors/${id}`, data),
  delete: (id) => api.delete(`/sectors/${id}`),
};

// ─── Hiring Roles & Sectors Service ──────────────────────
export const roleAPI = {
  list: (params) => api.get('/roles', { params }),
  getSummary: () => api.get('/roles/summary'),
  getById: (id) => api.get(`/roles/${id}`),
  create: (data) => api.post('/roles', data),
  update: (id, data) => api.patch(`/roles/${id}`, data),
  delete: (id) => api.delete(`/roles/${id}`),
};

// ─── Wallet Service ──────────────────────────────────────
export const walletAPI = {
  getBalance: (params) => api.get('/wallet', { params }),
  getTransactions: (params) => api.get('/wallet/transactions', { params }),
  purchase: (data) => api.post('/wallet/purchase', data),
  topUp: (data) => api.post('/wallet/topup', data),
};

// ─── Organization Service ────────────────────────────────
export const organizationAPI = {
  list: (params) => api.get('/organizations', { params }),
  getById: (id) => api.get(`/organizations/${id}`),
  getAdminStats: () => api.get('/organizations/admin/stats'),
};

// ─── Audit Service ───────────────────────────────────────
export const auditAPI = {
  list: (params) => api.get('/audit', { params }),
};

// ─── Payment Session Service (Real Phone QR Gateway) ─────
export const paymentAPI = {
  getNetworkInfo: () => api.get('/payments/network-info'),
  createSession: (data) => api.post('/payments/session', data),
  getSession: (id) => api.get(`/payments/session/${id}`),
  getSessionStatus: (id) => api.get(`/payments/session/${id}/status`),
  confirmSession: (id) => api.post(`/payments/session/${id}/confirm`),
  rejectSession: (id) => api.post(`/payments/session/${id}/reject`),
};
