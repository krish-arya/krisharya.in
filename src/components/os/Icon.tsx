import type { ReactNode } from "react";

export interface IconSpec {
  tint: [string, string];
  glyph: ReactNode;
  /** Dark glyph on a light tile. */
  ink?: boolean;
}

/** A macOS-style app tile: rounded square, soft gradient, inner highlight. */
export function Icon({ spec, size = 56, className = "" }: { spec: IconSpec; size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={`app-icon ${spec.ink ? "text-[#1d1d1f]" : "text-white"} ${className}`}
      style={{ width: size, height: size, fontSize: size, background: `linear-gradient(160deg, ${spec.tint[0]}, ${spec.tint[1]})` }}
    >
      {spec.glyph}
    </span>
  );
}

const svg = (d: ReactNode) => (
  <svg viewBox="0 0 24 24" width="52%" height="52%" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

/** Skill tiles read like element symbols: two letters, set large. */
export const mark = (abbr: string) => <span className="icon-mark">{abbr}</span>;

export const glyphs = {
  folder: svg(<path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h4l2 2h9A1.5 1.5 0 0 1 21 9.5v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z" />),
  grid: svg(
    <>
      {[5, 12, 19].flatMap((y) => [5, 12, 19].map((x) => <circle key={`${x}${y}`} cx={x} cy={y} r={1.6} fill="currentColor" stroke="none" />))}
    </>,
  ),
  briefcase: svg(
    <>
      <rect x="3" y="7.5" width="18" height="12" rx="2" />
      <path d="M9 7.5V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v1.5M3 12.5h18" />
    </>,
  ),
  paper: svg(
    <>
      <path d="M6.5 3h8l4 4v13a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M14.5 3v4h4M8.5 11h7M8.5 14h7M8.5 17h4" />
    </>,
  ),
  note: svg(<path d="M7 8h10M7 12h10M7 16h6" />),
  terminal: svg(<path d="M5 8l4 4-4 4M12 16h7" />),
  mail: svg(
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="M3.5 7l8.5 6 8.5-6" />
    </>,
  ),
  doc: svg(
    <>
      <path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M14 3v4h4" />
    </>,
  ),
  code: svg(<path d="M9 7l-5 5 5 5M15 7l5 5-5 5" />),
  monogram: <span className="icon-mark">KA</span>,
  in: <span className="icon-mark lowercase">in</span>,
};
