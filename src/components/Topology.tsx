"use client";

import { useState } from "react";
import { projectById, projects, short, topology, type ProjectId } from "@/content/data";
import { GoButton } from "./GoButton";

/**
 * Skills as relationships: every leaf points at the systems that evidence it.
 * Hover a skill to light its systems; hover a system to light its skills.
 */
export function Topology() {
  const [skill, setSkill] = useState<string | null>(null);
  const [sys, setSys] = useState<ProjectId | null>(null);

  const litSystems = new Set<ProjectId>(skill ? topology.flatMap((g) => g.leaves).find((l) => l.name === skill)?.used ?? [] : sys ? [sys] : []);

  return (
    <section id="topology" data-zone="rest" aria-labelledby="topo-h" className="px-[var(--gutter)] pt-24 md:pt-40">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="label">06 · Topology</p>
            <h2 id="topo-h" className="display mt-4 text-[clamp(56px,9vw,140px)]">
              Stack
            </h2>
          </div>
          <p className="max-w-[44ch] self-end text-[17px] leading-relaxed text-paper-2 lg:col-span-4 lg:col-start-9">
            No proficiency bars. Each skill links to the systems where it was actually used. Hover either side.
          </p>
        </div>

        {/* systems bus */}
        <div className="mt-12 flex flex-wrap gap-1 border-t border-line-2 pt-4" onMouseLeave={() => setSys(null)}>
          {projects.map((p) => (
            <GoButton
              key={p.id}
              to={p.id}
              className={`chip transition-colors ${litSystems.has(p.id) ? "!border-signal !text-paper" : "hover:text-paper"}`}
            >
              <span onMouseEnter={() => setSys(p.id)} onFocus={() => setSys(p.id)}>
                <span className="mr-2 text-paper-3">{p.code}</span>
                {short[p.id]}
              </span>
            </GoButton>
          ))}
        </div>

        <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3" onMouseLeave={() => setSkill(null)}>
          {topology.map((g) => (
            <div key={g.group} className="min-w-0">
              <h3 className="mono text-[13px] uppercase tracking-[0.12em] text-paper">{g.group}</h3>
              <ul className="mono mt-2 text-[13px]">
                {g.leaves.map((l, i) => {
                  const on = skill === l.name || (sys !== null && l.used.includes(sys));
                  return (
                    <li
                      key={l.name}
                      tabIndex={0}
                      onMouseEnter={() => setSkill(l.name)}
                      onFocus={() => setSkill(l.name)}
                      onBlur={() => setSkill(null)}
                      className={`flex cursor-default items-baseline gap-2 py-1 outline-none transition-colors ${on ? "text-paper" : "text-paper-2"}`}
                    >
                      <span className="text-paper-3">{i === g.leaves.length - 1 ? "└──" : "├──"}</span>
                      <span className={`shrink-0 ${on ? "text-signal" : ""}`}>{l.name}</span>
                      <span className="ml-auto min-w-0 truncate pl-2 text-[11px] text-paper-3">
                        {l.used.length ? l.used.map((u) => projectById[u].code).join(" ") : "resume"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        <p className="label mt-8 !normal-case !tracking-[0.04em]">
          “resume” = listed on the resume, not shown in a system on this site.
        </p>
      </div>
    </section>
  );
}
