import { useEffect, useRef, useState } from 'react';
import { FiVolume2 } from 'react-icons/fi';
import './AudioPlayer.css';

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];
const STORAGE_KEY = 'lectureAudioRate';

// The listener picks a speed once and expects it to hold for the rest of the series, so the
// choice is remembered across lessons instead of resetting to 1× on every navigation.
const readStoredRate = () => {
  const stored = Number(localStorage.getItem(STORAGE_KEY));
  return SPEEDS.includes(stored) ? stored : 1;
};

const AudioPlayer = ({ src, title = 'صوتي (الاستماع للدرس)' }) => {
  const audioRef = useRef(null);
  const [rate, setRate] = useState(readStoredRate);

  // playbackRate lives on the DOM node, not in markup — it has to be reapplied whenever the
  // element is (re)mounted with a new src, otherwise the next lesson starts back at 1×.
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }, [rate, src]);

  const changeRate = (value) => {
    setRate(value);
    localStorage.setItem(STORAGE_KEY, String(value));
  };

  if (!src) return null;

  return (
    <div className="sketch-audio-box">
      <div className="sketch-audio-header">
        <FiVolume2 />
        <span>{title}</span>
      </div>

      <audio ref={audioRef} controls preload="metadata" className="sketch-audio-player" src={src}>
        متصفحك لا يدعم مشغل الصوت.
      </audio>

      <div className="sketch-audio-speed" role="group" aria-label="سرعة التشغيل">
        <span className="sketch-audio-speed-label">السرعة</span>
        {SPEEDS.map((value) => (
          <button
            key={value}
            type="button"
            className={`sketch-audio-speed-btn ${value === rate ? 'active' : ''}`}
            aria-pressed={value === rate}
            onClick={() => changeRate(value)}
          >
            {value}×
          </button>
        ))}
      </div>
    </div>
  );
};

export default AudioPlayer;
