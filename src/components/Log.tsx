import { experience } from "@/content/data";
import { GoButton } from "./GoButton";

export function Log() {
  return (
    <section id="log" data-zone="rest" aria-labelledby="log-h" className="px-[var(--gutter)] pt-24 md:pt-40">
      <div className="mx-auto max-w-[1440px]">
        <p className="label">05 · System log</p>
        <h2 id="log-h" className="display mt-4 text-[clamp(56px,9vw,140px)]">
          Log
        </h2>

        <ol className="mt-12 border-t border-line-2">
          {experience.map((e) => (
            <li key={e.org} className="grid gap-6 border-b border-line py-8 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="mono text-paper-3">
                  <span className="text-signal">{e.year}</span> · {e.span}
                </p>
                <h3 className="display mt-3 text-[clamp(36px,4vw,56px)]">{e.org}</h3>
                <p className="mono mt-2 text-paper-2">
                  {e.role} · {e.place}
                </p>
              </div>
              <ul className="grid border-t border-l border-line sm:grid-cols-2 lg:col-span-8 xl:grid-cols-3">
                {e.entries.map((x) => {
                  const body = (
                    <>
                      <span className="label block">{x.label}</span>
                      <span className="display mt-2 block text-[clamp(30px,3vw,44px)] leading-none normal-case">{x.value}</span>
                      <span className="mt-2 block text-[14px] leading-snug text-paper-2">{x.detail}</span>
                    </>
                  );
                  return (
                    <li key={x.label} className="border-r border-b border-line">
                      {x.project ? (
                        <GoButton to={x.project} className="group block h-full p-4 transition-colors hover:bg-paper/[.03]">
                          {body}
                          <span className="mono mt-3 block text-paper-3 group-hover:text-signal">open system →</span>
                        </GoButton>
                      ) : (
                        <div className="h-full p-4">{body}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
