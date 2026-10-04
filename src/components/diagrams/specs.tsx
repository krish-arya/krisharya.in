"use client";

import { Code, type FlowSpec } from "./Flow";

// ─────────────────────────────────────────────── MUTAGEN
const SRC = `def can_book(seats_left: int, requested: int) -> bool:
    return requested <= seats_left`;

export const mutagen: FlowSpec = {
  w: 960,
  h: 270,
  nodes: [
    { id: "src", label: "Source", sub: "code under test", x: 90, y: 70, w: 130, kind: "io" },
    { id: "llm", label: "LLM", sub: "write a test", x: 280, y: 70, w: 130, kind: "model" },
    { id: "mut", label: "Inject mutant", sub: "plant one fault", x: 470, y: 70, w: 140 },
    { id: "run", label: "Run test", sub: "against the mutant", x: 670, y: 70, w: 140 },
    { id: "gate", label: "Killed?", sub: "test failed on mutant", x: 670, y: 205, w: 150, kind: "gate" },
    { id: "keep", label: "Keep test", sub: "fault detected", x: 870, y: 205, w: 130 },
    { id: "regen", label: "Regenerate", sub: "test is blind", x: 470, y: 205, w: 140 },
  ],
  edges: [
    { from: "src", to: "llm" },
    { from: "llm", to: "mut" },
    { from: "mut", to: "run" },
    { from: "run", to: "gate" },
    { from: "gate", to: "keep", label: "yes" },
    { from: "gate", to: "regen", kind: "reject", label: "no" },
    { from: "regen", to: "llm", kind: "feedback", via: [[280, 205]] },
  ],
  steps: [
    { at: "src", note: "A function under test.", payload: <Code>{SRC}</Code> },
    {
      at: "llm",
      note: "The LLM writes test_1.",
      payload: <Code>{`def test_can_book():\n    assert can_book(seats_left=10, requested=2)`}</Code>,
    },
    {
      at: "mut",
      note: "Mutagen plants a fault: <= becomes <.",
      payload: (
        <>
          <Code tone="dim">{"-    return requested <= seats_left"}</Code>
          <Code tone="signal">{"+    return requested <  seats_left"}</Code>
        </>
      ),
    },
    { at: "run", note: "test_1 runs against the mutant.", payload: <Code>{"can_book(10, 2)  →  2 < 10  →  True\ntest_1 ............ PASSED"}</Code> },
    {
      at: "gate",
      verdict: "fail",
      note: "It still passes. test_1 cannot see the fault: the mutant survived.",
      payload: <Code tone="signal">{"mutant  <= → <   SURVIVED\ntest_1  covers the line, detects nothing"}</Code>,
    },
    { at: "regen", note: "A blind test is not kept. It goes back to be regenerated." },
    {
      at: "llm",
      note: "The LLM writes test_2.",
      payload: <Code>{`def test_can_book_last_seat():\n    assert can_book(seats_left=3, requested=3)`}</Code>,
    },
    { at: "mut", note: "Same mutant." },
    { at: "run", note: "test_2 runs against the mutant.", payload: <Code>{"can_book(3, 3)  →  3 < 3  →  False\ntest_2 ............ FAILED"}</Code> },
    {
      at: "gate",
      verdict: "pass",
      note: "It fails on the mutant. Mutant killed: the fault was detected.",
      payload: <Code tone="pass">{"mutant  <= → <   KILLED by test_2"}</Code>,
    },
    {
      at: "keep",
      verdict: "pass",
      note: "test_2 is kept. Both tests had identical coverage. Only one could catch the bug.",
      payload: (
        <Code>
          {"            coverage   kills mutant\ntest_1      100%       no      → regenerated\ntest_2      100%       "}
          <span className="text-pass">yes     → kept</span>
        </Code>
      ),
    },
  ],
  idle: "Success ≠ coverage. Success = demonstrated fault detection.",
  footnote: "Example function and tests are illustrative. The loop is Mutagen's.",
};

