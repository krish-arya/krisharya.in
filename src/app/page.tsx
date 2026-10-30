import { person, projects } from "@/content/data";
import { Desktop } from "@/components/os/Desktop";

export default function Home() {
  return (
    <>
      {/* The desktop is interactive; this is the same story for crawlers and screen readers. */}
      <div className="sr-only">
        <h1>
          {person.name}: {person.roles.join(", ")}
        </h1>
        <p>
          I build intelligent systems. Production voice, retrieval and evaluation at EaseMyTrip, a product shipped alone at Tov AI, and published research
          on systems that correct themselves.
        </p>
        <ul>
          {projects.map((p) => (
            <li key={p.id}>
              {p.title}: {p.kicker}
            </li>
          ))}
        </ul>
        <a href={`mailto:${person.email}`}>{person.email}</a>
      </div>
      <Desktop />
    </>
  );
}
