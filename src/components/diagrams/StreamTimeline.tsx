"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ProjectId } from "@/content/data";
import { useFirstView, useReducedMotion, useRunSignal } from "./hooks";

type Seg = { a: number; b: number; kind?: "hatch" | "dim" | "cut"; tag?: string };
type Lane = { name: string; segs: Seg[]; ticks?: boolean };

const W = 900;
const LEFT = 120;
const RIGHT = 20;
const LANE = 34;
const TOP = 26;
const x = (t: number) => LEFT + (t / 100) * (W - LEFT - RIGHT);

function lanes(variant: "prod" | "v2v", mode: "stream" | "seq", barge: boolean): { lanes: Lane[]; bracket: [number, number, string] } {
  if (variant === "prod") {
    if (mode === "seq")
      return {
        lanes: [
          { name: "User audio", segs: [{ a: 0, b: 40 }] },
          { name: "STT", segs: [{ a: 40, b: 55 }] },
          { name: "LLM", segs: [{ a: 55, b: 74 }] },
          { name: "TTS", segs: [{ a: 74, b: 90 }] },
          { name: "Audio out", segs: [{ a: 90, b: 100 }] },
        ],
        bracket: [40, 90, "sum of every stage"],
      };
    return {
      lanes: [
        { name: "User audio", segs: [{ a: 0, b: 40 }] },
        { name: "Streaming STT", segs: [{ a: 3, b: 43 }] },
        { name: "LLM", segs: [{ a: 43, b: 62 }] },
        { name: "Streaming TTS", segs: [{ a: 46, b: 76 }] },
        { name: "Audio out", segs: [{ a: 50, b: 84 }] },
      ],
      bracket: [40, 50, "<200ms end to end"],
    };
  }
  if (mode === "seq")
    return {
      lanes: [
        { name: "User audio", segs: [{ a: 0, b: 40 }], ticks: true },
        { name: "Silero VAD", segs: [{ a: 40, b: 44, tag: "silence" }] },
        { name: "STT", segs: [{ a: 44, b: 56 }] },
        { name: "LLM", segs: [{ a: 56, b: 74 }] },
        { name: "TTS", segs: [{ a: 74, b: 88 }] },
        { name: "Playback", segs: [{ a: 88, b: 100 }] },
      ],
      bracket: [40, 88, "fixed silence timer, then each stage in turn"],
    };
  const cut = 63;
  return {
    lanes: [
      { name: "User audio", segs: [{ a: 0, b: 40 }, ...(barge ? [{ a: 61, b: 76, tag: "barge-in" }] : [])], ticks: true },
      { name: "Silero VAD", segs: [{ a: 0, b: 40, kind: "dim" }, ...(barge ? [{ a: 61, b: 76, kind: "dim" as const }] : [])] },
      { name: "STT partials", segs: [0, 7, 14, 21, 28, 35].map((a) => ({ a: a + 2, b: a + 7 })) },
      {
        name: "LLM",
        segs: [{ a: 32, b: 42, kind: "hatch", tag: "speculative prefill" }, { a: 42, b: barge ? cut : 64 }],
      },
      {
        name: "TTS clauses",
        segs: barge ? [{ a: 45, b: 53 }, { a: 54, b: cut, kind: "cut" }] : [{ a: 45, b: 53 }, { a: 54, b: 62 }, { a: 63, b: 71 }],
      },
      { name: "Playback", segs: barge ? [{ a: 48, b: cut, kind: "cut", tag: "cancelled" }] : [{ a: 48, b: 82 }] },
    ],
    bracket: [40, 48, "last user frame → first response frame"],
  };
}

