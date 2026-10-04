"use client";

import { useState } from "react";
import { useRunSignal } from "./hooks";

const STAGES = ["Codebase", "Mira", "Findings", "Engineer", "Accept / ignore", "Workflow"];

const FINDINGS = [
  { f: "Possible None returned from get_fare() is dereferenced", t: "edge case", useful: true },
  { f: "Trailing whitespace on line 212", t: "nit", useful: false },
  { f: "HTTP call to pricing service has no timeout", t: "reliability", useful: true },
  { f: "Prefer f-string over .format()", t: "style", useful: false },
  { f: "bookingId and booking_id used for the same field", t: "inconsistency", useful: true },
  { f: "Consider renaming variable `x`", t: "nit", useful: false },
];

type Verdict = "accept" | "ignore";

export function MiraBench() {
  const [v, setV] = useState<Record<number, Verdict>>({});
  useRunSignal("mira", () => setV({}));

  const decided = Object.keys(v).length;
  const accepted = Object.values(v).filter((x) => x === "accept").length;
  const stage = decided === 0 ? 2 : decided < FINDINGS.length ? 3 : 5;
  const ratio = decided ? accepted / decided : 0;

  return (
    <div className="border border-line bg-ink-1">
      {/* the loop, as a strip */}
      <ol className="flex flex-wrap border-b border-line" aria-label="Review loop">
        {STAGES.map((s, i) => (
          <li
            key={s}
            className={`mono flex items-center gap-2 border-r border-line px-3 py-2.5 text-[11px] uppercase tracking-[0.08em] ${
              i === stage ? "text-signal" : i < stage ? "text-paper" : "text-paper-3"
            }`}
          >
            <span className="text-paper-3">{String(i + 1).padStart(2, "0")}</span>
            {s}
          </li>
        ))}
      </ol>

      <div className="grid md:grid-cols-[1fr_220px]">
        <ul className="divide-y divide-line">
          {FINDINGS.map((x, i) => (
            <li key={i} className={`flex flex-wrap items-center gap-3 px-4 py-2.5 ${v[i] === "ignore" ? "opacity-40" : ""}`}>
              <span className="chip w-[11ch] justify-center">{x.t}</span>
              <span className={`min-w-0 flex-1 text-[14px] ${v[i] === "accept" ? "text-pass" : "text-paper"}`}>{x.f}</span>
              <span className="flex gap-1">
                <button className={`btn h-7 px-2 ${v[i] === "accept" ? "is-on" : ""}`} onClick={() => setV({ ...v, [i]: "accept" })} aria-pressed={v[i] === "accept"}>
                  Accept
                </button>
                <button className={`btn h-7 px-2 ${v[i] === "ignore" ? "is-on" : ""}`} onClick={() => setV({ ...v, [i]: "ignore" })} aria-pressed={v[i] === "ignore"}>
                  Ignore
                </button>
              </span>
            </li>
          ))}
        </ul>
        <div className="border-t border-line p-4 md:border-t-0 md:border-l">
          <p className="label">Signal</p>
          <p className="display mt-1 text-[44px] leading-none">{decided ? `${Math.round(ratio * 100)}%` : "—"}</p>
          <p className="mono mt-1 text-paper-3">
            {accepted} accepted / {decided} reviewed
          </p>
          <div className="mt-3 h-1 bg-line">
            <div className="h-full bg-pass transition-[width] duration-300" style={{ width: `${ratio * 100}%` }} />
          </div>
          <p className="mt-4 text-[14px] leading-snug text-paper-2" aria-live="polite">
            {decided < 3
              ? "Triage the findings the way an engineer would."
              : ratio < 0.5
                ? "Mostly noise. This is how developers learn to skip every finding, including the real ones."
                : "Useful findings outweigh noise. The human reviewer can spend their time on design."}
          </p>
        </div>
      </div>
      <p className="label border-t border-line px-4 py-2 !normal-case !tracking-[0.04em]">
        Simulation with example findings, to show why review quality beats issue count. Not pilot data.
      </p>
    </div>
  );
}
