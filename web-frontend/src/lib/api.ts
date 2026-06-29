export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export async function searchYouTube(query: string, maxResults = 20) {
  const res = await fetch(
    `${API_BASE}/search?q=${encodeURIComponent(query)}&max_results=${maxResults}`
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Search failed");
  return data.results ?? [];
}

export async function getStreamInfo(videoId: string) {
  const res = await fetch(`${API_BASE}/stream/${videoId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Could not load audio stream");
  return data;
}

export function streamUrl(videoId: string) {
  return `${API_BASE}/proxy-stream/${videoId}`;
}

export function downloadUrl(videoId: string) {
  return `${API_BASE}/download/${videoId}`;
}
