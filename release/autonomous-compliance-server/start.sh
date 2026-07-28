#!/bin/bash
# Autonomous Regulatory Compliance Agent Swarm — Startup Script
# Version 8.0.0 | MIT License
# ================================================================

set -e

PORT="${PORT:-3000}"
HOSTNAME="${HOSTNAME:-0.0.0.0}"

echo "============================================================"
echo "  Autonomous Regulatory Compliance Agent Swarm v8.0.0"
echo "  4-Agent Pipeline | 22 Governance Components | 11 Stages"
echo "  19 API Routes | 16 Dashboard Tabs"
echo "============================================================"
echo ""
echo "  Starting on http://${HOSTNAME}:${PORT}"
echo "  Press Ctrl+C to stop"
echo ""

# Check Python3 is available for the data generator
if command -v python3 &> /dev/null; then
    echo "  [OK] Python3 found: $(python3 --version)"
    # Auto-generate data if no observability-data.json exists
    if [ ! -f "public/observability-data.json" ]; then
        echo "  [INIT] No data found — running Python generator..."
        python3 scripts/generate_observability_data.py
        echo "  [OK] Data generated successfully"
    fi
else
    echo "  [WARN] Python3 not found — /api/observability/regenerate will not work"
    echo "         Static JSON data will still be served."
fi

echo ""
echo "  Dashboard: http://localhost:${PORT}"
echo "  API root:  http://localhost:${PORT}/api/observability"
echo ""

exec node server.js -H ${HOSTNAME} -p ${PORT}