// ─────────────────────────────────────────────── BYLIN
export const bylin: FlowSpec = {
  w: 860,
  h: 260,
  nodes: [
    { id: "in", label: "Request", x: 70, y: 60, w: 100, kind: "io" },
    { id: "sum", label: "Summarize", x: 205, y: 60, w: 120, kind: "model" },
    { id: "ret", label: "Retrieve", x: 345, y: 60, w: 120, kind: "store" },
    { id: "gen", label: "Generate", sub: "multiple models", x: 495, y: 60, w: 140, kind: "model" },
    { id: "score", label: "Quality score", sub: "emb. sim + LLM grade", x: 665, y: 60, w: 160, kind: "gate" },
    { id: "drop", label: "Filtered", sub: "weak output", x: 800, y: 190, w: 100 },
    { id: "user", label: "User", sub: "approve / reject", x: 665, y: 190, w: 130, kind: "human" },
    { id: "hist", label: "Approval history", sub: "per-user · UUID-scoped", x: 380, y: 190, w: 170, kind: "store" },
  ],
  edges: [
    { from: "in", to: "sum" },
    { from: "sum", to: "ret" },
    { from: "ret", to: "gen" },
    { from: "gen", to: "score" },
    { from: "score", to: "user", label: "pass" },
    { from: "score", to: "drop", kind: "reject", via: [[800, 60]], start: [745, 60] },
    { from: "user", to: "hist" },
    { from: "hist", to: "gen", kind: "feedback", via: [[495, 190]] },
  ],
  steps: [
    { at: "in", note: "A request comes in." },
    { at: "sum", note: "Summarize the input." },
    { at: "ret", note: "Retrieve relevant context." },
    { at: "gen", note: "Generate across multiple models via OpenRouter, orchestrated on self-hosted n8n." },
    { at: "score", note: "Score every output: a normalized fusion of embedding similarity and an LLM-graded evaluation." },
    { at: "drop", verdict: "fail", note: "Weak outputs are filtered automatically. No user ever sees them." },
    { at: "user", note: "What passes reaches the user, who approves or rejects it." },
    { at: "hist", note: "Each decision is stored against that user." },
    { at: "gen", verdict: "pass", note: "Approval history biases the next generation toward what this user accepts." },
  ],
  idle: "Generation is one stage of four. Scoring decides what ships.",
};

// ─────────────────────────────────────────────── LAUNCHMYFOLIO
export const folio: FlowSpec = {
  w: 760,
  h: 130,
  nodes: [
    { id: "resume", label: "Resume", x: 75, y: 60, w: 110, kind: "io" },
    { id: "und", label: "Understand", x: 225, y: 60, w: 130, kind: "model" },
    { id: "pers", label: "Personalize", sub: "tailored copy", x: 380, y: 60, w: 130, kind: "model" },
    { id: "lay", label: "Layout", sub: "sections + order", x: 535, y: 60, w: 130, kind: "model" },
    { id: "site", label: "Portfolio", sub: "live site", x: 685, y: 60, w: 110, kind: "io" },
  ],
  edges: [
    { from: "resume", to: "und" },
    { from: "und", to: "pers" },
    { from: "pers", to: "lay" },
    { from: "lay", to: "site" },
  ],
  steps: [
    { at: "resume", note: "A resume: unstructured, written for a recruiter's skim.", payload: <Code tone="dim">{"<name>\n<role> · <company> · <dates>\n  • <bullet>\n  • <bullet>\nPROJECTS ...\nSKILLS ..."}</Code> },
    { at: "und", note: "Read into structure.", payload: <Code>{`{ "name": …, "roles": [ … ], "projects": [ … ], "skills": [ … ] }`}</Code> },
    { at: "pers", note: "Copy is written for this person, not filled into a template." },
    { at: "lay", note: "Sections are chosen and ordered per user.", payload: <Code>{"[ hero ] [ projects ] [ experience ] [ skills ] [ contact ]"}</Code> },
    { at: "site", verdict: "pass", note: "A personalized site. 1,000+ users in the first week." },
  ],
  idle: "The model's output is an interface, not a paragraph.",
  footnote: "Payloads are schematic.",
};

