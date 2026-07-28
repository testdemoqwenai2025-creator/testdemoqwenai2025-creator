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
      imperatives: data.data.imperativeRegistry,
      statistics: { totalImperatives: data.statistics.totalImperatives },
    });
  } catch {
    return NextResponse.json({ error: "Failed to load imperative registry" }, { status: 500 });
  }
}
