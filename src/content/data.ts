/**
 * Every fact on the site lives here.
 * Sources: resume (R), product brief (B), NL2SQL paper (P1), scam manuscript (P2),
 * book chapter 8 (P3), V2V second-review deck (V). Nothing is added beyond them.
 */

export type WorldId = "build" | "engineer" | "research" | "integrate";

export type ProjectId =
  | "bylin"
  | "mutagen"
  | "folio"
  | "voice"
  | "rag"
  | "eval"
  | "easydarshan"
  | "v2v"
  | "nl2sql"
  | "scam"
  | "xai"
  | "env"
  | "mira";

/** A paragraph, or a list of short points. */
export type Block = string | { list: string[] };

export interface Metric {
  value: string;
  label: string;
}

export interface Project {
  id: ProjectId;
  code: string;
  world: WorldId;
  title: string;
  /** One line under the title. */
  kicker: string;
  /** Monospace metadata row. */
  meta: string[];
  status?: string;
  authors?: string;
  venue?: { label: string; href?: string };
  /** L1 what · L2 how · L3 why · L4 implementation */
  levels: [Block[], Block[], Block[], Block[]];
  metrics: Metric[];
  stack: string[];
  /** Extra names the terminal accepts for `show <name>`. */
  aliases: string[];
}

export const person = {
  name: "Krish Arya",
  location: "New Delhi, India",
  roles: ["AI Engineer", "Builder", "Researcher"],
  education: {
    school: "Maharaja Surajmal Institute of Technology",
    degree: "B.Tech Information Technology",
    years: "2023–2027",
    cgpa: "8.5",
  },
  email: "hello@krisharya.in",
  links: [
    { label: "GitHub", handle: "krish-arya", href: "https://github.com/krish-arya" },
    { label: "LinkedIn", handle: "krish-arya-", href: "https://www.linkedin.com/in/krish-arya-" },
    { label: "Email", handle: "hello@krisharya.in", href: "mailto:hello@krisharya.in" },
  ],
};

export const worlds: { id: WorldId; n: string; name: string; theme: string }[] = [
  { id: "build", n: "01", name: "Build", theme: "Shipping products" },
  { id: "engineer", n: "02", name: "Engineer", theme: "Complex AI systems in production" },
  { id: "research", n: "03", name: "Research", theme: "Investigation and experiment" },
  { id: "integrate", n: "04", name: "Integrate", theme: "AI inside a real engineering org" },
];

/** The generate → verify → feed back pattern, per system. Drives the index table. */
export const loops: { id: ProjectId; system: string; generator: string; verifier: string; feedback: string }[] = [
  { id: "mutagen", system: "Mutagen", generator: "LLM writes a test", verifier: "Does it kill the injected mutant?", feedback: "Survivors are regenerated" },
  { id: "nl2sql", system: "NL2SQL", generator: "Gemini writes SQL", verifier: "Execution against the database", feedback: "Failure + schema + error → vector memory" },
  { id: "rag", system: "Support RAG", generator: "Chat logs → Q/A records", verifier: "PII scrub, contradiction check vs KB", feedback: "Approved records re-embedded" },
  { id: "bylin", system: "Bylin.app", generator: "Multi-model generation", verifier: "Embedding similarity + LLM grade", feedback: "Approval history biases later outputs" },
  { id: "easydarshan", system: "EasyDarshan", generator: "Schema-constrained extraction", verifier: "Is the claim in the source snapshot?", feedback: "Unsupported claims dropped" },
  { id: "eval", system: "Eval platform", generator: "The support bot", verifier: "Composite bot-health score", feedback: "Four channels show where it fails" },
  { id: "v2v", system: "V2V agent", generator: "Speculative prefill on a partial", verifier: "Did the partial change?", feedback: "Discard and reissue" },
  { id: "mira", system: "Mira pilot", generator: "AI first-pass review", verifier: "Engineer accepts or ignores", feedback: "Signal quality decides adoption" },
];

