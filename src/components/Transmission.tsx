"use client";

import { useState } from "react";
import { person } from "@/content/data";

const KINDS = ["Freelance project", "Collaboration", "Job or internship", "Something else"];
const TIMELINES = ["As soon as possible", "Within a month", "1–3 months", "Flexible"];

const field =
  "mt-2 w-full border-b border-line-2 bg-transparent py-3 text-paper outline-none placeholder:text-paper-3 focus:border-signal";

/** No backend: composes a structured email in the visitor's own mail client. */
export function Transmission() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [kind, setKind] = useState(KINDS[0]);
  const [timeline, setTimeline] = useState(TIMELINES[3]);
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`${kind}: ${name}`);
    const body = encodeURIComponent(
      [`From: ${name}`, `Reply to: ${email}`, `Type: ${kind}`, `Timeline: ${timeline}`, "", msg].join("\n"),
    );
    window.location.href = `mailto:${person.email}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <section id="transmission" data-zone="rest" aria-labelledby="tx-h" className="px-[var(--gutter)] pt-24 pb-[calc(var(--term-h)+64px)] md:pt-40">
      <div className="mx-auto max-w-[1440px] border-t border-line-2 pt-10">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="label">08 · Contact</p>
            <h2 id="tx-h" className="display mt-4 text-[clamp(56px,8vw,128px)]">
              Trans&shy;mission
            </h2>
            <p className="mt-6 max-w-[36ch] text-[17px] leading-relaxed text-paper-2">
              Open to freelance builds, collaborations and roles: AI systems, RAG, agents, voice, evaluation. Tell me what you&apos;re working on.
            </p>
            <ul className="mt-10 border-t border-line">
              {person.links.map((l) => (
                <li key={l.label} className="border-b border-line">
                  <a
                    href={l.href}
                    target={l.href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    className="group flex items-baseline justify-between gap-4 py-3"
                  >
                    <span className="label group-hover:text-paper-2">{l.label}</span>
                    <span className="mono text-[13px] text-paper group-hover:text-signal">{l.handle} ↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <form onSubmit={send} className="lg:col-span-6 lg:col-start-7" aria-label="Project inquiry">
            <fieldset>
              <legend className="label">What&apos;s this about</legend>
              <div className="mt-3 flex flex-wrap gap-1" role="radiogroup">
                {KINDS.map((k) => (
                  <button key={k} type="button" role="radio" aria-checked={kind === k} onClick={() => setKind(k)} className={`btn ${kind === k ? "is-on" : ""}`}>
                    {k}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mt-10 grid gap-10 sm:grid-cols-2">
              <div>
                <label htmlFor="tx-name" className="label block">
                  From
                </label>
                <input id="tx-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="[ name ]" autoComplete="name" className={`${field} text-[20px]`} />
              </div>
              <div>
                <label htmlFor="tx-email" className="label block">
                  Reply to
                </label>
                <input
                  id="tx-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="[ email ]"
                  autoComplete="email"
                  className={`${field} text-[20px]`}
                />
              </div>
            </div>

            <label htmlFor="tx-time" className="label mt-10 block">
              Timeline
            </label>
            <select id="tx-time" value={timeline} onChange={(e) => setTimeline(e.target.value)} className={`${field} mono text-[14px]`}>
              {TIMELINES.map((t) => (
                <option key={t} value={t} className="bg-ink-1">
                  {t}
                </option>
              ))}
            </select>

            <label htmlFor="tx-msg" className="label mt-10 block">
              Message
            </label>
            <textarea
              id="tx-msg"
              required
              rows={5}
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="[ what you're building, what you need, any links ]"
              className={`${field} resize-y text-[18px] leading-relaxed`}
            />

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button type="submit" className="btn btn-primary">
                [ Send transmission ]
              </button>
              <p className="mono text-paper-3" aria-live="polite">
                {sent ? `Opened your mail client. If nothing happened, write to ${person.email}.` : "Opens your mail client, addressed to me."}
              </p>
            </div>
          </form>
        </div>

        <footer className="mono mt-24 flex flex-wrap justify-between gap-4 border-t border-line pt-6 text-paper-3">
          <p>© 2026 {person.name} · {person.location}</p>
          <p>Next.js · React Three Fiber · every number on this page is sourced</p>
        </footer>
      </div>
    </section>
  );
}
