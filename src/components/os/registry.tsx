"use client";

import { person, projectById, type ProjectId } from "@/content/data";
import { GROUP_TINT, skillBySlug } from "@/content/skills";
import { os } from "@/lib/os";
import { glyphs, mark, type IconSpec } from "./Icon";

export interface AppMeta {
  name: string;
  /** Window title; defaults to name. */
  title?: string;
  icon: IconSpec;
  size: [number, number];
}

export const APPS = {
  about: { name: "About Krish", icon: { tint: ["#4b5563", "#111827"], glyph: glyphs.monogram }, size: [580, 700] },
  projects: { name: "Projects", icon: { tint: ["#7cc4ff", "#1e6fe0"], glyph: glyphs.folder }, size: [920, 600] },
  skills: { name: "Skills", icon: { tint: ["#e5e7eb", "#9ca3af"], glyph: glyphs.grid, ink: true }, size: [0, 0] },
  experience: { name: "Experience", icon: { tint: ["#fcd34d", "#d97706"], glyph: glyphs.briefcase }, size: [880, 580] },
  papers: { name: "Papers", icon: { tint: ["#fca5a5", "#dc2626"], glyph: glyphs.paper }, size: [900, 620] },
  notes: { name: "Notes", icon: { tint: ["#fffbe6", "#fde68a"], glyph: glyphs.note, ink: true }, size: [820, 560] },
  terminal: { name: "Terminal", icon: { tint: ["#3f3f46", "#09090b"], glyph: glyphs.terminal }, size: [680, 440] },
  mail: { name: "Mail", title: "New Message", icon: { tint: ["#93c5fd", "#2563eb"], glyph: glyphs.mail }, size: [620, 560] },
} satisfies Record<string, AppMeta>;

export type AppId = keyof typeof APPS;

export const DOCK: AppId[] = ["projects", "skills", "experience", "papers", "notes", "terminal", "mail", "about"];

export const LINKS: { name: string; href: string; icon: IconSpec }[] = [
  { name: "GitHub", href: person.links[0].href, icon: { tint: ["#52525b", "#18181b"], glyph: glyphs.code } },
  { name: "LinkedIn", href: person.links[1].href, icon: { tint: ["#60a5fa", "#0a66c2"], glyph: glyphs.in } },
];

const WORLD_TINT: Record<string, [string, string]> = {
  build: ["#86efac", "#15803d"],
  engineer: ["#7dd3fc", "#0369a1"],
  research: ["#fca5a5", "#b91c1c"],
  integrate: ["#c4b5fd", "#6d28d9"],
};

export const projectIcon = (id: ProjectId): IconSpec => ({ tint: WORLD_TINT[projectById[id].world], glyph: glyphs.doc });

/** Metadata for any window key, or null if the key names nothing. Keys come from the URL, so own properties only (no #constructor). */
export function resolve(key: string): AppMeta | null {
  const [kind, arg] = key.split(":");
  if (kind === "project") {
    const p = Object.hasOwn(projectById, arg) ? projectById[arg as ProjectId] : undefined;
    return p ? { name: p.title, icon: projectIcon(p.id), size: [780, 640] } : null;
  }
  if (kind === "skill") {
    const s = Object.hasOwn(skillBySlug, arg) ? skillBySlug[arg] : undefined;
    return s ? { name: s.name, icon: { tint: GROUP_TINT[s.group], glyph: mark(s.abbr) }, size: [460, 520] } : null;
  }
  return Object.hasOwn(APPS, kind) ? (APPS as Record<string, AppMeta>)[kind] : null;
}

/** Opens (or brings forward) whatever a key names, and moves keyboard focus to it unless told not to. */
export function launch(key: string, focus = true) {
  if (key === "skills") return os.launchpad(true);
  const m = resolve(key);
  if (m) os.open(key, m.size, focus);
}