export const projects: Project[] = [
  // ───────────────────────────── BUILD
  {
    id: "bylin",
    code: "B-01",
    world: "build",
    title: "Bylin.app",
    kicker: "An AI content-generation product. Idea to live users, one engineer.",
    meta: ["Tov AI", "AI Engineer", "Apr–Jun 2026", "Remote"],
    levels: [
      [
        "An AI content-generation product built at Tov AI and taken from idea to live users. I was the sole engineer: model pipeline, database, deployment and instrumentation.",
      ],
      [
        "Every request runs a multi-stage pipeline: summarization, retrieval, generation, quality scoring. It runs across multiple models via OpenRouter and is orchestrated on self-hosted n8n. Users then approve or reject what comes out.",
      ],
      [
        "A model can't grade its own output in the same breath it writes it, so scoring is a separate stage. A normalized score fuses embedding similarity with an LLM-graded evaluation, and weak outputs are filtered automatically before anyone sees them.",
        "Approval history is fed back to bias later generations toward what each user actually accepts.",
      ],
      [
        {
          list: [
            "Postgres on Supabase; schema designed from scratch",
            "Per-user, UUID-scoped approval state with auto-archival",
            "Credential hashing",
            "Payment-gateway sync",
            "Approval history stored and fed back into generation",
          ],
        },
      ],
    ],
    metrics: [
      { value: "1", label: "Engineer (sole)" },
      { value: "4", label: "Pipeline stages" },
      { value: "Live", label: "Shipped to users" },
    ],
    stack: ["OpenRouter", "n8n (self-hosted)", "Postgres", "Supabase", "Embeddings", "LLM grading"],
    aliases: ["bylin.app", "tov", "tov-ai"],
  },
  {
    id: "mutagen",
    code: "B-02",
    world: "build",
    title: "Mutagen",
    kicker: "LLM-driven mutation testing. A test only survives if it catches a planted bug.",
    meta: ["Open source", "Python", "pip install mutagen-ai"],
    levels: [
      ["LLM-driven test generation where every generated test must kill an injected mutant to survive."],
      [
        "An LLM writes a test. Mutagen injects a mutant, a small deliberate fault in the code under test. The test runs against the mutant. If the test fails, it detected the fault: the mutant is killed and the test is kept. If the test still passes, it can't see the fault, so it gets regenerated.",
      ],
      [
        "Coverage measures which lines ran, not whether a test would notice them being wrong. Two tests can cover exactly the same line while only one of them can detect a bug in it.",
        "So demonstrated fault detection, not coverage, is the success criterion.",
      ],
      [
        {
          list: [
            "Clean / Hexagonal architecture",
            "Closed loop modelled as a finite state machine",
            "Async I/O",
            "Crash-safe resume",
            "~11K lines of Python",
            "Published as a pip package: mutagen-ai",
          ],
        },
      ],
    ],
    metrics: [
      { value: "~11K", label: "Lines of code" },
      { value: "Kill", label: "Success criterion, not coverage" },
      { value: "PyPI", label: "mutagen-ai" },
    ],
    stack: ["Python", "LLMs", "Mutation testing", "FSM", "asyncio", "Hexagonal architecture"],
    aliases: ["mutagen-ai", "mutation"],
  },
  {
    id: "folio",
    code: "B-03",
    world: "build",
    title: "LaunchMyFolio",
    kicker: "A resume goes in. A personalized portfolio site comes out.",
    meta: ["Product", "Groq", "Flask", "Next.js"],
    levels: [
      ["An AI platform that turns a resume into a personalized portfolio site, end to end. 1,000+ users in its first week."],
      ["The resume is read and understood, then the system generates tailored copy, picks the sections and lays them out for each user."],
      ["The model's output here isn't text for someone to read. It's an interface. Copy, structure and layout are all generated per person."],
      [{ list: ["Groq API for inference", "Flask backend", "Next.js front end", "Per-user copy, section and layout generation"] }],
    ],
    metrics: [
      { value: "1,000+", label: "Users in week one" },
      { value: "3", label: "Things generated: copy, sections, layout" },
    ],
    stack: ["Groq", "Flask", "Next.js"],
    aliases: ["launchmyfolio", "lmf", "portfolio"],
  },

  // ───────────────────────────── ENGINEER (EaseMyTrip)
  {
    id: "voice",
    code: "E-01",
    world: "engineer",
    title: "Real-time voice agent",
    kicker: "In-house outbound calling. Speech in, speech out, under 200ms.",
    meta: ["EaseMyTrip", "Production", "LiveKit"],
    levels: [
      ["An in-house real-time voice agent for outbound calling, with under 200ms end-to-end latency."],
      [
        "STT, LLM and TTS run as one streaming pipeline instead of three calls in sequence. Audio streams into speech-to-text, text streams into the model, and tokens stream into text-to-speech. LiveKit handles transport.",
      ],
      [
        "Vendors were chosen on latency distribution and cost, not headline quality. The callers speak with Indian accents and in Hinglish, so that's the speech the vendor evaluation was run on.",
      ],
      [
        {
          list: [
            "Streaming STT → LLM → streaming TTS, orchestrated as one pipeline",
            "LiveKit for real-time transport",
            "Vendor evaluation: Indian-accent and Hinglish support",
            "Selection on latency distribution and cost",
          ],
        },
      ],
    ],
    metrics: [
      { value: "<200ms", label: "End-to-end latency" },
      { value: "3", label: "Streaming stages, overlapped" },
    ],
    stack: ["STT", "LLM", "TTS", "LiveKit", "Streaming"],
    aliases: ["voice-agent", "voice-agent-prod", "calling"],
  },
  {
    id: "rag",
    code: "E-02",
    world: "engineer",
    title: "Production RAG",
    kicker: "A customer-support knowledge base that updates itself from real conversations.",
    meta: ["EaseMyTrip", "Production", "pgvector"],
    levels: [
      ["Took the customer-support chatbot to a production RAG system whose knowledge base keeps itself current."],
      [
        "Scattered support content was consolidated into one deduplicated knowledge base on a Dockerized pgvector store.",
        "A pipeline then turns raw chat logs into (intent, question, answer, confidence) records. It scrubs PII, checks each record against the KB for contradictions, and re-embeds the additions that are approved.",
      ],
      [
        "A knowledge base written once goes stale, and real conversations already contain the missing answers. They also contain personal data and wrong answers. The PII scrub and contradiction check are what make it safe to let the KB learn from them.",
      ],
      [
        {
          list: [
            "Dedup + consolidation into a single KB",
            "pgvector, Dockerized",
            "Chat log → (intent, question, answer, confidence)",
            "PII scrubbing before structuring",
            "Contradiction check against existing KB",
            "Re-embedding of approved additions",
          ],
        },
      ],
    ],
    metrics: [
      { value: "Self-updating", label: "Knowledge base" },
      { value: "4", label: "Fields per learned record" },
    ],
    stack: ["pgvector", "Postgres", "Docker", "Embeddings", "PII scrubbing"],
    aliases: ["kb", "knowledge-base", "support-rag"],
  },
  {
    id: "eval",
    code: "E-03",
    world: "engineer",
    title: "Evaluation platform",
    kicker: "Defined how the support bot is measured. Then built the instrument.",
    meta: ["EaseMyTrip", "FastAPI", "React"],
    levels: [
      ["Defined the chatbot's evaluation framework from scratch and built the platform that runs it, scoring 50K+ conversations in parallel."],
      [
        "A composite bot-health score combines four signals: escalations, tool-call success, intent resolution and friction. A FastAPI service scores conversations in parallel, with a React front end.",
      ],
      [
        "One accuracy number blurs different failures together. Separate channels tell you whether a conversation went wrong because a tool call failed, an intent wasn't resolved, the exchange had friction, or it escalated to a human.",
      ],
      [{ list: ["Composite score: escalations · tool-call success · intent resolution · friction", "FastAPI scoring service, parallel execution", "React front end", "50K+ conversations scored"] }],
    ],
    metrics: [
      { value: "50K+", label: "Conversations scored" },
      { value: "4", label: "Health channels" },
    ],
    stack: ["FastAPI", "React", "Python", "Eval pipelines"],
    aliases: ["evaluation", "bot-health", "eval-platform"],
  },
  {
    id: "easydarshan",
    code: "E-04",
    world: "engineer",
    title: "EasyDarshan",
    kicker: "An agentic pilgrimage planner that decides from evidence, not from fluency.",
    meta: ["EaseMyTrip", "Agentic", "Going live"],
    levels: [
      ["An agentic AI planner for multi-stop pilgrimage itineraries under real constraints. I designed the agent loop and shipped the full-stack app around it."],
      [
        "The agent plans through tool calls over retrieval and computed data instead of single-shot generation. It checks seasonal closures, mandatory registration, travel feasibility and accessibility.",
        "The app around it has admin roles and a human review queue.",
      ],
      [
        "Closures and registration rules are exactly the kind of fact a language model will confidently make up. So extraction is schema-constrained, and a mechanical evidence check drops any claim that isn't present in the source snapshot.",
      ],
      [
        {
          list: [
            "Live search + official-site resolution: SearXNG, Tavily",
            "Custom scrapers",
            "SPARQL discovery across 2,000+ entities",
            "Entity resolution over conflicting sources",
            "Schema-constrained LLM extraction",
            "Mechanical evidence check against the source snapshot",
          ],
        },
      ],
    ],
    metrics: [
      { value: "2,000+", label: "Entities discovered via SPARQL" },
      { value: "4", label: "Hard constraints per plan" },
    ],
    stack: ["Agents", "Tool calling", "SearXNG", "Tavily", "SPARQL", "Scrapers", "Structured extraction"],
    aliases: ["darshan", "pilgrimage"],
  },
  {
    id: "v2v",
    code: "E-05",
    world: "engineer",
    title: "Low-latency voice-to-voice agent",
    kicker: "Start thinking before the user finishes. Stop talking the moment they interrupt.",
    meta: ["Academic", "Minor project", "MSIT"],
    status: "In progress · architecture complete, integration next, latency evaluation upcoming",
    authors: "With Saksham Garg and Krishan Kishore · Mentor: Mr. Akshay Singh",
    levels: [
      ["A voice agent designed around overlap: each stage starts before the previous one has finished, and playback can be cancelled mid-sentence."],
      [
        "Audio arrives in 20ms frames. Silero VAD detects speech. Streaming STT emits partial transcripts. When a partial is stable, the LLM starts a speculative prefill. Tokens are cut into clause-level chunks and streamed to TTS, so playback begins on the first clause.",
        "If the user speaks, playback is cancelled and history is truncated (barge-in).",
      ],
      [
        "End-to-end latency only equals the sum of the stages if they run in sequence. Overlapping them moves the model's work into time the user is still talking.",
        "Speculation has a cost: if the partial changes, the prefill is discarded and reissued.",
      ],
      [
        {
          list: [
            "LiveKit Agents worker on Python asyncio, hub-and-spoke around one orchestrator",
            "FastAPI token service issues LiveKit room JWTs",
            "STT: Deepgram Nova-3 · fallback faster-whisper",
            "LLM: Groq Llama 3.1 8B Instant · fallback Ollama",
            "TTS: Deepgram Aura-2 · fallback Kokoro-82M",
            "Adapters hide the vendor, so switching one is a config change",
            "Frame-level tracer timestamps every hop and reports p50 / p95 / p99",
            "₹0 planned API spend on free tiers",
          ],
        },
      ],
    ],
    metrics: [
      { value: "20ms", label: "Audio frames" },
      { value: "p50·p95·p99", label: "Per-stage tracing (evaluation pending)" },
      { value: "₹0", label: "Planned API spend" },
    ],
    stack: ["LiveKit", "FastAPI", "asyncio", "Silero VAD", "Deepgram Nova-3", "Groq Llama", "Deepgram Aura-2"],
    aliases: ["voice-to-voice", "v2v-agent", "lowlatency"],
  },

  // ───────────────────────────── RESEARCH
  {
    id: "nl2sql",
    code: "EXP-001",
    world: "research",
    title: "Self-healing multilingual NLP-to-SQL",
    kicker: "When the SQL fails, the system remembers why.",
    meta: ["Springer LNNS 2052", "ICICC 2026", "pp. 437–444"],
    authors: "Prabhjot Kaur, Krish Arya, Kashika Malhotra, Vibhuti Mehta, Khushi Sehrawat, Preeti Singh",
    venue: { label: "doi:10.1007/978-3-032-30909-9_34", href: "https://doi.org/10.1007/978-3-032-30909-9_34" },
    levels: [
      ["Ask a database a question in Hindi, Tamil, Bengali, Urdu or English and get SQL back. When the SQL fails, the failure becomes memory."],
      [
        "A LangChain agent on Gemini 2.0 Flash translates the question, retrieves relevant schema chunks from ChromaDB, writes SQL and executes it through SQLAlchemy.",
        "On failure, the failed query, its schema and the exact error are embedded together and stored. Later failures retrieve the most similar past cases and use them to correct the SQL.",
      ],
      [
        "Self-correction usually costs either retraining or repeated inference passes. Here, past failures are retrieved like documents.",
        "78% of execution failures were corrected without retraining, and fewer redundant LLM calls give an estimated 20–25% compute saving at scale.",
      ],
      [
        {
          list: [
            "Gemini 2.0 Flash for translation and SQL generation",
            "Gemini embedding-001 + ChromaDB for schema and error memory",
            "Two LangChain tools: generate, execute (SQLAlchemy)",
            "Spider: 92% correct · 4% errors · 4% skipped",
            "Evaluated across 14 SQL query types",
          ],
        },
      ],
    ],
    metrics: [
      { value: "92%", label: "Accuracy on Spider" },
      { value: "78%", label: "Execution failures auto-corrected" },
      { value: "20–25%", label: "Est. compute saved at scale" },
    ],
    stack: ["Gemini 2.0 Flash", "LangChain", "ChromaDB", "SQLAlchemy", "Embeddings"],
    aliases: ["sql", "text-to-sql", "nlp2sql", "nlp-to-sql"],
  },
  {
    id: "scam",
    code: "EXP-002",
    world: "research",
    title: "Proactive financial scam detection",
    kicker: "Flag the scam while it's still small.",
    meta: ["Intl. J. of System Assurance Engineering & Management", "Springer"],
    authors: "Prabhjot Kaur, Vibhuti Mehta, Krish Arya",
    levels: [
      ["A multimodal framework asking whether AI can detect a financial scam before it goes viral."],
      [
        "Signals come from four families (text, metadata, network structure and temporal dynamics) across phishing emails, blockchain Ponzi data and social-media scam posts.",
        "Models range from Random Forests and LSTMs to graph neural networks and LLMs. They're evaluated on classification and on early warning: lead time to virality and the cost of false alarms.",
      ],
      [
        "Accuracy after a scam has spread doesn't help the people who already saw it. The measure that matters is how early.",
        "The best hybrid flagged scams at a cascade of about 50 shares, against a viral threshold of 500+.",
      ],
      [
        {
          list: [
            "Best hybrid: Claude 4 Opus with chain-of-thought prompting + temporal graph neural networks",
            "F1 0.97 · early-warning recall 0.94",
            "Ablations, adversarial robustness tests, diffusion simulations",
            "PyTorch, TensorFlow, Hugging Face; Docker environment for reproduction",
          ],
        },
      ],
    ],
    metrics: [
      { value: "~50", label: "Shares at detection" },
      { value: "500+", label: "Viral threshold" },
      { value: "0.97", label: "F1 (best hybrid)" },
    ],
    stack: ["LLMs", "Chain-of-thought", "Temporal GNNs", "LSTMs", "Random Forests"],
    aliases: ["scam-detection", "fraud", "financial"],
  },
  {
    id: "xai",
    code: "EXP-003",
    world: "research",
    title: "XAI in autonomous systems and robotics",
    kicker: "A robot's explanation is only useful if it arrives in time to act on.",
    meta: ["Book chapter 8", "Explainable AI in Critical Domains", "Nova Science Publishers"],
    authors: "Prabhjot Kaur, Vibhuti Mehta, Krish Arya",
    venue: { label: "Explainable AI for Safety-Critical Decision Making in Autonomous Robotics: From Black Boxes to Transparent Agents" },
    levels: [
      ["A book chapter on explainability for autonomous systems that make safety-critical decisions."],
      [
        "It examines XAI across autonomous vehicles, medical robotics and industrial automation, and proposes a framework for multi-modal explanation generation under robotic constraints: limited compute, real-time operation, and different explanation needs for different stakeholders.",
      ],
      [
        "The central argument is that post-hoc explanation isn't enough for robots. Explanations have to be produced in step with the action, which pushes toward architectures that are interpretable by design.",
      ],
      [
        {
          list: [
            "Layered explanation architecture",
            "Attention-based and causal explanation models",
            "Trust calibration and adaptive explanations",
            "Evaluating explanation quality in safety-critical contexts",
          ],
        },
      ],
    ],
    metrics: [
      { value: "3", label: "Domains: vehicles, medical, industrial" },
      { value: "Ch. 8", label: "Nova Science" },
    ],
    stack: ["Explainable AI", "Robotics", "Human-robot interaction", "Safety"],
    aliases: ["explainable", "robotics", "chapter"],
  },
  {
    id: "env",
    code: "EXP-000",
    world: "research",
    title: "Environmental time-series modelling",
    kicker: "Earlier work. Where the research started.",
    meta: ["Earlier exploration", "ML / DL", "Time series"],
    levels: [
      ["Earlier predictive research on environmental and climate-related data."],
      ["Classical and deep time-series models (SARIMA and BiLSTM), with Optuna for hyperparameter search, on environmental datasets."],
      ["One direction estimated polar bear populations from environmental and climate-related data."],
      [{ list: ["SARIMA", "BiLSTM", "Optuna", "Environmental datasets"] }],
    ],
    metrics: [],
    stack: ["SARIMA", "BiLSTM", "Optuna", "Time series"],
    aliases: ["environmental", "climate", "polar-bear"],
  },

  // ───────────────────────────── INTEGRATE
  {
    id: "mira",
    code: "I-01",
    world: "integrate",
    title: "AI-assisted code review pilot",
    kicker: "AI inside the engineering loop, not instead of the engineer.",
    meta: ["EaseMyTrip", "Mira", "Pilot: one repository"],
    status: "Pilot and workflow integration. Mira is a third-party product; I did not build it.",
    levels: [
      ["Part of piloting AI-assisted code review at EaseMyTrip with Mira, starting from a single repository, and integrating it into the engineering workflow."],
      [
        "The AI does a first pass and flags obvious issues, edge cases and inconsistencies. An engineer evaluates each finding and accepts or ignores it, which leaves human reviewers more time for the decisions that need them.",
      ],
      [
        {
          list: [
            "Setup isn't the hardest part. Infrastructure, access, configuration and reliability are.",
            "AI review has to fit the way developers actually work.",
            "Noisy feedback teaches developers to ignore the system.",
            "Review quality matters more than raw issue count.",
            "A pilot shows real usage before anything scales.",
          ],
        },
      ],
      [{ list: ["Codebase → AI review → findings → engineer feedback → iteration → workflow integration", "Started with a single repository"] }],
    ],
    metrics: [
      { value: "1", label: "Repository to start" },
      { value: "Human", label: "Final decision on every finding" },
    ],
    stack: ["Mira", "Code review", "Engineering workflow"],
    aliases: ["code-review", "review", "ai-review"],
  },
];

