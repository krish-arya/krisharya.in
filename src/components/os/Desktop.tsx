"use client";

import { useEffect } from "react";
import { os, useOs } from "@/lib/os";
import { DesktopIcons } from "./DesktopIcons";
import { Dock } from "./Dock";
import { Launchpad } from "./Launchpad";
import { LockScreen } from "./LockScreen";
import { MenuBar } from "./MenuBar";
import { launch, resolve } from "./registry";
import { Spotlight } from "./Spotlight";
import { Wallpaper } from "./Wallpaper";
import { HomeGrid, Widgets } from "./Widgets";
import { Window } from "./Window";

export function Desktop() {
  const wins = useOs((s) => s.wins);
  const spotlight = useOs((s) => s.spotlight);
  const overlay = useOs((s) => s.spotlight || s.launchpad);

  // first paint: open whatever the URL names (#project/mutagen), else say hello
  useEffect(() => {
    let k = "";
    try {
      k = decodeURIComponent(location.hash.slice(1)).replace("/", ":");
    } catch {} // malformed escape (#%): fall through to the default
    if (k && resolve(k)) launch(k, false);
    else if (window.innerWidth >= 720) launch("about", false);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        os.spotlight();
      } else if (e.key === "Escape") {
        const s = os.get();
        if (s.spotlight) os.spotlight(false);
        else if (s.launchpad) os.launchpad(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="desktop">
      <Wallpaper />
      {/* overlays make what's behind them inert; Launchpad sits under the menu bar and dock, which stay usable */}
      <div inert={spotlight || undefined}>
        <MenuBar />
      </div>
      <main id="main" tabIndex={-1} inert={overlay || undefined} className="workspace" onPointerDown={(e) => e.target === e.currentTarget && os.get().launchpad && os.launchpad(false)}>
        <Widgets />
        <DesktopIcons />
        <HomeGrid />
        {wins.map((w) => (
          <Window key={w.key} win={w} />
        ))}
      </main>
      <Launchpad />
      <Spotlight />
      <div inert={spotlight || undefined}>
        <Dock />
      </div>
      <LockScreen />
    </div>
  );
}
