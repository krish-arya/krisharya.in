"use client";

import type { ProjectId } from "@/content/data";
import { EvalInstrument } from "./EvalInstrument";
import { Flow, type FlowSpec } from "./Flow";
import { MiraBench } from "./MiraBench";
import { ScamCascade } from "./ScamCascade";
import * as specs from "./specs";
import { StreamTimeline } from "./StreamTimeline";

export function Diagram({ id }: { id: ProjectId }) {
  switch (id) {
    case "voice":
      return <StreamTimeline id="voice" variant="prod" />;
    case "v2v":
      return <StreamTimeline id="v2v" variant="v2v" />;
    case "eval":
      return <EvalInstrument />;
    case "mira":
      return <MiraBench />;
    case "scam":
      return <ScamCascade />;
    case "mutagen":
      return <Flow id={id} spec={specs.mutagen} interval={1450} />;
    default:
      return <Flow id={id} spec={(specs as unknown as Record<string, FlowSpec>)[id]} />;
  }
}
