import { projects } from "@/content/data";
import { skills } from "@/content/skills";
import { APPS, type AppMeta, resolve } from "./registry";

export interface Hit {
  key: string;
  name: string;
  kind: "Application" | "Project" | "Skill";
  sub: string;
  meta: AppMeta;
  terms: string[];
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");

export const index: Hit[] = [
  ...Object.entries(APPS).map(([k, a]) => ({ key: k, name: a.name, kind: "Application" as const, sub: "Application", meta: a, terms: [k, a.name] })),
  ...projects.map((p) => ({
    key: `project:${p.id}`,
    name: p.title,
    kind: "Project" as const,
    sub: p.kicker,
    meta: resolve(`project:${p.id}`)!,
    terms: [p.id, p.title, p.code, ...p.aliases, ...p.stack],
  })),
  ...skills.map((s) => ({
    key: `skill:${s.slug}`,
    name: s.name,
    kind: "Skill" as const,
    sub: s.group,
    meta: resolve(`skill:${s.slug}`)!,
    terms: [s.slug, s.name, ...s.name.split(/[·/&]/)],
  })),
];

/** Ranked matches: exact term, then prefix, then substring. */
export function search(q: string, limit = 8): Hit[] {
  const n = norm(q);
  if (!n) return [];
  const score = (h: Hit) => {
    let best = 0;
    for (const t of h.terms.map(norm)) {
      if (!t) continue;
      if (t === n) best = Math.max(best, 3);
      else if (t.startsWith(n)) best = Math.max(best, 2);
      else if (t.includes(n)) best = Math.max(best, 1);
    }
    return best;
  };
  return index
    .map((h) => [h, score(h)] as const)
    .filter(([, s]) => s > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([h]) => h);
}
