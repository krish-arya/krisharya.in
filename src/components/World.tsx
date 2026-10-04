import type { ReactNode } from "react";
import { worlds, type WorldId } from "@/content/data";

const LEDE: Record<WorldId, string> = {
  build: "Products that went from an idea to people using them. One as the sole engineer at a company, one as open source, one with a thousand users in its first week.",
  engineer: "Systems running against real traffic, with real latency budgets and real failure modes.",
  research: "Experiments, written up and published. Co-authored with faculty at MSIT.",
  integrate: "Bringing AI into how an engineering team already works, where adoption depends on trust more than on capability.",
};

export function World({ id, children }: { id: WorldId; children: ReactNode }) {
  const w = worlds.find((x) => x.id === id)!;
  return (
    <section id={id} data-zone={id} aria-labelledby={`${id}-title`} className="relative px-[var(--gutter)] pt-24 md:pt-40">
      <div className="mx-auto max-w-[1440px]">
        <header className="grid gap-6 pb-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="label">
              <span className="text-signal">World {w.n}</span> · {w.theme}
            </p>
            <h2 id={`${id}-title`} className="display mt-4 text-[clamp(72px,14vw,220px)]">
              {w.name}
            </h2>
          </div>
          <p className="max-w-[44ch] self-end text-[17px] leading-relaxed text-paper-2 lg:col-span-4 lg:col-start-9">{LEDE[id]}</p>
        </header>
        {children}
      </div>
    </section>
  );
}

/** A labelled sub-group inside a world, e.g. "EaseMyTrip — production". */
export function Group({ title, meta, children }: { title: string; meta: string; children: ReactNode }) {
  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-t border-line-2 py-4">
        <h3 className="mono text-[13px] uppercase tracking-[0.12em] text-paper">{title}</h3>
        <p className="mono text-paper-3">{meta}</p>
      </div>
      {children}
    </div>
  );
}
