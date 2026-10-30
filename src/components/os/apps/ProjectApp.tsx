"use client";

import { useState } from "react";
import { projectById, worlds, type ProjectId } from "@/content/data";
import { skillsFor } from "@/content/skills";
import { Diagram } from "@/components/diagrams/Diagram";
import { Icon } from "../Icon";
import { launch, resolve } from "../registry";
import { Blocks, Section, Segmented, Stats, Tag } from "../ui";

const LEVELS = ["What", "How", "Why", "Build"];

export function ProjectApp({ id }: { id: ProjectId }) {
  const p = projectById[id];
  const [level, setLevel] = useState(0);
  const world = worlds.find((w) => w.id === p.world)!;
  const skills = skillsFor(id);

  return (
    <div className="h-full overflow-y-auto">
      <article className="mx-auto max-w-[720px] px-6 pt-6 pb-12 md:px-10">
        <p className="text-[12px] font-medium text-[var(--fg-3)]">
          {world.name} · {p.code}
        </p>
        <h1 className="mt-1 text-[28px] leading-tight font-semibold tracking-tight">{p.title}</h1>
        <p className="mt-2 text-[17px] leading-snug text-[var(--fg-2)]">{p.kicker}</p>
        <p className="mt-3 text-[13px] text-[var(--fg-3)]">{p.meta.join("  ·  ")}</p>

        {p.status && <p className="callout mt-4">{p.status}</p>}
        {p.authors && <p className="mt-3 text-[13px] text-[var(--fg-3)]">{p.authors}</p>}
        {p.venue &&
          (p.venue.href ? (
            <a href={p.venue.href} target="_blank" rel="noreferrer" className="mt-1 block text-[13px] text-[var(--accent)] hover:underline">
              {p.venue.label} ↗
            </a>
          ) : (
            <p className="mt-1 text-[13px] text-[var(--fg-2)] italic">{p.venue.label}</p>
          ))}

        {p.metrics.length > 0 && (
          <div className="mt-6">
            <Stats items={p.metrics} />
          </div>
        )}

        <div className="mt-8">
          <Segmented label="Detail level" value={level} onChange={setLevel} options={LEVELS.map((l, i) => ({ v: i, l }))} />
          <div className="mt-4 min-h-[96px]">
            <Blocks blocks={p.levels[level]} />
          </div>
        </div>

        <Section title="Architecture">
          <div className="canvas">
            <Diagram id={id} />
          </div>
        </Section>

        {skills.length > 0 && (
          <Section title="Skills used">
            <div className="flex flex-wrap gap-4">
              {skills.map((s) => (
                <button key={s.slug} onClick={() => launch(`skill:${s.slug}`)} className="group flex w-[68px] flex-col items-center gap-1.5">
                  <Icon spec={resolve(`skill:${s.slug}`)!.icon} size={44} className="transition-transform group-hover:scale-105" />
                  <span className="line-clamp-2 text-center text-[11px] leading-tight text-[var(--fg-2)]">{s.name}</span>
                </button>
              ))}
            </div>
          </Section>
        )}

        <Section title="Stack">
          <div className="flex flex-wrap gap-1.5">
            {p.stack.map((s) => (
              <Tag key={s}>{s}</Tag>
            ))}
          </div>
        </Section>
      </article>
    </div>
  );
}