// ─────────────────────────────────────────────── PRODUCTION RAG
export const rag: FlowSpec = {
  w: 900,
  h: 330,
  nodes: [
    { id: "content", label: "Support content", sub: "scattered", x: 85, y: 60, w: 140, kind: "io" },
    { id: "dedup", label: "Dedup", sub: "consolidate", x: 250, y: 60, w: 120 },
    { id: "kb", label: "Knowledge base", sub: "pgvector · Docker", x: 430, y: 60, w: 160, kind: "store" },
    { id: "ret", label: "Retrieve", x: 610, y: 60, w: 120 },
    { id: "gen", label: "Generate", x: 770, y: 60, w: 120, kind: "model" },
    { id: "logs", label: "Chat logs", sub: "raw", x: 85, y: 210, w: 140, kind: "io" },
    { id: "pii", label: "PII scrub", x: 250, y: 210, w: 120, kind: "gate" },
    { id: "struct", label: "Structure", sub: "intent · q · a · conf", x: 430, y: 210, w: 160, kind: "model" },
    { id: "contra", label: "Contradiction check", sub: "vs existing KB", x: 630, y: 210, w: 170, kind: "gate" },
    { id: "emb", label: "Re-embed", sub: "approved only", x: 820, y: 210, w: 110 },
    { id: "rej", label: "Rejected", sub: "conflicts with KB", x: 630, y: 300, w: 150 },
  ],
  edges: [
    { from: "content", to: "dedup" },
    { from: "dedup", to: "kb" },
    { from: "kb", to: "ret" },
    { from: "ret", to: "gen" },
    { from: "logs", to: "pii" },
    { from: "pii", to: "struct" },
    { from: "struct", to: "contra" },
    { from: "contra", to: "emb", label: "ok" },
    { from: "contra", to: "rej", kind: "reject" },
    { from: "emb", to: "kb", kind: "feedback", via: [[820, 135], [430, 135]] },
  ],
  steps: [
    { at: "content", note: "Support content was scattered across sources." },
    { at: "dedup", note: "Consolidated and deduplicated." },
    { at: "kb", note: "One knowledge base on a Dockerized pgvector store." },
    { at: "ret", note: "Questions retrieve from it…" },
    { at: "gen", note: "…and answers are generated from what was retrieved." },
    {
      at: "logs",
      note: "Meanwhile, real conversations already contain answers the KB lacks.",
      payload: <Code>{"customer: I cancelled yesterday, when do I get my refund?\n          you can reach me at priya@example.com\nagent:    refunds go to the original payment method within <N> days"}</Code>,
    },
    {
      at: "pii",
      note: "PII is scrubbed before anything is kept.",
      payload: <Code>{"customer: I cancelled yesterday, when do I get my refund?\n          you can reach me at "}<span className="text-signal">[EMAIL]</span>{"\nagent:    refunds go to the original payment method within <N> days"}</Code>,
    },
    {
      at: "struct",
      note: "The exchange becomes a structured record.",
      payload: <Code>{`{ "intent":     "refund_timeline",\n  "question":   "When do I get my refund after cancelling?",\n  "answer":     "To the original payment method within <N> days.",\n  "confidence": <score> }`}</Code>,
    },
    { at: "contra", verdict: "pass", note: "Checked against the KB for contradictions. Conflicting records are rejected; this one passes." },
    { at: "emb", note: "Approved, then embedded." },
    { at: "kb", verdict: "pass", note: "The KB now knows something nobody wrote by hand." },
  ],
  idle: "Two loops: one answers, one learns.",
  footnote: "Example conversation and record are illustrative.",
};

