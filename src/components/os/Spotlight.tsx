"use client";

import { useState } from "react";
import { os, useOs } from "@/lib/os";
import { Icon } from "./Icon";
import { launch } from "./registry";
import { index, search } from "./search";

const SUGGESTED = ["projects", "project:mutagen", "project:voice", "skill:rag", "mail"];

export function Spotlight() {
  const on = useOs((s) => s.spotlight);
  if (!on) return null;
  return <Panel />;
}

function Panel() {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const hits = q.trim() ? search(q) : SUGGESTED.map((k) => index.find((h) => h.key === k)!);

  const key = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setSel((s) => (s + (e.key === "ArrowDown" ? 1 : -1) + hits.length) % Math.max(hits.length, 1));
    } else if (e.key === "Enter" && hits[sel]) {
      launch(hits[sel].key);
    } else if (e.key === "Escape") {
      os.spotlight(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9000]" onClick={() => os.spotlight(false)}>
      <div role="dialog" aria-label="Search" className="spotlight" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4">
          <svg viewBox="0 0 16 16" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 text-[var(--fg-3)]">
            <circle cx="7" cy="7" r="4.6" />
            <path d="M10.5 10.5L14 14" strokeLinecap="round" />
          </svg>
          <input
            autoFocus
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSel(0);
            }}
            onKeyDown={key}
            placeholder="Search projects, skills, apps"
            aria-label="Search projects, skills, apps"
            className="h-14 min-w-0 flex-1 bg-transparent text-[20px] outline-none placeholder:text-[var(--fg-3)]"
          />
        </div>
        {hits.length > 0 && (
          <ul className="max-h-[50vh] overflow-y-auto border-t border-[var(--sep)] p-1.5" role="listbox">
            {!q.trim() && <li className="px-3 pt-1 pb-1.5 text-[11px] font-semibold text-[var(--fg-3)]">Suggestions</li>}
            {hits.map((h, i) => (
              <li key={h.key} role="option" aria-selected={i === sel}>
                <button
                  onPointerEnter={() => setSel(i)}
                  onClick={() => launch(h.key)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left ${i === sel ? "bg-[var(--accent)] text-white" : ""}`}
                >
                  <Icon spec={h.meta.icon} size={28} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-medium">{h.name}</span>
                    <span className={`block truncate text-[12px] ${i === sel ? "text-white/80" : "text-[var(--fg-3)]"}`}>{h.sub}</span>
                  </span>
                  <span className={`text-[11px] ${i === sel ? "text-white/80" : "text-[var(--fg-3)]"}`}>{h.kind}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {q.trim() && !hits.length && <p className="border-t border-[var(--sep)] px-4 py-4 text-[14px] text-[var(--fg-3)]">No results for “{q}”.</p>}
      </div>
    </div>
  );
}
