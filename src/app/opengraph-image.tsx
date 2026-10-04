import { ImageResponse } from "next/og";

export const alt = "Krish Arya — AI engineer, builder, researcher";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ROWS = [
  ["<200ms", "voice agent, end to end"],
  ["50K+", "conversations scored"],
  ["92%", "Spider accuracy, published"],
  ["1,000+", "users in week one"],
];

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0c0c0b",
          color: "#ece7dd",
          padding: 64,
          fontFamily: "monospace",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: "#78736a", letterSpacing: 3 }}>
          <span>KRISH ARYA — SYSTEM</span>
          <span>AI ENGINEER · BUILDER · RESEARCHER</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 104, fontWeight: 700, lineHeight: 0.92, letterSpacing: -3 }}>
          <span>I BUILD</span>
          <span>INTELLIGENT</span>
          <span style={{ display: "flex" }}>
            SYSTEMS<span style={{ color: "#ff5a1f" }}>.</span>
          </span>
        </div>
        <div style={{ display: "flex", borderTop: "1px solid rgba(236,231,221,.2)" }}>
          {ROWS.map(([v, l]) => (
            <div key={v} style={{ display: "flex", flexDirection: "column", flex: 1, paddingTop: 20 }}>
              <span style={{ fontSize: 40 }}>{v}</span>
              <span style={{ fontSize: 17, color: "#78736a", marginTop: 6 }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
