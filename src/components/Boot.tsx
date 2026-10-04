"use client";

import { useEffect, useState } from "react";

const LINES: [string, string][] = [
  ["PRODUCTION", "4 SYSTEMS"],
  ["PRODUCTS", "3 SHIPPED"],
  ["RESEARCH", "3 PAPERS"],
  ["EXPERIENCE", "4 ROLES"],
];

const STEP = 140;

/**
 * ≤1.1s. Any key, click or scroll skips it. Never shown again on this browser,
 * never shown with reduced motion (gated before paint in layout.tsx).
 */
export function Boot() {
  const [n, setN] = useState(0);

  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.boot === "skip") return;

    const finish = () => {
      root.dataset.boot = "done";
      try {
        localStorage.setItem("ka.booted", "1");
      } catch {}
    };

    const timers = LINES.map((_, i) => window.setTimeout(() => setN(i + 1), STEP * (i + 1)));
    timers.push(window.setTimeout(() => setN(LINES.length + 1), STEP * (LINES.length + 1)));
    timers.push(window.setTimeout(finish, STEP * (LINES.length + 1) + 380));

    const skip = () => finish();
    window.addEventListener("keydown", skip, { once: true });
    window.addEventListener("pointerdown", skip, { once: true });
    window.addEventListener("wheel", skip, { once: true, passive: true });
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("wheel", skip);
    };
  }, []);

  return (
    <div className="boot" aria-hidden>
      <div className="mono w-full max-w-[520px] text-paper-2">
        <p className="text-paper">INITIALIZING KRISH.ARYA</p>
        <div className="mt-4 space-y-1">
          {LINES.map(([k, v], i) => (
            <p key={k} style={{ opacity: n > i ? 1 : 0 }} className="flex gap-2">
              <span>{k}</span>
              <span className="min-w-0 flex-1 overflow-hidden whitespace-nowrap text-paper-3">
                ........................................................
              </span>
              <span>{v}</span>
              <span className="w-[3ch] text-pass">OK</span>
            </p>
          ))}
        </div>
        <p className="mt-4 text-signal" style={{ opacity: n > LINES.length ? 1 : 0 }}>
          SYSTEM ONLINE
        </p>
        <p className="label mt-8">Any key to skip</p>
      </div>
    </div>
  );
}
