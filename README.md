# Krish Arya — System

Portfolio site. Design rationale (phases 1–6 of the brief) is in [`DESIGN.md`](DESIGN.md).

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

Site URL defaults to `https://krisharya.in` (OpenGraph, canonical, robots, sitemap). Override with `NEXT_PUBLIC_SITE_URL` for preview deploys.

## Where things live

| Path | What |
|---|---|
| `src/content/data.ts` | **Every fact on the site.** Projects (L1–L4 text, metrics, stack), experience, topology, loop table. Edit content here only. |
| `src/lib/graph.ts` | The system graph shared by the 3D core and the static map |
| `src/lib/store.ts` | Tiny external store: zone, focus, depth, run signals |
| `src/components/Terminal.tsx` | `krish@system:~$`. Commands: help, projects, show <name>, experience, research, stack, depth <1-4>, loop, contact, whoami, clear, boot |
| `src/components/core/` | R3F scene (desktop + WebGL only) and the SVG fallback map |
| `src/components/diagrams/` | `Flow` (steppable loop engine) + `specs.tsx` per project; custom instruments for voice, eval, scam, Mira |

## Content rules

Only facts from the resume, the three papers, the V2V deck and the brief. Example payloads inside diagrams (code, SQL, chat logs, findings, signal traces) are labelled illustrative on the page. Before adding a metric, check it exists in a source.

## Accessibility and fallbacks

- 3D is never required: phones, `prefers-reduced-motion`, and missing WebGL get a static SVG system map.
- Boot sequence ≤1.1s, skipped on any input, never shown twice, never shown with reduced motion.
- All diagrams have Step/Reset controls and text readouts; motion only plays when a diagram is first seen or asked to run.
- Keyboard: `/` or `` ` `` focuses the terminal; Tab completes; Esc closes.
