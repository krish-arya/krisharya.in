import { person } from "@/content/data";
import { SystemMap } from "./core/SystemMap";
import { GoButton } from "./GoButton";

const READOUT = [
  { v: "<200ms", l: "Voice agent, end to end", id: "voice" },
  { v: "50K+", l: "Conversations scored", id: "eval" },
  { v: "92%", l: "Spider accuracy, published", id: "nl2sql" },
  { v: "1,000+", l: "Users in week one", id: "folio" },
];

export function Hero() {
  return (
    <section id="top" data-zone="hero" className="pointer-events-none relative min-h-[100svh] px-[var(--gutter)] pt-[calc(var(--rail-h)+28px)] pb-[calc(var(--term-h)+32px)]">
      <div className="grid-bg pointer-events-none absolute inset-0 -z-10" aria-hidden />
      <div className="flex min-h-[calc(100svh-var(--rail-h)-var(--term-h)-72px)] flex-col justify-between gap-12">
        <div className="pointer-events-auto flex items-start justify-between gap-6">
          <p className="label">
            {person.roles.join(" · ")}
            <span className="hidden md:inline"> &nbsp;/&nbsp; {person.location} · B.Tech IT, MSIT ’27</span>
          </p>
        </div>

        <div className="max-w-[1100px]">
          <h1 className="pointer-events-auto">
            <span className="mono mb-5 block text-paper-2">{person.name.toUpperCase()}</span>
            <span className="display block text-[clamp(56px,min(11.5vw,14.5vh),168px)]">
              I build
              <br />
              intelligent
              <br />
              systems<span className="text-signal">.</span>
            </span>
          </h1>
          <p className="pointer-events-auto mt-8 max-w-[34ch] text-[17px] leading-relaxed text-paper-2 md:text-[19px]">
            Production voice, retrieval and evaluation at EaseMyTrip. A product shipped alone at Tov AI. Published research on systems that correct
            themselves.
          </p>
          <SystemMap className="hero-map mx-auto mt-10 max-w-[420px]" />
        </div>

        <div className="pointer-events-auto flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <GoButton to="loop" className="btn btn-primary">
              [ Enter the system ]
            </GoButton>
            <p className="mono hidden text-paper-3 md:block">
              or press <kbd className="border border-line px-1.5 text-paper-2">/</kbd> and type <span className="text-paper-2">show mutagen</span>
            </p>
          </div>
          <dl className="grid grid-cols-2 border-t border-l border-line md:grid-cols-4">
            {READOUT.map((r) => (
              <GoButton key={r.id} to={r.id} as="div" className="group flex flex-col border-r border-b border-line px-4 py-3 text-left hover:bg-paper/[.03] lg:min-w-[170px]">
                <dt className="label order-2 mt-1 block group-hover:text-paper-2">{r.l}</dt>
                <dd className="display text-[34px] leading-none normal-case">{r.v}</dd>
              </GoButton>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
