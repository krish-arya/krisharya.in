# KRISH ARYA — SYSTEM
Design document. Phases 1–6 of the brief in `product.md`. Implementation is this repo.

---

## PHASE 1 — ANALYSIS

### Source material read
| Source | What it contributes |
|---|---|
| `Krish_Arya_Resume_EY_AI_Engineer.pdf` (3 identical copies) | Roles, dates, every production metric, contact links, leadership |
| `Self healing_krish.pdf` (published, Springer LNNS 2052, ICICC 2026, pp. 437–444) | NL2SQL architecture, 92% / 4% / 4%, 78%, 20–25%, 14 SQL types, Gemini 2.0 Flash, embedding-001, ChromaDB, SQLAlchemy, Indian languages |
| `nlp_2_sql_springer__Copy_ (2).pdf` | Pre-print of the same paper; nothing new |
| `IJSA-S-26-01772.pdf` | Scam-detection manuscript (Kaur, Mehta, Arya): RQs, signal families, models, F1 0.97, EW recall 0.94, detection at ~50 shares vs 500+ viral threshold |
| `Chapter_8.pdf` | Full chapter title, authors (Kaur, Mehta, Arya), structure: layered explanations, real-time interpretability, AV / medical / industrial case studies |
| `V2V_Agent_Second_Presentation.pptx` | Full V2V architecture, API stack + fallbacks, free-tier budget, overlapped data-flow, milestones. **Team of three, in progress, latency not yet measured.** |

### Accuracy constraints discovered (these override the brief where they conflict)
- All three papers are co-authored; Prabhjot Kaur is first author on each. The site lists full author lists.
- The book chapter's real title is *"Explainable AI for Safety-Critical Decision Making in Autonomous Robotics: From Black Boxes to Transparent Agents"* (Ch. 8, *Explainable AI in Critical Domains*, Nova Science).
- V2V agent: co-built with Saksham Garg and Krishan Kishore, mentor Mr. Akshay Singh. Status at second review: API stack and backend architecture complete; integration in progress; latency evaluation upcoming. **The site shows p50/p95/p99 as what the tracer will report, never as numbers.**
- Environmental research and Mira have no source documents beyond the brief → described only at the level the brief states.
- Phone number is on the resume; it is deliberately left off the site.

### Strongest projects (by evidence density)
1. EaseMyTrip production stack — voice <200ms, RAG self-updating KB, eval platform 50K+, EasyDarshan 2,000+ entities
2. Mutagen — 11K LOC, published package, a genuinely original success criterion
3. Bylin.app — sole engineer, idea → live users
4. NL2SQL — published, three hard numbers
5. LaunchMyFolio — 1,000+ users week one

### Strongest metrics (all sourced)
`<200ms` · `50K+ conversations` · `2,000+ entities` · `92% Spider` · `78% auto-corrected` · `20–25% est. compute` · `1,000+ users / week one` · `~11K LOC` · `75% / 45%` (Growify) · `F1 0.97 / EW recall 0.94 / ~50 vs 500+` (scam manuscript) · `10,000+ footfall / 500+ team` (ENVA Fest)

### Recurring architecture pattern — the key finding
Nearly every system Krish built has the same shape: **generate → verify against something real → feed the result back.**

| System | Generator | Verifier | What gets fed back |
|---|---|---|---|
| Mutagen | LLM writes a test | Does it kill the injected mutant? | Survivors trigger regeneration |
| NL2SQL | Gemini writes SQL | Execution against the DB | Failure + schema + error → vector memory |
| Production RAG | Chat logs → Q/A records | PII scrub, contradiction check vs KB | Approved records re-embedded |
| Bylin | Multi-model generation | Embedding sim + LLM grade | Approval history biases later generations |
| EasyDarshan | LLM extraction | Mechanical evidence check vs source snapshot | Unsupported claims dropped |
| Eval platform | The bot itself | Composite bot-health score | Scores → where to fix |
| Mira pilot | AI first-pass review | Engineer accepts / ignores | Signal quality → workflow fit |
| V2V | Speculative prefill on partials | Did the partial change? | Discard and reissue |

Second motif: **streaming + overlap** (voice agents: stages run concurrently, not in sequence).
Third motif: **evidence over assertion** (claims must exist in the source; tests must demonstrate detection).

### Recurring visual metaphors
loop · gate · trace / timeline · frames · packets · evidence graph · instrument channels

---

## PHASE 2 — THREE CREATIVE DIRECTIONS

