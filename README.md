# Autonomous Regulatory Compliance Agent Swarm — Observability

[![Version](https://img.shields.io/badge/version-6.0.0-emerald.svg)]()
[![Generator Stages](https://img.shields.io/badge/generator-8%20stages-blue.svg)]()
[![API Routes](https://img.shields.io/badge/API%20routes-17-purple.svg)]()
[![Dashboard Tabs](https://img.shields.io/badge/dashboard%20tabs-14-orange.svg)]()
[![Live](https://img.shields.io/badge/live-GitHub%20Pages-success.svg)](https://testdemoqwenai2025-creator.github.io/Autonomous_Regulatory_Compliance_Agent_Swarm/)

Full-stack observability infrastructure for the **Autonomous Regulatory Compliance Agent Swarm** as specified in the Technical Specification (PDF) and `SKILLS.md` capability matrix. Implements a push-based 4-agent cascade (Ingestion → Legal Analyst → Prosecutor → Defender) with full imperative traceability per PDF §9.2, plus a 22-component HIPAA Governance Orchestrator (Stage 7) mirroring the prototype in `download/reference/hipaa_governance_orchestrator.py`.

## Frontend Endpoint (Dynamic Dashboard)

👉 **https://preview-chat-0f08f775-cc2e-462b-a193-602475266e1c.space-z.ai/**

The dynamic Next.js 16 dashboard is served from this container via **Caddy (port 81) → Next.js (port 3000)**. The Space-Z preview gateway routes the public URL above through to the container, making all 16 API endpoints and the 13-tab UI accessible from any browser.

| Surface | URL | Notes |
|---------|-----|-------|
| **Public dashboard** | https://preview-chat-0f08f775-cc2e-462b-a193-602475266e1c.space-z.ai/ | Routes through the Space-Z preview gateway → Caddy → Next.js |
| **Local dashboard** | `http://localhost:3000/` | Direct Next.js dev server (run `bun run dev`) |
| **Local via Caddy** | `http://localhost:81/` | Same path the gateway takes internally |
| **Static mirror** | https://testdemoqwenai2025-creator.github.io/Autonomous_Regulatory_Compliance_Agent_Swarm/ | Always-on GitHub Pages snapshot (no middleware) |

All 16 API routes are reachable on the same public host. Example curl commands:

```bash
# Two consecutive fetches return different KPI values (jittered)
curl -s https://preview-chat-0f08f775-cc2e-462b-a193-602475266e1c.space-z.ai/api/observability | jq '.data.metrics.summary.current_compliance_posture'
curl -s https://preview-chat-0f08f775-cc2e-462b-a193-602475266e1c.space-z.ai/api/observability | jq '.data.metrics.summary.current_compliance_posture'

# Trigger the Python middleware regenerator
curl -s -X POST https://preview-chat-0f08f775-cc2e-462b-a193-602475266e1c.space-z.ai/api/observability/regenerate | jq '{runId, generatedAt, version}'

# Check specific API slices
curl -s https://preview-chat-0f08f775-cc2e-462b-a193-602475266e1c.space-z.ai/api/observability/metrics | jq '.data.metrics.series[0].name'
curl -s https://preview-chat-0f08f775-cc2e-462b-a193-602475266e1c.space-z.ai/api/observability/alerts | jq '.data.triggered_alerts | length'
```

---

## Live Preview & Frontend Endpoints

### Public dashboard (always-on, GitHub Pages)

👉 **https://testdemoqwenai2025-creator.github.io/Autonomous_Regulatory_Compliance_Agent_Swarm/**

A static HTML mirror of the dashboard, deployed via GitHub Pages from the companion repo [`Autonomous_Regulatory_Compliance_Agent_Swarm`](https://github.com/testdemoqwenai2025-creator/Autonomous_Regulatory_Compliance_Agent_Swarm). No build step, no server — open the URL and the dashboard loads immediately. Each page has its dataset embedded inline as a `var ORCHESTRATION_DATA = {...}` block, so every page is self-contained and works on any static host (GitHub Pages, Netlify, S3, etc.).

| Page | URL | Content |
|------|-----|---------|
| **Landing** | [`/`](https://testdemoqwenai2025-creator.github.io/Autonomous_Regulatory_Compliance_Agent_Swarm/) | Architecture overview, 4 layer cards, agent topology diagram |
| **Agent Swarm Core** | [`/swarm.html`](https://testdemoqwenai2025-creator.github.io/Autonomous_Regulatory_Compliance_Agent_Swarm/swarm.html) | 4-agent event-driven orchestration: Ingestion, Legal Analysis, Prosecution, Defense. Distributed tracing, event bus metrics, inter-agent messaging, live simulation. |
| **HIPAA Governance** | [`/governance.html`](https://testdemoqwenai2025-creator.github.io/Autonomous_Regulatory_Compliance_Agent_Swarm/governance.html) | 22-component HIPAA governance layer: IAM, encryption, masking, tokenization, consent, retention, anomaly detection, prompt firewall, audit trail, synthetic patients, provenance chain, DR snapshots. |
| **State Machine** | [`/statemachine.html`](https://testdemoqwenai2025-creator.github.io/Autonomous_Regulatory_Compliance_Agent_Swarm/statemachine.html) | Compliance state lifecycle engine: 6 states, 6 tracked entities, 11 transitions, 6 cross-regulation conflicts detected and resolved with strategy mapping. |
| **Capabilities** | [`/capabilities.html`](https://testdemoqwenai2025-creator.github.io/Autonomous_Regulatory_Compliance_Agent_Swarm/capabilities.html) | 20 individual skills across 4 agents mapped to SKILLS.md proficiency levels L1–L3. Source polling, NLP classification, gap analysis, policy generation, and more. |

**Static site quick-stats:** 5 HTML pages · ~52 KB governance page · vanilla HTML/CSS/JS (no framework, no build step) · data embedded inline · CORS-enabled (`access-control-allow-origin: *`) · served by GitHub.com with `max-age=600` cache.

### Dynamic source (Next.js, this repo)

The dynamic Next.js 16 app in this repo (`src/`) is the **source of truth** — it adds a live middle-tier on top of the same data: per-request jitter, servedAt stamping, an auto-refresh polling UI, and a `POST /api/observability/regenerate` endpoint that re-executes the Python generator on demand. Run it locally with `bun run dev` and open `http://localhost:3000`.

| Endpoint | Type | Description |
|----------|------|-------------|
| **Live Dashboard** | Frontend (UI) | The 13-tab observability dashboard — Overview, Agent Topology, Metrics, Pipeline Traces, Imperatives, Violations, Audit Logs, Alerts, State Machine, Orchestration, Conflicts, Audit Chain, Governance Orchestrator |
| `/` | Frontend route | Server-rendered shell + client-side polling (auto-refresh every 30s) |
| `/api/observability` | REST API | Full swarm dataset, **dynamic** — jittered per call, returns `servedAt` |
| `/api/observability/regenerate` (GET) | REST API | Middleware health check — returns dataset mtime, version, size |
| `/api/observability/regenerate` (POST) | REST API | **Re-runs the Python generator** and serves a fresh dataset (~150ms) |

### Relationship between the two

| Aspect | GitHub Pages (static) | Next.js app (this repo) |
|--------|----------------------|-------------------------|
| Hosting | GitHub Pages, always-on | Local dev / FC container |
| Framework | Vanilla HTML/CSS/JS | Next.js 16 + React 19 + Tailwind 4 |
| Data freshness | Frozen snapshot (baked in at deploy time) | Dynamic — jitter + regenerate |
| API endpoints | None (data inline) | 16 REST endpoints |
| Tabs / pages | 5 pages | 13 tabs |
| Build step | None | `bun run build` |
| Best for | Public demo, portfolio, sharing | Local development, dynamic middleware testing |

The Python generator (`scripts/generate_observability_data.py`) is the single source of truth for both — it produces the JSON dataset that the Next.js app serves dynamically and that the static site bakes in at deploy time.

### Try the dynamic middleware locally

Once the dev server is running (`bun run dev`), open the dashboard and try the **Regenerate Now** button on the Overview tab — it triggers `POST /api/observability/regenerate`, which executes `scripts/generate_observability_data.py` end-to-end (all 7 stages) and swaps the dataset under the running server. The `generatedAt` timestamp in the footer will jump, confirming the middleware is wired through.

You can also verify the dynamic behavior from a terminal:

```bash
# Two consecutive fetches return different KPI values (jittered)
curl -s http://localhost:3000/api/observability | jq '.data.metrics.summary.current_compliance_posture'
curl -s http://localhost:3000/api/observability | jq '.data.metrics.summary.current_compliance_posture'

# Re-run the Python middleware and observe the new generatedAt
curl -s -X POST http://localhost:3000/api/observability/regenerate | jq '{runId, generatedAt, version}'
```

## What Is This Application?

This is a **compliance observability dashboard** for an autonomous multi-agent system that ingests regulatory updates (HIPAA, GDPR, SOC2, PCI-DSS, EU-AI-ACT, ISO27001, SEC) and audits whether internal infrastructure violates them. Four AI agents cooperate in a push-based cascade:

1. **Ingestion Agent** — strips boilerplate from Federal Register / EUR-Lex feeds, normalizes to a strict JSON schema (PDF §3.2)
2. **Legal Analyst Agent** — deconstructs statutes into atomic imperatives (`IMP-XXXX` IDs) with system-query parameters (PDF §4.1)
3. **Prosecutor Agent** — runs Phase I vector search (policy docs) and Phase II SQL execution (live infra) to *prove* violations (PDF §5)
4. **Defender Agent** — generates remediation plans, policy drafts, and Jira tickets, each traceable to an `IMP-XXXX` (PDF §6)

A **22-component HIPAA Governance Orchestrator** (Stage 7) wraps the swarm with healthcare-specific controls — IAM, KMS, masking, consent, OPA policy-as-code, prompt firewall, output validator, provenance, DR snapshots, and 13 more — each emitting structured events into a SHA-256 hash-linked audit trail.

The dashboard surfaces all of this through 13 tabs (Next.js) and 5 pages (static mirror), backed by 16 API endpoints and a live middle-tier that ensures the dynamic UI is **not** replaying a frozen JSON snapshot.

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
                                      │
                                      ▼
                  ┌────────────────────────────────────────┐
                  │  Stage 7: HIPAA Governance Orchestrator │
                  │  22-component functional simulation     │
                  │  (IAM, KMS, Masking, Consent, OPA,      │
                  │   Prompt Firewall, Output Validator,    │
                  │   Provenance, DR, ...)                  │
                  └────────────────────────────────────────┘
```

## Project Structure

```
scripts/
├── generate_observability_data.py        → Swarm Data Generator v5.0.0 (7 stages)
└── governance_orchestrator_stage.py      → Stage 7: 22-component HIPAA governance module

public/
└── observability-data.json               → Generated Dataset (~710KB, v5.0.0)

src/app/api/observability/
├── route.ts                              → Main API (full swarm data)
├── traces/route.ts                       → 4-agent pipeline traces
├── metrics/route.ts                      → Swarm metrics (9 series)
├── logs/route.ts                         → Agent activity & audit logs
├── alerts/route.ts                       → Swarm alert rules + triggered alerts
├── topology/route.ts                     → 4-agent swarm topology
├── imperatives/route.ts                  → Imperative registry (IMP-XXXX)
├── violations/route.ts                   → Violations + remediation
├── state-machine/route.ts                → Compliance state machine (Stage 6)
├── orchestration/route.ts                → Event bus + topics (Stage 6)
├── conflicts/route.ts                    → Regulatory conflict resolution (Stage 6)
├── audit-chain/route.ts                  → Hash-linked append-only audit chain (Stage 6)
└── governance-orchestrator/route.ts      → 22-component HIPAA governance (Stage 7)

src/app/page.tsx                          → Dashboard Entry (13 tabs)

src/components/dashboard/
├── stats-cards.tsx                       → Swarm KPI Cards
├── metrics-charts.tsx                    → Agent-colored time-series
├── traces-panel.tsx                      → Pipeline trace waterfall
├── logs-panel.tsx                        → Agent activity browser
├── alerts-panel.tsx                      → Swarm alert rules
├── agent-topology.tsx                    → 4-agent topology view
├── imperative-registry.tsx               → IMP-XXXX registry
├── violations-panel.tsx                  → Violations + remediation
├── state-machine-panel.tsx               → 8-entity state machine (Stage 6)
├── orchestration-panel.tsx               → Event bus topics + consumers (Stage 6)
├── conflicts-panel.tsx                   → Regulatory conflict matrix (Stage 6)
├── provenance-panel.tsx                  → Hash-linked audit chain (Stage 6)
└── governance-orchestrator-panel.tsx     → 22-component HIPAA governance (Stage 7)

download/
├── SKILLS.md                             → Agent skills & capabilities matrix
├── Autonomous_Regulatory_Compliance_Agent_Swarm.pdf  → Technical spec
├── observability-data.json               → Mirror of public dataset
└── reference/
    ├── hipaa_governance_orchestrator.py  → 22-component prototype (Stage 7 source)
    ├── orchestration_output.json         → Prototype output sample
    ├── agent_swarm_core.py               → Event bus prototype (Stage 6 source)
    └── state_machine_conflict_engine.py  → State machine + conflict engine prototype
```

## Generator Pipeline (8 stages, v6.0.0)

| Stage | Module | Output | Spec Reference |
|-------|--------|--------|-----------------|
| 1 | `generate_swarm_traces()` | 20 push-update scenarios, ~80 spans | PDF §7 |
| 2 | `generate_metrics()` | 9 metric series × 60 data points | All sections |
| 3 | `generate_logs()` | 200 agent activity logs (INFO/WARN/ERROR/FATAL/DEBUG) | SKILLS §5 |
| 4 | `generate_alert_rules()` + `generate_triggered_alerts()` | 10 rules + 25 triggered alerts | PDF §3, §7, §9 |
| 5 | `generate_agent_topology()` + `generate_imperative_registry()` + `generate_violations()` | 4 agents, 38 imperatives, 10 violations | PDF §3-§6, SKILLS §1-§4 |
| 6 | `generate_state_machine()` + `generate_event_bus()` + `generate_conflicts()` + `generate_audit_chain()` | 8 entities, 40 transitions, 8 topics, 15 conflicts, 30 audit entries | SKILLS §5 |
| 7 | `generate_governance_orchestrator()` | 22 components, 37 events, 36 audit entries, escalations, breach alerts, provenance chain, synthetic patients, DR snapshots, OCR/ONC compliance report | HIPAA Governance Orchestrator prototype |
| 8 | `generate_compliance_score()` | 7-framework composite scores (6 dimensions each), 30-day trend, 10-item risk matrix, imperative coverage, posture assessment | Compliance Scoring |

## Dashboard Tabs (14 total)

| # | Tab | Content | Stage |
|---|-----|---------|-------|
| 1 | **Overview** | Architecture hero, KPIs, dynamic-layer card, 17 API endpoints | 1 |
| 2 | **Agent Topology** | 4-agent cascade diagram + per-agent skills/throughput | 1 |
| 3 | **Metrics** | 9 swarm-specific metrics color-coded by owning agent | 1 |
| 4 | **Pipeline Traces** | 20 push-update scenarios with span waterfall | 1 |
| 5 | **Imperatives** | IMP-XXXX registry with system-query parameters | 1 |
| 6 | **Violations** | Phase I/II violations + penalty exposure + artifacts | 1 |
| 7 | **Audit Logs** | Agent activity logs with level/agent filters | 1 |
| 8 | **Alerts** | 10 swarm alert rules mapped to PDF sections | 1 |
| 9 | **State Machine** | 8-entity compliance state machine with transition timeline | 6 |
| 10 | **Orchestration** | Event bus topics, partitions, consumer groups, throughput | 6 |
| 11 | **Conflicts** | 15 regulatory conflicts with severity + resolution strategy | 6 |
| 12 | **Audit Chain** | 30-entry hash-linked append-only audit chain with signatures | 6 |
| 13 | **Governance Orchestrator** | 22-component HIPAA governance with audit trail, escalations, breach alerts, provenance, DR snapshots, synthetic patients, OCR/ONC report | 7 |
| 14 | **Compliance Score** | 7-framework weighted composite score, dimension breakdown, 30-day trend chart, cross-framework risk matrix, imperative coverage, posture assessment | 9 |

## API Endpoints (17 total)

| # | Method | Endpoint | Returns | Stage | Dynamic? |
|---|--------|----------|---------|-------|----------|
| 1 | GET | `/api/observability` | Full swarm observability data | 1 | ✅ jittered per call, returns `servedAt` |
| 2 | GET | `/api/observability/topology` | 4-agent topology + architecture | 1 | static |
| 3 | GET | `/api/observability/traces` | 4-agent pipeline traces | 1 | static |
| 4 | GET | `/api/observability/metrics` | Swarm metrics (9 series) | 1 | ✅ live sample appended per call |
| 5 | GET | `/api/observability/imperatives` | Imperative registry (PDF §4) | 1 | static |
| 6 | GET | `/api/observability/violations` | Prosecutor violations + remediation | 1 | static |
| 7 | GET | `/api/observability/logs` | Agent activity & audit logs | 1 | static |
| 8 | GET | `/api/observability/alerts` | Swarm alert rules + triggered alerts | 1 | ✅ state transitions on each call |
| 9 | GET | `/api/observability/state-machine` | Compliance state machine (SKILLS §5) | 6 | static |
| 10 | GET | `/api/observability/orchestration` | Event bus + topics (SKILLS §5) | 6 | static |
| 11 | GET | `/api/observability/conflicts` | Regulatory conflict resolution | 6 | static |
| 12 | GET | `/api/observability/audit-chain` | Immutable append-only audit chain | 6 | static |
| 13 | GET | `/api/observability/governance-orchestrator` | 22-component HIPAA governance orchestrator | 7 | static |
| 14 | GET | `/api/observability/compliance-score` | 7-framework composite scores + 30-day trend + risk matrix | 9 | ✅ jittered composite + per-framework scores per call |
| 15 | GET | `/api/observability/regenerate` | Middleware health check (mtime, version, size) | 8 | ✅ always fresh |
| 16 | POST | `/api/observability/regenerate` | Re-runs Python generator end-to-end, serves new dataset | 8 | ✅ triggers middleware |
| 17 | GET | `/api` | API root (health check) | 1 | static |

### Frontend Endpoints

The dashboard exposes one user-facing route plus the live middle-tier endpoints documented above:

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Observability dashboard (13 tabs, server-rendered shell + client-side polling every 30s) |
| GET | `/api/observability` | Consumed by the dashboard on load + every 30s (cache-busted) |
| GET | `/api/observability/regenerate` | Polled by the Live indicator to verify middleware reachability |
| POST | `/api/observability/regenerate` | Triggered by the **Regenerate Now** button on the Overview tab |

The frontend consumes the 16 API endpoints above via `fetch()` from the browser. Each API endpoint returns JSON only; the UI is rendered entirely by `src/app/page.tsx` and the components in `src/components/dashboard/`.

### Dynamic Middleware Behavior

The application is **not a static scenario replay**. The middle tier applies the following dynamic transformations on every request:

| Layer | Transformation | Visible Effect |
|-------|----------------|----------------|
| `servedAt` stamp | Every response includes a fresh ISO timestamp | Header `X-Served-At` + footer "Served:" line updates each poll |
| KPI jitter | ±5% noise applied to `metrics.summary.*` continuous values | KPI cards visibly tick between 30s polls |
| Live sample append | Each metric series gets a new `{timestamp, value}` sample | Charts grow a fresh point on each poll (rolling window of 90) |
| Alert state rotation | Random non-critical `firing` alert becomes `acknowledged` | Alerts panel shows live state transitions |
| Regenerate endpoint | `POST` re-executes `scripts/generate_observability_data.py` | `generatedAt` jumps to a new timestamp; entire dataset swapped |
| Auto-refresh polling | Frontend polls `/api/observability` every 30s | Live pulse indicator + "Served:" time updates without manual refresh |
| Cache-busting | `fetch()` URL includes `?_=${Date.now()}` | No stale responses from browser cache |

## Stage 7: HIPAA Governance Orchestrator (22 Components)

The 13th dashboard tab surfaces a 22-component functional simulation layer for managing AI and data workflows in a healthcare compliance context. Each component emits one or more structured events that flow into a SHA-256 hash-linked audit trail.

| # | Component | Category | Event |
|---|-----------|----------|-------|
| C1 | Identity & Access Management (IAM) | Access Control | `IAM_CHECK` |
| C2 | Immutable Audit Logging Engine | Auditability | `AUDIT_SUMMARY` |
| C3 | Encryption at Rest / In-Transit (KMS) | Cryptographic Protection | `ENCRYPT` |
| C4 | Dynamic Data Masking (Safe Harbor) | De-identification | `DATA_MASKING` |
| C5 | Tokenization Engine (FHIR) | De-identification | `TOKENIZE` |
| C6 | Consent Management & Preference Store | Patient Rights | `CONSENT_RECORD` |
| C7 | Retention Policy Enforcer | Lifecycle Management | `RETENTION_CHECK` |
| C8 | Data Classification & Sensitivity Labeller | Data Governance | `CLASSIFY` |
| C9 | Boundary Guard (Data Residency / Geo-Fencing) | Cross-Border Transfer | `GEO_FENCE` |
| C10 | Anomaly Detection & Breach Alert System | Threat Detection | `ANOMALY_DETECT` |
| C11 | Automated Compliance Reporting (OCR/ONC) | Reporting | `COMPLIANCE_REPORT` |
| C12 | Regulatory Change Ingestion & Versioning | Regulatory Intelligence | `REG_CHANGE` |
| C13 | Policy-as-Code Engine (OPA/Rego) | Policy Enforcement | `POLICY_EVAL` |
| C14 | Multi-Tenancy Isolation Layer | Tenant Isolation | `TENANT_ISOLATE` |
| C15 | API Rate Limiter & Abuse Shield | API Protection | `RATE_LIMIT` |
| C16 | Prompt Inspection & Firewall Gatekeeper | AI Safety | `PROMPT_FIREWALL` |
| C17 | Context Window Budget Manager | AI Safety | `CONTEXT_BUDGET` |
| C18 | Non-Deterministic Output Validator | AI Safety | `OUTPUT_VALIDATE` |
| C19 | Human-in-the-Loop Escalation Gate | Governance | `ESCALATE` |
| C20 | Explainability & Provenance Tracker | Auditability | `PROVENANCE` |
| C21 | Synthetic Data Generation Engine | Privacy Engineering | `SYNTHETIC_GEN` |
| C22 | Disaster Recovery & State Rehydrator | Resilience | `SNAPSHOT` |

Each run emits:
- **37 structured events** across the 22 components
- **36-entry SHA-256 hash-linked audit trail** (each entry chained to the previous)
- **2 escalation events** (raised + resolved, with officer attribution)
- **1 breach alert** (anomaly-triggered, with OCR 60-hour notification flag)
- **3 provenance steps** (Ingestion → Legal Analyst → Output Validator)
- **8 synthetic patients** (high-fidelity, HIPAA-safe, with conditions & medications)
- **1 DR snapshot** (with state hash verification + rehydration test)
- **1 OCR/ONC compliance report** (admin/physical/technical safeguards, Q4-2025)

## Compliance Frameworks Monitored

HIPAA · GDPR · SOC2 · PCI-DSS · EU-AI-ACT · ISO27001 · SEC

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Charts | Recharts |
| Icons | Lucide React |
| Data Gen | Python 3 (7-stage pipeline) |

## Getting Started

```bash
# 1. Install dependencies
bun install

# 2. Regenerate the observability dataset (optional — pre-generated copy is in public/)
#    This can also be triggered live from the dashboard's "Regenerate Now" button
python3 scripts/generate_observability_data.py

# 3. Run the dev server
bun run dev
# Open http://localhost:3000
#
# Verify the dynamic middle-tier is wired through:
#   curl -s http://localhost:3000/api/observability | jq '.servedAt'
#   curl -s -X POST http://localhost:3000/api/observability/regenerate | jq '{runId, generatedAt}'
```

## Development Stages

Each stage of application development follows this workflow:

1. Implement the stage module (Python generator + Next.js component + API route)
2. Update `README.md` with new endpoints, tabs, and stage description
3. Update `download/SKILLS.md` with new capabilities
4. Run `npm run build` to verify zero compile errors
5. Commit with `feat(stage-N): <description>` message
6. Push to GitHub

### Stage History

| Stage | Commit | Description |
|-------|--------|-------------|
| 1-5 | `ac54893` | Initial observability: traces, metrics, logs, alerts, topology, imperatives, violations |
| 6 | `f0ecae1` | Orchestration layer: state machine, event bus, conflicts, audit chain |
| 7 | `a013ab9` | HIPAA Governance Orchestrator: 22 components, audit trail, escalations, DR |
| 8 | `bab4c2c` | Dynamic live middleware: regenerate endpoint, per-request jitter, auto-refresh polling |
| 9 | (this commit) | Compliance scoring engine: 7-framework weighted composite, 30-day trend, cross-framework risk matrix |

## Implementation Guardrails (PDF §9)

All components enforce the three architectural invariants:

1. **Source Fidelity (§9.1)** — no external data; context-only operations
2. **Traceable Remediation (§9.2)** — every artifact must map to an IMP-XXXX
3. **Deterministic Formatting (§9.3)** — strict JSON schemas between agents

## License

MIT
