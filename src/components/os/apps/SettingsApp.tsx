"use client";

import { ACCENTS, WALLPAPERS, setPrefs, usePrefs, type Appearance } from "@/lib/prefs";
import { Section } from "../ui";

const LOOKS: { v: Appearance; l: string }[] = [
  { v: "auto", l: "Auto" },
  { v: "light", l: "Light" },
  { v: "dark", l: "Dark" },
];

/** A thumbnail painted the same way as the real wallpaper. */
const thumb = (c: string[]) =>
  `radial-gradient(60% 70% at 20% 25%, ${c[1]} 0%, transparent 70%), radial-gradient(55% 65% at 85% 30%, ${c[3]} 0%, transparent 70%), radial-gradient(70% 60% at 55% 100%, ${c[2]} 0%, transparent 70%), ${c[0]}`;

export function SettingsApp() {
  const p = usePrefs();

  return (
    <div className="h-full overflow-y-auto px-6 pt-5 pb-10 md:px-8">
      <Section title="Appearance" className="!mt-0">
        <div role="radiogroup" aria-label="Appearance" className="flex gap-4">
          {LOOKS.map((o) => (
            <button key={o.v} role="radio" aria-checked={p.appearance === o.v} onClick={() => setPrefs({ appearance: o.v })} className="look group flex flex-col items-center gap-2">
              <span className={`look-swatch look-${o.v}`}>
                <span />
              </span>
              <span className="text-[12px]">{o.l}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Accent colour">
        <div role="radiogroup" aria-label="Accent colour" className="flex flex-wrap gap-3">
          {ACCENTS.map((a) => (
            <button
              key={a.name}
              role="radio"
              aria-checked={p.accent === a.color}
              aria-label={a.name}
              title={a.name}
              onClick={() => setPrefs({ accent: a.color })}
              className="accent-dot"
              style={{ background: a.color }}
            />
          ))}
        </div>
      </Section>

      <Section title="Wallpaper">
        <div role="radiogroup" aria-label="Wallpaper" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {WALLPAPERS.map((w) => (
            <button key={w.id} role="radio" aria-checked={p.wallpaper === w.id} onClick={() => setPrefs({ wallpaper: w.id })} className="wall-pick">
              <span className="wall-thumb" style={{ background: thumb(w.colors) }} />
              <span className="mt-1.5 block text-[12px]">{w.name}</span>
            </button>
          ))}
        </div>
      </Section>

      <p className="mt-8 text-[12px] text-[var(--fg-3)]">Saved in this browser.</p>
    </div>
  );
}
