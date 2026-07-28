import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

async function getData() {
  const filePath = path.join(process.cwd(), "public", "observability-data.json");
  const fileContents = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(fileContents);
}

export async function GET() {
  try {
    const data = await getData();
    const sm = data.data.stateMachine;
    return NextResponse.json({
      ...sm,
      statistics: {
        entities: sm.entities.length,
        totalTransitions: sm.total_transitions,
        escalations: sm.metrics.escalations,
        resolutions: sm.metrics.resolutions,
        distribution: sm.state_distribution,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to load state machine data" }, { status: 500 });
  }
}
