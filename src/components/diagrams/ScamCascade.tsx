"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useFirstView, useReducedMotion, useRunSignal } from "./hooks";

const W = 900;
const H = 300;
const L = 70;
const R = 30;
const T = 20;
const B = 50;

// log-scale y: 1 → 5000 shares
const ly = (v: number) => T + (1 - Math.log10(v) / Math.log10(5000)) * (H - T - B);
const lx = (u: number) => L + u * (W - L - R);
// an illustrative logistic cascade
const cascade = (u: number) => Math.max(1, 3000 / (1 + Math.exp(-11 * (u - 0.58))));
const crossing = (level: number) => {
  for (let u = 0; u <= 1; u += 0.001) if (cascade(u) >= level) return u;
  return 1;
};
const U50 = crossing(50);
const U500 = crossing(500);

export function ScamCascade() {
  const reduce = useReducedMotion();
  const [u, setU] = useState(1);
  const raf = useRef(0);
  const box = useRef<HTMLDivElement>(null);

  const run = useCallback(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setU(1);
    cancelAnimationFrame(raf.current);
    const t0 = performance.now();
    const tick = (t: number) => {
      const v = Math.min((t - t0) / 3000, 1);
      setU(v);
      if (v < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  }, []);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  useFirstView(box, () => !reduce && run());
  useRunSignal("scam", run);

  const pts = Array.from({ length: 121 }, (_, i) => i / 120).filter((p) => p <= u);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${lx(p).toFixed(1)},${ly(cascade(p)).toFixed(1)}`).join("");
  const flagged = u >= U50;
  const viral = u >= U500;

  return (
    <div ref={box} className="border border-line bg-ink-1">
      <div className="flex flex-wrap gap-x-8 gap-y-2 border-b border-line px-4 py-3">
        {[
          ["Signals", "text · metadata · network · temporal"],
          ["Models", "RF · LSTM · GNN · LLM"],
          ["Best", "LLM + CoT + temporal GNN"],
        ].map(([k, v]) => (
          <p key={k} className="mono text-paper-2">
            <span className="label mr-2">{k}</span>
            {v}
          </p>
        ))}
      </div>
      <div className="px-2 pt-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="A scam's share cascade over time. The hybrid model flags it at about 50 shares; the viral threshold is 500 or more.">
          {[1, 10, 100, 1000].map((v) => (
            <g key={v}>
              <line x1={L} x2={W - R} y1={ly(v)} y2={ly(v)} stroke="var(--line)" />
              <text x={L - 10} y={ly(v) + 4} textAnchor="end" fontFamily="var(--font-mono)" fontSize="10" fill="var(--paper-3)">
                {v}
              </text>
            </g>
          ))}
          <text x={L} y={H - 14} fontFamily="var(--font-mono)" fontSize="10" letterSpacing="0.08em" fill="var(--paper-3)">
            TIME →
          </text>
          <text x={8} y={T + 4} fontFamily="var(--font-mono)" fontSize="10" letterSpacing="0.08em" fill="var(--paper-3)">
            SHARES
          </text>

          {/* thresholds from the paper */}
          <line x1={L} x2={W - R} y1={ly(500)} y2={ly(500)} stroke="var(--paper-3)" strokeDasharray="4 4" />
          <text x={W - R} y={ly(500) - 6} textAnchor="end" fontFamily="var(--font-mono)" fontSize="10.5" letterSpacing="0.06em" fill={viral ? "var(--paper)" : "var(--paper-3)"}>
            VIRAL THRESHOLD · 500+
          </text>
          <line x1={L} x2={W - R} y1={ly(50)} y2={ly(50)} stroke="var(--signal)" strokeOpacity="0.45" strokeDasharray="2 4" />

          <path d={d} fill="none" stroke="var(--paper)" strokeWidth="1.4" />

          {flagged && (
            <g>
              <line x1={lx(U50)} x2={lx(U50)} y1={ly(50)} y2={H - B} stroke="var(--signal)" />
              <rect x={lx(U50) - 4} y={ly(50) - 4} width={8} height={8} fill="var(--signal)" />
              <text x={lx(U50) - 8} y={ly(50) - 10} textAnchor="end" fontFamily="var(--font-mono)" fontSize="10.5" letterSpacing="0.06em" fill="var(--signal)">
                FLAGGED · ~50 SHARES
              </text>
            </g>
          )}
          {viral && (
            <g>
              <line x1={lx(U500)} x2={lx(U500)} y1={ly(500)} y2={H - B} stroke="var(--paper-3)" />
              <line x1={lx(U50)} x2={lx(U500)} y1={H - B + 12} y2={H - B + 12} stroke="var(--pass)" />
              <text x={(lx(U50) + lx(U500)) / 2} y={H - B + 28} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10.5" letterSpacing="0.06em" fill="var(--pass)">
                LEAD TIME
              </text>
            </g>
          )}
        </svg>
      </div>
      <p className="label border-t border-line px-4 py-2 !normal-case !tracking-[0.04em]">
        Curve is illustrative. The ~50 and 500+ thresholds, F1 0.97 and early-warning recall 0.94 are reported in the paper.
      </p>
    </div>
  );
}
