import { useState, useRef, useEffect } from 'react';

export const AudioTranscript = ({ voices = [] }) => {
  const [selectedVoice, setSelectedVoice] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const audioRef = useRef(null);
  const dropdownRef = useRef(null);

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

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

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
    <div className="border rounded-lg bg-card border-gray-200 dark:border-gray-800">
      {/* Header with voice selector */}
      <div className="grid grid-cols-3 items-center px-3 py-1.5 bg-muted border-b border-gray-200 dark:border-gray-800">
        <span className="text-xs font-medium">Listen to Page</span>

        <span className="text-xs font-semibold text-muted-foreground text-center">Powered by Fish Audio S1</span>

        {voices.length > 1 ? (
          <div className="relative justify-self-end" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer text-xs"
            >
              <span className="text-muted-foreground">Voice:</span>
              <span className="font-medium">{voices[selectedVoice]?.name}</span>
              <svg
                className={`w-3 h-3 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden z-50">
                {voices.map((voice, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedVoice(index);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                      index === selectedVoice ? 'bg-gray-100 dark:bg-gray-800 font-medium' : ''
                    }`}
                  >
                    {voice.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="justify-self-end" />
        )}
      </div>

      {/* Audio Player */}
      <div className="px-3 py-1.5 bg-card">
        <audio ref={audioRef} src={currentVoice?.url} preload="metadata" />

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
