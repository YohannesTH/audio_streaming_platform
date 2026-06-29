import type { Metadata } from "next";
import "./globals.css";
import { AudioPlayerProvider } from "@/context/AudioPlayerContext";
import AudioPlayer from "@/components/AudioPlayer";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "AURA — Audio Streaming",
  description: "Stream YouTube audio seamlessly. Podcasts, music, lectures, and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AudioPlayerProvider>
          <div className="app-container">
            <Sidebar />
            <main className="main-content">{children}</main>
          </div>
          <AudioPlayer />
        </AudioPlayerProvider>
      </body>
    </html>
  );
}
