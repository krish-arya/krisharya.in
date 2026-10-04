"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { experience, person, projects, topology, worlds, type Project } from "@/content/data";
import { leafKey } from "@/lib/graph";
import { goTo, system, useSystem, type Depth } from "@/lib/store";

type Line = { id: number; text: string; tone?: "in" | "dim" | "signal" | "pass" };

const COMMANDS = ["help", "projects", "show", "experience", "research", "stack", "contact", "depth", "whoami", "loop", "clear", "boot"];

function resolve(name: string): Project | undefined {
  const q = name.toLowerCase().trim();
  return projects.find((p) => p.id === q || p.aliases.includes(q) || p.title.toLowerCase() === q);
}

const pad = (s: string, n: number) => (s.length >= n ? s : s + " ".repeat(n - s.length));

let lineId = 0;
const L = (text: string, tone?: Line["tone"]): Line => ({ id: ++lineId, text, tone });

function run(raw: string): { out: Line[]; act?: () => void; clear?: boolean } {
  const [cmd, ...rest] = raw.trim().split(/\s+/);
  const arg = rest.join(" ");
  switch ((cmd ?? "").toLowerCase()) {
    case "":
      return { out: [] };
    case "help":
      return {
        out: [
          L("projects            list every system, by world"),
          L("show <name>         focus a system: camera, page and its loop"),
          L("experience          the log"),
          L("research            the research archive"),
          L("stack               skills as a topology"),
          L("depth <1-4>         how much detail every project shows"),
          L("loop                the pattern behind all of it"),
          L("contact · whoami · clear · boot"),
          L("tab completes · ↑↓ history · esc closes", "dim"),
        ],
      };
    case "projects":
    case "ls":
      return {
        out: worlds.flatMap((w) => [
          L(`${w.n} ${w.name.toUpperCase()}`, "dim"),
          ...projects.filter((p) => p.world === w.id).map((p) => L(`   ${pad(p.code, 9)}${pad(p.id, 13)}${p.title}`)),
        ]),
      };
    case "show":
    case "open":
    case "cd": {
      const p = resolve(arg);
      if (!arg) return { out: [L("usage: show <name>   e.g. show mutagen", "dim")] };
      if (!p) return { out: [L(`no system named '${arg}'. try: projects`, "signal")] };
      return {
        out: [
          L(`→ focusing ${p.code} ${p.title.toUpperCase()}`, "signal"),
          L(p.kicker),
          ...p.metrics.map((m) => L(`   ${pad(m.value, 14)}${m.label}`, "pass")),
          L(`   stack: ${p.stack.join(" · ")}`, "dim"),
        ],
        act: () => {
          system.focusOn(leafKey(p.id));
          goTo(p.id, true);
          window.setTimeout(() => system.run(p.id), 650);
        },
      };
    }
    case "experience":
    case "log":
      return {
        out: experience.map((e) => L(`${e.year}  ${pad(e.org.toUpperCase(), 13)}${pad(e.role, 28)}${e.entries.map((x) => x.value).join(" · ")}`)),
        act: () => goTo("log"),
      };
    case "research":
      return {
        out: projects.filter((p) => p.world === "research").map((p) => L(`${pad(p.code, 9)}${p.title}${p.metrics[0] ? "   " + p.metrics[0].value : ""}`)),
        act: () => goTo("research"),
      };
    case "stack":
    case "skills":
      return {
        out: topology.map((g) => L(`${pad(g.group.toUpperCase(), 18)}${g.leaves.map((l) => l.name).join(" · ")}`)),
        act: () => goTo("topology"),
      };
    case "contact":
      return { out: person.links.map((l) => L(`${pad(l.label, 10)}${l.handle}`)), act: () => goTo("transmission") };
    case "whoami":
      return {
        out: [
          L(`${person.name}. ${person.roles.join(", ")}.`),
          L(`${person.location} · ${person.education.degree}, MSIT ${person.education.years}`, "dim"),
        ],
      };
    case "loop":
      return {
        out: [L("generate → verify against something real → feed back."), L("the model is one box. the engineering is the loop.", "dim")],
        act: () => goTo("loop"),
      };
    case "depth": {
      const d = Number(arg);
      if (![1, 2, 3, 4].includes(d)) return { out: [L("usage: depth <1-4>   1 = what · 4 = implementation", "dim")] };
      return { out: [L(`depth set to L${d}`, "pass")], act: () => system.set({ depth: d as Depth }) };
    }
    case "clear":
      return { out: [], clear: true };
    case "boot":
      return {
        out: [L("rebooting…", "dim")],
        act: () => {
          try {
            localStorage.removeItem("ka.booted");
          } catch {}
          window.setTimeout(() => location.reload(), 300);
        },
      };
    case "sudo":
      return { out: [L("not needed. everything here is already public.", "dim")] };
    default: {
      // let `mutagen` work as shorthand for `show mutagen`
      const p = resolve(raw);
      if (p) return run(`show ${p.id}`);
      return { out: [L(`command not found: ${cmd}. try: help`, "signal")] };
    }
  }
}