export const projectById = Object.fromEntries(projects.map((p) => [p.id, p])) as Record<ProjectId, Project>;

export const experience: {
  year: string;
  span: string;
  org: string;
  role: string;
  place: string;
  entries: { label: string; value: string; detail: string; project?: ProjectId }[];
}[] = [
  {
    year: "2026",
    span: "Jun 2026 – present",
    org: "EaseMyTrip",
    role: "Technology Trainee (AI/ML)",
    place: "New Delhi",
    entries: [
      { label: "Voice", value: "<200ms", detail: "Real-time outbound voice agent, end to end", project: "voice" },
      { label: "RAG", value: "Self-updating", detail: "Production support KB on pgvector", project: "rag" },
      { label: "Evaluation", value: "50K+", detail: "Conversations scored in parallel", project: "eval" },
      { label: "EasyDarshan", value: "2,000+", detail: "Entities in the retrieval layer", project: "easydarshan" },
      { label: "AI code review", value: "Mira pilot", detail: "Workflow integration, one repo first", project: "mira" },
    ],
  },
  {
    year: "2026",
    span: "Apr – Jun 2026",
    org: "Tov AI",
    role: "AI Engineer",
    place: "Remote",
    entries: [{ label: "Bylin.app", value: "Sole engineer", detail: "Idea → live users; pipeline, DB, deploy, instrumentation", project: "bylin" }],
  },
  {
    year: "2025",
    span: "Sep – Dec 2025",
    org: "Growthic",
    role: "AI Generalist Intern",
    place: "New Delhi",
    entries: [
      { label: "AI agents", value: "Tone-adaptive", detail: "Content agents that adapt to tone, intent and writing style for LinkedIn posts" },
      { label: "Analytics", value: "AWS EC2", detail: "Reddit campaign management and LinkedIn analytics platforms" },
    ],
  },
  {
    year: "2025",
    span: "May – Aug 2025",
    org: "Growify LLP",
    role: "AI & Automation Intern",
    place: "New Delhi",
    entries: [
      { label: "Automation", value: "−75%", detail: "Image-organization time (line-sheet mapper, batch resizer, image-similarity search)" },
      { label: "Ops effort", value: "−45%", detail: "Manual operational effort" },
      { label: "RAG", value: "Onboarding", detail: "Scattered onboarding documents made queryable" },
    ],
  },
];

