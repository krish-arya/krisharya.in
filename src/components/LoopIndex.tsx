import { loops, projectById, worlds, projects, short } from "@/content/data";
import { GoButton } from "./GoButton";

export function LoopIndex() {
  return (
    <section id="loop" data-zone="rest" aria-labelledby="loop-h" className="relative px-[var(--gutter)] py-24 md:py-40">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="label">00 · Index</p>
            <h2 id="loop-h" className="display mt-6 text-[clamp(40px,6vw,84px)]">
              The model is one box.
              <span className="block text-paper-3">The engineering is the loop around it.</span>
            </h2>
          </div>
          <div className="text-[17px] leading-relaxed text-paper-2 lg:col-span-5 lg:col-start-8 lg:pt-12">
            <p>
              Almost every system below has the same shape: something <span className="text-paper">generates</span>, something real{" "}
              <span className="text-paper">verifies</span>, and the result is <span className="text-paper">fed back</span>. A test has to kill a mutant.
              SQL has to execute. A claim has to exist in its source. A finding has to survive an engineer.
            </p>
          </div>
        </div>

        {/* the thesis, as data */}
        <div className="mt-16 overflow-x-auto border-t border-line-2">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <caption className="sr-only">Generate, verify and feed back, for each system</caption>
            <thead>
              <tr className="label">
                <th scope="col" className="py-4 pr-6 font-normal">System</th>
                <th scope="col" className="py-4 pr-6 font-normal">
                  <span className="text-paper-2">01</span> Generates
                </th>
                <th scope="col" className="py-4 pr-6 font-normal">
                  <span className="text-signal">02</span> Verified by
                </th>
                <th scope="col" className="py-4 font-normal">
                  <span className="text-pass">03</span> Feeds back
                </th>
              </tr>
            </thead>
            <tbody>
              {loops.map((l) => (
                <tr key={l.id} className="group border-t border-line align-top transition-colors hover:bg-paper/[.025]">
                  <th scope="row" className="py-4 pr-6 font-normal">
                    <GoButton to={l.id} className="flex items-baseline gap-3 text-paper hover:text-signal">
                      <span className="mono w-[6ch] text-paper-3">{projectById[l.id].code}</span>
                      <span className="text-[17px]">{l.system}</span>
                    </GoButton>
                  </th>
                  <td className="py-4 pr-6 text-paper-2">{l.generator}</td>
                  <td className="py-4 pr-6 text-paper">{l.verifier}</td>
                  <td className="py-4 text-paper-2">{l.feedback}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* four worlds */}
        <nav aria-label="Worlds" className="mt-20 grid border-t border-l border-line sm:grid-cols-2 lg:grid-cols-4">
          {worlds.map((w) => {
            const ps = projects.filter((p) => p.world === w.id);
            return (
              <GoButton key={w.id} to={w.id} className="group block border-r border-b border-line p-6 transition-colors hover:bg-paper/[.03]">
                <span className="mono text-signal">{w.n}</span>
                <span className="display mt-6 block text-[44px] group-hover:text-signal">{w.name}</span>
                <span className="mt-2 block text-paper-2">{w.theme}</span>
                <span className="mono mt-6 block text-paper-3">{ps.map((p) => short[p.id]).join(" · ")}</span>
              </GoButton>
            );
          })}
        </nav>
      </div>
    </section>
  );
}
