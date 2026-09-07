import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? ''
    : 'https://plantcure-ai.vercel.app'
);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to get token with backward compatibility
const getAccessToken = () => localStorage.getItem('plantcure_access_token') || localStorage.getItem('leafcure_access_token');
const getRefreshToken = () => localStorage.getItem('plantcure_refresh_token') || localStorage.getItem('leafcure_refresh_token');

const clearStoredAuth = () => {
  localStorage.removeItem('plantcure_access_token');
  localStorage.removeItem('plantcure_refresh_token');
  localStorage.removeItem('plantcure_user');
  localStorage.removeItem('leafcure_access_token');
  localStorage.removeItem('leafcure_refresh_token');
  localStorage.removeItem('leafcure_user');
};

// Request interceptor: Attach JWT Bearer token and optional Gemini Vision API Key
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const geminiKey = localStorage.getItem('plantcure_gemini_api_key');
    if (geminiKey && geminiKey.trim()) {
      config.headers['X-Gemini-API-Key'] = geminiKey.trim();
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Automatic Token Refresh on 401 Unauthorized
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do not attempt refresh on auth login/register endpoints
    const isAuthEndpoint = originalRequest.url?.includes('/api/auth/login') ||
                           originalRequest.url?.includes('/api/auth/register') ||
                           originalRequest.url?.includes('/api/auth/refresh');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        isRefreshing = false;
        clearStoredAuth();
        window.dispatchEvent(new CustomEvent('plantcure:auth_expired'));
        window.dispatchEvent(new CustomEvent('leafcure:auth_expired'));
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;
        localStorage.setItem('plantcure_access_token', newAccessToken);
        if (response.data.refresh) {
          localStorage.setItem('plantcure_refresh_token', response.data.refresh);
        }

        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        clearStoredAuth();
        window.dispatchEvent(new CustomEvent('plantcure:auth_expired'));
        window.dispatchEvent(new CustomEvent('leafcure:auth_expired'));
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
