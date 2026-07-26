export const COMPLETED_LECTURE_PREFIX = 'completed_lecture_';

export const readLocalCompletedIds = () => {
  const ids = new Set();
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(COMPLETED_LECTURE_PREFIX) && localStorage.getItem(key) === 'true') {
        ids.add(key.replace(COMPLETED_LECTURE_PREFIX, ''));
      }
    }
  } catch {
    // ignore
  }
  return ids;
};

export const clearLocalCompletedKeys = () => {
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(COMPLETED_LECTURE_PREFIX)) keys.push(key);
    }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore
  }
};
