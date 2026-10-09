import { useEffect, useRef, useState } from 'react';

export const AudioClip = ({ src, title, text }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handlePause);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      document.querySelectorAll('audio').forEach((other) => {
        if (other !== audio) other.pause();
      });
      audio.play();
    } else {
      audio.pause();
    }
  };

  const handleProgressChange = (event) => {
    const next = parseFloat(event.target.value);
    audioRef.current.currentTime = next;
    setCurrentTime(next);
  };

  const formatTime = (time) => {
    if (!Number.isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="not-prose my-3 rounded-xl border border-gray-200 px-3 py-2 dark:border-white/10">
      {title || text ? (
        <div className="mb-2">
          {title ? <p className="m-0 text-sm font-medium">{title}</p> : null}
          {text ? (
            <p className="m-0 mt-1 font-mono text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              {text}
            </p>
          ) : null}
        </div>
      ) : null}
      <div className="flex items-center gap-3">
        <audio ref={audioRef} src={src} preload="metadata" />
        <button
          onClick={togglePlay}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary text-white transition-opacity hover:opacity-90"
          aria-label={isPlaying ? `Pause ${title || 'sample'}` : `Play ${title || 'sample'}`}
        >
          {isPlaying ? (
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="ml-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <span className="w-10 font-mono text-xs tabular-nums text-gray-500 dark:text-gray-400">
          {formatTime(currentTime)}
        </span>
        <div className="relative h-1.5 flex-1 rounded-full bg-gray-200 dark:bg-white/10">
          <div
            className="absolute top-0 left-0 h-full rounded-full bg-primary"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />
          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={currentTime}
            onChange={handleProgressChange}
            aria-label={`Seek ${title || 'sample'}`}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </div>
        <span className="w-10 text-right font-mono text-xs tabular-nums text-gray-500 dark:text-gray-400">
          {formatTime(duration)}
        </span>
      </div>
    </div>
  );
};
