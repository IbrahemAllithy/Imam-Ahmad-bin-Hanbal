const YOUTUBE_REGEX =
  /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/;

export const extractYoutubeId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(YOUTUBE_REGEX);
  return match?.[1] || null;
};

export const buildYoutubeEmbedUrl = (youtubeId) => {
  if (!youtubeId || !/^[\w-]{11}$/.test(youtubeId)) return null;
  return `https://www.youtube.com/embed/${youtubeId}`;
};

export const isValidYoutubeUrl = (url) => extractYoutubeId(url) !== null;
