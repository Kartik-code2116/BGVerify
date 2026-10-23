import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
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
