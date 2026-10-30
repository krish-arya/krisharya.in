"use client";

import { useState, type ReactNode } from "react";
import { loops, processes } from "@/content/data";
import { launch } from "../registry";
import { SideItem, Split } from "../ui";

const DOT: Record<string, string> = {
  prod: "bg-[#34c759]",
  live: "bg-[#34c759]",
  deploying: "bg-[#ff9f0a]",
  building: "bg-[#ff9f0a]",
  shipped: "bg-[var(--fg-3)]",
};

const NOTES: { title: string; preview: string; body: ReactNode }[] = [
  {
    title: "The pattern",
    preview: "generate → verify → feed back",
    body: (
      <>
        <p>
          Nearly every system I build has the same shape: <b>generate</b>, <b>verify against something real</b>, <b>feed the result back</b>.
        </p>
        <table className="mt-5 w-full text-left text-[13px]">
          <thead className="text-[11px] text-[var(--fg-3)]">
            <tr>
              <th className="py-1.5 pr-3 font-medium">System</th>
              <th className="py-1.5 pr-3 font-medium">Generate</th>
              <th className="hidden py-1.5 pr-3 font-medium sm:table-cell">Verify</th>
              <th className="hidden py-1.5 font-medium md:table-cell">Feed back</th>
            </tr>
          </thead>
          <tbody>
            {loops.map((l) => (
              <tr key={l.id} onClick={() => launch(`project:${l.id}`)} className="row cursor-pointer align-top">
                <td className="py-2 pr-3 font-medium">{l.system}</td>
                <td className="py-2 pr-3 text-[var(--fg-2)]">{l.generator}</td>
                <td className="hidden py-2 pr-3 text-[var(--fg-2)] sm:table-cell">{l.verifier}</td>
                <td className="hidden py-2 text-[var(--fg-2)] md:table-cell">{l.feedback}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    ),
  },
  {
    title: "Running now",
    preview: `${processes.filter((p) => p.stat === "prod").length} in production`,
    body: (
      <ul className="space-y-1">
        {processes.map((p) => (
          <li key={p.id}>
            <button onClick={() => launch(`project:${p.id}`)} className="row flex w-full items-center gap-3 rounded-md px-2 py-2 text-left">
              <span className={`h-2 w-2 shrink-0 rounded-full ${DOT[p.stat]}`} />
              <span className="min-w-0 flex-1">
                <span className="block font-mono text-[13px]">{p.name}</span>
                <span className="block text-[12px] text-[var(--fg-3)]">{p.note}</span>
              </span>
              <span className="text-[12px] text-[var(--fg-3)]">{p.stat}</span>
            </button>
          </li>
        ))}
      </ul>
    ),
  },
  {
    title: "Off hours",
    preview: "TARK · Prakriti MSIT",
    body: (
      <ul className="space-y-4">
        <li>
          <p className="font-medium">President, TARK Literary Society</p>
        </li>
        <li>
          <p className="font-medium">Cultural Head, Prakriti MSIT</p>
          <p className="text-[var(--fg-2)]">ENVA Fest: 10,000+ footfall, a team of 500+.</p>
        </li>
      </ul>
    ),
  },
  {
    title: "Open to",
    preview: "Freelance, collaborations, roles",
    body: (
      <>
        <p>Freelance builds, collaborations and roles: AI systems, RAG, agents, voice, evaluation.</p>
        <button onClick={() => launch("mail")} className="pill pill-primary mt-5">
          Write to me
        </button>
      </>
    ),
  },
];

export function NotesApp() {
  const [i, setI] = useState(0);
  return (
    <Split
      side={
        <nav className="flex gap-1 p-2 md:block md:space-y-px">
          {NOTES.map((n, k) => (
            <SideItem key={n.title} on={k === i} onClick={() => setI(k)}>
              <span className="block font-medium">{n.title}</span>
              <span className="hidden truncate text-[11px] opacity-70 md:block">{n.preview}</span>
            </SideItem>
          ))}
        </nav>
      }
    >
      <div className="mx-auto max-w-[640px] px-6 pt-6 pb-10 text-[15px] leading-relaxed">
        <h1 className="mb-4 text-[24px] font-semibold tracking-tight">{NOTES[i].title}</h1>
        {NOTES[i].body}
      </div>
    </Split>
  );
}
