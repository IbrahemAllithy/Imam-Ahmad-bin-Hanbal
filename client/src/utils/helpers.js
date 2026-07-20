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

export const truncate = (text, length = 120) => {
  if (!text) return '';
  const plain = text.replace(/<[^>]+>/g, '');
  return plain.length > length ? `${plain.slice(0, length)}...` : plain;
};
