"use client";

import { useRef, useState } from "react";
import { os, useOs } from "@/lib/os";
import { Icon, type IconSpec } from "./Icon";
import { DOCK, LINKS, launch, resolve } from "./registry";

const BASE = 50;
const REACH = 140;
const GROW = 0.55;

type Item = { id: string; name: string; icon: IconSpec; running: boolean; href?: string } | "sep";

export function Dock() {
  const wins = useOs((s) => s.wins);
  const launchpad = useOs((s) => s.launchpad);
  const [scales, setScales] = useState<Record<string, number>>({});
  const refs = useRef<Record<string, HTMLElement | null>>({});

  const open = new Set(wins.map((w) => w.key));
  const items: Item[] = DOCK.map((k) => ({ id: k, name: resolve(k)!.name, icon: resolve(k)!.icon, running: k === "skills" ? launchpad : open.has(k) }));
  // documents and skill apps appear while they're open, like running apps
  const extra = wins.filter((w) => !(DOCK as string[]).includes(w.key));
  if (extra.length) items.push("sep", ...extra.map((w) => ({ id: w.key, name: resolve(w.key)!.name, icon: resolve(w.key)!.icon, running: true })));
  items.push("sep", ...LINKS.map((l) => ({ id: l.name, name: l.name, icon: l.icon, running: false, href: l.href })));

  // magnify by distance from the pointer, measured in the event, never during render
  const magnify = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const next: Record<string, number> = {};
    for (const [id, el] of Object.entries(refs.current)) {
      if (!el) continue;
      const r = el.getBoundingClientRect();
      const d = Math.abs(e.clientX - (r.left + r.width / 2));
      next[id] = 1 + GROW * Math.max(0, Math.cos(Math.min(d / REACH, 1) * (Math.PI / 2)));
    }
    setScales(next);
  };

  const click = (id: string) => {
    if (id === "skills") return os.launchpad();
    // clicking the focused app's icon minimizes it, like macOS
    const top = wins.filter((x) => !x.min).sort((a, b) => b.z - a.z)[0];
    if (top?.key === id) os.minimize(id);
    else launch(id);
  };

  return (
    <nav aria-label="Dock" className="dock-wrap">
      <ul className="dock" onPointerMove={magnify} onPointerLeave={() => setScales({})}>
        {items.map((it, i) =>
          it === "sep" ? (
            <li key={`sep${i}`} className="dock-sep" aria-hidden />
          ) : (
            <li
              key={it.id}
              ref={(el) => {
                refs.current[it.id] = el;
              }}
              className="dock-item"
              style={{ "--s": scales[it.id] ?? 1 } as React.CSSProperties}
            >
              {it.href ? (
                <a href={it.href} target="_blank" rel="noreferrer" aria-label={it.name}>
                  <Icon spec={it.icon} size={BASE} />
                </a>
              ) : (
                <button onClick={() => click(it.id)} aria-label={it.name}>
                  <Icon spec={it.icon} size={BASE} />
                </button>
              )}
              <span className="dock-tip">{it.name}</span>
              {it.running && <span className="dock-dot" />}
            </li>
          ),
        )}
      </ul>
    </nav>
  );
}