// ─────────────────────────────────────────────── EASYDARSHAN
type Claim = { c: string; src: string; state?: "ok" | "drop" };
function Claims({ rows, checked }: { rows: Claim[]; checked: boolean }) {
  return (
    <table className="mono w-full text-left text-[12px]">
      <thead className="text-paper-3">
        <tr>
          <th className="pb-1 pr-4 font-normal">CLAIM</th>
          <th className="pb-1 pr-4 font-normal">SOURCE</th>
          <th className="pb-1 font-normal">EVIDENCE</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.c} className={r.state === "drop" ? "text-signal line-through decoration-1" : "text-paper"}>
            <td className="py-0.5 pr-4">{r.c}</td>
            <td className="py-0.5 pr-4 text-paper-2">{r.src}</td>
            <td className={`py-0.5 ${r.state === "ok" ? "text-pass" : r.state === "drop" ? "" : "text-paper-3"}`}>
              {!checked ? "…" : r.state === "ok" ? "in snapshot ✓" : "not found ✕"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
const CLAIMS: Claim[] = [
  { c: "stop 2 · seasonal closure window", src: "official site", state: "ok" },
  { c: "stop 2 · registration required", src: "official site", state: "ok" },
  { c: "stop 2 → 3 · travel feasible in 1 day", src: "computed", state: "ok" },
  { c: "stop 3 · step-free access", src: "—", state: "drop" },
];

export const easydarshan: FlowSpec = {
  w: 780,
  h: 330,
  nodes: [
    { id: "user", label: "Pilgrim", x: 70, y: 60, w: 100, kind: "io" },
    { id: "agent", label: "Agent", sub: "plans · calls tools", x: 230, y: 60, w: 140, kind: "model" },
    { id: "tools", label: "Tools", sub: "SearXNG · Tavily · SPARQL", x: 440, y: 60, w: 180 },
    { id: "src", label: "Sources", sub: "snapshot", x: 670, y: 60, w: 140, kind: "store" },
    { id: "ext", label: "Extract", sub: "schema-constrained", x: 670, y: 190, w: 150, kind: "model" },
    { id: "check", label: "Evidence check", sub: "claim in snapshot?", x: 440, y: 190, w: 170, kind: "gate" },
    { id: "decide", label: "Decide", sub: "4 constraints", x: 230, y: 190, w: 140, kind: "model" },
    { id: "plan", label: "Itinerary", x: 70, y: 190, w: 100, kind: "io" },
    { id: "drop", label: "Dropped", sub: "no evidence", x: 440, y: 290, w: 140 },
  ],
  edges: [
    { from: "user", to: "agent" },
    { from: "agent", to: "tools" },
    { from: "tools", to: "src" },
    { from: "src", to: "ext" },
    { from: "ext", to: "check" },
    { from: "check", to: "decide" },
    { from: "check", to: "drop", kind: "reject" },
    { from: "decide", to: "plan" },
    { from: "decide", to: "agent", kind: "feedback", label: "replan" },
  ],
  steps: [
    { at: "user", note: "A request for a multi-stop pilgrimage." },
    { at: "agent", note: "The agent plans by calling tools, not by generating an answer in one shot." },
    { at: "tools", note: "Live search and official-site resolution (SearXNG, Tavily), custom scrapers, SPARQL across 2,000+ entities." },
    { at: "src", note: "What the tools found is captured as a source snapshot. Entities are resolved across conflicting sources." },
    { at: "ext", note: "Facts are extracted into a fixed schema.", payload: <Claims rows={CLAIMS} checked={false} /> },
    { at: "check", note: "Every claim is checked mechanically against the snapshot.", payload: <Claims rows={CLAIMS} checked /> },
    { at: "drop", verdict: "fail", note: "A claim the sources don't contain is dropped, however plausible it sounds.", payload: <Claims rows={CLAIMS} checked /> },
    { at: "decide", note: "Decisions use verified facts only: closures, registration, feasibility, accessibility." },
    { at: "plan", verdict: "pass", note: "An itinerary built from evidence, then a human review queue before it ships." },
  ],
  idle: "The agent decides from evidence. Unsupported claims never reach the plan.",
  footnote: "Claims shown are schematic, not real temple data.",
};

// ─────────────────────────────────────────────── NL2SQL
export const nl2sql: FlowSpec = {
  w: 940,
  h: 290,
  nodes: [
    { id: "q", label: "Question", sub: "Indian languages", x: 80, y: 70, w: 140, kind: "io" },
    { id: "tr", label: "Translate", sub: "Gemini 2.0 Flash", x: 245, y: 70, w: 140, kind: "model" },
    { id: "schema", label: "Schema retrieval", sub: "ChromaDB · top-k", x: 425, y: 70, w: 160, kind: "store" },
    { id: "gen", label: "Generate SQL", sub: "Gemini 2.0 Flash", x: 605, y: 70, w: 150, kind: "model" },
    { id: "exec", label: "Execute", sub: "SQLAlchemy", x: 760, y: 70, w: 110 },
    { id: "res", label: "Result", x: 885, y: 70, w: 90, kind: "io" },
    { id: "mem", label: "Error memory", sub: "query + schema + error", x: 760, y: 215, w: 180, kind: "store" },
    { id: "fix", label: "Correct", sub: "similar past failures", x: 520, y: 215, w: 170, kind: "model" },
  ],
  edges: [
    { from: "q", to: "tr" },
    { from: "tr", to: "schema" },
    { from: "schema", to: "gen" },
    { from: "gen", to: "exec" },
    { from: "exec", to: "res", label: "ok" },
    { from: "exec", to: "mem", kind: "reject", label: "error", start: [775, 90], via: [[775, 195]], end: [775, 195] },
    { from: "mem", to: "fix" },
    { from: "fix", to: "exec", kind: "feedback", start: [520, 195], via: [[520, 140], [735, 140]], end: [735, 90] },
  ],
  steps: [
    { at: "q", note: "A question, in Hindi.", payload: <Code>{"पिछले महीने कितने ऑर्डर रद्द हुए?\n"}<span className="text-paper-3">(How many orders were cancelled last month?)</span></Code> },
    { at: "tr", note: "Gemini translates it to English, keeping the intent." },
    { at: "schema", note: "The query is embedded; the most relevant schema chunks come back from ChromaDB.", payload: <Code>{"orders( id, customer_id, status, cancelled_on, … )"}</Code> },
    { at: "gen", note: "SQL is generated with that schema in context.", payload: <Code>{"SELECT COUNT(*) FROM orders\nWHERE status = 'cancelled'\n  AND cancel_date >= date('now', 'start of month', '-1 month');"}</Code> },
    { at: "exec", verdict: "fail", note: "Execution fails.", payload: <Code tone="signal">{"OperationalError: no such column: cancel_date"}</Code> },
    { at: "mem", note: "Failed query, schema and error are embedded together and stored. This failure is now memory." },
    { at: "fix", note: "Similar past failures are retrieved into the prompt. Gemini writes a corrected query.", payload: <Code>{"  AND "}<span className="text-pass">cancelled_on</span>{" >= date('now', 'start of month', '-1 month')"}</Code> },
    { at: "exec", verdict: "pass", note: "It executes. No retraining, no extra fine-tuning." },
    { at: "res", verdict: "pass", note: "Result returned in readable form. 78% of execution failures were corrected this way." },
  ],
  idle: "Failures are stored like documents and retrieved when they happen again.",
  footnote: "Example question, schema and SQL are illustrative. Metrics are from the published paper.",
};

// ─────────────────────────────────────────────── XAI
export const xai: FlowSpec = {
  w: 760,
  h: 250,
  nodes: [
    { id: "sense", label: "Sensors", sub: "camera · lidar · force · audio", x: 110, y: 60, w: 190, kind: "io" },
    { id: "dec", label: "Decision", sub: "safety-critical", x: 330, y: 60, w: 150, kind: "model" },
    { id: "exp", label: "Explanation", sub: "in step with the action", x: 550, y: 60, w: 190 },
    { id: "s1", label: "Supervisor", x: 160, y: 200, w: 130, kind: "human" },
    { id: "s2", label: "Technician", x: 320, y: 200, w: 130, kind: "human" },
    { id: "s3", label: "Safety officer", x: 480, y: 200, w: 140, kind: "human" },
    { id: "s4", label: "Developer", x: 640, y: 200, w: 130, kind: "human" },
  ],
  edges: [
    { from: "sense", to: "dec" },
    { from: "dec", to: "exp" },
    ...["s1", "s2", "s3", "s4"].map((s, i) => ({
      from: "exp",
      to: s,
      start: [550, 80] as [number, number],
      via: [
        [550, 130],
        [[160, 320, 480, 640][i], 130],
      ] as [number, number][],
    })),
  ],
  steps: [
    { at: "sense", note: "Multi-modal input arrives in real time." },
    { at: "dec", note: "The system makes a decision that affects someone's safety." },
    { at: "exp", note: "The explanation is produced with the decision, not reconstructed afterwards." },
    { at: ["s1", "s2", "s3", "s4"], verdict: "pass", note: "Each stakeholder gets the explanation their role needs, at the depth it needs." },
  ],
  idle: "Post-hoc explanation arrives too late for a robot. The chapter argues for interpretability by design.",
};

// ─────────────────────────────────────────────── ENVIRONMENTAL
export const env: FlowSpec = {
  w: 700,
  h: 170,
  nodes: [
    { id: "data", label: "Env. data", sub: "climate time series", x: 85, y: 60, w: 150, kind: "io" },
    { id: "model", label: "SARIMA · BiLSTM", x: 280, y: 60, w: 170, kind: "model" },
    { id: "opt", label: "Optuna", sub: "hyperparameter search", x: 280, y: 140, w: 170 },
    { id: "est", label: "Estimate", sub: "e.g. population", x: 500, y: 60, w: 150, kind: "io" },
  ],
  edges: [
    { from: "data", to: "model" },
    { from: "model", to: "opt", start: [250, 80], end: [250, 120] },
    { from: "opt", to: "model", kind: "feedback", start: [310, 120], end: [310, 80], label: "" },
    { from: "model", to: "est" },
  ],
  steps: [
    { at: "data", note: "Environmental and climate-related time series." },
    { at: "model", note: "Classical (SARIMA) and deep (BiLSTM) models." },
    { at: "opt", note: "Optuna searches the hyperparameters." },
    { at: "model", note: "Trials feed back into the model." },
    { at: "est", verdict: "pass", note: "One direction: estimating polar bear populations." },
  ],
  idle: "Where the research started.",
};
