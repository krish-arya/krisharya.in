"use client";

import { useState } from "react";
import { topology } from "@/content/data";
import { skills } from "@/content/skills";
import { os, useOs } from "@/lib/os";
import { Icon } from "./Icon";
import { launch, resolve } from "./registry";

/** Every skill is an app. Launchpad shows them all, grouped by discipline. */
export function Launchpad() {
  const on = useOs((s) => s.launchpad);
  const [q, setQ] = useState("");
  if (!on) return null;

  const n = q.trim().toLowerCase();
  const shown = n ? skills.filter((s) => s.name.toLowerCase().includes(n) || s.group.toLowerCase().includes(n)) : skills;
  const dismiss = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) os.launchpad(false);
  };

  return (
    <div role="dialog" aria-label="Skills" className="launchpad" onClick={dismiss}>
      <button onClick={() => os.launchpad(false)} className="fixed top-[calc(var(--menu-h)+10px)] right-4 rounded-full bg-white/20 px-3 py-1 text-[13px] font-medium text-white">
        Done
      </button>
      <div className="mx-auto flex w-full max-w-[1000px] flex-col items-center px-4 pt-10 pb-32" onClick={dismiss}>
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search skills" aria-label="Search skills" className="lp-search" />
        <p className="mt-3 text-center text-[13px] text-white/75">{skills.length} skills, each one an app. Open one to see where it&apos;s used.</p>

        {topology.map((g) => {
          const list = shown.filter((s) => s.group === g.group);
          if (!list.length) return null;
          return (
            <section key={g.group} className="mt-10 w-full" onClick={dismiss}>
              <h2 className="mb-4 text-center text-[13px] font-semibold tracking-wide text-white/85">{g.group}</h2>
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-6" onClick={dismiss}>
                {list.map((s) => (
                  <button key={s.slug} onClick={() => launch(`skill:${s.slug}`)} className="lp-app group">
                    <Icon spec={resolve(`skill:${s.slug}`)!.icon} size={64} className="transition-transform group-hover:scale-[1.06] group-active:scale-95" />
                    <span className="mt-2 line-clamp-2 text-center text-[12px] leading-tight text-white">{s.name}</span>
                  </button>
                ))}
              </div>
            </section>
          );
        })}
        {!shown.length && <p className="mt-16 text-white/80">No skill matches “{q}”.</p>}
      </div>
    </div>
  );
}
