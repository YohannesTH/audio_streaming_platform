"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { getStreamInfo, streamUrl } from "@/lib/api";
import type { Track } from "@/types/track";

interface AudioContextProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  progress: number;
  duration: number;
  volume: number;
  playTrack: (track: Track) => Promise<void>;
  togglePlayPause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  clearError: () => void;
  favorites: Track[];
  toggleFavorite: (track: Track) => void;
  isFavorite: (trackId: string) => boolean;
}

const AudioPlayerContext = createContext<AudioContextProps | undefined>(undefined);
const FAVORITES_KEY = "aura_favorites";
const VOLUME_KEY = "aura_volume";

export const AudioPlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [favorites, setFavorites] = useState<Track[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;

    const storedFavs = localStorage.getItem(FAVORITES_KEY);
    if (storedFavs) {
      try {
        setFavorites(JSON.parse(storedFavs));
      } catch {
        localStorage.removeItem(FAVORITES_KEY);
      }
    }

    const storedVolume = localStorage.getItem(VOLUME_KEY);
    if (storedVolume) {
      const parsed = Number(storedVolume);
      if (!Number.isNaN(parsed)) {
        audio.volume = parsed;
        setVolumeState(parsed);
      }
    } else {
      audio.volume = 0.8;
    }

    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onPlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);
    const onError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      const code = audio.error?.code;
      const message =
        code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED
          ? "This audio format could not be played. Try another track or restart the backend."
          : code === MediaError.MEDIA_ERR_NETWORK
            ? "Network error while loading audio. Check that the backend is running."
            : "Unable to play this track. Try selecting it again.";
      setError(message);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("error", onError);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("error", onError);
      audioRef.current = null;
    };
  }, []);

  const toggleFavorite = useCallback((track: Track) => {
    setFavorites((prev) => {
      const exists = prev.some((t) => t.id === track.id);
      const newFavs = exists ? prev.filter((t) => t.id !== track.id) : [...prev, track];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavs));
      return newFavs;
    });
  }, []);

  const isFavorite = useCallback(
    (trackId: string) => favorites.some((t) => t.id === trackId),
    [favorites]
  );

  const playTrack = useCallback(async (track: Track) => {
    const audio = audioRef.current;
    if (!audio) return;

    setError(null);
    setCurrentTrack(track);
    setIsLoading(true);
    setProgress(0);
    setDuration(track.duration ?? 0);

    try {
      const streamInfo = await getStreamInfo(track.id);
      if (streamInfo.duration) {
        setDuration(streamInfo.duration);
      }

      audio.pause();
      audio.src = streamUrl(track.id);
      audio.load();
      await audio.play();
    } catch (err) {
      setIsLoading(false);
      setIsPlaying(false);
      setError(
        err instanceof Error
          ? err.message
          : "Playback failed. Make sure the backend server is running."
      );
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      audio.pause();
    } else {
      setError(null);
      audio.play().catch(() => {
        setError("Playback failed. Try selecting the track again.");
      });
    }
  }, [currentTrack, isPlaying]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setProgress(time);
  }, []);

  const setVolume = useCallback((value: number) => {
    const clamped = Math.min(1, Math.max(0, value));
    if (audioRef.current) audioRef.current.volume = clamped;
    setVolumeState(clamped);
    localStorage.setItem(VOLUME_KEY, String(clamped));
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isLoading,
        error,
        progress,
        duration,
        volume,
        playTrack,
        togglePlayPause,
        seek,
        setVolume,
        clearError,
        favorites,
        toggleFavorite,
        isFavorite,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error("useAudioPlayer must be used within an AudioPlayerProvider");
  }
  return context;
};
