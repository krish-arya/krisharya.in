"use client";

import { useState } from "react";
import { person } from "@/content/data";

const KINDS = ["Freelance project", "Collaboration", "Job or internship", "Something else"];

/** No backend: composes the email in the visitor's own mail client. */
export function MailApp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [kind, setKind] = useState(KINDS[0]);
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`${kind}: ${name}`);
    const body = encodeURIComponent([`From: ${name}`, `Reply to: ${email}`, "", msg].join("\n"));
    window.location.href = `mailto:${person.email}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <form onSubmit={send} className="flex h-full flex-col" aria-label="Write to Krish">
      <div className="mail-row">
        <span>To:</span>
        <span className="chip-to">{person.name}</span>
      </div>
      <label className="mail-row">
        <span>From:</span>
        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" />
      </label>
      <label className="mail-row">
        <span>Reply to:</span>
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
      </label>
      <label className="mail-row">
        <span>Subject:</span>
        <select value={kind} onChange={(e) => setKind(e.target.value)}>
          {KINDS.map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>
      </label>
      <textarea
        required
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        placeholder="What you're building, what you need, any links."
        className="min-h-[160px] flex-1 resize-none bg-transparent px-5 py-4 text-[15px] leading-relaxed outline-none placeholder:text-[var(--fg-3)]"
      />
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--sep)] px-5 py-3">
        <p className="text-[12px] text-[var(--fg-3)]" aria-live="polite">
          {sent ? `Opened your mail client. If nothing happened, write to ${person.email}.` : "Opens your mail client, addressed to me."}
        </p>
        <button type="submit" className="pill pill-primary">
          Send
        </button>
      </div>
    </form>
  );
}
