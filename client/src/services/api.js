import axios from 'axios';


const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');
const BASE_URL = API_URL.replace(/\/api$/, '');

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

/** Milliseconds until the access token expires; 0 when it is missing or unreadable. */
const msUntilExpiry = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1])).exp * 1000 - Date.now();
  } catch {
    return 0;
  }
};

const isAuthEndpoint = (url = '') => url.includes('/auth/refresh') || url.includes('/auth/login');

// One in-flight refresh at a time — parallel requests all wait on the same promise instead of
// racing to rotate the refresh token, which would invalidate each other.
let refreshPromise = null;

export const refreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API_URL}/auth/refresh`, {}, { withCredentials: true })
      .then(({ data }) => {
        sessionStorage.setItem('accessToken', data.accessToken);
        return data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

const endSession = (reason) => {
  sessionStorage.removeItem('accessToken');
  // ProtectedRoute unmounts the page the moment the user goes null, so the caller's own catch
  // block never gets to render anything — the reason has to survive to the login screen.
  sessionStorage.setItem('authLogoutReason', reason);
  window.dispatchEvent(new CustomEvent('auth:logout'));
};

api.interceptors.request.use(async (config) => {
  let token = sessionStorage.getItem('accessToken');

  // The access token lives 15 minutes. Filling in a testimonial and picking a video can
  // easily outlast that, and a multipart upload that dies on 401 halfway through is the
  // worst time to find out. Renew up front rather than after the bytes are already sent.
  if (token && !isAuthEndpoint(config.url) && msUntilExpiry(token) < 60_000) {
    try {
      token = await refreshAccessToken();
    } catch {
      // Leave the stale token in place: the response interceptor handles the 401 and reports
      // it properly, which beats throwing an opaque error out of the request pipeline.
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/login')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const accessToken = await refreshAccessToken();
        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // The account allows a single active session: signing in anywhere else rotates the
        // stored refresh hash and invalidates this one. Say so, because "انتهت الجلسة" alone
        // makes no sense to someone who logged in a minute ago on another device.
        endSession(
          'انتهت جلستك — قد يكون سبب ذلك تسجيل الدخول بنفس الحساب في مكان آخر. سجّل الدخول من جديد.'
        );
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const getStorageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${BASE_URL}${path}`;
};

// Archive.org exposes a cover thumbnail for every item at a predictable URL
// derived from its identifier (the segment right after "/details/").
export const getArchiveCoverUrl = (pdfUrl) => {
  const match = (pdfUrl || '').match(/archive\.org\/details\/([^/]+)/);
  return match ? `https://archive.org/services/img/${match[1]}` : '';
};

export const getBookCoverUrl = (book) =>
  book?.coverImage ? getStorageUrl(book.coverImage) : getArchiveCoverUrl(book?.pdfUrl);

export default api;
