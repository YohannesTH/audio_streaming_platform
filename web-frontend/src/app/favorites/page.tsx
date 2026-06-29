"use client";

import Link from "next/link";
import { useAudioPlayer } from "@/context/AudioPlayerContext";
import TrackCard from "@/components/TrackCard";
import EmptyState from "@/components/EmptyState";

export default function Favorites() {
  const { favorites, playTrack, toggleFavorite, currentTrack, isPlaying } = useAudioPlayer();

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Your library</p>
          <h1>Favorites</h1>
          <p className="subtitle">
            {favorites.length === 0
              ? "Tracks you love will appear here."
              : `${favorites.length} saved track${favorites.length === 1 ? "" : "s"}`}
          </p>
        </div>
      </header>

      {favorites.length === 0 ? (
        <EmptyState
          title="No favorites yet"
          description="Heart any track while searching to build your personal library."
          action={
            <Link href="/" className="btn-secondary">
              Discover music
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
              onPlay={playTrack}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
