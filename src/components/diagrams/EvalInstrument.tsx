"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useOnScreen, useReducedMotion, useRunSignal } from "./hooks";

const CHANNELS = [
  { id: "esc", name: "Escalations", hint: "handed to a human" },
  { id: "tool", name: "Tool-call success", hint: "did the action work" },
  { id: "res", name: "Intent resolution", hint: "was the need met" },
  { id: "fric", name: "Friction", hint: "how hard it was" },
];

const N = 160;
const W = 900;
const LEFT = 170;
const ROW = 46;

// deterministic noise so server and client agree
function series(seed: number) {
  let s = seed;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const out: number[] = [];
  let v = 0.5;
  for (let i = 0; i < N * 2; i++) {
    v += (r() - 0.5) * 0.22;
    v = Math.min(0.92, Math.max(0.08, v * 0.94 + 0.5 * 0.06));
    out.push(v);
  }
  return out;
}

export function EvalInstrument() {
  const reduce = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const on = useOnScreen(box);
  const [solo, setSolo] = useState<string | null>(null);
  const [off, setOff] = useState(0);
  const data = useMemo(() => CHANNELS.map((_, i) => series(97 + i * 131)), []);

  useEffect(() => {
    if (!on || reduce) return;
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const tick = (t: number) => {
      acc += t - last;
      last = t;
      if (acc > 70) {
        acc = 0;
        setOff((o) => (o + 1) % N);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [on, reduce]);

  useRunSignal("eval", () => setSolo(null));

  const span = W - LEFT - 20;
  const path = (d: number[], row: number) =>
    d
      .slice(off, off + N)
      .map((v, i) => `${i ? "L" : "M"}${(LEFT + (i / (N - 1)) * span).toFixed(1)},${(row * ROW + 10 + (1 - v) * (ROW - 16)).toFixed(1)}`)
      .join("");

  // composite: escalations and friction count against health
  const composite = useMemo(
    () => Array.from({ length: N * 2 }, (_, i) => 0.5 + ((1 - data[0][i] + data[1][i] + data[2][i] + (1 - data[3][i])) / 4 - 0.5) * 2.4),
    [data],
  );

  const H = (CHANNELS.length + 1) * ROW + 24;

  return (
    <div ref={box} className="border border-line bg-ink-1">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line px-4 py-3">
        <div>
          <p className="label">Conversations scored</p>
          <p className="display text-[40px] leading-none">50K+</p>
        </div>
        <p className="mono max-w-[38ch] text-right text-paper-3">bot health = f(escalations, tool success, resolution, friction)</p>
      </div>

      <div className="overflow-x-auto px-2 pt-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[560px]" role="img" aria-label="Four health channels and the composite bot-health score they produce.">
          {CHANNELS.map((c, i) => {
            const dim = solo && solo !== c.id;
            return (
              <g key={c.id} opacity={dim ? 0.25 : 1} className="cursor-pointer" onClick={() => setSolo(solo === c.id ? null : c.id)}>
                <rect x={0} y={i * ROW} width={W} height={ROW} fill="transparent" />
                <line x1={LEFT} x2={W - 20} y1={i * ROW + ROW - 3} y2={i * ROW + ROW - 3} stroke="var(--line)" />
                <text x={0} y={i * ROW + 20} fontFamily="var(--font-mono)" fontSize="10.5" letterSpacing="0.08em" fill="var(--paper)">
                  {`CH${i + 1} ${c.name.toUpperCase()}`}
                </text>
                <text x={0} y={i * ROW + 34} fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--paper-3)">
                  {c.hint}
                </text>
                <path d={path(data[i], i)} fill="none" stroke="var(--paper-2)" strokeWidth="1" />
              </g>
            );
          })}
          <g>
            <line x1={0} x2={W - 20} y1={CHANNELS.length * ROW + 4} y2={CHANNELS.length * ROW + 4} stroke="var(--line-2)" />
            <text x={0} y={CHANNELS.length * ROW + 28} fontFamily="var(--font-mono)" fontSize="10.5" letterSpacing="0.08em" fill="var(--signal)">
              BOT HEALTH
            </text>
            <text x={0} y={CHANNELS.length * ROW + 42} fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--paper-3)">
              composite
            </text>
            <path d={path(composite, CHANNELS.length).replace(/,(\d+(\.\d+)?)/g, (_, y) => `,${(Number(y) + 8).toFixed(1)}`)} fill="none" stroke="var(--signal)" strokeWidth="1.4" />
          </g>
        </svg>
      </div>
      <p className="mono border-t border-line px-4 py-3 text-paper-2">
        {solo
          ? `${CHANNELS.find((c) => c.id === solo)!.name}: one failure mode, isolated. A single accuracy number would hide which one it was.`
          : "Click a channel to isolate it. Four signals separate the ways a conversation fails; the composite says how much."}
      </p>
      <p className="label border-t border-line px-4 py-2 !normal-case !tracking-[0.04em]">Signal shapes are illustrative, not production data.</p>
    </div>
  );
}
