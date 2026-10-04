import type { ProjectId, WorldId } from "@/content/data";

/**
 * The central system (brief §30). Hubs are capabilities; leaves are the systems
 * that sit on them. Positions are in 3D scene units; the SVG map projects x/y.
 */
export interface GraphNode {
  id: string;
  label: string;
  kind: "hub" | "leaf";
  pos: [number, number, number];
  project?: ProjectId;
}

export const hubs: GraphNode[] = [
  { id: "research", label: "Research", kind: "hub", pos: [0, 5.2, 0] },
  { id: "models", label: "AI models", kind: "hub", pos: [0, 3.3, 0.5] },
  { id: "rag", label: "RAG", kind: "hub", pos: [-2.7, 1.5, -0.4] },
  { id: "agents", label: "Agents", kind: "hub", pos: [0, 1.5, 0.8] },
  { id: "voice", label: "Voice", kind: "hub", pos: [2.7, 1.5, -0.4] },
  { id: "systems", label: "Systems", kind: "hub", pos: [0, -0.4, 0] },
  { id: "products", label: "Products", kind: "hub", pos: [-2.1, -2.3, 0.5] },
  { id: "evaluation", label: "Evaluation", kind: "hub", pos: [2.1, -2.3, -0.3] },
  { id: "workflow", label: "Eng. workflow", kind: "hub", pos: [0, -4.2, 0] },
];

const leaf = (project: ProjectId, label: string, pos: [number, number, number]): GraphNode => ({
  id: project,
  label,
  kind: "leaf",
  pos,
  project,
});

export const leaves: GraphNode[] = [
  leaf("nl2sql", "NL2SQL", [-2.0, 5.9, -0.8]),
  leaf("scam", "Scam detection", [2.0, 5.9, -0.6]),
  leaf("xai", "XAI", [-1.6, 4.5, 1.2]),
  leaf("env", "Env. ML", [1.7, 4.6, 1.1]),
  leaf("rag", "Support RAG", [-4.2, 0.8, 0.6]),
  leaf("easydarshan", "EasyDarshan", [-1.1, 0.6, 2.0]),
  leaf("voice", "Voice agent", [4.3, 0.9, 0.5]),
  leaf("v2v", "V2V agent", [3.9, 2.4, 0.9]),
  leaf("bylin", "Bylin.app", [-3.9, -2.0, 1.4]),
  leaf("mutagen", "Mutagen", [-3.3, -3.3, -0.6]),
  leaf("folio", "LaunchMyFolio", [-1.0, -3.2, 1.7]),
  leaf("eval", "Eval · 50K+", [3.7, -2.9, 0.6]),
  leaf("mira", "Mira pilot", [1.6, -5.0, 0.9]),
];

/** Leaf ids collide with hub ids for rag/voice, so leaves are keyed with a prefix in the scene. */
export const leafKey = (id: string) => `p:${id}`;

const leafParent: Record<ProjectId, string> = {
  nl2sql: "research",
  scam: "research",
  xai: "research",
  env: "research",
  rag: "rag",
  easydarshan: "agents",
  voice: "voice",
  v2v: "voice",
  bylin: "products",
  mutagen: "products",
  folio: "products",
  eval: "evaluation",
  mira: "workflow",
};

export interface GraphEdge {
  from: string;
  to: string;
  feedback?: boolean;
}

export const edges: GraphEdge[] = [
  { from: "research", to: "models" },
  { from: "models", to: "rag" },
  { from: "models", to: "agents" },
  { from: "models", to: "voice" },
  { from: "rag", to: "systems" },
  { from: "agents", to: "systems" },
  { from: "voice", to: "systems" },
  { from: "systems", to: "products" },
  { from: "systems", to: "evaluation" },
  { from: "products", to: "workflow" },
  { from: "evaluation", to: "workflow" },
  // the loop closes: what evaluation learns flows back into the models
  { from: "evaluation", to: "models", feedback: true },
  ...leaves.map((l) => ({ from: leafParent[l.project!], to: leafKey(l.id) })),
];

export const allNodes: (GraphNode & { key: string })[] = [
  ...hubs.map((h) => ({ ...h, key: h.id })),
  ...leaves.map((l) => ({ ...l, key: leafKey(l.id) })),
];

export const nodeByKey = Object.fromEntries(allNodes.map((n) => [n.key, n]));

/** Where the camera rests for each zone of the page. */
export const zoneTarget: Record<"hero" | WorldId | "rest", string | null> = {
  hero: null,
  build: "products",
  engineer: "agents",
  research: "research",
  integrate: "workflow",
  rest: null,
};

/** Edge path from the root to a node, used to light the route data takes. */
export function pathTo(key: string): Set<string> {
  const parents = new Map<string, string>();
  for (const e of edges) if (!e.feedback && !parents.has(e.to)) parents.set(e.to, e.from);
  const lit = new Set<string>();
  let cur = key;
  while (parents.has(cur)) {
    const p = parents.get(cur)!;
    lit.add(`${p}>${cur}`);
    cur = p;
  }
  return lit;
}
