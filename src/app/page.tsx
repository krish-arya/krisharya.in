import { Boot } from "@/components/Boot";
import { Core } from "@/components/core/Core";
import { Hero } from "@/components/Hero";
import { Log } from "@/components/Log";
import { LoopIndex } from "@/components/LoopIndex";
import { Operator } from "@/components/Operator";
import { Project } from "@/components/Project";
import { Rail } from "@/components/Rail";
import { Terminal } from "@/components/Terminal";
import { Topology } from "@/components/Topology";
import { Transmission } from "@/components/Transmission";
import { Group, World } from "@/components/World";
import { ZoneTracker } from "@/components/ZoneTracker";

export default function Home() {
  return (
    <>
      <Boot />
      <Core />
      <Rail />
      <main id="main" className="relative z-10">
        <Hero />
        <LoopIndex />

        <World id="build">
          <Project id="bylin" />
          <Project id="mutagen" wide />
          <Project id="folio" />
        </World>

        <World id="engineer">
          <Group title="EaseMyTrip — production" meta="Technology Trainee (AI/ML) · Jun 2026 – present · New Delhi">
            <Project id="voice" wide />
            <Project id="rag" />
            <Project id="eval" />
            <Project id="easydarshan" />
          </Group>
          <Group title="Academic — MSIT minor project" meta="Team of three · second review, Sep 2026">
            <Project id="v2v" wide />
          </Group>
        </World>

        <World id="research">
          <Project id="nl2sql" wide />
          <Project id="scam" wide />
          <Project id="xai" />
          <Project id="env" />
        </World>

        <World id="integrate">
          <Project id="mira" wide />
        </World>

        <Log />
        <Topology />
        <Operator />
        <Transmission />
      </main>
      <Terminal />
      <ZoneTracker />
    </>
  );
}