/** Skills as a topology: each leaf points at the systems that evidence it. */
export const topology: { group: string; leaves: { name: string; used: ProjectId[] }[] }[] = [
  {
    group: "AI systems",
    leaves: [
      { name: "LLMs", used: ["bylin", "mutagen", "folio", "voice", "rag", "easydarshan", "v2v", "nl2sql", "scam"] },
      { name: "Agents & agentic workflows", used: ["easydarshan", "nl2sql"] },
      { name: "RAG", used: ["rag", "bylin", "nl2sql"] },
      { name: "Tool calling", used: ["easydarshan", "nl2sql"] },
      { name: "Multi-model orchestration", used: ["bylin", "voice", "v2v"] },
      { name: "Evaluation", used: ["eval", "bylin", "voice", "mutagen", "scam"] },
      { name: "LangChain · LangGraph · CrewAI", used: ["nl2sql"] },
    ],
  },
  {
    group: "Retrieval",
    leaves: [
      { name: "pgvector", used: ["rag"] },
      { name: "ChromaDB", used: ["nl2sql"] },
      { name: "FAISS", used: [] },
      { name: "Embeddings", used: ["rag", "bylin", "nl2sql"] },
      { name: "Chunking", used: ["nl2sql"] },
      { name: "Reranking", used: [] },
      { name: "Knowledge-base design", used: ["rag"] },
      { name: "Live search · SPARQL · scrapers", used: ["easydarshan"] },
    ],
  },
  {
    group: "Speech",
    leaves: [
      { name: "Streaming STT / TTS", used: ["voice", "v2v"] },
      { name: "LiveKit", used: ["voice", "v2v"] },
      { name: "VAD · barge-in", used: ["v2v"] },
    ],
  },
  {
    group: "Backend",
    leaves: [
      { name: "Python", used: ["mutagen", "voice", "rag", "eval", "easydarshan", "v2v", "nl2sql"] },
      { name: "FastAPI", used: ["eval", "v2v"] },
      { name: "Flask", used: ["folio"] },
      { name: "Async I/O · worker pipelines", used: ["mutagen", "v2v"] },
      { name: "Postgres · Supabase", used: ["bylin", "rag"] },
      { name: "SQL · SQLAlchemy", used: ["nl2sql"] },
    ],
  },
  {
    group: "Models",
    leaves: [
      { name: "PyTorch · TensorFlow", used: ["scam"] },
      { name: "Scikit-learn", used: ["scam"] },
      { name: "Graph neural networks", used: ["scam"] },
      { name: "SARIMA · BiLSTM · Optuna", used: ["env"] },
    ],
  },
  {
    group: "Infra & front end",
    leaves: [
      { name: "Docker", used: ["rag", "scam"] },
      { name: "n8n · OpenRouter", used: ["bylin"] },
      { name: "AWS · GCP", used: [] },
      { name: "React · Next.js", used: ["eval", "folio"] },
    ],
  },
];

