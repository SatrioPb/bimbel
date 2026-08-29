import axios from 'axios';
import appCache from '../utils/cache';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor to inject Sanctum Bearer Token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor to handle responses & auto-invalidate cache on data mutation
apiClient.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toUpperCase();
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      // Invalidate frontend cache on mutation so next page loads fresh data
      appCache.flush();
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        appCache.flush();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Helper method to fetch with GET caching
apiClient.getWithCache = async (url, config = {}, ttlSeconds = 300) => {
  const cacheKey = url + JSON.stringify(config.params || {});
  const cachedData = appCache.get(cacheKey);

  if (cachedData) {
    return { data: cachedData, fromCache: true };
  }

  const response = await apiClient.get(url, config);
  if (response.data?.success) {
    appCache.set(cacheKey, response.data, ttlSeconds);
  }
  return response;
};

export default apiClient;
