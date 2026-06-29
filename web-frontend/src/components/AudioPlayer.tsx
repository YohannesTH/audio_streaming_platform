"use client";

import { useAudioPlayer } from "@/context/AudioPlayerContext";
import { formatTime } from "@/lib/format";
import { IconPause, IconPlay, IconSpinner, IconVolume } from "./Icons";

export default function AudioPlayer() {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    error,
    progress,
    duration,
    volume,
    togglePlayPause,
    seek,
    setVolume,
    clearError,
  } = useAudioPlayer();

  if (!currentTrack) return null;

  const thumbnail =
    currentTrack.thumbnail || `https://i.ytimg.com/vi/${currentTrack.id}/hqdefault.jpg`;
  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0;
  const progressPercent = safeDuration ? (progress / safeDuration) * 100 : 0;

  return (
    <>
      {error && (
        <div className="player-toast" role="alert">
          <span>{error}</span>
          <button type="button" onClick={clearError} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}

      <div className="audio-player-container">
        <div className="track-info">
          <img src={thumbnail} alt="" className="thumbnail" />
          <div className="details">
            <div className="title">{currentTrack.title}</div>
            <div className="channel">{currentTrack.channel}</div>
          </div>
        </div>

        <div className="player-center">
          <div className="controls">
            <button
              type="button"
              onClick={togglePlayPause}
              className="play-btn"
              aria-label={isPlaying ? "Pause" : "Play"}
              disabled={isLoading && !isPlaying}
            >
              {isLoading && !isPlaying ? (
                <IconSpinner className="play-btn-icon" />
              ) : isPlaying ? (
                <IconPause className="play-btn-icon" />
              ) : (
                <IconPlay className="play-btn-icon" />
              )}
            </button>
          </div>

          <div className="progress-row">
            <span className="time-label">{formatTime(progress)}</span>
            <input
              type="range"
              className="progress-slider"
              min={0}
              max={safeDuration || 100}
              value={safeDuration ? progress : 0}
              onChange={(e) => seek(Number(e.target.value))}
              aria-label="Seek"
            />
            <span className="time-label">{formatTime(safeDuration)}</span>
          </div>
          <div className="progress-bar" aria-hidden>
            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <div className="player-volume">
          <IconVolume className="volume-icon" />
          <input
            type="range"
            className="volume-slider"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            aria-label="Volume"
          />
        </div>
      </div>
    </>
  );
}
