# Agent Swarm Skills & Capabilities Matrix

This document catalogues the discrete skills, tooling, and competency domains required by each agent in the Autonomous Regulatory Compliance Agent Swarm. Skills are grouped by agent role and mapped to concrete deliverables.

---

## 1. Regulatory Ingestion Agent

### Core Skills
| Skill | Description | Output Artifact |
|-------|-------------|-----------------|
| **Source Polling & Web Scraping** | Periodic HTTP/fetch against Federal Register, EUR-Lex, state legislature APIs, and RSS feeds | Raw regulatory text corpus |
| **Document Classification (NLP)** | Zero-shot or fine-tuned classifier to label documents by domain (HIPAA, SOX, GDPR, PCI-DSS, etc.) | Tagged document index |
| **Change Detection (Diff Engine)** | Semantic diff between current and prior versions of a regulation; flags additions, deletions, amendments | Delta report with line-level annotations |
| **Metadata Extraction** | Extracts effective date, agency, citation number, and applicability scope | Structured JSON metadata envelope |
| **Priority Scoring** | Heuristic scorer combining recency, scope of affected industries, and penalty severity | Ranked ingestion queue |

### Tooling
- HTTP client with retry/backoff (resilient polling)
- PDF/HTML parser (pdfplumber, BeautifulSoup)
- Embedding model for semantic similarity (e.g., `text-embedding-3-small`)
- Cron / event-driven scheduler (e.g., AWS EventBridge)

---

## 2. Legal Analyst Agent

### Core Skills
| Skill | Description | Output Artifact |
|-------|-------------|-----------------|
| **Statutory Deconstruction** | Breaks regulatory prose into atomic obligations, prohibitions, and conditional clauses | Clause tree (JSON) |
| **Obligation Extraction** | NER + relation extraction to identify who must do what, by when, under which conditions | Normalized obligation records |
| **Logic Formalization** | Converts natural-language obligations into formal logic predicates (IF-THEN rules) | Machine-readable rule set |
| **Cross-Reference Resolution** | Links clauses to definitions, related sections, and superseding regulations | Dependency graph |
| **Risk Categorization** | Classifies each obligation by risk tier (Critical / High / Medium / Low) | Risk-tagged clause index |

### Tooling
- LLM with long-context window (legal text analysis)
- Structured output parser (JSON Schema enforcement)
- Knowledge graph store (Neo4j or equivalent)
- Legal ontology / controlled vocabulary

---

## 3. Compliance Prosecutor Agent

### Core Skills
| Skill | Description | Output Artifact |
|-------|-------------|-----------------|
| **Evidence Gathering** | Queries internal systems (SIEM, IAM logs, data catalogs) for compliance-relevant evidence | Evidence package (structured logs + metadata) |
| **Gap Analysis Engine** | Systematically compares obligations from Legal Analyst against actual organizational state | Gap report with pass/fail per obligation |
| **Violation Detection** | Flags specific controls that are missing, misconfigured, or expired | Violation ticket (JSON) |
| **Temporal Compliance Tracking** | Monitors deadline-driven obligations and flags approaching due dates | Deadline dashboard feed |
| **Audit Trail Generation** | Produces immutable, cryptographically-signed compliance evidence chains | Signed audit log |

### Tooling
- Query engine for multi-source data (SQL, NoSQL, API, log aggregation)
- Policy-as-Code evaluator (OPA/Rego or custom rule engine)
- Time-series database for deadline tracking
- Digital signature service (HSM-backed or cloud KMS)

---

## 4. Compliance Defender Agent

### Core Skills
| Skill | Description | Output Artifact |
|-------|-------------|-----------------|
| **Remediation Planning** | Generates prioritized remediation roadmaps with effort estimates, owner assignment, and rollback plans | Remediation plan (JSON + human-readable summary) |
| **Policy Generation** | Drafts internal policy documents, SOPs, and control descriptions to close identified gaps | Policy document (DOCX/PDF) |
| **Human-in-the-Loop Routing** | Escalates ambiguous or high-impact findings to designated human reviewers with full context | Escalation ticket with evidence bundle |
| **Exception & Waiver Management** | Processes risk-acceptance requests, calculates residual risk, and maintains exception registry | Exception record with approval chain |
| **Continuous Monitoring Setup** | Configures automated checks and alerts for newly identified control requirements | Monitoring rule definitions |

### Tooling
- LLM for natural language policy drafting
- Ticketing system integration (Jira, ServiceNow)
- Workflow engine for approval chains
- Alerting / notification service (Slack, PagerDuty, email)

---

## 5. Orchestration Layer Skills

