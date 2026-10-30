"use client";

import { person, projectById, type ProjectId } from "@/content/data";
import { GROUP_TINT, skillBySlug } from "@/content/skills";
import { os } from "@/lib/os";
import { docFace, element, glyphs, type IconSpec } from "./Icon";

export interface AppMeta {
  name: string;
  /** Window title; defaults to name. */
  title?: string;
  icon: IconSpec;
  size: [number, number];
}

export const APPS = {
  about: { name: "About Krish", icon: { tint: ["#5b6170", "#15171c"], glyph: glyphs.monogram }, size: [580, 700] },
  projects: { name: "Projects", icon: { tint: ["#7cc8ff", "#1e6fe0"], glyph: glyphs.folder }, size: [920, 600] },
  skills: { name: "Skills", icon: { tint: ["#3a3a3e", "#111114"], glyph: glyphs.grid }, size: [0, 0] },
  experience: { name: "Experience", icon: { tint: ["#ffd25e", "#f59e0b"], glyph: glyphs.briefcase }, size: [880, 580] },
  papers: { name: "Papers", icon: { tint: ["#ff8a80", "#e5322d"], glyph: glyphs.paper }, size: [900, 620] },
  notes: { name: "Notes", icon: { tint: ["#fff", "#fff"], glyph: glyphs.note, ink: true }, size: [820, 560] },
  terminal: { name: "Terminal", icon: { tint: ["#4a4a50", "#0d0d0f"], glyph: glyphs.terminal }, size: [680, 440] },
  mail: { name: "Mail", title: "New Message", icon: { tint: ["#6ec6ff", "#1a6cf0"], glyph: glyphs.mail }, size: [620, 560] },
  settings: { name: "System Settings", icon: { tint: ["#9a9aa2", "#4a4a52"], glyph: glyphs.gear }, size: [680, 600] },
} satisfies Record<string, AppMeta>;

export type AppId = keyof typeof APPS;

export const DOCK: AppId[] = ["projects", "skills", "experience", "papers", "notes", "terminal", "mail", "about", "settings"];

export const LINKS: { name: string; href: string; icon: IconSpec }[] = [
  { name: "GitHub", href: person.links[0].href, icon: { tint: ["#52525b", "#18181b"], glyph: glyphs.code } },
  { name: "LinkedIn", href: person.links[1].href, icon: { tint: ["#60a5fa", "#0a66c2"], glyph: glyphs.in } },
];

export const WORLD_TINT: Record<string, [string, string]> = {
  build: ["#34d399", "#0f8a5f"],
  engineer: ["#38bdf8", "#1d5fd6"],
  research: ["#fb7185", "#c81e4a"],
  integrate: ["#a78bfa", "#6d28d9"],
};

const INITIALS: Record<ProjectId, string> = {
  bylin: "By",
  mutagen: "Mu",
  folio: "Lf",
  voice: "Vo",
  rag: "Kb",
  eval: "Ev",
  easydarshan: "Ed",
  v2v: "V2",
  nl2sql: "Sq",
  scam: "Sc",
  xai: "Xa",
  env: "En",
  mira: "Mi",
};

export const projectIcon = (id: ProjectId): IconSpec => ({
  tint: WORLD_TINT[projectById[id].world],
  glyph: docFace(projectById[id].code, INITIALS[id]),
  shape: "doc",
});

/** Metadata for any window key, or null if the key names nothing. Keys come from the URL, so own properties only (no #constructor). */
export function resolve(key: string): AppMeta | null {
  const [kind, arg] = key.split(":");
  if (kind === "project") {
    const p = Object.hasOwn(projectById, arg) ? projectById[arg as ProjectId] : undefined;
    return p ? { name: p.title, icon: projectIcon(p.id), size: [780, 640] } : null;
  }
  if (kind === "skill") {
    const s = Object.hasOwn(skillBySlug, arg) ? skillBySlug[arg] : undefined;
    return s ? { name: s.name, icon: { tint: GROUP_TINT[s.group], glyph: element(s.n, s.abbr) }, size: [460, 520] } : null;
  }
  return Object.hasOwn(APPS, kind) ? (APPS as Record<string, AppMeta>)[kind] : null;
}

/** Opens (or brings forward) whatever a key names, and moves keyboard focus to it unless told not to. */
export function launch(key: string, focus = true) {
  if (key === "skills") return os.launchpad(true);
  const m = resolve(key);
  if (m) os.open(key, m.size, focus);
}
