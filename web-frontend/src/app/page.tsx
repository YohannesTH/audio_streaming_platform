"use client";

import { useState } from "react";
import { useAudioPlayer } from "@/context/AudioPlayerContext";
import { searchYouTube } from "@/lib/api";
import type { Track } from "@/types/track";
import TrackCard from "@/components/TrackCard";
import EmptyState from "@/components/EmptyState";
import { IconSearch, IconSpinner } from "@/components/Icons";

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const { playTrack, toggleFavorite, isFavorite, currentTrack, isPlaying } = useAudioPlayer();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const data = await searchYouTube(trimmed);
      setResults(data);
    } catch (err) {
      setResults([]);
      setError(
        err instanceof Error
          ? err.message
          : "Search failed. Is the backend running on port 8000?"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Welcome back</p>
          <h1>Discover audio</h1>
          <p className="subtitle">Search podcasts, music, lectures, and more — audio only.</p>
        </div>
      </header>

      <form onSubmit={handleSearch} className="search-bar" role="search">
        <div className="search-input-wrap">
          <IconSearch className="search-icon" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you want to listen to?"
            aria-label="Search audio"
          />
        </div>
        <button type="submit" disabled={loading || !query.trim()}>
          {loading ? (
            <>
              <IconSpinner className="btn-spinner" />
              Searching
            </>
          ) : (
            "Search"
          )}
        </button>
      </form>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      {loading && (
        <div className="skeleton-grid" aria-hidden>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton-card" />
          ))}
        </div>
      )}

      {!loading && hasSearched && results.length === 0 && !error && (
        <EmptyState
          title="No results found"
          description="Try different keywords or check your spelling."
        />
      )}

      {!loading && !hasSearched && (
        <EmptyState
          title="Start listening"
          description="Search for any YouTube content and stream it as audio — no video, less data."
        />
      )}

      {!loading && results.length > 0 && (
        <section>
          <h2 className="section-title">{results.length} results</h2>
          <div className="results-grid">
            {results.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                isActive={currentTrack?.id === track.id}
                isPlaying={currentTrack?.id === track.id && isPlaying}
                isFavorite={isFavorite(track.id)}
                onPlay={playTrack}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
