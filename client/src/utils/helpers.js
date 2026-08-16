export const CATEGORIES = ['الكل', 'عقيدة', 'فقه', 'تفسير', 'حديث', 'سيرة', 'آداب', 'عام'];

export const extractYoutubeId = (url) => {
  if (!url) return null;
  const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/;
  return url.match(regex)?.[1] || null;
};

export const getYoutubeThumbnail = (youtubeId) =>
  youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : '';

export const getYoutubeEmbedUrl = (youtubeId) => {
  if (!youtubeId || !/^[\w-]{11}$/.test(youtubeId)) return null;
  return `https://www.youtube.com/embed/${youtubeId}`;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Turns whatever an archive.org page hands you into a URL the <audio> tag can actually play.
 *
 * archive.org exposes three shapes of the same item: /details/ (the HTML page), /embed/ (an
 * HTML player meant for an iframe) and /download/ (the file itself). Copying from the address
 * bar gives you one of the first two, which an <audio src> can never play. Those pages also
 * write spaces in the filename as "+", and a "+" inside a URL *path* is a literal plus — so
 * the download server 404s on it. Both mistakes are fixed here.
 *
 * Anything that isn't an archive.org URL is returned untouched.
 */
export const normalizeAudioUrl = (url) => {
  const trimmed = String(url || '').trim();
  if (!/^https?:\/\/(www\.)?archive\.org\/(details|embed)\//i.test(trimmed)) return trimmed;

  return trimmed
    .replace(/\/(details|embed)\//i, '/download/')
    .replace(/\+/g, '%20');
};

export const truncate = (text, length = 120) => {
  if (!text) return '';
  const plain = text.replace(/<[^>]+>/g, '');
  return plain.length > length ? `${plain.slice(0, length)}...` : plain;
};
