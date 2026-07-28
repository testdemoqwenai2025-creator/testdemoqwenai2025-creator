import { NextResponse } from "next/server";
import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/observability/regenerate
 *
 * Re-runs the Python data generator (scripts/generate_observability_data.py),
 * copies the fresh dataset into public/, and returns the new run_id +
 * lastGeneratedAt timestamp so the frontend can confirm the regeneration.
 *
 * This is the dynamic counterpart to the otherwise-static
 * public/observability-data.json — it lets the dashboard act as a live
 * middle-tier between the Python generator (middleware) and the React
 * frontend, instead of just replaying a frozen snapshot.
 */
export async function POST() {
  const projectRoot = process.cwd();
  const generatorPath = path.join(projectRoot, "scripts", "generate_observability_data.py");
  const generatedPath = "/home/z/my-project/download/observability-data.json";
  const publicPath = path.join(projectRoot, "public", "observability-data.json");

  try {
    // 1. Re-run the Python generator (middleware layer).
    //    -u = unbuffered stdout so we capture progress live
    //    Generator writes to /home/z/my-project/download/observability-data.json
    const stdout = execFileSync("python3", ["-u", generatorPath], {
      cwd: projectRoot,
      encoding: "utf-8",
      timeout: 60_000,
      stdio: ["ignore", "pipe", "pipe"],
    });

    // 2. Copy the freshly-generated dataset into public/ so subsequent
    //    GET /api/observability calls serve the new data.
    if (fs.existsSync(generatedPath)) {
      fs.copyFileSync(generatedPath, publicPath);
    } else {
      return NextResponse.json(
        { ok: false, error: "Generator ran but output file was not found", stdout },
        { status: 500 }
      );
    }

    // 3. Read back the new file to extract identity fields.
    const raw = fs.readFileSync(publicPath, "utf-8");
    const data = JSON.parse(raw);

    return NextResponse.json({
      ok: true,
      runId: `RUN-${Date.now().toString(36).toUpperCase()}`,
      generatedAt: data.generatedAt,
      version: data.version,
      generator: data.generator,
      regeneratedAt: new Date().toISOString(),
      stdout: stdout.split("\n").slice(-20).join("\n"),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, error: "Regeneration failed", detail: message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/observability/regenerate
 * Returns metadata about the current dataset without regenerating.
 * Useful for the frontend's "Live" indicator to verify the middleware is reachable.
 */
export async function GET() {
  try {
    const projectRoot = process.cwd();
    const publicPath = path.join(projectRoot, "public", "observability-data.json");
    const stat = fs.statSync(publicPath);
    const raw = fs.readFileSync(publicPath, "utf-8");
    const data = JSON.parse(raw);

    return NextResponse.json({
      ok: true,
      generatedAt: data.generatedAt,
      version: data.version,
      generator: data.generator,
      fileMtime: stat.mtime.toISOString(),
      fileSizeBytes: stat.size,
      middlewareReachable: true,
    });
  } catch {
    return NextResponse.json(
      { ok: false, middlewareReachable: false },
      { status: 500 }
    );
  }
}
