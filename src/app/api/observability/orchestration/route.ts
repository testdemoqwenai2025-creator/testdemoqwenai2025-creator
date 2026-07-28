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
    return NextResponse.json({
      eventBus: data.data.eventBus,
      conflicts: data.data.conflicts,
      statistics: {
        eventBusTopics: data.data.eventBus.total_topics,
        eventBusMessages: data.data.eventBus.total_messages,
        eventBusLag: data.data.eventBus.total_lag,
        conflictsDetected: data.data.conflicts.total_detected,
        conflictsResolved: data.data.conflicts.total_resolved,
        conflictsPending: data.data.conflicts.total_pending,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to load orchestration data" }, { status: 500 });
  }
}
