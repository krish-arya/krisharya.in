"use client";

import { useRef, useState, type ReactNode } from "react";
import { person, processes, projectById } from "@/content/data";
import { useFirstView } from "./diagrams/hooks";
import { GoButton } from "./GoButton";

// tiny syntax-highlight vocabulary
const K = ({ children }: { children: ReactNode }) => <span className="text-paper-2">{children}</span>;
const V = ({ children }: { children: ReactNode }) => <span className="text-paper">{children}</span>;
const S = ({ children }: { children: ReactNode }) => <span className="text-pass">&quot;{children}&quot;</span>;
const C = ({ children }: { children: ReactNode }) => <span className="text-paper-3"># {children}</span>;
const P = ({ children }: { children: ReactNode }) => <span className="text-paper-3">{children}</span>;

const WHOAMI: ReactNode[] = [
  <C key="c">operator.yaml</C>,
  <>
    <K>name</K>
    <P>:        </P>
    <V>{person.name}</V>
  </>,
  <>
    <K>role</K>
    <P>:        </P>
    <V>AI Engineer</V> <P>·</P> <V>Builder</V> <P>·</P> <V>Researcher</V>
  </>,
  <>
    <K>now</K>
    <P>:         </P>
    <V>Technology Trainee (AI/ML) @ EaseMyTrip</V>
  </>,
  <>
    <K>location</K>
    <P>:    </P>
    <V>New Delhi, IN</V> <C>UTC+05:30</C>
  </>,
  <>
    <K>education</K>
    <P>:   </P>
    <V>B.Tech IT, MSIT</V> <P>·</P> <V>2023–27</V> <P>·</P> <V>cgpa 8.5</V>
  </>,
  <>
    <K>pattern</K>
    <P>:     </P>
    <S>generate → verify → feed back</S>
  </>,
  <>
    <K>stack</K>
    <P>:       [</P>
    <S>python</S>
    <P>, </P>
    <S>fastapi</S>
    <P>, </P>
    <S>pgvector</S>
    <P>, </P>
    <S>langchain</S>
    <P>, </P>
    <S>livekit</S>
    <P>]</P>
  </>,
  <>
    <K>off_hours</K>
    <P>:</P>
  </>,
  <>
    <P>  - </P>
    <K>president</K>
    <P>: </P>
    <V>TARK Literary Society</V>
  </>,
  <>
    <P>  - </P>
    <K>cultural_head</K>
    <P>: </P>
    <V>Prakriti MSIT</V> <C>ENVA Fest · 10,000+ footfall · 500+ team</C>
  </>,
  <>
    <K>accepting</K>
    <P>:   [</P>
    <S>freelance</S>
    <P>, </P>
    <S>collaborations</S>
    <P>, </P>
    <S>roles</S>
    <P>]</P>
  </>,
];

const STAT_TONE: Record<string, string> = {
  prod: "text-pass",
  live: "text-pass",
  deploying: "text-signal",
  building: "text-signal",
  shipped: "text-paper-2",
};

const STEP = 55;

export function Operator() {
  const box = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useFirstView(box, () => setOn(true));

  // each line streams in once, like the terminal output
  const line = (i: number) => ({
    style: { transitionDelay: `${i * STEP}ms` },
    className: `transition-opacity duration-150 ${on ? "opacity-100" : "opacity-0"}`,
  });

  return (
    <section id="operator" data-zone="rest" aria-labelledby="op-h" className="px-[var(--gutter)] pt-24 md:pt-40">
      <div ref={box} className="mx-auto max-w-[1440px]">
        <p className="label">07 · Operator</p>
        <h2 id="op-h" className="display mt-4 text-[clamp(56px,9vw,140px)]">
          Whoami
        </h2>

        <div className="mt-12 grid gap-px border border-line bg-line lg:grid-cols-12">
          {/* whoami */}
          <div className="min-w-0 bg-ink-1 lg:col-span-7">
            <p className="mono flex items-center justify-between border-b border-line px-4 py-2.5 text-paper-3">
              <span>
                <span className="text-pass">krish@system</span>:~$ <span className="text-paper">whoami --verbose</span>
              </span>
              <span>yaml</span>
            </p>
            <pre className="mono overflow-x-auto px-4 py-5 text-[13px] leading-[1.9]">
              {WHOAMI.map((l, i) => (
                <div key={i} {...line(i)}>
                  <span className="mr-4 inline-block w-[2ch] select-none text-right text-paper-3/60">{i + 1}</span>
                  {l}
                </div>
              ))}
              <div {...line(WHOAMI.length)}>
                <span className="mr-4 inline-block w-[2ch] select-none text-right text-paper-3/60">{WHOAMI.length + 1}</span>
                <span className="caret" />
              </div>
            </pre>
          </div>

          {/* ps */}
          <div className="min-w-0 bg-ink-1 lg:col-span-5">
            <p className="mono flex items-center justify-between border-b border-line px-4 py-2.5 text-paper-3">
              <span>
                <span className="text-pass">krish@system</span>:~$ <span className="text-paper">ps --user krish</span>
              </span>
              <span>{processes.length} procs</span>
            </p>
            <table className="mono w-full text-left text-[12.5px]">
              <thead className="text-paper-3">
                <tr {...line(0)}>
                  <th className="px-4 pt-4 pb-2 font-normal">PID</th>
                  <th className="pt-4 pb-2 pr-3 font-normal">STAT</th>
                  <th className="pt-4 pb-2 pr-4 font-normal">PROCESS</th>
                </tr>
              </thead>
              <tbody>
                {processes.map((p, i) => (
                  <tr key={p.id} {...line(i + 1)} className={`${line(i + 1).className} group`}>
                    <td className="px-4 py-1.5 align-top text-paper-3">{projectById[p.id].code}</td>
                    <td className={`py-1.5 pr-3 align-top ${STAT_TONE[p.stat]}`}>{p.stat}</td>
                    <td className="py-1.5 pr-4 align-top">
                      <GoButton to={p.id} className="text-paper hover:text-signal">
                        {p.name}
                      </GoButton>
                      <span className="block text-paper-3">{p.note}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={line(processes.length + 1).style} className={`mono border-t border-line px-4 py-2.5 text-paper-3 ${line(processes.length + 1).className}`}>
              <span className="text-pass">prod</span> = running at EaseMyTrip · click a process to open it
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
