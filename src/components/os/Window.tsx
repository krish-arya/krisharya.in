"use client";

import { useId, useRef } from "react";
import type { ProjectId } from "@/content/data";
import { DOCK_H, MENU_H, focused, os, useOs, type Win } from "@/lib/os";
import { AboutApp } from "./apps/AboutApp";
import { ExperienceApp } from "./apps/ExperienceApp";
import { MailApp } from "./apps/MailApp";
import { NotesApp } from "./apps/NotesApp";
import { PapersApp } from "./apps/PapersApp";
import { ProjectApp } from "./apps/ProjectApp";
import { ProjectsApp } from "./apps/ProjectsApp";
import { SkillApp } from "./apps/SkillApp";
import { TerminalApp } from "./apps/TerminalApp";
import { resolve } from "./registry";

function AppView({ k }: { k: string }) {
  const [kind, arg] = k.split(":");
  switch (kind) {
    case "project":
      return <ProjectApp id={arg as ProjectId} />;
    case "skill":
      return <SkillApp slug={arg} />;
    case "about":
      return <AboutApp />;
    case "projects":
      return <ProjectsApp />;
    case "experience":
      return <ExperienceApp />;
    case "papers":
      return <PapersApp />;
    case "notes":
      return <NotesApp />;
    case "terminal":
      return <TerminalApp />;
    case "mail":
      return <MailApp />;
    default:
      return null;
  }
}

const MIN_W = 320;
const MIN_H = 220;

export function Window({ win }: { win: Win }) {
  const active = useOs((s) => focused(s)?.key === win.key);
  const meta = resolve(win.key)!;
  const titleId = useId();
  const drag = useRef<{ px: number; py: number; x: number; y: number; w: number; h: number; mode: "move" | "size" } | null>(null);

  const start = (e: React.PointerEvent, mode: "move" | "size") => {
    if (win.max || e.button !== 0 || (e.target as HTMLElement).closest("button")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { px: e.clientX, py: e.clientY, x: win.x, y: win.y, w: win.w, h: win.h, mode };
    os.focus(win.key);
  };
  const move = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.px;
    const dy = e.clientY - d.py;
    if (d.mode === "move") {
      // keep the title bar reachable
      const x = Math.min(window.innerWidth - 80, Math.max(80 - d.w, d.x + dx));
      const y = Math.min(window.innerHeight - MENU_H - DOCK_H - 20, Math.max(0, d.y + dy));
      os.move(win.key, { x, y });
    } else {
      os.move(win.key, { w: Math.max(MIN_W, d.w + dx), h: Math.max(MIN_H, d.h + dy) });
    }
  };
  const end = () => {
    drag.current = null;
  };

  const box = win.max ? undefined : { left: win.x, top: MENU_H + win.y, width: win.w, height: win.h };
  const dark = win.key === "terminal";

  return (
    <section
      role="dialog"
      aria-labelledby={titleId}
      data-win={win.key}
      tabIndex={-1}
      // minimized windows stay mounted for the animation; take them out of tab order and the a11y tree
      inert={win.min || undefined}
      onPointerDownCapture={() => os.focus(win.key)}
      onFocusCapture={() => os.focus(win.key)}
      className={`window ${win.max ? "is-max" : ""} ${win.min ? "is-min" : ""} ${active ? "is-active" : ""} ${dark ? "is-dark" : ""}`}
      style={{ ...box, zIndex: win.z }}
    >
      <header
        className="titlebar"
        onPointerDown={(e) => start(e, "move")}
        onPointerMove={move}
        onPointerUp={end}
        onDoubleClick={(e) => {
          // a quick double-click on the lights already toggled twice
          if ((e.target as HTMLElement).closest("button")) return;
          os.toggleMax(win.key);
        }}
      >
        <div className="lights">
          <button aria-label="Close" className="light close" onClick={() => os.close(win.key)}>
            <svg viewBox="0 0 8 8">
              <path d="M1.5 1.5l5 5M6.5 1.5l-5 5" />
            </svg>
          </button>
          <button aria-label="Minimize" className="light min" onClick={() => os.minimize(win.key)}>
            <svg viewBox="0 0 8 8">
              <path d="M1.2 4h5.6" />
            </svg>
          </button>
          <button aria-label="Zoom" className="light zoom" onClick={() => os.toggleMax(win.key)}>
            <svg viewBox="0 0 8 8">
              <path d="M2 6V2.6L5.4 6zM6 2v3.4L2.6 2z" fill="currentColor" stroke="none" />
            </svg>
          </button>
        </div>
        <h2 id={titleId} className="title">{meta.title ?? meta.name}</h2>
      </header>
      <div className="window-body">
        <AppView k={win.key} />
      </div>
      {!win.max && <div className="resize" onPointerDown={(e) => start(e, "size")} onPointerMove={move} onPointerUp={end} aria-hidden />}
    </section>
  );
}
