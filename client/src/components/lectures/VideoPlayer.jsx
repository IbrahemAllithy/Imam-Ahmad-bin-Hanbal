import { getYoutubeEmbedUrl } from '../../utils/helpers';
import './VideoPlayer.css';

const VideoPlayer = ({ youtubeId, title }) => {
  const embedUrl = getYoutubeEmbedUrl(youtubeId);
  if (!embedUrl) return <p className="alert alert-error">رابط الفيديو غير صالح</p>;

  return (
    <div className="video-player">
      <iframe
        src={embedUrl}
        title={title || 'محاضرة'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
};

export default VideoPlayer;
