import { allNodes, edges, nodeByKey } from "@/lib/graph";

const S = 46;
const X = (x: number) => (x + 5.2) * S;
const Y = (y: number) => (6.6 - y) * S;

/**
 * Static projection of the 3D core. Shown on phones, with reduced motion, and
 * whenever WebGL is unavailable. Readable on its own.
 */
export function SystemMap({ className = "" }: { className?: string }) {
  return (
    <figure className={className}>
      <svg viewBox={`0 0 ${10.4 * S} ${12.2 * S}`} className="h-auto w-full" role="img" aria-labelledby="map-title map-desc">
        <title id="map-title">System map</title>
        <desc id="map-desc">
          Research feeds AI models, which branch into RAG, agents and voice. Those meet in systems, which split into products and evaluation, and
          both flow into the engineering workflow. Evaluation feeds back into the models. Each project hangs off the capability it is built on.
        </desc>
        {edges.map((e, i) => {
          const a = nodeByKey[e.from].pos;
          const b = nodeByKey[e.to].pos;
          return (
            <line
              key={i}
              x1={X(a[0])}
              y1={Y(a[1])}
              x2={X(b[0])}
              y2={Y(b[1])}
              stroke={e.feedback ? "var(--pass)" : "var(--line-2)"}
              strokeOpacity={e.feedback ? 0.6 : 1}
              strokeDasharray={e.feedback ? "3 4" : e.to.startsWith("p:") ? "1 3" : undefined}
            />
          );
        })}
        {allNodes.map((n) => {
          const hub = n.kind === "hub";
          const w = hub ? 92 : 8;
          const h = hub ? 22 : 8;
          return (
            <g key={n.key} transform={`translate(${X(n.pos[0])},${Y(n.pos[1])})`}>
              <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="var(--ink-1)" stroke={hub ? "var(--line-3)" : "var(--paper-2)"} />
              <text
                y={hub ? 4 : -9}
                textAnchor="middle"
                fontFamily="var(--font-mono)"
                fontSize={hub ? 10 : 9}
                letterSpacing="0.08em"
                fill={hub ? "var(--paper)" : "var(--paper-3)"}
              >
                {n.label.toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
