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
```

---

*This skills matrix is a living document. As the agent swarm matures, new skills will be onboarded and proficiency levels will be upgraded through iterative training and real-world deployment feedback.*
