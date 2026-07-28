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
      rules: data.data.alerting.rules,
      triggeredAlerts: data.data.alerting.triggeredAlerts,
      statistics: {
        totalAlertRules: data.statistics.totalAlertRules,
        firingAlerts: data.statistics.firingAlerts,
        resolvedAlerts: data.statistics.resolvedAlerts,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to load alerts" }, { status: 500 });
  }
}
