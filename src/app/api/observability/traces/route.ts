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
      traces: data.data.traces,
      statistics: {
        totalTraces: data.statistics.totalTraces,
        totalSpans: data.statistics.totalSpans,
        errorTraces: data.statistics.errorTraces,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to load traces" }, { status: 500 });
  }
}