export function StreamTimeline({ id, variant }: { id: ProjectId; variant: "prod" | "v2v" }) {
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<"stream" | "seq">("stream");
  const [barge, setBarge] = useState(false);
  const [head, setHead] = useState(100);
  const raf = useRef(0);
  const box = useRef<HTMLDivElement>(null);

  const sweep = useCallback(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setHead(100);
    cancelAnimationFrame(raf.current);
    const t0 = performance.now();
    const tick = (t: number) => {
      const v = Math.min(((t - t0) / 2600) * 100, 100);
      setHead(v);
      if (v < 100) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  useFirstView(box, () => !reduce && sweep());
  useRunSignal(id, () => {
    setBarge(false);
    setMode("stream");
    sweep();
  });

  const { lanes: ls, bracket } = lanes(variant, mode, barge);
  const H = TOP + ls.length * LANE + 46;
  const clip = `clip-${variant}`;

  return (
    <div ref={box} className="border border-line bg-ink-1">
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
        <div role="radiogroup" aria-label="Pipeline mode" className="flex">
          {(["stream", "seq"] as const).map((m) => (
            <button
              key={m}
              role="radio"
              aria-checked={mode === m}
              className={`btn ${mode === m ? "is-on" : ""} -ml-px`}
              onClick={() => {
                setMode(m);
                setBarge(false);
                sweep();
              }}
            >
              {m === "stream" ? "Streaming" : "Sequential"}
            </button>
          ))}
        </div>
        {variant === "v2v" && (
          <button
            className="btn"
            aria-pressed={barge}
            disabled={mode !== "stream"}
            onClick={() => {
              setBarge((b) => !b);
              sweep();
            }}
          >
            {barge ? "Undo barge-in" : "Barge in"}
          </button>
        )}
        <span className="label ml-auto">Illustrative timing, not to scale</span>
      </div>

      <div className="overflow-x-auto px-2 pt-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[560px]" role="img" aria-label={`${mode === "stream" ? "Streaming" : "Sequential"} pipeline timeline. ${bracket[2]}.`}>
          <defs>
            <pattern id={`hatch-${variant}`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="6" height="6" fill="var(--signal-dim)" />
              <line x1="0" y1="0" x2="0" y2="6" stroke="var(--signal)" strokeWidth="1.2" />
            </pattern>
            <clipPath id={clip}>
              <rect x={0} y={0} width={x(head)} height={H} />
            </clipPath>
          </defs>

          {/* grid */}
          {[0, 25, 50, 75, 100].map((t) => (
            <line key={t} x1={x(t)} x2={x(t)} y1={TOP - 8} y2={TOP + ls.length * LANE} stroke="var(--line)" />
          ))}

          {ls.map((l, i) => {
            const y = TOP + i * LANE;
            return (
              <g key={l.name}>
                <text x={0} y={y + LANE / 2 + 4} fontFamily="var(--font-mono)" fontSize="10.5" letterSpacing="0.08em" fill="var(--paper-2)">
                  {l.name.toUpperCase()}
                </text>
                <line x1={LEFT} x2={W - RIGHT} y1={y + LANE / 2} y2={y + LANE / 2} stroke="var(--line)" />
                <g clipPath={`url(#${clip})`}>
                  {l.segs.map((s, k) => (
                    <g key={k}>
                      <rect
                        x={x(s.a)}
                        y={y + 8}
                        width={Math.max(x(s.b) - x(s.a), 2)}
                        height={LANE - 16}
                        fill={s.kind === "hatch" ? `url(#hatch-${variant})` : s.kind === "dim" ? "var(--line-2)" : s.kind === "cut" ? "var(--signal-dim)" : i === 0 ? "var(--paper-2)" : "var(--paper)"}
                        stroke={s.kind === "cut" ? "var(--signal)" : "none"}
                        opacity={i === 0 ? 0.55 : 0.9}
                      />
                      {l.ticks &&
                        Array.from({ length: Math.floor((s.b - s.a) / 2) }, (_, j) => (
                          <line key={j} x1={x(s.a + j * 2)} x2={x(s.a + j * 2)} y1={y + 8} y2={y + LANE - 8} stroke="var(--ink-1)" strokeWidth="1" />
                        ))}
                      {s.tag && (
                        <text x={x(s.a)} y={y + 5} fontFamily="var(--font-mono)" fontSize="9" letterSpacing="0.06em" fill={s.kind === "cut" || s.tag === "barge-in" ? "var(--signal)" : "var(--paper-3)"}>
                          {s.tag.toUpperCase()}
                        </text>
                      )}
                      {s.kind === "cut" && (
                        <text x={x(s.b) + 4} y={y + LANE / 2 + 4} fontFamily="var(--font-mono)" fontSize="11" fill="var(--signal)">
                          ✕
                        </text>
                      )}
                    </g>
                  ))}
                </g>
              </g>
            );
          })}

          {/* latency bracket */}
          {head >= bracket[1] && (
            <g>
              {(() => {
                const y = TOP + ls.length * LANE + 14;
                const ax = x(bracket[0]);
                const bx = x(bracket[1]);
                const tone = mode === "stream" ? "var(--pass)" : "var(--signal)";
                return (
                  <>
                    <line x1={ax} x2={bx} y1={y} y2={y} stroke={tone} />
                    <line x1={ax} x2={ax} y1={y - 5} y2={y + 5} stroke={tone} />
                    <line x1={bx} x2={bx} y1={y - 5} y2={y + 5} stroke={tone} />
                    <text x={ax} y={y + 18} fontFamily="var(--font-mono)" fontSize="10.5" letterSpacing="0.06em" fill={tone}>
                      {bracket[2].toUpperCase()}
                    </text>
                  </>
                );
              })()}
            </g>
          )}

          {head < 100 && <line x1={x(head)} x2={x(head)} y1={TOP - 10} y2={TOP + ls.length * LANE} stroke="var(--signal)" />}
        </svg>
      </div>

      <p className="mono border-t border-line px-4 py-3 text-paper-2" aria-live="polite">
        {mode === "seq"
          ? "Run in sequence, latency is the sum of every stage, and each one waits for the last to finish."
          : barge
            ? "The user speaks over the agent. Playback is cancelled instantly and history is truncated to what was actually said."
            : variant === "v2v"
              ? "Prefill starts on a stable partial, before the user finishes. If the partial changes, it is discarded and reissued."
              : "Stages overlap: each starts on the previous one's partial output instead of waiting for it to finish."}
      </p>
    </div>
  );
}
