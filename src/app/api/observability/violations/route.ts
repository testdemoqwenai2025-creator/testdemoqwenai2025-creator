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
    const violations = data.data.violations;
    const totalExposure = violations.reduce((sum: number, v: any) => sum + v.penalty_exposure_usd, 0);
    return NextResponse.json({
      violations,
      statistics: {
        totalViolations: violations.length,
        totalPenaltyExposureUsd: totalExposure,
        phaseIConflicts: violations.filter((v: any) => v.phase_i_conflict).length,
        phaseIIBreaches: violations.filter((v: any) => v.phase_ii_breach).length,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to load violations" }, { status: 500 });
  }
}
