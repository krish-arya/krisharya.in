"use client";

import { useState } from "react";
import { projects, type ProjectId } from "@/content/data";
import { launch } from "../registry";
import { Blocks, SideHead, SideItem, Split, Stats } from "../ui";

const papers = projects.filter((p) => p.world === "research");

export function PapersApp() {
  const [id, setId] = useState<ProjectId>(papers[0].id);
  const p = papers.find((x) => x.id === id)!;

  return (
    <Split
      side={
        <nav className="flex gap-1 p-2 md:block md:space-y-px">
          <SideHead>Library</SideHead>
          {papers.map((x) => (
            <SideItem key={x.id} on={x.id === id} onClick={() => setId(x.id)}>
              <span className="block truncate">{x.title}</span>
              <span className="hidden truncate text-[11px] opacity-70 md:block">{x.meta[0]}</span>
            </SideItem>
          ))}
        </nav>
      }
    >
      <article className="mx-auto max-w-[620px] px-6 pt-8 pb-12">
        <p className="text-[12px] font-medium tracking-wide text-[var(--fg-3)] uppercase">{p.meta.join(" · ")}</p>
        <h1 className="mt-2 font-serif text-[30px] leading-tight">{p.title}</h1>
        {p.authors && <p className="mt-3 text-[13px] text-[var(--fg-2)]">{p.authors}</p>}
        {p.venue &&
          (p.venue.href ? (
            <a href={p.venue.href} target="_blank" rel="noreferrer" className="mt-1 block text-[13px] text-[var(--accent)] hover:underline">
              {p.venue.label} ↗
            </a>
          ) : (
            <p className="mt-1 text-[13px] text-[var(--fg-3)] italic">{p.venue.label}</p>
          ))}

        <h2 className="mt-8 text-[13px] font-semibold text-[var(--fg-3)]">Abstract</h2>
        <div className="mt-2">
          <Blocks blocks={[...p.levels[0], ...p.levels[1]]} />
        </div>

        {p.metrics.length > 0 && (
          <>
            <h2 className="mt-8 mb-3 text-[13px] font-semibold text-[var(--fg-3)]">Results</h2>
            <Stats items={p.metrics} />
          </>
        )}

        <button onClick={() => launch(`project:${p.id}`)} className="pill pill-primary mt-8">
          Open full record and diagram
        </button>
      </article>
    </Split>
  );
}
