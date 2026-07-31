// Production frontend is on cPanel at shabanalawda.com.
// Allow both http and https (and www) — browsers send Origin exactly as the
// address bar shows, and a mismatch blocks login with credentials.
const PRODUCTION_ORIGINS = [
  'https://shabanalawda.com',
  'http://shabanalawda.com',
  'https://www.shabanalawda.com',
  'http://www.shabanalawda.com',
];

const DEV_URL = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');

export const CLIENT_ORIGINS =
  process.env.NODE_ENV === 'production' ? PRODUCTION_ORIGINS : [DEV_URL];

/** Canonical site URL for emails and absolute links. */
const CLIENT_URL =
  process.env.NODE_ENV === 'production' ? 'https://shabanalawda.com' : DEV_URL;

export default CLIENT_URL;
