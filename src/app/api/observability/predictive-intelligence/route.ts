import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'public', 'observability-data.json');

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    const data = JSON.parse(raw);
    const predictive = data.data?.predictiveIntelligence || data.data?.predictive_intelligence;

    if (!predictive) {
      return NextResponse.json(
        { error: 'Predictive intelligence data not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      servedAt: new Date().toISOString(),
      data: predictive,
    });
  } catch (error) {
    console.error('[API] predictive-intelligence error:', error);
    return NextResponse.json(
      { error: 'Failed to load predictive intelligence data' },
      { status: 500 }
    );
  }
}
