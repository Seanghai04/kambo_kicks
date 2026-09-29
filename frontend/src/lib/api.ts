import axios from 'axios';

function resolveBaseURL() {
  const configured = process.env.NEXT_PUBLIC_API_URL;

  // Explicit relative path (same-origin proxy)
  if (configured?.startsWith('/')) {
    return configured;
  }

  // Browser on Vercel → rewrite via next.config.mjs (no CORS)
  if (
    typeof window !== 'undefined' &&
    window.location.hostname.endsWith('.vercel.app')
  ) {
    return '/api-backend';
  }

  return configured || 'http://localhost:5000/api';
}

const api = axios.create({
  baseURL: resolveBaseURL(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  // Re-resolve in the browser in case the module initialized during SSR.
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('.vercel.app')) {
    config.baseURL = '/api-backend';
  }

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
