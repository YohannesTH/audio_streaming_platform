"use client";

import type { Track } from "@/types/track";
import { downloadUrl } from "@/lib/api";
import { formatDuration } from "@/lib/format";
import { IconHeart, IconPlay } from "./Icons";

type TrackCardProps = {
  track: Track;
  isActive?: boolean;
  isPlaying?: boolean;
  isFavorite?: boolean;
  showFavorite?: boolean;
  showDownload?: boolean;
  onPlay: (track: Track) => void;
  onToggleFavorite?: (track: Track) => void;
};

export default function TrackCard({
  track,
  isActive = false,
  isPlaying = false,
  isFavorite = false,
  showFavorite = true,
  showDownload = false,
  onPlay,
  onToggleFavorite,
}: TrackCardProps) {
  const thumbnail = track.thumbnail || `https://i.ytimg.com/vi/${track.id}/hqdefault.jpg`;

  return (
    <article className={`track-card ${isActive ? "track-card--active" : ""}`}>
      <button type="button" className="track-card-main" onClick={() => onPlay(track)}>
        <div className="track-card-art">
          <img src={thumbnail} alt="" loading="lazy" />
          <span className="track-card-overlay">
            {isActive && isPlaying ? (
              <span className="track-card-eq" aria-hidden>
                <span /><span /><span />
              </span>
            ) : (
              <IconPlay className="track-card-play-icon" />
            )}
          </span>
          {track.duration != null && (
            <span className="track-card-duration">{formatDuration(track.duration)}</span>
          )}
        </div>
        <div className="track-card-meta">
          <h3 title={track.title}>{track.title}</h3>
          <p title={track.channel}>{track.channel}</p>
        </div>
      </button>

      <div className="track-card-actions">
        {showFavorite && onToggleFavorite && (
          <button
            type="button"
            className={`icon-btn ${isFavorite ? "icon-btn--active" : ""}`}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            onClick={() => onToggleFavorite(track)}
          >
            <IconHeart filled={isFavorite} />
          </button>
        )}
        {showDownload && (
          <a
            href={downloadUrl(track.id)}
            className="icon-btn"
            aria-label={`Download ${track.title}`}
            download
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M12 4v10" strokeLinecap="round" />
              <path d="M8.5 10.5 12 14l3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 20h14" strokeLinecap="round" />
            </svg>
          </a>
        )}
      </div>
    </article>
  );
}
