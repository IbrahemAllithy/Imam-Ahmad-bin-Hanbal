import api from './api';

/** Production Render still caps list queries at 50. */
const SAFE_LIMIT = 50;

/**
 * Fetch all matching lectures with safe pagination.
 * Avoids sending `category` to the API (old servers whitelist short names only);
 * category filtering is done client-side.
 */
export const fetchAllLectures = async (params = {}, { signal } = {}) => {
  const { category, limit: _ignored, page: _ignoredPage, ...rest } = params;
  const query = { ...rest, limit: SAFE_LIMIT, page: 1 };

  const first = await api.get('/lectures', { params: query, signal });
  const payload = first.data;
  let rows = Array.isArray(payload?.data) ? [...payload.data] : [];
  const pages = Number(payload?.pagination?.pages) || 1;

  for (let page = 2; page <= pages; page += 1) {
    const res = await api.get('/lectures', {
      params: { ...query, page },
      signal,
    });
    if (Array.isArray(res.data?.data)) {
      rows = rows.concat(res.data.data);
    }
  }

  if (category && category !== 'الكل') {
    const needle = String(category).trim();
    rows = rows.filter((l) => {
      const cat = String(l.category || '').trim();
      return (
        cat === needle ||
        cat === needle.replace(/^ال/, '') ||
        `ال${cat}` === needle ||
        cat.includes(needle) ||
        needle.includes(cat)
      );
    });
  }

  return {
    success: true,
    data: rows,
    pagination: {
      page: 1,
      limit: rows.length,
      total: rows.length,
      pages: 1,
    },
  };
};