### Cross-Cutting Capabilities
| Skill | Description | Scope |
|-------|-------------|-------|
| **Event-Driven Dispatch** | Publish/subscribe messaging to trigger agents based on regulatory change events | All agents |
| **State Management** | Maintains compliance state machine (Compliant / At-Risk / Non-Compliant / Under-Remediation) | System-wide |
| **Conflict Resolution** | Detects and resolves contradictions between overlapping regulations | Legal Analyst + Prosecutor |
| **Audit Reporting** | On-demand generation of compliance posture reports for leadership and regulators | System-wide |
| **Immutability & Versioning** | All state transitions and artifacts are versioned and append-only | System-wide |

### Infrastructure Requirements
- Message broker (Kafka, RabbitMQ, or AWS SNS/SQS)
- Append-only data store (event-sourced database)
- Secret management (Vault, AWS Secrets Manager)
- Observability stack (distributed tracing, metrics, structured logging)

---

## Skill Proficiency Levels

Each skill is rated on a four-tier proficiency scale:

| Level | Label | Meaning |
|-------|-------|---------|
| L1 | **Foundational** | Basic execution with human oversight; template-driven |
| L2 | **Operational** | Autonomous execution for standard scenarios; exception escalation |
| L3 | **Advanced** | Handles edge cases, cross-domain conflicts, and multi-jurisdictional analysis |
| L4 | **Expert** | Strategic advisory capability; proactively identifies emerging risks and recommends policy |

### Current Target Proficiencies

| Agent | L1 | L2 | L3 | L4 |
|-------|----|----|----|----|
| Ingestion | Source Polling, Classification | Change Detection, Priority Scoring | Multi-jurisdictional correlation | Predictive regulatory forecasting |
| Legal Analyst | Metadata Extraction | Obligation Extraction, Logic Formalization | Cross-Reference Resolution, Risk Categorization | Strategic legal interpretation |
| Prosecutor | Evidence Gathering | Gap Analysis | Violation Detection, Temporal Tracking | Predictive compliance modeling |
| Defender | Human-in-the-Loop Routing | Remediation Planning, Policy Generation | Exception Management, Monitoring Setup | Strategic risk advisory |

---

## Capability Interdependency Map

```
Ingestion ──feeds──> Legal Analyst ──rules──> Prosecutor ──findings──> Defender
     │                    │                      │                     │
     └── raw corpus ──────┘                      │                     │
                          └── clause tree ───────┘                     │
                                                 └── gap report ───────┘
                                                                      │
                                                 ┌── remediation ─────┘
                                                 │
                                          [Human-in-the-Loop]
                                                 │
                                          Feedback Loop ──> Ingestion
                                                 │
                                                 ▼
                              ┌────────────────────────────────────┐
                              │  HIPAA Governance Orchestrator     │
                              │  22-component functional layer     │
                              │  (Stage 7 — see §6 below)          │
                              └────────────────────────────────────┘
```

---

## 6. HIPAA Governance Orchestrator (Stage 7)

A 22-component functional simulation layer for managing AI and data workflows in a healthcare compliance context. Mirrors the prototype at `download/reference/hipaa_governance_orchestrator.py` and surfaces in the observability dashboard as the 13th tab. All 22 components run in sequence per orchestration cycle and emit structured events into a SHA-256 hash-linked audit trail.

### Component Catalog

| # | Component | Category | Role |
|---|-----------|----------|------|
| C1 | Identity & Access Management (IAM) | Access Control | Role-based access with purpose-tagged authorization for PHI resources |
| C2 | Immutable Audit Logging Engine | Auditability | Append-only SHA-256 hash-linked audit log with tamper-evident chaining |
| C3 | Encryption at Rest / In-Transit (KMS) | Cryptographic Protection | AES-256-GCM with HSM-backed key management and rotation |
| C4 | Dynamic Data Masking (Safe Harbor) | De-identification | HIPAA Safe Harbor de-identification with PHI field redaction |
| C5 | Tokenization Engine (FHIR) | De-identification | FHIR-aligned tokenization for PHI identifiers with reversible token vault |
| C6 | Consent Management & Preference Store | Patient Rights | Patient consent capture, purpose-scoped authorization, revocable preferences |
| C7 | Retention Policy Enforcer | Lifecycle Management | Automated PHI retention enforcement with archive-then-delete workflows |
| C8 | Data Classification & Sensitivity Labeller | Data Governance | PHI/PII/Restricted/Public classification with sensitivity scoring |
| C9 | Boundary Guard (Data Residency / Geo-Fencing) | Cross-Border Transfer | Jurisdiction-aware data transfer controls (GDPR/US/CN rules) |
| C10 | Anomaly Detection & Breach Alert System | Threat Detection | Threshold-based anomaly detection with breach alert + OCR notification |
| C11 | Automated Compliance Reporting (OCR/ONC) | Reporting | Quarterly HIPAA report with admin/physical/technical safeguards |
| C12 | Regulatory Change Ingestion & Versioning | Regulatory Intelligence | Automated ingestion of HHS/OCR/ONC updates with versioned snapshots |
| C13 | Policy-as-Code Engine (OPA/Rego) | Policy Enforcement | OPA/Rego policy evaluation with declarative access rules |
| C14 | Multi-Tenancy Isolation Layer | Tenant Isolation | Per-tenant cryptographic isolation with subnet-level separation |
| C15 | API Rate Limiter & Abuse Shield | API Protection | Per-user/global rate limiting with burst allowance + abuse detection |
| C16 | Prompt Inspection & Firewall Gatekeeper | AI Safety | Prompt injection detection, jailbreak attempts, PHI leakage prevention |
| C17 | Context Window Budget Manager | AI Safety | Token budget allocation across prompt/response with truncation strategy |
| C18 | Non-Deterministic Output Validator | AI Safety | Hallucination detection by grounding AI output against source context |
| C19 | Human-in-the-Loop Escalation Gate | Governance | Priority-tagged escalation queue with approval/denial workflow |
| C20 | Explainability & Provenance Tracker | Auditability | Step-by-step provenance chain linking agent actions to data lineage |
| C21 | Synthetic Data Generation Engine | Privacy Engineering | High-fidelity synthetic patient generation for safe AI training/testing |
| C22 | Disaster Recovery & State Rehydrator | Resilience | State snapshots with hash-verified rehydration for DR scenarios |

