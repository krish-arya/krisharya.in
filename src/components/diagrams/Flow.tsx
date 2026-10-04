"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import type { ProjectId } from "@/content/data";
import { useFirstView, useReducedMotion, useRunSignal } from "./hooks";

export type Kind = "stage" | "model" | "gate" | "store" | "human" | "io";

export interface FNode {
  id: string;
  label: string;
  sub?: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
  kind?: Kind;
}

export interface FEdge {
  from: string;
  to: string;
  kind?: "main" | "feedback" | "reject";
  label?: string;
  via?: [number, number][];
  /** Exact attachment points, when the centre-ray anchor would land in the wrong place. */
  start?: [number, number];
  end?: [number, number];
}

export interface FStep {
  /** Node(s) active at this step. */
  at: string | string[];
  note: string;
  verdict?: "pass" | "fail";
  payload?: ReactNode;
}

export interface FlowSpec {
  w: number;
  h: number;
  nodes: FNode[];
  edges: FEdge[];
  steps: FStep[];
  /** Shown under the diagram when idle. */
  idle?: string;
  /** Small print, e.g. "Example data, illustrative". */
  footnote?: string;
}

const KIND_TAG: Partial<Record<Kind, string>> = { model: "MODEL", gate: "GATE", store: "STORE", human: "HUMAN", io: "I/O" };

type Pt = [number, number];
const ids = (s: FStep | undefined) => (s ? (Array.isArray(s.at) ? s.at : [s.at]) : []);

function anchor(n: FNode, toward: Pt): Pt {
  const hw = (n.w ?? 132) / 2;
  const hh = (n.h ?? 40) / 2;
  const dx = toward[0] - n.x;
  const dy = toward[1] - n.y;
  if (!dx && !dy) return [n.x, n.y];
  const s = Math.min(dx ? hw / Math.abs(dx) : Infinity, dy ? hh / Math.abs(dy) : Infinity);
  return [n.x + dx * s, n.y + dy * s];
}

function edgePoints(e: FEdge, byId: Record<string, FNode>): Pt[] {
  const a = byId[e.from];
  const b = byId[e.to];
  const via = e.via ?? [];
  const first = via[0] ?? [b.x, b.y];
  const last = via[via.length - 1] ?? [a.x, a.y];
  return [e.start ?? anchor(a, first), ...via, e.end ?? anchor(b, last)];
}

function along(pts: Pt[], t: number): Pt {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = seg.reduce((x, y) => x + y, 0);
  let d = t * total;
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i] || i === seg.length - 1) {
      const u = seg[i] ? Math.min(d / seg[i], 1) : 1;
      return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u];
    }
    d -= seg[i];
  }
  return pts[pts.length - 1];
}

/** A packet that runs once along a polyline when mounted. */
function Packet({ pts, ms = 520, tone }: { pts: Pt[]; ms?: number; tone: "signal" | "pass" | "fail" }) {
  const ref = useRef<SVGRectElement>(null);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const u = Math.min((t - t0) / ms, 1);
      const e = 1 - Math.pow(1 - u, 2);
      const [x, y] = along(pts, e);
      ref.current?.setAttribute("x", String(x - 3.5));
      ref.current?.setAttribute("y", String(y - 3.5));
      if (u < 1) raf = requestAnimationFrame(tick);
      else ref.current?.setAttribute("opacity", "0");
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pts, ms]);
  return <rect ref={ref} width={7} height={7} x={pts[0][0] - 3.5} y={pts[0][1] - 3.5} fill={tone === "pass" ? "var(--pass)" : "var(--signal)"} />;
}

