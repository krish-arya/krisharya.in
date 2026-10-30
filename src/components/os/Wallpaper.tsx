/** Colours come from html[data-wall] in CSS; this is only the shapes. */
export function Wallpaper() {
  return (
    <div className="wallpaper" aria-hidden>
      <span className="blob b1" />
      <span className="blob b2" />
      <span className="blob b3" />
      <span className="blob b4" />
      <svg className="waves" viewBox="0 0 1440 900" preserveAspectRatio="none">
        <path d="M0 610C240 520 420 700 720 640S1180 470 1440 540V900H0z" />
        <path d="M0 720C300 640 520 800 820 740S1240 620 1440 680V900H0z" />
        <path d="M0 300C260 380 520 220 800 280S1220 420 1440 330V0H0z" />
      </svg>
      <span className="grain" />
    </div>
  );
}
