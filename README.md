# Observability Dashboard

Full-stack observability infrastructure with distributed tracing, system metrics, structured logging, and intelligent alerting — visualized in a real-time Next.js dashboard.

## Architecture

```
scripts/generate_observability_data.py    → Data Generator (Python)
public/observability-data.json            → Generated Dataset
src/app/api/observability/route.ts        → API Endpoint
src/app/page.tsx                          → Dashboard Entry
src/components/dashboard/                 → Dashboard Components
  ├── stats-cards.tsx                     → KPI Overview Cards
  ├── metrics-charts.tsx                  → Time-Series Charts (Recharts)
  ├── traces-panel.tsx                     → Distributed Trace Viewer
  ├── logs-panel.tsx                       → Structured Log Browser
  └── alerts-panel.tsx                     → Alert Rules & Fired Alerts
```

## Features

### Tracing
- **50 distributed traces** with 226 spans across 10 microservices
- Span hierarchy visualization (parent → child waterfall)
- Service & operation breakdown with latency color coding
- Filter by status (OK / Error)

### Metrics
- **8 time-series metric families** with 60 data points each
- System: CPU usage, memory utilization, active connections
- Application: request rate, error rate, P50/P99 latency, queue depth
- Interactive charts with tooltips and gradient fills
- Summary cards with current, peak, and average values

### Logging
- **200 structured log entries** across 5 severity levels
- Service-level filtering (10 services)
- Full-text search across messages
- Trace ID correlation (trace:span linkage)
- Alerting flag for WARNING+ entries

### Alerting
- **8 alert rules** with conditions, severity, and runbook links
- **25 triggered alerts** (firing / resolved / acknowledged)
- Severity breakdown: critical, high, medium, low, info
- Environment/region/team labels with metric thresholds

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Charts | Recharts |
| Icons | Lucide React |
| Data Gen | Python 3 |

## Getting Started

```bash
# Install dependencies
bun install

# Generate fresh observability data
python3 scripts/generate_observability_data.py

# Start development server
bun run dev

# Open http://localhost:3000
```

## Data Generation

The Python script (`scripts/generate_observability_data.py`) produces realistic simulated data:

```bash
python3 scripts/generate_observability_data.py
# Output: download/observability-data.json (~200KB)
```

Configuration: Edit `SEED`, `num_traces`, `num_logs`, `num_points`, and `num_alerts` at the top of the script.

## Dashboard Tabs

| Tab | Description |
|-----|-------------|
| **Overview** | KPI cards + mini metric charts + hero stats |
| **Metrics** | Full time-series charts (system + application) |
| **Traces** | Distributed trace table with span waterfall |
| **Logs** | Filterable structured log viewer |
| **Alerts** | Alert rules + triggered alert table |

## License

MIT
