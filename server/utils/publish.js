/** Public visibility filter with small clock-skew grace (ms). */
export const PUBLISH_GRACE_MS = 2 * 60 * 1000;

export const publishedFilter = (now = new Date()) => {
  const grace = new Date(now.getTime() + PUBLISH_GRACE_MS);
  return {
    $or: [
      { publishedAt: { $exists: false } },
      { publishedAt: null },
      { publishedAt: { $lte: grace } },
    ],
  };
};

/** Empty / invalid → now. Otherwise keep the given date (supports scheduling). */
export const normalizePublishedAt = (value) => {
  if (value === '' || value === undefined || value === null) {
    return new Date();
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return new Date();
  }
  return date;
};
