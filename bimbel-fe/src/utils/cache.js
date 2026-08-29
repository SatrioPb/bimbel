// Client-side SessionStorage Cache Manager for Bimbel Frontend

const CACHE_PREFIX = 'bimbel_cache_';
const DEFAULT_TTL_SECONDS = 300; // 5 minutes default

export const appCache = {
  get: (key) => {
    try {
      const raw = sessionStorage.getItem(CACHE_PREFIX + key);
      if (!raw) return null;

      const item = JSON.parse(raw);
      if (Date.now() > item.expiry) {
        sessionStorage.removeItem(CACHE_PREFIX + key);
        return null;
      }
      return item.data;
    } catch (err) {
      console.warn('Cache get error:', err);
      return null;
    }
  },

  set: (key, data, ttlSeconds = DEFAULT_TTL_SECONDS) => {
    try {
      const item = {
        data,
        expiry: Date.now() + ttlSeconds * 1000,
      };
      sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
    } catch (err) {
      console.warn('Cache set error:', err);
    }
  },

  remove: (key) => {
    try {
      sessionStorage.removeItem(CACHE_PREFIX + key);
    } catch (err) {
      console.warn('Cache remove error:', err);
    }
  },

  clearPattern: (pattern = '') => {
    try {
      const keysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k && k.startsWith(CACHE_PREFIX) && k.includes(pattern)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => sessionStorage.removeItem(k));
    } catch (err) {
      console.warn('Cache clear error:', err);
    }
  },

  flush: () => {
    try {
      const keysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k && k.startsWith(CACHE_PREFIX)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => sessionStorage.removeItem(k));
    } catch (err) {
      console.warn('Cache flush error:', err);
    }
  },
};

export default appCache;