/** What's running right now. Statuses follow the resume and the V2V deck. */
export const processes: { id: ProjectId; stat: "prod" | "live" | "deploying" | "building" | "shipped"; name: string; note: string }[] = [
  { id: "voice", stat: "prod", name: "voice-agent", note: "<200ms end to end" },
  { id: "rag", stat: "prod", name: "support-rag", note: "self-updating KB" },
  { id: "eval", stat: "prod", name: "eval-platform", note: "50K+ conversations" },
  { id: "easydarshan", stat: "deploying", name: "easydarshan", note: "going live" },
  { id: "mira", stat: "building", name: "ai-code-review", note: "Mira pilot, 1 repo" },
  { id: "v2v", stat: "building", name: "v2v-agent", note: "team of 3, integration" },
  { id: "mutagen", stat: "shipped", name: "mutagen-ai", note: "pip install mutagen-ai" },
  { id: "bylin", stat: "shipped", name: "bylin.app", note: "sole engineer" },
];

/** Short names for dense listings. */
export const short: Record<ProjectId, string> = {
  bylin: "Bylin",
  mutagen: "Mutagen",
  folio: "LaunchMyFolio",
  voice: "Voice",
  rag: "RAG",
  eval: "Eval",
  easydarshan: "EasyDarshan",
  v2v: "V2V",
  nl2sql: "NL2SQL",
  scam: "Scam detection",
  xai: "XAI",
  env: "Env. ML",
  mira: "Mira pilot",
};
