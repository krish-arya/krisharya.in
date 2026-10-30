"use client";

import { projectById } from "@/content/data";
import { skillBySlug, skills } from "@/content/skills";
import { Icon } from "../Icon";
import { launch, projectIcon, resolve } from "../registry";
import { Section } from "../ui";

export function SkillApp({ slug }: { slug: string }) {
  const s = skillBySlug[slug];
  const siblings = skills.filter((x) => x.group === s.group && x.slug !== slug);

  return (
    <div className="h-full overflow-y-auto px-6 pt-6 pb-10">
      <div className="flex flex-col items-center text-center">
        <Icon spec={resolve(`skill:${slug}`)!.icon} size={88} />
        <h1 className="mt-4 text-[22px] font-semibold tracking-tight">{s.name}</h1>
        <p className="mt-1 text-[13px] text-[var(--fg-3)]">
          {s.group} · {s.used.length ? `used in ${s.used.length} system${s.used.length > 1 ? "s" : ""}` : "in the toolkit"}
        </p>
      </div>

      <Section title="Where it's used">
        {s.used.length ? (
          <ul className="group-list">
            {s.used.map((id) => {
              const p = projectById[id];
              return (
                <li key={id}>
                  <button onClick={() => launch(`project:${id}`)} className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-[var(--hover)]">
                    <Icon spec={projectIcon(id)} size={30} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-medium">{p.title}</span>
                      <span className="block truncate text-[12px] text-[var(--fg-3)]">{p.kicker}</span>
                    </span>
                    <span className="text-[var(--fg-3)]">›</span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-[14px] text-[var(--fg-2)]">Part of the working toolkit, not tied to one of the featured systems here.</p>
        )}
      </Section>

      {siblings.length > 0 && (
        <Section title={`More in ${s.group}`}>
          <div className="flex flex-wrap gap-4">
            {siblings.map((x) => (
              <button key={x.slug} onClick={() => launch(`skill:${x.slug}`)} className="group flex w-[68px] flex-col items-center gap-1.5">
                <Icon spec={resolve(`skill:${x.slug}`)!.icon} size={44} className="transition-transform group-hover:scale-105" />
                <span className="line-clamp-2 text-center text-[11px] leading-tight text-[var(--fg-2)]">{x.name}</span>
              </button>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
