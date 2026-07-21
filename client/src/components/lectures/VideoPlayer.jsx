import { getYoutubeEmbedUrl, extractYoutubeId } from '../../utils/helpers';
import './VideoPlayer.css';

const VideoPlayer = ({ youtubeId, youtubeUrl, title }) => {
  const id = youtubeId || extractYoutubeId(youtubeUrl);
  const embedUrl = getYoutubeEmbedUrl(id);
  
  if (!embedUrl) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: '#ffffff', background: '#1c1917' }}>
        <p style={{ margin: 0, fontSize: '1.1rem' }}>لم يضف رابط اليوتيوب لهذا الدرس بعد</p>
      </div>
    );
  }

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
