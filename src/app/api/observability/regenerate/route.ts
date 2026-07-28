import { NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const execFileAsync = promisify(execFile);

/**
 * POST /api/observability/regenerate
 *
 * Re-runs the Python data generator (scripts/generate_observability_data.py),
 * copies the fresh dataset into public/, and returns the new runId +
 * generatedAt timestamp so the frontend can confirm the regeneration.
 */
export async function POST() {
  const projectRoot = process.cwd();
  const generatorPath = path.join(projectRoot, "scripts", "generate_observability_data.py");
  const generatedPath = path.join(projectRoot, "download", "observability-data.json");
  const publicPath = path.join(projectRoot, "public", "observability-data.json");

  try {
    // 1. Re-run the Python generator asynchronously (non-blocking).
    //    -u = unbuffered stdout so we capture progress lines
    const { stdout, stderr } = await execFileAsync("python3", ["-u", generatorPath], {
      cwd: projectRoot,
      encoding: "utf-8",
      timeout: 60_000,
      maxBuffer: 2 * 1024 * 1024,
    });

    // 2. Copy the freshly-generated dataset into public/ so subsequent
    //    GET /api/observability calls serve the new data.
    if (fs.existsSync(generatedPath)) {
      fs.copyFileSync(generatedPath, publicPath);
    } else {
      return NextResponse.json(
        {
          ok: false,
          error: "Generator ran but output file was not found",
          stderr: stderr.slice(-500),
        },
        { status: 500 },
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
    let message = "Regeneration failed";
    let detail: string | undefined;
    if (err instanceof Error) {
      message = err.message;
      // execFile wraps stderr in the error object
      if ("stderr" in err && typeof (err as Record<string, unknown>).stderr === "string") {
        detail = String((err as Record<string, unknown>).stderr).slice(-500);
      }
    }
    return NextResponse.json({ ok: false, error: message, detail }, { status: 500 });
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
    const servedAt = new Date().toISOString();

    return NextResponse.json(
      {
        ok: true,
        generatedAt: data.generatedAt,
        version: data.version,
        generator: data.generator,
        fileMtime: stat.mtime.toISOString(),
        fileSizeBytes: stat.size,
        middlewareReachable: true,
        servedAt,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
          "X-Served-At": servedAt,
        },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Middleware unreachable";
    return NextResponse.json({ ok: false, middlewareReachable: false, error: message }, { status: 500 });
  }
}
