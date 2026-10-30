"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { person, processes, projects } from "@/content/data";
import { skills } from "@/content/skills";
import { os } from "@/lib/os";
import { launch } from "../registry";
import { search } from "../search";

const PROMPT = (
  <span>
    <span className="text-[#5ad06b]">krish@macbook</span> <span className="text-[#6cb6ff]">~</span> %{" "}
  </span>
);

const HELP = `commands
  open <name>     open an app, project or skill   (open mutagen)
  ls              list projects
  skills          list every skill app
  ps              what's running right now
  whoami          about me
  contact         write to me
  clear           clear the screen
  exit            close this window`;

function run(input: string): ReactNode {
  const [cmd, ...rest] = input.trim().split(/\s+/);
  const arg = rest.join(" ");
  switch (cmd) {
    case "":
      return null;
    case "help":
      return HELP;
    case "ls":
      return projects.map((p) => `${p.code.padEnd(9)}${p.id.padEnd(13)}${p.title}`).join("\n");
    case "skills":
      return skills.map((s) => `${s.abbr.padEnd(4)}${s.name}`).join("\n");
    case "ps":
      return ["STAT       PROCESS", ...processes.map((p) => `${p.stat.padEnd(11)}${p.name.padEnd(16)}${p.note}`)].join("\n");
    case "whoami":
      return [person.name, person.roles.join(" · "), "Technology Trainee (AI/ML) @ EaseMyTrip", `${person.location} · ${person.email}`].join("\n");
    case "contact":
      launch("mail");
      return "opening Mail…";
    case "exit":
      os.close("terminal");
      return null;
    case "open":
    case "show":
    case "cd": {
      if (!arg) return `usage: ${cmd} <name>`;
      const hit = search(arg, 1)[0];
      if (!hit) return `${cmd}: ${arg}: no such app, project or skill`;
      launch(hit.key);
      return `opening ${hit.name}…`;
    }
    default: {
      // bare names open things too
      const hit = search(input, 1)[0];
      if (hit) {
        launch(hit.key);
        return `opening ${hit.name}…`;
      }
      return `zsh: command not found: ${cmd}. Try 'help'.`;
    }
  }
}

export function TerminalApp() {
  const [lines, setLines] = useState<{ cmd: string; out: ReactNode }[]>([{ cmd: "help", out: HELP }]);
  const [value, setValue] = useState("");
  const [hist, setHist] = useState<string[]>([]);
  const [h, setH] = useState(-1);
  const input = useRef<HTMLInputElement>(null);
  const end = useRef<HTMLDivElement>(null);

  // braces matter: scrollIntoView returns a Promise in current browsers, and an effect may only return a cleanup function
  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [lines]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = value;
    setValue("");
    setH(-1);
    if (cmd.trim()) setHist((x) => [cmd, ...x]);
    if (cmd.trim() === "clear") return setLines([]);
    // run outside the updater: it opens and closes windows, which mustn't happen during render
    const out = run(cmd);
    setLines((l) => [...l, { cmd, out }]);
  };

  const key = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const n = Math.max(-1, Math.min(hist.length - 1, h + (e.key === "ArrowUp" ? 1 : -1)));
      if (n === h) return; // nothing further back (or forward): keep what's typed
      setH(n);
      setValue(n < 0 ? "" : hist[n]);
    }
  };

  return (
    <div className="terminal h-full overflow-y-auto px-4 py-3" onClick={() => input.current?.focus()}>
      <p className="text-[#8b8b8b]">Last login: {new Date().toDateString()} on ttys000</p>
      <div role="log" aria-live="polite" aria-relevant="additions">
        {lines.map((l, i) => (
          <div key={i}>
            <p>
              <span aria-hidden>{PROMPT}</span>
              {l.cmd}
            </p>
            {l.out && <pre className="whitespace-pre-wrap text-[#d4d4d4]">{l.out}</pre>}
          </div>
        ))}
      </div>
      <form onSubmit={submit} className="flex">
        <span aria-hidden>{PROMPT}</span>
        <input
          ref={input}
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={key}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          aria-label="Terminal input"
          className="ml-1 min-w-0 flex-1 bg-transparent caret-[#d4d4d4] outline-none"
        />
      </form>
      <div ref={end} />
    </div>
  );
}
