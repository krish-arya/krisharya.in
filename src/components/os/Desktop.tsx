"use client";

import { useEffect } from "react";
import { os, useOs } from "@/lib/os";
import { Dock } from "./Dock";
import { Launchpad } from "./Launchpad";
import { MenuBar } from "./MenuBar";
import { launch, resolve } from "./registry";
import { Spotlight } from "./Spotlight";
import { HomeGrid, Widgets } from "./Widgets";
import { Window } from "./Window";

export function Desktop() {
  const wins = useOs((s) => s.wins);

  // first paint: open whatever the URL names (#project/mutagen), else say hello
  useEffect(() => {
    const k = decodeURIComponent(location.hash.slice(1)).replace("/", ":");
    if (k && resolve(k)) launch(k);
    else if (window.innerWidth >= 720) launch("about");
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
      <MenuBar />
      <main id="main" className="workspace" onPointerDown={(e) => e.target === e.currentTarget && os.get().launchpad && os.launchpad(false)}>
        <Widgets />
        <HomeGrid />
        {wins.map((w) => (
          <Window key={w.key} win={w} />
        ))}
      </main>
      <Launchpad />
      <Spotlight />
      <Dock />
    </div>
  );
}
