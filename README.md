# Autonomous Compliance — Observability Infrastructure

Full-stack observability infrastructure for the **Autonomous Compliance** platform with distributed tracing, compliance metrics, structured audit logs, and intelligent alerting — visualized in a real-time Next.js dashboard.

## Architecture

```
scripts/generate_observability_data.py    → Data Generator (Python)
public/observability-data.json            → Generated Dataset
src/app/api/observability/route.ts        → API Endpoint
src/app/page.tsx                          → Dashboard Entry
src/components/dashboard/                 → Dashboard Components
  ├── stats-cards.tsx                     → Compliance KPI Overview Cards
  ├── metrics-charts.tsx                  → Time-Series Charts (Recharts)
  ├── traces-panel.tsx                     → Compliance Workflow Trace Viewer
  ├── logs-panel.tsx                       → Audit Log Browser
  └── alerts-panel.tsx                     → Compliance Alert Rules & Fired Alerts
```

## Compliance Services

| Service | Role |
|---------|------|
| **compliance-gateway** | API entry point for all compliance operations |
| **policy-engine** | Evaluates, compiles, and resolves compliance policies |
| **audit-logger** | Immutable audit trail recording and integrity validation |
| **risk-assessor** | Calculates risk scores, threat modeling, residual risk |
| **compliance-checker** | Automated checks against SOC2, GDPR, HIPAA, ISO27001, PCI-DSS |
| **data-governor** | Data classification, retention enforcement, access control |
| **identity-verifier** | Authentication, authorization, access reviews, MFA |
| **evidence-collector** | Evidence collection, chain validation, attestation |
| **control-mapper** | Maps controls to NIST, CIS benchmarks, control matrix |
| **reporting-service** | Generates compliance reports, executive summaries, heatmaps |

## Features

### Tracing
- **50 distributed traces** with 218 spans across 10 compliance services
- Span hierarchy visualization (parent → child waterfall)
- Framework tagging (SOC2, GDPR, HIPAA, ISO27001, PCI-DSS, NIST-CSF, CIS)
- Check type badges (e.g., `SOC2.A1`, `GDPR.Art.6`)
- Filter by status (OK / Error)

### Metrics
- **6 compliance-specific time-series**: compliance score, violation rate, policy eval throughput, risk score, audit coverage, evidence collection
- **2 system metrics**: CPU, memory
- All with 60 data points, interactive tooltips, and threshold lines
- Summary cards with current, peak, and minimum values

### Logging
- **200 structured audit log entries** across 5 severity levels
- Compliance-specific messages (policy evaluations, control checks, risk assessments, data classification)
- Service-level filtering (10 compliance services)
- Full-text search across messages
- Trace ID correlation and alerting flags

### Alerting
- **10 compliance alert rules** with conditions, severity, and runbook links
- **25 triggered alerts** (firing / resolved / acknowledged)
- Framework-specific labels (SOC2, GDPR, HIPAA, etc.)
- Team labels (compliance, security, governance, legal, engineering)
- Metric threshold tracking with current vs. threshold display

## Compliance Frameworks

SOC2 · GDPR · HIPAA · ISO27001 · PCI-DSS · NIST-CSF · CIS

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

# Generate compliance observability data
python3 scripts/generate_observability_data.py

# Start development server
bun run dev

# Open http://localhost:3000
```

## Data Generation

```bash
python3 scripts/generate_observability_data.py
# Output: download/observability-data.json (~216KB)
```

Configuration: Edit `SEED`, `num_traces`, `num_logs`, `num_points`, and `num_alerts` at the top of the script.

## Dashboard Tabs

| Tab | Description |
|-----|-------------|
| **Overview** | Hero stats + compliance KPI cards + framework badges + mini charts |
| **Metrics** | Full time-series charts (compliance + system) with thresholds |
| **Traces** | Distributed trace table with compliance workflow span waterfall |
| **Logs** | Filterable audit log viewer with service/level/search |
| **Alerts** | Compliance alert rules + triggered alert table with runbook links |

## License

MIT
