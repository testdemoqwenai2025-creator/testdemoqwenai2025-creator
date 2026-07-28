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
    return NextResponse.json(data.data.governanceOrchestrator);
  } catch {
    return NextResponse.json(
      { error: "Failed to load HIPAA governance orchestrator data" },
      { status: 500 }
    );
  }
}
