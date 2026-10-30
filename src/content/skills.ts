import { topology, type ProjectId } from "./data";

/** Every leaf of the skill topology, shipped as its own app. */
export interface Skill {
  slug: string;
  /** Position in the table, like an atomic number. */
  n: number;
  name: string;
  /** Two-letter mark drawn on the app icon, like an element symbol. */
  abbr: string;
  group: string;
  used: ProjectId[];
}

const ABBR: Record<string, string> = {
  LLMs: "Lm",
  "Agents & agentic workflows": "Ag",
  RAG: "Rg",
  "Tool calling": "Tc",
  "Multi-model orchestration": "Mo",
  Evaluation: "Ev",
  "LangChain · LangGraph · CrewAI": "Lc",
  pgvector: "Pv",
  ChromaDB: "Ch",
  FAISS: "Fs",
  Embeddings: "Em",
  Chunking: "Ck",
  Reranking: "Rr",
  "Knowledge-base design": "Kb",
  "Live search · SPARQL · scrapers": "Sq",
  "Streaming STT / TTS": "St",
  LiveKit: "Lk",
  "VAD · barge-in": "Vd",
  Python: "Py",
  FastAPI: "Fa",
  Flask: "Fl",
  "Async I/O · worker pipelines": "As",
  "Postgres · Supabase": "Pg",
  "SQL · SQLAlchemy": "Sl",
  "PyTorch · TensorFlow": "Pt",
  "Scikit-learn": "Sk",
  "Graph neural networks": "Gn",
  "SARIMA · BiLSTM · Optuna": "Ts",
  Docker: "Dk",
  "n8n · OpenRouter": "N8",
  "AWS · GCP": "Cl",
  "React · Next.js": "Rx",
};

/** Icon gradient per skill group. */
export const GROUP_TINT: Record<string, [string, string]> = {
  "AI systems": ["#a78bfa", "#6d28d9"],
  Retrieval: ["#5eead4", "#0f766e"],
  Speech: ["#f9a8d4", "#be185d"],
  Backend: ["#7dd3fc", "#1d4ed8"],
  Models: ["#fdba74", "#c2410c"],
  "Infra & front end": ["#cbd5e1", "#334155"],
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const skills: Skill[] = topology
  .flatMap((g) => g.leaves.map((l) => ({ slug: slugify(l.name), name: l.name, abbr: ABBR[l.name] ?? l.name.slice(0, 2), group: g.group, used: l.used })))
  .map((s, i) => ({ ...s, n: i + 1 }));

export const skillBySlug = Object.fromEntries(skills.map((s) => [s.slug, s])) as Record<string, Skill>;

export const skillsFor = (id: ProjectId) => skills.filter((s) => s.used.includes(id));
