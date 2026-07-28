# Autonomous Regulatory Compliance Agent Swarm — Observability

Full-stack observability infrastructure for the **Autonomous Regulatory Compliance Agent Swarm** as specified in the Technical Specification (PDF) and SKILLS.md capability matrix. Implements a push-based 4-agent cascade (Ingestion → Legal Analyst → Prosecutor → Defender) with full imperative traceability per PDF §9.2.

## Architecture (per PDF §2)

```
                  Push Update (RSS / Federal Register / EUR-Lex)
                                       │
                                       ▼
                  ┌────────────────────────────────────────┐
                  │  Agent 1: Ingestion & Schema Agent      │
                  │  • Boilerplate stripping (60-80% tokens)│
                  │  • JSON schema enforcement (PDF §3.2)   │
                  │  • Source: Federal Register, HHS, EDPB  │
                  └───────────────────┬────────────────────┘
                                      ▼
                  ┌────────────────────────────────────────┐
                  │  Agent 2: Legal Analyst Agent           │
                  │  • Statutory deconstruction             │
                  │  • Imperative extraction (IMP-XXXX)     │
                  │  • Law-to-logic mapping (PDF §4.1)      │
                  └───────────────────┬────────────────────┘
                                      ▼
                  ┌────────────────────────────────────────┐
                  │  Agent 3: Prosecutor Agent              │
                  │  • Phase I: Vector search (policy docs) │
                  │  • Phase II: SQL execution (live infra) │
                  │  • Adversarial stance: prove violation  │
                  └───────────────────┬────────────────────┘
                                      ▼
                  ┌────────────────────────────────────────┐
                  │  Agent 4: Defender Agent                │
                  │  • Remediation plan generation          │
                  │  • Policy drafts + Jira tickets         │
                  │  • Traceability to IMP-XXXX enforced    │
                  └───────────────────┬────────────────────┘
                                      ▼
                            Human-in-the-Loop (CCO)
```

## Project Structure

```
scripts/generate_observability_data.py     → Swarm Data Generator (Python)
public/observability-data.json             → Generated Dataset
src/app/api/observability/route.ts         → Main API Endpoint
src/app/api/observability/
  ├── traces/route.ts                      → Pipeline traces
  ├── metrics/route.ts                     → Swarm metrics
  ├── logs/route.ts                        → Agent activity logs
  ├── alerts/route.ts                      → Swarm alerts
  ├── topology/route.ts                    → Agent topology (NEW)
  ├── imperatives/route.ts                 → Imperative registry (NEW)
  └── violations/route.ts                  → Violations + remediation (NEW)
src/app/page.tsx                           → Dashboard Entry (8 tabs)
src/components/dashboard/
  ├── stats-cards.tsx                      → Swarm KPI Cards
  ├── metrics-charts.tsx                   → Agent-colored time-series
  ├── traces-panel.tsx                     → Pipeline trace waterfall
  ├── logs-panel.tsx                       → Agent activity browser
  ├── alerts-panel.tsx                     → Swarm alert rules
  ├── agent-topology.tsx                   → 4-agent topology view (NEW)
  ├── imperative-registry.tsx              → IMP-XXXX registry (NEW)
  └── violations-panel.tsx                 → Violations + remediation (NEW)
```

## Dashboard Tabs (8 total)

| Tab | Content | Spec Reference |
|-----|---------|----------------|
| **Overview** | Architecture hero, KPIs, API endpoints | PDF §2 |
| **Agent Topology** | 4-agent cascade diagram + per-agent skills/throughput | PDF §3-§6, SKILLS.md §1-§4 |
| **Metrics** | 9 swarm-specific metrics color-coded by owning agent | All sections |
| **Pipeline Traces** | 20 push-update scenarios with span waterfall | PDF §7 |
| **Imperatives** | IMP-XXXX registry with system-query parameters | PDF §4 |
| **Violations** | Phase I/II violations + penalty exposure + artifacts | PDF §5-§6 |
| **Audit Logs** | Agent activity logs with level/agent filters | SKILLS.md §5 |
| **Alerts** | 10 swarm alert rules mapped to PDF sections | PDF §3, §7, §9 |

## Compliance Frameworks Monitored

HIPAA · GDPR · SOC2 · PCI-DSS · EU-AI-ACT · ISO27001 · SEC

## API Endpoints (8 total)

| Method | Endpoint | Returns |
|--------|----------|---------|
| GET | `/api/observability` | Full swarm data |
| GET | `/api/observability/topology` | 4-agent topology + architecture |
| GET | `/api/observability/traces` | Pipeline traces |
| GET | `/api/observability/metrics` | Swarm metrics (9 series) |
| GET | `/api/observability/imperatives` | Imperative registry |
| GET | `/api/observability/violations` | Violations + penalty exposure |
| GET | `/api/observability/logs` | Agent activity logs |
| GET | `/api/observability/alerts` | Swarm alert rules + triggered alerts |

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
bun install
python3 scripts/generate_observability_data.py
bun run dev
# Open http://localhost:3000
```

## Implementation Guardrails (PDF §9)

All components enforce the three architectural invariants:

1. **Source Fidelity (§9.1)** — no external data; context-only operations
2. **Traceable Remediation (§9.2)** — every artifact must map to an IMP-XXXX
3. **Deterministic Formatting (§9.3)** — strict JSON schemas between agents

## License

MIT
