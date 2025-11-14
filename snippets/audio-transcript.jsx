import { useState, useRef, useEffect } from 'react';

export const AudioTranscript = ({ voices = [] }) => {
  const [selectedVoice, setSelectedVoice] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Reset audio when voice changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [selectedVoice]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressChange = (e) => {
    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const currentVoice = voices[selectedVoice];

  return (
    <div className="border rounded-lg overflow-hidden bg-card border-gray-200 dark:border-gray-800">
      {/* Header with voice selector */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted border-b border-gray-200 dark:border-gray-800">
        <span className="text-xs font-medium">Listen to Page</span>

        <span className="text-xs font-semibold text-muted-foreground">Powered by Fish Audio S1</span>

        {voices.length > 1 ? (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Voice:</span>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(Number(e.target.value))}
              className="text-xs px-1.5 py-0.5 rounded border bg-background border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {voices.map((voice, index) => (
                <option key={index} value={index}>
                  {voice.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="w-[80px]" />
        )}
      </div>

      {/* Audio Player */}
      <div className="px-3 py-1.5 bg-card">
        <audio ref={audioRef} src={currentVoice?.src} preload="metadata" />

        <div className="flex items-center gap-2">
          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-full hover:opacity-80 transition-opacity relative overflow-hidden"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            <div
              className="transition-transform duration-300 ease-in-out"
              style={{
                transform: isPlaying ? 'rotate(180deg)' : 'rotate(0deg)'
              }}
            >
              {isPlaying ? (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </div>
          </button>

          {/* Progress Bar and Time */}
          <div className="flex-1 flex items-center gap-2">
            <span className="text-xs font-mono text-gray-500 dark:text-gray-400 min-w-[35px]">
              {formatTime(currentTime)}
            </span>

            <div className="flex-1 relative h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gray-400 dark:bg-gray-500 transition-all duration-100"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleProgressChange}
                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <span className="text-xs font-mono text-gray-500 dark:text-gray-400 min-w-[35px]">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