### A. SIGNAL CHAIN
- **Metaphor:** the portfolio as an oscilloscope. Every system is a signal path; every project is measured.
- **Visual language:** graticule grids, phosphor-free (warm white on black), trace lines, time axes in ms.
- **3D:** a single long signal bench receding in depth; each project is a stage module on the bench.
- **Homepage:** a live overlapped-stage waterfall (from the V2V data-flow slide) where the "stages" are Krish's career.
- **Signature interaction:** scrubbing a timeline cursor across the page; everything updates to that moment.
- **Projects:** each is a per-stage trace with latency annotations.
- **Research:** recorded experiments on a trace history.
- **Experience:** a horizontal timeline track.
- **Mobile:** vertical trace, cursor becomes scroll position.
- **Why different:** built from the V2V slide, not from a template. **Weakness:** over-indexes on latency; products and research don't have honest ms numbers, so it would tempt fake measurement.

### B. CLOSED LOOP  ← recommended
- **Metaphor:** every system Krish builds is a loop: generate → verify → feed back. The site is a map of those loops, connected into one system.
- **Visual language:** thin technical linework, monospace stage labels, one signal colour for data in motion, gates drawn as physical breaks in a line, sage for "passed verification".
- **3D:** a central "system core": machined, matte nodes arranged in the brief's §30 hierarchy (RESEARCH → MODELS → RAG/AGENTS/VOICE → SYSTEMS → PRODUCTS/EVALUATION → WORKFLOW → MIRA), connected by edges with packets moving along them. Scroll moves the camera down the hierarchy; terminal commands fly the camera to a node and activate its loop.
- **Homepage:** name + statement over the core; a terminal docked at the bottom.
- **Signature interaction:** `krish@system:~$ show mutagen` → camera travels, node activates, packets start flowing, the page scrolls to the project and its loop runs one cycle.
- **Projects:** each project gets its *own* loop diagram, built from its real architecture, with a 4-level depth control (What → How → Why → Implementation).
- **Research:** experiment records (EXP-001…) with apparatus, method, result, and authorship. The NL2SQL loop is steppable.
- **Experience:** a system log, with metrics as the loudest typography.
- **Mobile:** 3D replaced by a static system map; diagrams stay (they're SVG); terminal becomes a command sheet with tappable chips.
- **Why different:** the metaphor is *extracted from his work* (the table above). It couldn't be moved into another person's portfolio without being false.

### C. THE RACK
- **Metaphor:** an equipment rack. Each project is a 1U/2U module you pull out to inspect.
- **Visual language:** brushed panels, screw heads, indicator LEDs, front-panel typography.
- **3D:** a physically lit rack; modules slide out on hover/click.
- **Homepage:** the rack, powered off; boot turns modules on.
- **Signature interaction:** pulling a module to see its internals.
- **Projects / research / experience:** modules of different heights; research in a separate rack.
- **Mobile:** modules as a stacked list.
- **Why different:** strongly physical. **Weakness:** skeuomorphic; the metaphor says "hardware", which Krish doesn't build, and it hides architecture behind panels.

---

## PHASE 3 — RECOMMENDATION

**B. CLOSED LOOP**, with A's motion grammar (streaming, overlap, frames) borrowed for the motion system.

- It is the only one of the three that is *true about the work*: the generate–verify–feedback loop really does recur across production, products, research and the Mira pilot.
- It turns the brief's central sentence ("I engineer systems around it") into something visible: the LLM is always one box; the engineering is everything around the box.
- It accommodates honest numbers and honest absences. Where there's a metric, it labels the gate; where there isn't, the loop still explains the system.
- The 3D layer has a job (the system map + camera focus), not a decoration role.

---

## PHASE 4 — INFORMATION ARCHITECTURE

Single page, deep-linkable (`/#mutagen`), ordered by the brief's four worlds:

```
00  BOOT                 ≤1.1s, skippable, skipped on return + reduced motion
01  HERO / SYSTEM CORE   name · statement · roles · [ENTER THE SYSTEM] · 3D core
    INDEX                the four worlds as a 4-column legend + the loop thesis table
02  WORLD 1 — BUILD      Bylin.app (Tov AI) · Mutagen · LaunchMyFolio
03  WORLD 2 — ENGINEER   EaseMyTrip: Voice · RAG · Eval · EasyDarshan;  V2V (academic, team)
04  WORLD 3 — RESEARCH   EXP-001 NL2SQL · EXP-002 Scam detection · EXP-003 XAI chapter · EXP-000 Environmental ML
05  WORLD 4 — INTEGRATE  Mira code-review pilot
06  LOG                  experience as a system log (2026 → 2025), metrics loud
07  TOPOLOGY             skills as a relationship graph tied back to projects
08  OPERATOR             the human: education, Prakriti/ENVA Fest, TARK, short understated note
09  TRANSMISSION         contact
```

Every project block has the same internal skeleton (so engineers learn to scan it):
`ID · world · context line` → `title` → `loop diagram` → `depth tabs L1–L4` → `metrics strip` → `stack`.

---

## PHASE 5 — INTERACTION ARCHITECTURE

**Navigation.** A thin top rail: `KRISH ARYA — SYSTEM` · world indices `01 BUILD 02 ENGINEER 03 RESEARCH 04 INTEGRATE` · `DEPTH [1 2 3 4]` · `LOG` `CONTACT`. The global depth control sets the default disclosure level for every project (recruiter = 1, engineer = 4).

**Scroll.** The 3D camera's target follows the active world: Research → models node, Build → products, Engineer → systems, Integrate → workflow/Mira. Smoothly damped, never scroll-jacked. Content scrolls natively.

**Object states** (3D nodes and 2D stages share them): `idle` (outline, dim) → `hover/inspect` (label + edges brighten) → `active` (packets flow through its edges, signal colour) → `verified` (sage tick) / `rejected` (signal colour strike).

**Transitions.** Only state changes animate. Durations: 120ms (UI), 280ms (panels), 900ms (camera). Easing: `cubic-bezier(.2,.7,0,1)`, fast out, physical settle.

**Terminal.** Docked bottom bar, `/` or `` ` `` focuses it. Commands: `help` `projects` `experience` `research` `stack` `contact` `show <id>` `depth <1-4>` `whoami` `clear` `boot`. History ↑/↓, Tab autocompletes. Output streams line by line (frame cadence, like STT partials). `show <id>` = print summary + set 3D focus + scroll + run that project's loop once.

**Project interactions.**
- Mutagen: step the FSM by hand (generate → inject → run → verdict); mutant shown as a real one-character diff; a surviving mutant forces regeneration.
- NL2SQL: step the self-healing loop; error routes through memory.
- Voice / V2V: overlapped-stage timeline; `BARGE IN` cancels playback mid-stream.
- RAG: records flow through PII scrub and contradiction check; some get rejected.
- EasyDarshan: claims checked against a source snapshot; unsupported ones get struck.
- Mira: findings arrive; engineer accepts / ignores; a signal-to-noise readout shows why noise kills adoption.
- Every diagram has a static, labelled state, so meaning never depends on animation.

**3D states.** `boot` (nodes appear in dependency order) → `overview` → `focus(node)` → `overview`. Pauses rendering when off-screen or tab hidden.

**Mobile.** No WebGL core; a static SVG system map takes its place. Diagrams remain. Terminal becomes a sheet with tappable command chips. Depth control lives in the sheet.

---

## PHASE 6 — DESIGN SYSTEM

**Typography.**
- Display / body: **Archivo** (variable width axis: condensed for big headlines, normal for text).
- Metadata / labels / terminal: **IBM Plex Mono**.
- Human voice (Operator section, small asides only): **Instrument Serif** italic.
- Scale: 12 / 13 / 15 / 17 / 22 / 32 / 48 / clamp(56→168) for the hero.

**Colour** (warm, restrained, one signal):
| token | value | use |
|---|---|---|
| `--ink-0` | `#0C0C0B` | background |
| `--ink-1` | `#131311` | raised surfaces |
| `--ink-2` | `#1B1B18` | wells, terminal |
| `--line` | `rgba(236,231,221,.10)` | hairlines |
| `--line-2` | `rgba(236,231,221,.20)` | emphasised rules |
| `--paper` | `#ECE7DD` | primary text |
| `--paper-2` | `#A39E93` | secondary text |
| `--paper-3` | `#6E6A62` | metadata |
| `--signal` | `#FF5A1F` | data in motion, active state, the one accent |
| `--pass` | `#A9C2A6` | verified / passed gate |

**Spacing.** 4px base; section rhythm 96 / 160px desktop, 64 / 96 mobile; 12-column grid, 24px gutter, max width 1440.
**Borders.** 1px hairlines only. Radius 0 everywhere except 2px on inputs. No glass, no blur.
**Shadows.** None in 2D. Depth comes from the 3D layer only.
**Texture.** 3% film grain overlay + 64px technical grid at 4% opacity, masked to fade.
**3D materials.** `MeshStandardMaterial`, roughness 0.85, metalness 0.15, warm grey (#2a2926); active nodes get an emissive signal rim. No bloom, no transmission.
**Lighting.** One warm key (directional, upper left, 2.2), cool weak fill (0.25), ambient 0.15. Fog to background colour for depth.
**Animation principles.** Motion = information. Nothing loops unless data is flowing. Nothing spins. Reduced motion → all loops static, camera cuts instead of travels, boot skipped.
**Responsive.** ≥1100 full experience; 720–1100 diagrams stack under text, 3D reduced; <720 no WebGL, map SVG, single column, terminal sheet.
