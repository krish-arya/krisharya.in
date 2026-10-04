"use client";

import { useState } from "react";
import { projectById, type Block, type ProjectId } from "@/content/data";
import { useSystem, type Depth } from "@/lib/store";
import { Diagram } from "./diagrams/Diagram";

const LEVELS = ["What", "How", "Why", "Build"] as const;

function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) =>
        typeof b === "string" ? (
          <p key={i}>{b}</p>
        ) : (
          <ul key={i} className="mt-1 space-y-1.5">
            {b.list.map((li) => (
              <li key={li} className="flex gap-3">
                <span className="mono mt-[3px] text-paper-3">—</span>
                <span>{li}</span>
              </li>
            ))}
          </ul>
        ),
      )}
    </>
  );
}

export function Project({ id, wide = false }: { id: ProjectId; wide?: boolean }) {
  const p = projectById[id];
  const global = useSystem((s) => s.depth);
  const [local, setLocal] = useState<Depth>(global);
  const [seenGlobal, setSeenGlobal] = useState<Depth>(global);
  if (seenGlobal !== global) {
    setSeenGlobal(global);
    setLocal(global);
  }

  const text = (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="mono text-signal">{p.code}</span>
        {p.meta.map((m) => (
          <span key={m} className="mono text-paper-3">
            {m}
          </span>
        ))}
      </div>
      <h3 id={`${p.id}-h`} className="display mt-5 text-[clamp(40px,5vw,72px)]">{p.title}</h3>
      <p className="mt-4 max-w-[46ch] text-[19px] leading-snug text-paper">{p.kicker}</p>

      {p.status && <p className="mono mt-4 border-l border-signal pl-3 text-paper-2">{p.status}</p>}
      {p.authors && <p className="mono mt-3 text-paper-3">{p.authors}</p>}
      {p.venue &&
        (p.venue.href ? (
          <a href={p.venue.href} target="_blank" rel="noreferrer" className="mono mt-1 inline-block text-paper-2 underline decoration-line-3 underline-offset-4 hover:text-paper">
            {p.venue.label} ↗
          </a>
        ) : (
          <p className="serif mt-2 max-w-[52ch] text-[18px] leading-snug text-paper-2">“{p.venue.label}”</p>
        ))}

      {/* progressive disclosure */}
      <div className="mt-8">
        <div role="tablist" aria-label={`${p.title} detail level`} className="flex border-b border-line">
          {LEVELS.map((name, i) => {
            const d = (i + 1) as Depth;
            return (
              <button
                key={name}
                role="tab"
                aria-selected={local === d}
                onClick={() => setLocal(d)}
                className={`mono -mb-px flex h-9 items-center gap-2 border-b px-3 transition-colors ${
                  local === d ? "border-signal text-paper" : local > d ? "border-line-3 text-paper-2" : "border-transparent text-paper-3 hover:text-paper-2"
                }`}
              >
                <span className={local >= d ? "text-signal" : ""}>L{d}</span>
                {name.toUpperCase()}
              </button>
            );
          })}
        </div>
        <div role="tabpanel" className="space-y-5 pt-5">
          {p.levels.slice(0, local).map((blocks, i) => (
            <div key={i} className="grid grid-cols-[3.5ch_1fr] gap-3">
              <span className="mono pt-[3px] text-paper-3">L{i + 1}</span>
              <div className={`prose-sys max-w-[60ch] text-[16px] leading-relaxed ${i === local - 1 ? "text-paper" : "text-paper-2"}`}>
                <Blocks blocks={blocks} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const facts = (
    <>
      {p.metrics.length > 0 && (
        <dl className="mt-10 grid grid-cols-2 border-t border-l border-line sm:grid-cols-3">
          {p.metrics.map((m) => (
            <div key={m.label} className="flex flex-col border-r border-b border-line px-4 py-3">
              <dt className="label order-2 mt-1">{m.label}</dt>
              <dd className="display text-[clamp(28px,3vw,40px)] leading-none normal-case">{m.value}</dd>
            </div>
          ))}
        </dl>
      )}
      <ul className="mt-5 flex flex-wrap gap-1" aria-label="Stack">
        {p.stack.map((s) => (
          <li key={s} className="chip">
            {s}
          </li>
        ))}
      </ul>
    </>
  );

  return (
    <article id={p.id} data-project={p.id} aria-labelledby={`${p.id}-h`} className="scroll-mt-[calc(var(--rail-h)+24px)] border-t border-line py-16 md:py-24">
      {wide ? (
        <>
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="min-w-0 lg:col-span-6">{text}</div>
            <div className="lg:col-span-5 lg:col-start-8 lg:pt-14">{facts}</div>
          </div>
          <div className="mt-12">
            <Diagram id={p.id} />
          </div>
        </>
      ) : (
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-5">
            {text}
            {facts}
          </div>
          <div className="min-w-0 lg:sticky lg:top-[calc(var(--rail-h)+32px)] lg:col-span-7 lg:self-start">
            <Diagram id={p.id} />
          </div>
        </div>
      )}
    </article>
  );
}
