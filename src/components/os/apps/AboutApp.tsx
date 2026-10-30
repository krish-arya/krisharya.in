"use client";

import { person } from "@/content/data";
import { launch } from "../registry";
import { Stats } from "../ui";

const SPECS: [string, string][] = [
  ["Now", "Technology Trainee (AI/ML), EaseMyTrip"],
  ["Location", person.location],
  ["Education", `${person.education.degree}, MSIT · ${person.education.years}`],
  ["Pattern", "generate → verify → feed back"],
];

export const HEADLINES = [
  { value: "<200ms", label: "Voice agent, end to end", id: "voice" },
  { value: "50K+", label: "Conversations scored", id: "eval" },
  { value: "92%", label: "Spider accuracy, published", id: "nl2sql" },
  { value: "1,000+", label: "Users in week one", id: "folio" },
] as const;

export function AboutApp() {
  return (
    <div className="h-full overflow-y-auto px-6 pt-4 pb-8 md:px-10">
      <div className="flex flex-col items-center text-center">
        <div className="avatar">KA</div>
        <h1 className="mt-4 text-[26px] font-semibold tracking-tight">{person.name}</h1>
        <p className="text-[14px] text-[var(--fg-3)]">{person.roles.join(" · ")}</p>
        <p className="mt-3 max-w-[40ch] text-[15px] leading-relaxed text-[var(--fg-2)]">
          I build intelligent systems. Production voice, retrieval and evaluation at EaseMyTrip, a product shipped alone at Tov AI, and published research on
          systems that correct themselves.
        </p>
      </div>

      <dl className="mx-auto mt-6 max-w-[420px] space-y-1.5 text-[13px]">
        {SPECS.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[88px_1fr] gap-3">
            <dt className="text-right font-medium text-[var(--fg)]">{k}</dt>
            <dd className="text-[var(--fg-2)]">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6">
        <Stats items={HEADLINES.map((h) => ({ ...h, onClick: () => launch(`project:${h.id}`) }))} />
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button onClick={() => launch("projects")} className="pill pill-primary">
          View projects
        </button>
        <button onClick={() => launch("mail")} className="pill">
          Contact
        </button>
      </div>
    </div>
  );
}