function complete(input: string): string {
  const parts = input.trimStart().split(/\s+/);
  if (parts.length <= 1) {
    const hit = COMMANDS.filter((c) => c.startsWith(parts[0] ?? ""));
    return hit.length === 1 ? hit[0] + " " : input;
  }
  if (["show", "open", "cd"].includes(parts[0])) {
    const names = projects.flatMap((p) => [p.id, ...p.aliases]);
    const hit = names.filter((n) => n.startsWith(parts[1]));
    return hit.length >= 1 ? `${parts[0]} ${hit[0]}` : input;
  }
  return input;
}

const SUGGEST = ["show mutagen", "show voice-agent", "show sql", "show easydarshan", "show bylin", "show mira", "research", "help"];

export function Terminal() {
  const open = useSystem((s) => s.terminalOpen);
  const [lines, setLines] = useState<Line[]>(() => [L("type `help`, or try `show mutagen`", "dim")]);
  const [value, setValue] = useState("");
  const history = useRef<string[]>([]);
  const hIdx = useRef(-1);
  const input = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const queue = useRef<number[]>([]);

  const exec = useCallback((raw: string) => {
    const { out, act, clear } = run(raw);
    queue.current.forEach(clearTimeout);
    queue.current = [];
    setLines((prev) => (clear ? [] : [...prev, L(`krish@system:~$ ${raw}`, "in")]).slice(-160));
    // stream the output a line per frame-ish tick, like partial transcripts arriving
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) setLines((prev) => [...prev, ...out].slice(-160));
    else out.forEach((l, i) => queue.current.push(window.setTimeout(() => setLines((prev) => [...prev, l].slice(-160)), 26 * (i + 1))));
    if (raw.trim()) history.current.unshift(raw);
    hIdx.current = -1;
    system.set({ terminalOpen: true });
    act?.();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing = t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable;
      if (!typing && (e.key === "/" || e.key === "`")) {
        e.preventDefault();
        input.current?.focus();
        system.set({ terminalOpen: true });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [lines, open]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      exec(value);
      setValue("");
    } else if (e.key === "Tab") {
      e.preventDefault();
      setValue(complete(value));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const n = Math.min(hIdx.current + 1, history.current.length - 1);
      if (n >= 0) {
        hIdx.current = n;
        setValue(history.current[n]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const n = hIdx.current - 1;
      hIdx.current = Math.max(n, -1);
      setValue(n >= 0 ? history.current[n] : "");
    } else if (e.key === "Escape") {
      system.set({ terminalOpen: false });
      input.current?.blur();
    }
  };

  return (
    <section aria-label="System terminal" className="fixed inset-x-0 bottom-0 z-40 border-t border-line-2 bg-ink-1">
      <div
        ref={logRef}
        role="log"
        aria-live="polite"
        className={`mono overflow-y-auto border-b border-line px-[var(--gutter)] transition-[max-height,padding] duration-300 ${
          open ? "max-h-[38vh] py-3" : "max-h-0 py-0"
        }`}
      >
        {lines.map((l) => (
          <pre
            key={l.id}
            className={`whitespace-pre-wrap break-words font-[inherit] ${
              l.tone === "in" ? "mt-2 text-paper" : l.tone === "dim" ? "text-paper-3" : l.tone === "signal" ? "text-signal" : l.tone === "pass" ? "text-pass" : "text-paper-2"
            }`}
          >
            {l.text}
          </pre>
        ))}
      </div>

      <div className="flex h-[var(--term-h)] items-center gap-3 px-[var(--gutter)]">
        <label htmlFor="term" className="mono shrink-0 text-pass">
          krish@system<span className="text-paper-3">:~$</span>
        </label>
        <input
          id="term"
          ref={input}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => system.set({ terminalOpen: true })}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="help"
          aria-describedby="term-hint"
          className="mono min-w-0 flex-1 bg-transparent text-paper caret-[var(--signal)] outline-none placeholder:text-paper-3"
        />
        <span id="term-hint" className="sr-only">
          Commands: help, projects, show followed by a project name, experience, research, stack, contact.
        </span>
        <div className="hidden min-w-0 gap-1 overflow-x-auto md:flex">
          {SUGGEST.slice(0, 5).map((s) => (
            <button key={s} onClick={() => exec(s)} className="chip shrink-0 hover:border-line-3 hover:text-paper">
              {s}
            </button>
          ))}
        </div>
        <button
          onClick={() => system.set({ terminalOpen: !open })}
          aria-expanded={open}
          aria-label={open ? "Collapse terminal output" : "Expand terminal output"}
          className="mono h-7 w-7 shrink-0 border border-line text-paper-2 hover:text-paper"
        >
          {open ? "–" : "+"}
        </button>
      </div>
      {/* phone: commands as tappable chips */}
      <div className={`flex gap-1 overflow-x-auto px-[var(--gutter)] pb-3 md:hidden ${open ? "" : "hidden"}`}>
        {SUGGEST.map((s) => (
          <button key={s} onClick={() => exec(s)} className="chip shrink-0">
            {s}
          </button>
        ))}
      </div>
    </section>
  );
}