### Per-Run Output Schema

Each orchestration run produces a structured payload with the following top-level keys:

```json
{
  "run_id": "3c419f08c306",
  "start_time": "2026-07-28T17:01:24.998Z",
  "end_time": "2026-07-28T17:01:25.014Z",
  "total_components": 22,
  "components_exercised": 22,
  "total_events": 37,
  "component_catalog": [...],          // 22 entries with metadata
  "components": { ... },               // keyed by component number, multi-event keys like "1a", "6b"
  "audit_trail": [...],                // 36 SHA-256 hash-linked entries
  "escalation_events": [...],          // C19 human-in-loop events
  "breach_alerts": [...],              // C10 anomaly-triggered alerts
  "provenance_chain": [...],           // C20 step-by-step agent actions
  "synthetic_patients": { ... },       // C21 high-fidelity PHI-safe records
  "compliance_report": { ... },        // C11 OCR/ONC quarterly report
  "dr_snapshots": [...],               // C22 state snapshots with hash verification
  "categories": { ... },               // component count per category
  "statistics": { ... }                // aggregate counts
}
```

### Skill Proficiency for Stage 7

| Component Cluster | L1 Foundational | L2 Operational | L3 Advanced | L4 Expert |
|-------------------|-----------------|----------------|-------------|-----------|
| Access & Crypto (C1, C3, C14) | IAM role checks | KMS key rotation | Per-tenant crypto isolation | Zero-trust architecture |
| De-identification (C4, C5, C21) | Field redaction | FHIR tokenization | Synthetic data fidelity scoring | Privacy-preserving ML pipelines |
| Consent & Lifecycle (C6, C7, C8) | Consent capture | Retention enforcement | Sensitivity classification | Cross-jurisdictional retention |
| Cross-Border & Threat (C9, C10) | Geo-fence rules | Anomaly thresholds | Breach alert orchestration | Predictive threat modeling |
| AI Safety (C16, C17, C18) | Prompt firewall | Context budgeting | Hallucination grounding | Adversarial output defense |
| Governance & Audit (C2, C11, C12, C13, C19, C20) | Audit log append | OPA policy eval | OCR report generation | Predictive compliance posture |
| Resilience (C22) | Snapshot creation | State rehydration | Cross-region DR failover | RTO/RPO optimization |

### Observability Hooks

- **Audit Trail (C2):** Every event from every component is appended to a SHA-256 hash-linked chain. Each entry stores `prev_chain_hash`, `entry_hash`, and `chain_hash` for tamper detection.
- **Provenance Chain (C20):** Each agent action records its inputs, outputs, timestamp, and a step hash. The chain links Ingestion → Legal Analyst → Output Validator (extensible to all 4 agents).
- **Escalation Gate (C19):** High-severity findings (e.g., AI hallucination) auto-route to the on-call compliance officer with priority tags and resolution workflow.
- **Breach Alerts (C10):** Anomalies crossing severity thresholds trigger breach alerts with `ocr_notification_required` flag and a 60-hour notification window per HIPAA §164.408.

### Implementation Reference

- **Prototype:** `download/reference/hipaa_governance_orchestrator.py` (959 lines, standalone Python)
- **Observability module:** `scripts/governance_orchestrator_stage.py` (~470 lines, integrated with the 7-stage generator)
- **Dashboard component:** `src/components/dashboard/governance-orchestrator-panel.tsx` (~620 lines, 10 sub-panels)
- **API endpoint:** `GET /api/observability/governance-orchestrator`
- **Dashboard tab:** "Governance Orchestrator" (13th tab, Boxes icon)

---

*This skills matrix is a living document. As the agent swarm matures, new skills will be onboarded and proficiency levels will be upgraded through iterative training and real-world deployment feedback.*
