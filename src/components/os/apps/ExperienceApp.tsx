"use client";

import { useState } from "react";
import { experience, person } from "@/content/data";
import { launch } from "../registry";
import { SideHead, SideItem, Split } from "../ui";

export function ExperienceApp() {
  const [i, setI] = useState(0);
  const e = experience[i];

  return (
    <Split
      side={
        <nav className="flex gap-1 p-2 md:block md:space-y-px">
          <SideHead>Roles</SideHead>
          {experience.map((x, n) => (
            <SideItem key={x.org} on={n === i} onClick={() => setI(n)}>
              <span className="block">{x.org}</span>
              <span className="hidden text-[11px] opacity-70 md:block">{x.span}</span>
            </SideItem>
          ))}
          <div className="hidden px-3 pt-6 text-[12px] leading-relaxed text-[var(--fg-3)] md:block">
            <p className="font-semibold">Education</p>
            <p>{person.education.degree}</p>
            <p>MSIT · {person.education.years}</p>
            <p>CGPA {person.education.cgpa}</p>
          </div>
        </nav>
      }
    >
      <div className="mx-auto max-w-[640px] px-6 pt-6 pb-10">
        <p className="text-[12px] font-medium text-[var(--fg-3)]">
          {e.span} · {e.place}
        </p>
        <h1 className="mt-1 text-[26px] font-semibold tracking-tight">{e.org}</h1>
        <p className="text-[16px] text-[var(--fg-2)]">{e.role}</p>

        <ul className="group-list mt-6">
          {e.entries.map((x) => (
            <li key={x.label}>
              <div className="flex items-center gap-4 px-4 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-medium text-[var(--fg-3)]">{x.label}</p>
                  <p className="text-[20px] font-semibold tracking-tight">{x.value}</p>
                  <p className="text-[13px] text-[var(--fg-2)]">{x.detail}</p>
                </div>
                {x.project && (
                  <button onClick={() => launch(`project:${x.project}`)} className="pill shrink-0">
                    Open
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Split>
  );
}
