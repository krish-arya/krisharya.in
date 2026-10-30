"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { person } from "@/content/data";
import { focused, os, useOs } from "@/lib/os";
import { DOCK, launch, resolve } from "./registry";

function Clock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const t = setInterval(tick, 15_000);
    return () => clearInterval(t);
  }, []);
  if (!now) return null;
  return (
    <span className="tabular-nums">
      <span className="hidden sm:inline">{now.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })}&nbsp;&nbsp;</span>
      {now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
    </span>
  );
}

type Entry = { label: string; run: () => void } | "sep";

interface MenuProps {
  id: string;
  label: ReactNode;
  entries: Entry[];
  bold?: boolean;
  open: string | null;
  setOpen: (v: string | null) => void;
}

function Menu({ id, label, entries, bold, open, setOpen }: MenuProps) {
  const on = open === id;
  return (
    <div className="relative">
      <button
        className={`menu-btn ${bold ? "font-semibold" : ""} ${on ? "is-on" : ""}`}
        aria-expanded={on}
        aria-haspopup="menu"
        onClick={() => setOpen(on ? null : id)}
        onPointerEnter={() => open && setOpen(id)}
      >
        {label}
      </button>
      {on && (
        <div role="menu" className="menu">
          {entries.map((e, i) =>
            e === "sep" ? (
              <hr key={i} />
            ) : (
              <button
                key={e.label}
                role="menuitem"
                onClick={() => {
                  setOpen(null);
                  e.run();
                }}
              >
                {e.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}

const ext = (href: string) => () => window.open(href, "_blank", "noopener");

export function MenuBar() {
  const top = useOs((s) => focused(s));
  const [open, setOpen] = useState<string | null>(null);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const off = (e: PointerEvent) => {
      if (!bar.current?.contains(e.target as Node)) setOpen(null);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("pointerdown", off);
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("pointerdown", off);
      window.removeEventListener("keydown", esc);
    };
  }, [open]);

  const appName = top ? resolve(top.key)!.name : "Desktop";
  const props = { open, setOpen };

  return (
    <div ref={bar} className="menubar">
      <div className="flex min-w-0 items-center">
        <Menu
          id="k"
          label={<span className="font-bold tracking-tight">KA</span>}
          entries={[
            { label: "About Krish", run: () => launch("about") },
            "sep",
            { label: "Write to Krish…", run: () => launch("mail") },
            { label: "GitHub ↗", run: ext(person.links[0].href) },
            { label: "LinkedIn ↗", run: ext(person.links[1].href) },
          ]}
          {...props}
        />
        <Menu
          id="app"
          bold
          label={<span className="block max-w-[38vw] truncate">{appName}</span>}
          entries={
            top
              ? [
                  { label: "Minimize", run: () => os.minimize(top.key) },
                  { label: "Zoom", run: () => os.toggleMax(top.key) },
                  { label: "Close Window", run: () => os.close(top.key) },
                ]
              : [{ label: "About Krish", run: () => launch("about") }]
          }
          {...props}
        />
        <Menu
          id="go"
          label="Go"
          entries={[...DOCK.map((k) => ({ label: resolve(k)!.name, run: () => launch(k) })), "sep", { label: "Search…   ⌘K", run: () => os.spotlight(true) }]}
          {...props}
        />
        <span className="hidden sm:block">
          <Menu
            id="win"
            label="Window"
            entries={[
              { label: "Minimize All", run: () => os.get().wins.forEach((w) => os.minimize(w.key)) },
              { label: "Close All", run: () => os.get().wins.forEach((w) => os.close(w.key)) },
            ]}
            {...props}
          />
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2 pr-1">
        <span className="hidden items-center gap-1.5 md:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-[#34c759]" />
          Open to work
        </span>
        <button aria-label="Search" className="menu-btn" onClick={() => os.spotlight()}>
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="7" cy="7" r="4.6" />
            <path d="M10.5 10.5L14 14" strokeLinecap="round" />
          </svg>
        </button>
        <Clock />
      </div>
    </div>
  );
}
