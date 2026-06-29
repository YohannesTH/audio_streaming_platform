"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAudioPlayer } from "@/context/AudioPlayerContext";
import { IconDownload, IconHeart, IconHome } from "./Icons";

const navItems = [
  { name: "Discover", path: "/", icon: IconHome },
  { name: "Favorites", path: "/favorites", icon: IconHeart },
  { name: "Downloads", path: "/downloads", icon: IconDownload },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { favorites } = useAudioPlayer();

  return (
    <aside className="sidebar">
      <Link href="/" className="logo">
        <span className="logo-mark">A</span>
        <div>
          <h2>AURA</h2>
          <p>Audio streaming</p>
        </div>
      </Link>

      <nav className="nav-menu" aria-label="Main">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.path;
          return (
            <Link href={item.path} key={item.path} className={`nav-item ${active ? "active" : ""}`}>
              <Icon className="nav-icon" />
              <span>{item.name}</span>
              {item.path === "/favorites" && favorites.length > 0 && (
                <span className="nav-badge">{favorites.length}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <p>Stream audio from YouTube — podcasts, music, lectures, and more.</p>
      </div>
    </aside>
  );
}
