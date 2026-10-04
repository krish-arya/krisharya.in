"use client";

import { worlds } from "@/content/data";
import { goTo, system, useSystem, type Depth } from "@/lib/store";

const DEPTHS: { d: Depth; hint: string }[] = [
  { d: 1, hint: "What it is" },
  { d: 2, hint: "How it works" },
  { d: 3, hint: "Why it's built that way" },
  { d: 4, hint: "Implementation" },
];

export function Rail() {
  const zone = useSystem((s) => s.zone);
  const depth = useSystem((s) => s.depth);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-ink-0/85 backdrop-blur-[2px]">
      <div className="flex h-[var(--rail-h)] items-center gap-6 px-[var(--gutter)]">
        <a href="#top" onClick={(e) => (e.preventDefault(), goTo("top"))} className="mono shrink-0 text-paper">
          KRISH ARYA <span className="text-paper-3">— SYSTEM</span>
        </a>

        <nav aria-label="Worlds" className="hidden flex-1 justify-center lg:flex">
          <ul className="flex gap-1">
            {worlds.map((w) => (
              <li key={w.id}>
                <a
                  href={`#${w.id}`}
                  onClick={(e) => (e.preventDefault(), goTo(w.id))}
                  aria-current={zone === w.id ? "true" : undefined}
                  className={`mono flex h-8 items-center gap-2 px-3 transition-colors ${
                    zone === w.id ? "text-paper" : "text-paper-3 hover:text-paper-2"
                  }`}
                >
                  <span className={zone === w.id ? "text-signal" : ""}>{w.n}</span>
                  {w.name.toUpperCase()}
                </a>
              </li>
            ))}
            <li>
              <a href="#log" onClick={(e) => (e.preventDefault(), goTo("log"))} className="mono flex h-8 items-center px-3 text-paper-3 hover:text-paper-2">
                LOG
              </a>
            </li>
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-3 lg:ml-0">
          <div role="radiogroup" aria-label="Detail depth" className="hidden items-center gap-2 md:flex">
            <span className="label">Depth</span>
            <div className="flex border border-line">
              {DEPTHS.map(({ d, hint }) => (
                <button
                  key={d}
                  role="radio"
                  aria-checked={depth === d}
                  title={`L${d} · ${hint}`}
                  onClick={() => system.set({ depth: d })}
                  className={`mono h-7 w-7 transition-colors ${
                    depth >= d ? "bg-paper/[.07] text-paper" : "text-paper-3 hover:text-paper-2"
                  } ${depth === d ? "!text-signal" : ""}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <a
            href="#transmission"
            onClick={(e) => (e.preventDefault(), goTo("transmission"))}
            className="mono hidden h-8 items-center border border-line-2 px-3 text-paper hover:border-paper-2 sm:flex"
          >
            CONTACT
          </a>
        </div>
      </div>
    </header>
  );
}
