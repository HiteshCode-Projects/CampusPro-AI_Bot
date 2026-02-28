import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' }
});

// Global error interceptor
api.interceptors.response.use(
  res => res,
  err => {
    const message = err.response?.data?.error || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default api;
