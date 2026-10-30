"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
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

type Entry = { label: string; run: () => void; hint?: string; check?: string } | "sep";

interface MenuProps {
  id: string;
  label: ReactNode;
  /** Accessible name when the label is just a mark. */
  name?: string;
  entries: Entry[];
  bold?: boolean;
  open: string | null;
  setOpen: (v: string | null) => void;
}

// a disclosure, not role=menu: Tab moves through the items and nothing promises arrow-key navigation
function Menu({ id, label, name, entries, bold, open, setOpen }: MenuProps) {
  const on = open === id;
  const menu = useRef<HTMLDivElement>(null);

  // keep the dropdown on screen when its title sits near the right edge
  useLayoutEffect(() => {
    const el = menu.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.right > window.innerWidth - 8) el.style.left = `${window.innerWidth - 8 - r.right}px`;
  }, [on]);

  return (
    <div className="relative">
      <button
        className={`menu-btn ${bold ? "font-semibold" : ""} ${on ? "is-on" : ""}`}
        aria-expanded={on}
        aria-controls={`menu-${id}`}
        aria-label={name}
        onClick={() => setOpen(on ? null : id)}
        onPointerEnter={() => open && setOpen(id)}
      >
        {label}
      </button>
      {on && (
        <div ref={menu} id={`menu-${id}`} className="menu">
          {entries.map((e, i) =>
            e === "sep" ? (
              <hr key={i} />
            ) : (
              <button
                key={`${e.label}${i}`}
                onClick={() => {
                  setOpen(null);
                  e.run();
                }}
              >
                {e.check !== undefined && <span className="w-4 shrink-0">{e.check}</span>}
                {e.label}
                {e.hint && <span className="ml-auto pl-6 text-[var(--fg-3)]">{e.hint}</span>}
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
  const wins = useOs((s) => s.wins);
  const [open, setOpen] = useState<string | null>(null);
  const bar = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const off = (e: PointerEvent) => {
      if (!bar.current?.contains(e.target as Node)) setOpen(null);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // the focused item is about to unmount; send focus back to the menu's title
      if (bar.current?.contains(document.activeElement)) bar.current.querySelector<HTMLElement>(`[aria-controls="menu-${open}"]`)?.focus();
      setOpen(null);
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
  // phones: windows are always full screen and there's no dock to minimize to (menus only open client-side)
  const wide = open !== null && window.innerWidth >= 720;
  const winEntries: Entry[] = [
    ...(top && wide ? ([{ label: "Minimize", run: () => os.minimize(top.key) }, { label: "Zoom", run: () => os.toggleMax(top.key) }, "sep"] as Entry[]) : []),
    // every open window, like macOS: ✓ marks the front one, ◆ the minimized ones
    ...wins.map((w) => ({ label: resolve(w.key)!.name, check: w.key === top?.key ? "✓" : w.min ? "◆" : "", run: () => launch(w.key) })),
    ...(wins.length ? (["sep"] as Entry[]) : []),
    ...(wide ? [{ label: "Minimize All", run: () => os.get().wins.forEach((w) => os.minimize(w.key)) }] : []),
    { label: "Close All", run: () => os.get().wins.forEach((w) => os.close(w.key)) },
  ];

  return (
    <nav
      ref={bar}
      aria-label="Menu bar"
      className="menubar"
      onBlur={(e) => {
        if (!bar.current?.contains(e.relatedTarget as Node)) setOpen(null);
      }}
    >
      <div className="flex min-w-0 items-center">
        <Menu
          id="k"
          name="Krish"
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
          entries={top ? [{ label: "Close Window", run: () => os.close(top.key) }] : [{ label: "About Krish", run: () => launch("about") }]}
          {...props}
        />
        {/* the home screen covers Go on phones, and the bar is short on room */}
        <span className="hidden sm:block">
          <Menu
            id="go"
            label="Go"
            entries={[...DOCK.map((k) => ({ label: resolve(k)!.name, run: () => launch(k) })), "sep", { label: "Search…", hint: "⌘K", run: () => os.spotlight(true) }]}
            {...props}
          />
        </span>
        <Menu id="win" label="Window" entries={winEntries} {...props} />
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
    </nav>
  );
}
