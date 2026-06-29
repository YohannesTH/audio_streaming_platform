"use client";

import Link from "next/link";
import { useAudioPlayer } from "@/context/AudioPlayerContext";
import TrackCard from "@/components/TrackCard";
import EmptyState from "@/components/EmptyState";

export default function Downloads() {
  const { favorites, playTrack, toggleFavorite, currentTrack, isPlaying } = useAudioPlayer();

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Offline listening</p>
          <h1>Downloads</h1>
          <p className="subtitle">Save favorites to your device as M4A audio files.</p>
        </div>
      </header>

      {favorites.length === 0 ? (
        <EmptyState
          title="Nothing to download"
          description="Add tracks to your favorites first, then download them here for offline playback."
          action={
            <Link href="/" className="btn-secondary">
              Find something to save
            </Link>
          }
        />
      ) : (
        <div className="results-grid">
          {favorites.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              isActive={currentTrack?.id === track.id}
              isPlaying={currentTrack?.id === track.id && isPlaying}
              isFavorite
              showDownload
              onPlay={playTrack}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