export function Flow({ id, spec, interval = 1500 }: { id: ProjectId; spec: FlowSpec; interval?: number }) {
  const uid = useId().replace(/:/g, "");
  const reduce = useReducedMotion();
  const [i, setI] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const byId = useMemo(() => Object.fromEntries(spec.nodes.map((n) => [n.id, n])), [spec.nodes]);
  const n = spec.steps.length;

  const play = useCallback(() => {
    setI(0);
    setPlaying(true);
  }, []);

  useEffect(() => {
    if (!playing) return;
    if (i >= n - 1) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- end of the run
      setPlaying(false);
      return;
    }
    const t = window.setTimeout(() => setI((x) => x + 1), interval);
    return () => clearTimeout(t);
  }, [playing, i, n, interval]);

  useFirstView(box, () => {
    if (!reduce) play();
  });
  useRunSignal(id, play);

  const step = spec.steps[i];
  const payload = [...spec.steps.slice(0, i + 1)].reverse().find((s) => s.payload)?.payload;
  const prev = spec.steps[i - 1];
  const active = new Set(ids(step));
  const seen = new Set(spec.steps.slice(0, i + 1).flatMap(ids));
  const prevIds = new Set(ids(prev));

  // the edge(s) the packet travels this step
  const moving = useMemo(
    () => (i > 0 ? spec.edges.map((e, k) => ({ e, k })).filter(({ e }) => prevIds.has(e.from) && active.has(e.to)) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i, spec.edges],
  );
  const litEdges = new Set(
    spec.edges
      .map((e, k) => ({ e, k }))
      .filter(({ e }) => seen.has(e.from) && seen.has(e.to))
      .map(({ k }) => k),
  );

  return (
    <div ref={box} className="border border-line bg-ink-1">
      {/* desktop / tablet: the diagram */}
      <div className="hidden overflow-hidden px-3 pt-4 sm:block">
        <svg viewBox={`0 0 ${spec.w} ${spec.h}`} className="h-auto w-full" role="img" aria-label={spec.steps.map((s) => s.note).join(" ")}>
          <defs>
            {(["main", "lit", "feedback", "reject"] as const).map((k) => (
              <marker key={k} id={`${uid}-${k}`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path
                  d="M0,0 L8,4 L0,8 z"
                  fill={k === "lit" ? "var(--paper-2)" : k === "feedback" ? "var(--pass)" : k === "reject" ? "var(--signal)" : "var(--line-3)"}
                />
              </marker>
            ))}
          </defs>

          {spec.edges.map((e, k) => {
            const pts = edgePoints(e, byId);
            const lit = litEdges.has(k);
            const mid = along(pts, 0.5);
            const marker = e.kind === "feedback" ? "feedback" : e.kind === "reject" ? "reject" : lit ? "lit" : "main";
            return (
              <g key={k}>
                <polyline
                  points={pts.map((p) => p.join(",")).join(" ")}
                  className={`d-edge ${e.kind === "feedback" ? "is-feedback" : ""} ${e.kind === "reject" ? "is-reject" : ""} ${lit ? "is-lit" : ""}`}
                  style={e.kind === "feedback" && lit ? { stroke: "var(--pass)" } : e.kind === "reject" && lit ? { stroke: "var(--signal)" } : undefined}
                  markerEnd={`url(#${uid}-${marker})`}
                />
                {e.label && (
                  <text x={mid[0]} y={mid[1] - 6} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" letterSpacing="0.06em" fill="var(--paper-3)">
                    {e.label.toUpperCase()}
                  </text>
                )}
              </g>
            );
          })}

          {spec.nodes.map((nd) => {
            const w = nd.w ?? 132;
            const h = nd.h ?? 40;
            const isActive = active.has(nd.id);
            const v = isActive ? step?.verdict : undefined;
            return (
              <g
                key={nd.id}
                transform={`translate(${nd.x - w / 2},${nd.y - h / 2})`}
                className={`d-node ${seen.has(nd.id) ? "is-seen" : ""} ${isActive ? "is-active" : ""} ${v === "pass" ? "is-pass" : ""}`}
              >
                <rect className="frame" width={w} height={h} strokeDasharray={nd.kind === "human" ? "3 3" : undefined} />
                {nd.kind === "store" && <line x1={0} x2={w} y1={h - 4} y2={h - 4} stroke="var(--line-2)" />}
                {nd.kind === "model" && <rect x={0} y={0} width={3} height={h} fill={isActive ? "var(--signal)" : "var(--line-3)"} />}
                {nd.kind && KIND_TAG[nd.kind] && (
                  <text x={0} y={-5} fontSize="8.5" letterSpacing="0.12em" fill="var(--paper-3)">
                    {KIND_TAG[nd.kind]}
                  </text>
                )}
                <text className="t" x={w / 2} y={nd.sub ? h / 2 - 2 : h / 2 + 4} textAnchor="middle" fontSize="11" letterSpacing="0.08em">
                  {nd.label.toUpperCase()}
                </text>
                {nd.sub && (
                  <text x={w / 2} y={h / 2 + 12} textAnchor="middle" fontSize="9.5" fill="var(--paper-3)">
                    {nd.sub}
                  </text>
                )}
                {v && (
                  <text x={w - 6} y={12} textAnchor="end" fontSize="11" style={{ fill: v === "pass" ? "var(--pass)" : "var(--signal)" }}>
                    {v === "pass" ? "✓" : "✕"}
                  </text>
                )}
              </g>
            );
          })}

          {!reduce && moving.map(({ e, k }) => <Packet key={`${i}-${k}`} pts={edgePoints(e, byId)} tone={e.kind === "feedback" ? "pass" : "signal"} />)}
        </svg>
      </div>

      {/* phone: the same loop as a rail */}
      <ol className="space-y-px px-4 pt-4 sm:hidden" aria-hidden>
        {spec.nodes.map((nd, k) => (
          <li
            key={nd.id}
            className={`mono flex min-w-0 items-baseline gap-3 border-l px-3 py-1.5 transition-colors ${
              active.has(nd.id) ? "border-signal text-paper" : seen.has(nd.id) ? "border-line-3 text-paper-2" : "border-line text-paper-3"
            }`}
          >
            <span className="w-5 text-paper-3">{String(k + 1).padStart(2, "0")}</span>
            <span className="shrink-0">{nd.label.toUpperCase()}</span>
            {nd.sub && <span className="min-w-0 truncate text-paper-3">{nd.sub}</span>}
          </li>
        ))}
      </ol>

      {/* readout */}
      <div className="mt-3 border-t border-line">
        <div className="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center">
          <p className="mono min-h-[3em] flex-1 text-paper-2 md:min-h-[1.5em]" aria-live="polite">
            <span className="mr-3 text-paper-3">{i < 0 ? "--" : String(i + 1).padStart(2, "0")}/{String(n).padStart(2, "0")}</span>
            {step ? (
              <span className={step.verdict === "fail" ? "text-signal" : step.verdict === "pass" ? "text-pass" : "text-paper"}>{step.note}</span>
            ) : (
              <span>{spec.idle ?? "Run the loop, or step through it."}</span>
            )}
          </p>
          <div className="flex shrink-0 gap-1">
            <button className="btn" onClick={play} aria-pressed={playing}>
              {playing ? "Running" : "Run"}
            </button>
            <button
              className="btn"
              onClick={() => {
                setPlaying(false);
                setI((x) => Math.min(x + 1, n - 1));
              }}
              disabled={i >= n - 1}
            >
              Step →
            </button>
            <button
              className="btn"
              onClick={() => {
                setPlaying(false);
                setI(-1);
              }}
              aria-label="Reset"
            >
              ↺
            </button>
          </div>
        </div>
        {spec.steps.some((s) => s.payload) && (
          <div className="min-h-[148px] border-t border-line bg-ink-0/60 px-4 py-3">{payload ?? <p className="label pt-1">Payload appears here as the loop runs</p>}</div>
        )}
        {spec.footnote && <p className="label border-t border-line px-4 py-2 !normal-case !tracking-[0.04em]">{spec.footnote}</p>}
      </div>
    </div>
  );
}

/** Monospace payload block used inside steps. */
export function Code({ children, tone }: { children: ReactNode; tone?: "signal" | "pass" | "dim" }) {
  return (
    <pre
      className={`mono overflow-x-auto whitespace-pre text-[12px] leading-[1.65] ${
        tone === "signal" ? "text-signal" : tone === "pass" ? "text-pass" : tone === "dim" ? "text-paper-3" : "text-paper"
      }`}
    >
      {children}
    </pre>
  );
}
