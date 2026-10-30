"use client";

import { person, processes } from "@/content/data";
import { HEADLINES } from "./apps/AboutApp";
import { Icon } from "./Icon";
import { DOCK, launch, resolve } from "./registry";

const DOT: Record<string, string> = { prod: "#34c759", live: "#34c759", deploying: "#ff9f0a", building: "#ff9f0a", shipped: "rgba(127,127,127,.6)" };

/** Desktop widgets: who, what's measurable, what's running. */
export function Widgets() {
  return (
    <div className="widgets">
      <div className="widget">
        <p className="text-[12px] font-medium text-[var(--fg-3)]">{person.roles.join(" · ")}</p>
        <p className="mt-1 text-[26px] leading-[1.1] font-semibold tracking-tight">{person.name}</p>
        <p className="mt-2 text-[14px] leading-snug text-[var(--fg-2)]">I build intelligent systems that check their own work.</p>
        <p className="mt-3 text-[12px] text-[var(--fg-3)]">{person.location}</p>
      </div>

      <div className="widget grid grid-cols-2 gap-x-4 gap-y-3">
        {HEADLINES.map((h) => (
          <button key={h.id} onClick={() => launch(`project:${h.id}`)} className="text-left">
            <span className="block text-[22px] font-semibold tracking-tight">{h.value}</span>
            <span className="block text-[11px] leading-tight text-[var(--fg-3)]">{h.label}</span>
          </button>
        ))}
      </div>

      <div className="widget">
        <p className="mb-2 text-[12px] font-semibold text-[var(--fg-3)]">Running now</p>
        <ul className="space-y-1">
          {processes.slice(0, 5).map((p) => (
            <li key={p.id}>
              <button onClick={() => launch(`project:${p.id}`)} className="flex w-full items-center gap-2 text-left text-[13px] hover:opacity-70">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: DOT[p.stat] }} />
                <span className="min-w-0 flex-1 truncate font-mono text-[12px]">{p.name}</span>
                <span className="text-[11px] text-[var(--fg-3)]">{p.stat}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Phones get a home screen instead of a free-form desktop. */
export function HomeGrid() {
  return (
    <div className="home-grid">
      {DOCK.map((k) => (
        <button key={k} onClick={() => launch(k)} className="flex flex-col items-center gap-1.5">
          <Icon spec={resolve(k)!.icon} size={58} />
          <span className="text-[11px] text-[var(--fg)] dark:drop-shadow">{resolve(k)!.name}</span>
        </button>
      ))}
    </div>
  );
}
