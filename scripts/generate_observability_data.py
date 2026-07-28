#!/usr/bin/env python3
"""
Autonomous Regulatory Compliance Agent Swarm — Observability Generator
======================================================================
Implements observability for the 4-agent swarm architecture defined in
the Technical Specification (PDF) and SKILLS.md:

  Agent 1: Ingestion & Schema Agent        (deterministic parser)
  Agent 2: Legal Analyst Agent             (rules engine — imperatives)
  Agent 3: Prosecutor Agent                (adversarial evaluator)
  Agent 4: Defender Agent                  (remediation engineer)

Stages follow Section 7 of the spec: Push Update → Parse → Imperative
Extraction → Adversarial Audit → Remediation Engineering → Human-in-Loop.

Output: /home/z/my-project/download/observability-data.json
"""

import json
import random
import uuid
import hashlib
import math
from datetime import datetime, timedelta, timezone

SEED = 42
random.seed(SEED)
OUTPUT_PATH = "/home/z/my-project/download/observability-data.json"
NOW = datetime.now(timezone.utc)


def ts(minutes_ago=0, seconds_offset=0):
    dt = NOW - timedelta(minutes=minutes_ago, seconds=seconds_offset)
    return dt.strftime("%Y-%m-%dT%H:%M:%S.") + f"{dt.microsecond // 1000:03d}Z"


def rand_latency(lo=5, hi=500):
    return max(lo, min(hi, int(random.lognormvariate(math.log(50), 1.0))))


def rand_choice(options, weights=None):
    return random.choices(options, weights=weights or [1]*len(options), k=1)[0]


def hash_id(*parts):
    raw = ":".join(str(p) for p in parts)
    return hashlib.sha256(raw.encode()).hexdigest()[:12].upper()


# ══════════════════════════════════════════════════════════════════════════════
# Domain Data — matches PDF §3.2 (Agent 1 schema), §4.1 (mapping), §7.1 (HIPAA)
# ══════════════════════════════════════════════════════════════════════════════

REGULATORY_SOURCES = [
    {"id": "FR-2026-14872", "name": "HIPAA Access Log Retention Amendment",
     "jurisdiction": "HIPAA", "agency": "HHS", "tier": "Critical",
     "effective_date": "2026-09-01", "raw_pages": 52,
     "cleaned_tokens": 4120, "raw_tokens": 18430,
     "url": "https://federalregister.gov/d/2026-14872"},
    {"id": "FR-2026-14903", "name": "GDPR Article 25 — Data Protection by Design Update",
     "jurisdiction": "GDPR", "agency": "EDPB", "tier": "High",
     "effective_date": "2026-08-15", "raw_pages": 38,
     "cleaned_tokens": 3180, "raw_tokens": 14250,
     "url": "https://eur-lex.europa.eu/2026/14903"},
    {"id": "FR-2026-14944", "name": "SOC 2 — Type II Encryption-at-Rest Requirement",
     "jurisdiction": "SOC2", "agency": "AICPA", "tier": "High",
     "effective_date": "2026-10-01", "raw_pages": 24,
     "cleaned_tokens": 2040, "raw_tokens": 9180,
     "url": "https://aicpa.org/2026/14944"},
    {"id": "FR-2026-14988", "name": "PCI-DSS v4.1 — MFA Scope Expansion",
     "jurisdiction": "PCI-DSS", "agency": "PCI-SSC", "tier": "Critical",
     "effective_date": "2026-07-30", "raw_pages": 67,
     "cleaned_tokens": 5890, "raw_tokens": 28140,
     "url": "https://pcisecuritystandards.org/2026/14988"},
    {"id": "FR-2026-15019", "name": "EU AI Act — High-Risk System Audit Logging",
     "jurisdiction": "EU-AI-ACT", "agency": "EU-Commission", "tier": "Critical",
     "effective_date": "2026-08-27", "raw_pages": 89,
     "cleaned_tokens": 7820, "raw_tokens": 37640,
     "url": "https://eur-lex.europa.eu/2026/15019"},
    {"id": "FR-2026-15052", "name": "ISO 27001:2026 — Annex A Control Update",
     "jurisdiction": "ISO27001", "agency": "ISO", "tier": "Moderate",
     "effective_date": "2026-11-01", "raw_pages": 31,
     "cleaned_tokens": 2680, "raw_tokens": 12090,
     "url": "https://iso.org/2026/15052"},
    {"id": "FR-2026-15088", "name": "SEC Cybersecurity Disclosure Rule Amendment",
     "jurisdiction": "SEC", "agency": "SEC", "tier": "High",
     "effective_date": "2026-09-15", "raw_pages": 19,
     "cleaned_tokens": 1620, "raw_tokens": 7820,
     "url": "https://sec.gov/2026/15088"},
]

# Imperative templates per jurisdiction (matches PDF §4.1 mapping examples)
IMPERATIVE_TEMPLATES = {
    "HIPAA": [
        {"text": "Maintain access logs for a minimum of 365 days",
         "query": 'query_db_metadata(table="Access_Logs", filter="retention_period < 365d", action="count")',
         "risk_tier": "Critical"},
        {"text": "Encrypt all PHI at rest using AES-256",
         "query": 'scan_storage_config(attribute="encryption_standard", expected="AES-256")',
         "risk_tier": "Critical"},
        {"text": "Administrative access requires Multi-Factor Authentication",
         "query": 'check_iam_policy(role="admin", requirement="mfa_enabled")',
         "risk_tier": "High"},
        {"text": "Conduct annual HIPAA security risk assessment",
         "query": 'check_audit_records(control="HIPAA-SRA", cadence="annual")',
         "risk_tier": "Moderate"},
    ],
    "GDPR": [
        {"text": "Implement data protection by design and by default",
         "query": 'scan_dpia_records(status="completed", scope="all-systems")',
         "risk_tier": "High"},
        {"text": "Honor data subject erasure requests within 30 days",
         "query": 'query_ticket_sla(category="DSAR-erasure", max_days=30)',
         "risk_tier": "High"},
        {"text": "Maintain records of processing activities (ROPA)",
         "query": 'check_ropa_inventory(completeness="all-systems")',
         "risk_tier": "Moderate"},
        {"text": "Cross-border data transfer requires SCC or adequacy decision",
         "query": 'check_transfer_agreements(dest="non-EEA", agreement_type="SCC")',
         "risk_tier": "High"},
    ],
    "SOC2": [
        {"text": "All data at rest must be encrypted with industry-standard algorithms",
         "query": 'scan_storage_config(attribute="encryption_standard", expected="AES-256")',
         "risk_tier": "High"},
        {"text": "Access reviews must be performed quarterly",
         "query": 'check_access_review_records(cadence="quarterly")',
         "risk_tier": "Moderate"},
        {"text": "Change management requires documented approval workflows",
         "query": 'check_change_tickets(approval_workflow="documented")',
         "risk_tier": "Moderate"},
    ],
    "PCI-DSS": [
        {"text": "Multi-factor authentication required for all access into CDE",
         "query": 'check_iam_policy(scope="CDE", requirement="mfa_enabled")',
         "risk_tier": "Critical"},
        {"text": "Cardholder data retention limited to business need",
         "query": 'query_db_metadata(table="CHD", filter="age > business_need", action="flag")',
         "risk_tier": "High"},
        {"text": "Network segmentation between CDE and corporate networks",
         "query": 'scan_network_segmentation(scope="CDE", isolation="enforced")',
         "risk_tier": "Critical"},
        {"text": "Quarterly vulnerability scans required",
         "query": 'check_scan_records(control="vuln-scan", cadence="quarterly")',
         "risk_tier": "High"},
    ],
    "EU-AI-ACT": [
        {"text": "High-risk AI systems must maintain automated audit logs for 5 years",
         "query": 'query_db_metadata(table="AI_Audit_Logs", filter="retention < 1825d", action="count")',
         "risk_tier": "Critical"},
        {"text": "Human oversight mandatory for high-risk AI decisions",
         "query": 'check_ai_systems(risk_tier="high", oversight="human-in-loop")',
         "risk_tier": "High"},
        {"text": "Bias testing required before deployment and quarterly thereafter",
         "query": 'check_bias_test_records(cadence="quarterly")',
         "risk_tier": "High"},
    ],
    "ISO27001": [
        {"text": "Information security policy reviewed at planned intervals",
         "query": 'check_policy_review_records(cadence="annual")',
         "risk_tier": "Moderate"},
        {"text": "Asset inventory maintained with assigned ownership",
         "query": 'check_asset_inventory(ownership="assigned", completeness="100%")',
         "risk_tier": "Moderate"},
    ],
    "SEC": [
        {"text": "Material cybersecurity incidents disclosed within 4 business days",
         "query": 'check_disclosure_sla(incident_type="material-cyber", max_days=4)',
         "risk_tier": "Critical"},
        {"text": "Risk management strategy documented and reviewed annually",
         "query": 'check_risk_strategy_review(cadence="annual")',
         "risk_tier": "High"},
    ],
}

# ══════════════════════════════════════════════════════════════════════════════
# Stage 1: Distributed Traces — 4-Agent Pipeline Spans
# ══════════════════════════════════════════════════════════════════════════════

AGENTS = [
    {"name": "Ingestion_Agent", "role": "Deterministic Parser",
     "operations": ["PollFederalRegister", "ParsePDF", "StripBoilerplate", "ValidateSchema", "PublishToEventBus"]},
    {"name": "Legal_Analyst_Agent", "role": "Rules Engine",
     "operations": ["ExtractNormativeStatements", "FormalizeImperative", "AssignImperativeId",
                    "GenerateSystemQuery", "CrossReferenceResolution", "RiskCategorize"]},
    {"name": "Prosecutor_Agent", "role": "Adversarial Evaluator",
     "operations": ["Phase1_VectorSearch", "Phase1_PolicyConflict", "Phase2_ExecuteSQLQuery",
                    "Phase2_VerifyConfig", "GenerateViolationReport", "CalculatePenaltyExposure"]},
    {"name": "Defender_Agent", "role": "Remediation Engineer",
     "operations": ["MapViolationToImperative", "GenerateRemediationPlan",
                    "DraftPolicyUpdate", "CreateEngineeringTicket", "BuildExecutiveDashboard",
                    "RouteForHumanApproval"]},
]


def generate_swarm_traces(num_scenarios=20):
    """Each scenario = 1 push update flowing through the 4-agent pipeline."""
    traces = []
    for i in range(num_scenarios):
        scenario_id = f"SCN-{uuid.uuid4().hex[:8].upper()}"
        trace_id = uuid.uuid4().hex
        source = rand_choice(REGULATORY_SOURCES)
        started_at = ts(minutes_ago=random.randint(0, 60))
        root_span_id = uuid.uuid4().hex[:16]

        # Root span: Trigger detection
        spans = [{
            "spanId": root_span_id,
            "traceId": trace_id,
            "parentSpanId": None,
            "agent": "Ingestion_Agent",
            "operation": "PollFederalRegister",
            "startTime": started_at,
            "durationMs": rand_latency(50, 400),
            "status": "ok",
            "tags": {
                "regulation.id": source["id"],
                "regulation.name": source["name"],
                "regulation.jurisdiction": source["jurisdiction"],
                "regulation.tier": source["tier"],
                "scenario.id": scenario_id,
            },
            "events": [
                {"name": "RSS trigger", "ts": started_at, "attr": {"source": source["url"]}},
            ]
        }]

        # Agent 1: Ingestion chain
        prev_span = root_span_id
        for op in ["ParsePDF", "StripBoilerplate", "ValidateSchema", "PublishToEventBus"]:
            span_id = uuid.uuid4().hex[:16]
            spans.append({
                "spanId": span_id,
                "traceId": trace_id,
                "parentSpanId": prev_span,
                "agent": "Ingestion_Agent",
                "operation": op,
                "startTime": ts(minutes_ago=random.randint(0, 59), seconds_offset=random.randint(0, 30)),
                "durationMs": rand_latency(5, 250),
                "status": rand_choice(["ok", "ok", "ok", "ok", "error"]),
                "tags": {
                    "regulation.id": source["id"],
                    "scenario.id": scenario_id,
                    "agent.role": "Deterministic Parser",
                    **({"token.saved_pct": round(100 - (source["cleaned_tokens"]/source["raw_tokens"])*100, 1)} if op == "StripBoilerplate" else {}),
                    **({"schema.valid": "true", "agent1.output.effective_date": source["effective_date"],
                        "agent1.output.penalty_tier": source["tier"],
                        "agent1.output.jurisdiction": source["jurisdiction"]} if op == "ValidateSchema" else {}),
                },
                "events": []
            })
            prev_span = span_id

        # Agent 2: Legal Analyst — extract 1-3 imperatives
        num_imperatives = random.randint(1, 3)
        imperative_ids = []
        for j in range(num_imperatives):
            template = rand_choice(IMPERATIVE_TEMPLATES.get(source["jurisdiction"], [{"text": "General compliance required", "query": "scan_compliance()", "risk_tier": "Moderate"}]))
            imp_id = f"IMP-{random.randint(1000,9999)}"
            imperative_ids.append({
                "id": imp_id,
                "text": template["text"],
                "query": template["query"],
                "risk_tier": template["risk_tier"],
                "jurisdiction": source["jurisdiction"],
                "regulation_id": source["id"],
                "scenario_id": scenario_id,
                "trace_id": trace_id,
                "extracted_at": ts(minutes_ago=random.randint(0, 55)),
            })
            for op in ["FormalizeImperative", "AssignImperativeId", "GenerateSystemQuery"]:
                span_id = uuid.uuid4().hex[:16]
                spans.append({
                    "spanId": span_id,
                    "traceId": trace_id,
                    "parentSpanId": prev_span,
                    "agent": "Legal_Analyst_Agent",
                    "operation": op,
                    "startTime": ts(minutes_ago=random.randint(0, 55), seconds_offset=random.randint(0, 30)),
                    "durationMs": rand_latency(20, 350),
                    "status": "ok",
                    "tags": {
                        "imperative.id": imp_id,
                        "imperative.risk_tier": template["risk_tier"],
                        "scenario.id": scenario_id,
                        "agent.role": "Rules Engine",
                    },
                    "events": []
                })
                prev_span = span_id

        # Agent 3: Prosecutor — adversarial audit (Phase I + Phase II)
        has_violation = random.random() < 0.55  # 55% violation rate (adversarial stance)
        for op in ["Phase1_VectorSearch", "Phase1_PolicyConflict", "Phase2_ExecuteSQLQuery",
                    "Phase2_VerifyConfig", "GenerateViolationReport", "CalculatePenaltyExposure"]:
            span_id = uuid.uuid4().hex[:16]
            status = "error" if op in ["Phase2_ExecuteSQLQuery", "Phase2_VerifyConfig"] and has_violation else "ok"
            spans.append({
                "spanId": span_id,
                "traceId": trace_id,
                "parentSpanId": prev_span,
                "agent": "Prosecutor_Agent",
                "operation": op,
                "startTime": ts(minutes_ago=random.randint(0, 54), seconds_offset=random.randint(0, 30)),
                "durationMs": rand_latency(30, 500),
                "status": status,
                "tags": {
                    "audit.phase": "I" if "Phase1" in op else "II",
                    "audit.adversarial": "true",
                    "scenario.id": scenario_id,
                    "violation.detected": "true" if has_violation else "false",
                    "agent.role": "Adversarial Evaluator",
                    **({"imperative.ids": ",".join([i["id"] for i in imperative_ids])} if imperative_ids else {}),
                },
                "events": [
                    {"name": "adversarial_prompt", "ts": ts(minutes_ago=random.randint(0, 50)),
                     "attr": {"prompt": "Assume non-compliance. Prove violation."}}
                ] if "Phase1" in op else []
            })
            prev_span = span_id

        # Agent 4: Defender — remediation engineering (only if violation)
        artifacts_generated = []
        if has_violation:
            for op in ["MapViolationToImperative", "GenerateRemediationPlan",
                       "DraftPolicyUpdate", "CreateEngineeringTicket", "BuildExecutiveDashboard",
                       "RouteForHumanApproval"]:
                span_id = uuid.uuid4().hex[:16]
                if op == "CreateEngineeringTicket":
                    artifacts_generated.append({
                        "type": "Engineering Ticket",
                        "id": f"JIRA-{random.randint(10000,99999)}",
                        "target_audience": "Development",
                        "imperative_id": imperative_ids[0]["id"] if imperative_ids else None,
                    })
                elif op == "DraftPolicyUpdate":
                    artifacts_generated.append({
                        "type": "Updated Policy",
                        "id": f"POL-REV-{random.randint(1000,9999)}",
                        "target_audience": "HR / Legal",
                        "imperative_id": imperative_ids[0]["id"] if imperative_ids else None,
                    })
                elif op == "GenerateRemediationPlan":
                    artifacts_generated.append({
                        "type": "Remediation Instructions",
                        "id": f"REM-{random.randint(1000,9999)}",
                        "target_audience": "IT / Engineering",
                        "imperative_id": imperative_ids[0]["id"] if imperative_ids else None,
                    })
                spans.append({
                    "spanId": span_id,
                    "traceId": trace_id,
                    "parentSpanId": prev_span,
                    "agent": "Defender_Agent",
                    "operation": op,
                    "startTime": ts(minutes_ago=random.randint(0, 50), seconds_offset=random.randint(0, 30)),
                    "durationMs": rand_latency(50, 600),
                    "status": "ok",
                    "tags": {
                        "scenario.id": scenario_id,
                        "agent.role": "Remediation Engineer",
                        "imperative.linked": "true",
                        "traceability.enforced": "true",
                    },
                    "events": []
                })
                prev_span = span_id

        trace_status = "error" if has_violation else "ok"
        traces.append({
            "traceId": trace_id,
            "scenarioId": scenario_id,
            "scenarioName": source["name"],
            "regulation": source,
            "startedAt": started_at,
            "durationMs": sum(s["durationMs"] for s in spans),
            "status": trace_status,
            "spanCount": len(spans),
            "imperatives": imperative_ids,
            "violationDetected": has_violation,
            "artifactsGenerated": artifacts_generated,
            "spans": spans,
        })

    return traces


# ══════════════════════════════════════════════════════════════════════════════
# Stage 2: Compliance Metrics — Swarm-specific KPIs
# ══════════════════════════════════════════════════════════════════════════════

def generate_metrics(num_points=60):
    points = {k: [] for k in [
        "ingestion_throughput", "imperative_extraction_rate", "violation_detection_rate",
        "remediation_completion_rate", "boilerplate_reduction_pct", "compliance_posture_score",
        "adversarial_audit_pass_rate", "human_approval_latency_hr", "token_cost_saved_usd",
    ]}

    base = {
        "ingestion_throughput": 14,           # regulations ingested/hour
        "imperative_extraction_rate": 38,     # imperatives/hour
        "violation_detection_rate": 4.2,      # violations/hour
        "remediation_completion_rate": 92.3,  # % of violations remediated within SLA
        "boilerplate_reduction_pct": 73.5,    # PDF claim: 60-80%
        "compliance_posture_score": 87.4,     # overall org posture (0-100)
        "adversarial_audit_pass_rate": 44.8,  # % of audits that detect violations (adversarial stance)
        "human_approval_latency_hr": 2.4,     # avg hours from detection to human approval
        "token_cost_saved_usd": 127.80,       # $ saved per hour from boilerplate stripping
    }

    for i in range(num_points):
        t = ts(minutes_ago=(num_points - i))
        time_factor = math.sin(i / num_points * 2 * math.pi) * 5
        burst = 8 if 18 <= i <= 23 else 0  # regulatory publication burst

        for k, b in base.items():
            noise = random.gauss(0, b * 0.03)
            if k == "compliance_posture_score":
                v = round(max(45, min(100, b - i * 0.04 + time_factor * 0.2 - burst * 0.4 + noise)), 1)
            elif k == "remediation_completion_rate":
                v = round(max(50, min(100, b + time_factor * 0.5 - burst * 2 + noise)), 1)
            elif k == "boilerplate_reduction_pct":
                v = round(max(50, min(85, b + noise)), 1)
            elif k == "token_cost_saved_usd":
                v = round(max(0, b * (1 + burst * 0.15) + noise), 2)
            elif k == "human_approval_latency_hr":
                v = round(max(0.2, b + burst * 0.3 + noise), 2)
            elif "rate" in k and "pass" not in k and "completion" not in k:
                v = round(max(0.1, b + burst + noise), 2)
            elif k == "adversarial_audit_pass_rate":
                v = round(max(20, min(80, b + time_factor * 0.4 + noise)), 1)
            else:
                v = round(max(0.1, b + burst + noise), 2)
            points[k].append({"timestamp": t, "value": v})

    metric_meta = {
        "ingestion_throughput": ("regulations/hour", "Agent 1 — Federal Register polling throughput"),
        "imperative_extraction_rate": ("imperatives/hour", "Agent 2 — Imperative extraction throughput"),
        "violation_detection_rate": ("violations/hour", "Agent 3 — Violation detection rate"),
        "remediation_completion_rate": ("%", "Agent 4 — Remediation SLA completion"),
        "boilerplate_reduction_pct": ("%", "Agent 1 — Boilerplate token reduction (PDF §3.1)"),
        "compliance_posture_score": ("score", "Aggregate org compliance posture (0-100)"),
        "adversarial_audit_pass_rate": ("%", "Agent 3 — Adversarial audit violation detection rate"),
        "human_approval_latency_hr": ("hours", "Avg detection → human approval latency"),
        "token_cost_saved_usd": ("$/hour", "LLM token cost saved by boilerplate stripping"),
    }

    return {
        "system": {
            k: {"unit": u, "description": d, "data": points[k], "owner_agent": owner}
            for k, (u, d) in metric_meta.items()
            for owner in [(
                "Ingestion_Agent" if "ingestion" in k or "boilerplate" in k or "token" in k else
                "Legal_Analyst_Agent" if "imperative" in k else
                "Prosecutor_Agent" if "violation" in k or "adversarial" in k else
                "Defender_Agent" if "remediation" in k else
                "Orchestrator"
            )]
        },
        "summary": {
            "current_compliance_posture": points["compliance_posture_score"][-1]["value"],
            "current_violation_rate": points["violation_detection_rate"][-1]["value"],
            "current_remediation_rate": points["remediation_completion_rate"][-1]["value"],
            "current_boilerplate_reduction": points["boilerplate_reduction_pct"][-1]["value"],
            "current_token_savings": points["token_cost_saved_usd"][-1]["value"],
            "current_audit_pass_rate": points["adversarial_audit_pass_rate"][-1]["value"],
            "current_ingestion_rate": points["ingestion_throughput"][-1]["value"],
            "current_imperative_rate": points["imperative_extraction_rate"][-1]["value"],
            "current_approval_latency": points["human_approval_latency_hr"][-1]["value"],
            "peak_violation_rate": max(p["value"] for p in points["violation_detection_rate"]),
            "min_posture_score": min(p["value"] for p in points["compliance_posture_score"]),
            "avg_token_savings": round(sum(p["value"] for p in points["token_cost_saved_usd"]) / num_points, 2),
        }
    }


# ══════════════════════════════════════════════════════════════════════════════
# Stage 3: Audit Logs — Swarm Agent Activity
# ══════════════════════════════════════════════════════════════════════════════

LOG_LEVELS = ["DEBUG", "INFO", "INFO", "INFO", "INFO", "WARN", "WARN", "ERROR", "ERROR", "FATAL"]

LOG_MESSAGES = {
    "DEBUG": [
        "Agent 1 polled {source} (HTTP {status_code}, {elapsed_ms}ms) — no new publications",
        "Boilerplate stripper removed {tokens_removed} tokens from {regulation_id} ({reduction_pct}% reduction)",
        "Schema validation passed for {regulation_id}: effective_date={effective_date}, tier={tier}",
        "Event published to topic {topic} (partition {partition}, offset {offset})",
        "Agent 2 retrieved imperative {imperative_id} from cache (hit ratio {hit_pct}%)",
    ],
    "INFO": [
        "Agent 1 detected new regulation: {regulation_name} ({jurisdiction}) — triggering pipeline",
        "Agent 2 extracted imperative {imperative_id}: \"{imperative_text}\" (risk tier: {risk_tier})",
        "Agent 2 generated system query for {imperative_id}: {system_query}",
        "Agent 3 Phase I vector search completed — {policies_scanned} policies scanned, {conflicts_found} conflicts",
        "Agent 3 Phase II SQL execution completed — violation {violation_id} detected: {violation_desc}",
        "Agent 4 generated {artifact_type} for violation {violation_id} (imperative: {imperative_id})",
        "Agent 4 routed remediation package {package_id} for human approval (escalated to {escalated_to})",
        "Scenario {scenario_id} completed in {elapsed_ms}ms — pipeline status: {pipeline_status}",
        "Orchestrator: 4-agent pipeline completed for {regulation_id} — {imperatives_count} imperatives, {violations_count} violations",
        "Audit trail signed and archived: digest={audit_digest}, location={audit_location}",
    ],
    "WARN": [
        "Schema validation warning for {regulation_id}: optional field {field} missing — proceeding",
        "Agent 2 cross-reference resolution incomplete for {imperative_id} — flagged for review",
        "Agent 3 Phase I vector similarity below threshold ({similarity_score} < {threshold}) — manual review needed",
        "Agent 4 traceability check: artifact {artifact_id} cannot fully resolve to imperative — flagged",
        "High adversarial audit pass rate: {pass_rate}% (last hour) — review prosecutor prompt",
        "Human approval latency exceeded SLA: {latency_hours}h > {sla_hours}h for violation {violation_id}",
        "Imperative extraction confidence low: {confidence} for clause in {regulation_id}",
    ],
    "ERROR": [
        "Agent 1 schema validation FAILED for {regulation_id}: missing required field {field} — quarantined",
        "Agent 2 imperative formalization failed: ambiguous modal verb usage in clause {clause_id}",
        "Agent 3 Phase II SQL execution error: query failed against {db_target} — {error_msg}",
        "Agent 4 remediation artifact generation failed: cannot map violation {violation_id} to any imperative (REJECTED)",
        "Pipeline orchestration failed for scenario {scenario_id} — agent {agent_name} exceeded timeout",
        "Audit trail integrity check FAILED: hash mismatch for event {event_id} — tampering suspected",
        "Adversarial audit error: prosecutor could not execute query {system_query} — {error_msg}",
    ],
    "FATAL": [
        "CRITICAL: Pipeline integrity violation — Agent 4 produced artifact without imperative linkage (Section 9.2 violation)",
        "CRITICAL: Compliance lag detected — regulation {regulation_id} published {lag_hours}h ago, not yet processed",
        "CRITICAL: Audit trail corruption — append-only store mutation detected for scenario {scenario_id}",
    ],
}


def generate_logs(num_logs=200):
    logs = []
    for i in range(num_logs):
        level = rand_choice(LOG_LEVELS)
        agent = rand_choice(AGENTS)["name"]
        template = rand_choice(LOG_MESSAGES[level])
        timestamp = ts(minutes_ago=random.randint(0, 60), seconds_offset=random.randint(0, 59))

        regulation = rand_choice(REGULATORY_SOURCES)
        message = template.format(
            source=rand_choice(["Federal Register RSS", "EUR-Lex API", "HHS Update Feed", "SEC EDGAR"]),
            status_code=rand_choice([200, 200, 200, 304, 404, 500]),
            elapsed_ms=rand_latency(10, 2000),
            tokens_removed=random.randint(800, 28000),
            regulation_id=regulation["id"],
            regulation_name=regulation["name"],
            jurisdiction=regulation["jurisdiction"],
            reduction_pct=round(100 - (regulation["cleaned_tokens"]/regulation["raw_tokens"])*100, 1),
            effective_date=regulation["effective_date"],
            tier=regulation["tier"],
            topic=rand_choice(["regulatory.changes", "analysis.results", "gap.findings", "remediation.plans"]),
            partition=random.randint(0, 2),
            offset=random.randint(1000, 99999),
            hit_pct=random.randint(65, 95),
            imperative_id=f"IMP-{random.randint(1000,9999)}",
            imperative_text=rand_choice(IMPERATIVE_TEMPLATES[regulation["jurisdiction"]])["text"],
            risk_tier=rand_choice(["Critical", "High", "Moderate", "Low"]),
            system_query='scan_storage_config(attribute="encryption_standard", expected="AES-256")',
            policies_scanned=random.randint(50, 500),
            conflicts_found=random.randint(0, 5),
            violation_id=f"VIO-{uuid.uuid4().hex[:8].upper()}",
            violation_desc=rand_choice(["retention_period below required threshold", "MFA not enabled on admin role",
                                        "encryption standard non-compliant", "access review overdue by 45 days"]),
            artifact_type=rand_choice(["Remediation Instructions", "Updated Policy", "Engineering Ticket", "Executive Dashboard"]),
            package_id=f"PKG-{random.randint(10000,99999)}",
            escalated_to=rand_choice(["CCO", "CISO", "Legal Counsel", "Engineering Lead"]),
            scenario_id=f"SCN-{uuid.uuid4().hex[:8].upper()}",
            pipeline_status=rand_choice(["completed", "completed", "completed", "escalated", "failed"]),
            imperatives_count=random.randint(1, 8),
            violations_count=random.randint(0, 4),
            audit_digest=hashlib.sha256(uuid.uuid4().hex.encode()).hexdigest()[:16],
            audit_location=f"s3://compliance-audit/{regulation['jurisdiction']}/{ts(0)[:10]}/{uuid.uuid4().hex[:8]}.json",
            event_id=f"EVT-{uuid.uuid4().hex[:8].upper()}",
            field=rand_choice(["Effective_Date", "Penalty_Tier", "Jurisdiction", "Raw_Content_Cleaned"]),
            clause_id=f"CLS-{random.randint(100,999)}",
            similarity_score=round(random.uniform(0.4, 0.85), 3),
            threshold=0.75,
            artifact_id=f"ART-{uuid.uuid4().hex[:8].upper()}",
            pass_rate=round(random.uniform(55, 78), 1),
            latency_hours=round(random.uniform(2.5, 8.5), 1),
            sla_hours=2.0,
            confidence=round(random.uniform(0.55, 0.85), 2),
            db_target=rand_choice(["postgres-primary", "iam-policy-store", "config-db"]),
            error_msg=rand_choice(["connection timeout", "permission denied", "table not found", "query syntax error"]),
            agent_name=agent,
            lag_hours=round(random.uniform(1.5, 12), 1),
        )

        fields = {
            "agent": agent,
            "agent_role": next((a["role"] for a in AGENTS if a["name"] == agent), "Unknown"),
            "traceId": uuid.uuid4().hex[:16],
            "hostname": f"{agent.lower()}-{random.randint(1,3)}.{rand_choice(['us-east','eu-west','ap-south'])}.compliance.internal",
            "version": f"v{random.randint(1,3)}.{random.randint(0,8)}.{random.randint(0,40)}",
            "regulation_id": regulation["id"],
            "jurisdiction": regulation["jurisdiction"],
        }
        if level in ("WARN", "ERROR", "FATAL"):
            fields["alerting"] = True

        logs.append({
            "timestamp": timestamp,
            "level": level,
            "message": message,
            "agent": agent,
            "fields": fields,
        })

    logs.sort(key=lambda x: x["timestamp"], reverse=True)
    return logs


# ══════════════════════════════════════════════════════════════════════════════
# Stage 4: Compliance Alerting — Swarm-Specific Rules
# ══════════════════════════════════════════════════════════════════════════════

def generate_alert_rules():
    return [
        {"id": "ALR-001", "name": "ComplianceLagDetected",
         "description": "Regulation published > 1 hour ago but not yet processed by Agent 1 (PDF §8.1)",
         "condition": "ingestion_lag_hours > 1 for 5m", "severity": "critical",
         "agent": "Ingestion_Agent", "channel": "#compliance-critical",
         "runbook": "https://wiki/runbooks/compliance-lag"},
        {"id": "ALR-002", "name": "ImperativeExtractionFailure",
         "description": "Agent 2 failed to formalize imperative from normative clause",
         "condition": "extraction_failures > 0 for 10m", "severity": "high",
         "agent": "Legal_Analyst_Agent", "channel": "#compliance-high",
         "runbook": "https://wiki/runbooks/imperative-extraction"},
        {"id": "ALR-003", "name": "AdversarialAuditViolationSurge",
         "description": "Agent 3 detecting > 10 violations/hour — review prosecutor prompt tuning",
         "condition": "violation_detection_rate > 10 for 15m", "severity": "high",
         "agent": "Prosecutor_Agent", "channel": "#compliance-high",
         "runbook": "https://wiki/runbooks/adversarial-surge"},
        {"id": "ALR-004", "name": "TraceabilityViolation",
         "description": "Agent 4 produced artifact without imperative linkage (PDF §9.2 violation)",
         "condition": "unlinked_artifacts > 0", "severity": "critical",
         "agent": "Defender_Agent", "channel": "#compliance-critical",
         "runbook": "https://wiki/runbooks/traceability-violation"},
        {"id": "ALR-005", "name": "AuditTrailTampering",
         "description": "Append-only audit store mutation detected — integrity compromised",
         "condition": "audit_hash_mismatches > 0", "severity": "critical",
         "agent": "Orchestrator", "channel": "#incidents-critical",
         "runbook": "https://wiki/runbooks/audit-tampering"},
        {"id": "ALR-006", "name": "HumanApprovalLatencyExceeded",
         "description": "CCO approval latency exceeded 2-hour SLA (PDF §7.1 Step 6)",
         "condition": "human_approval_latency_hr > 2 for 1h", "severity": "medium",
         "agent": "Defender_Agent", "channel": "#compliance-medium",
         "runbook": "https://wiki/runbooks/approval-latency"},
        {"id": "ALR-007", "name": "CompliancePostureDrop",
         "description": "Aggregate compliance posture dropped below 75% — CCO notification",
         "condition": "compliance_posture_score < 75 for 15m", "severity": "high",
         "agent": "Orchestrator", "channel": "#compliance-high",
         "runbook": "https://wiki/runbooks/posture-drop"},
        {"id": "ALR-008", "name": "BoilerplateReductionBelowTarget",
         "description": "Agent 1 boilerplate reduction below 60% target (PDF §3.1)",
         "condition": "boilerplate_reduction_pct < 60 for 30m", "severity": "low",
         "agent": "Ingestion_Agent", "channel": "#compliance-low",
         "runbook": "https://wiki/runbooks/boilerplate"},
        {"id": "ALR-009", "name": "SchemaValidationFailures",
         "description": "Agent 1 quarantining documents due to schema failures (PDF §3.2)",
         "condition": "schema_quarantines > 3 for 10m", "severity": "medium",
         "agent": "Ingestion_Agent", "channel": "#compliance-medium",
         "runbook": "https://wiki/runbooks/schema-failures"},
        {"id": "ALR-010", "name": "RegulatoryDeadlineApproaching",
         "description": "Regulation effective date within 7 days — remediation must complete",
         "condition": "days_until_effective < 7", "severity": "critical",
         "agent": "Orchestrator", "channel": "#compliance-critical",
         "runbook": "https://wiki/runbooks/regulatory-deadline"},
    ]


def generate_triggered_alerts(num_alerts=25):
    rules = generate_alert_rules()
    alerts = []
    for i in range(num_alerts):
        rule = rand_choice(rules)
        state = rand_choice(["firing", "firing", "firing", "resolved", "resolved", "acknowledged"])
        fired_at = ts(minutes_ago=random.randint(0, 55))

        # Parse threshold
        cond = rule["condition"]
        threshold = 0
        try:
            if ">" in cond:
                threshold = float(cond.split(">")[1].split()[0])
            elif "<" in cond:
                threshold = float(cond.split("<")[1].split()[0])
        except (ValueError, IndexError):
            pass

        alert = {
            "alertId": f"CALERT-{uuid.uuid4().hex[:8].upper()}",
            "ruleId": rule["id"],
            "ruleName": rule["name"],
            "description": rule["description"],
            "severity": rule["severity"],
            "state": state,
            "agent": rule["agent"],
            "firedAt": fired_at,
            "channel": rule["channel"],
            "runbook": rule["runbook"],
            "labels": {
                "env": rand_choice(["production", "production", "staging"]),
                "jurisdiction": rand_choice([r["jurisdiction"] for r in REGULATORY_SOURCES]),
                "team": rand_choice(["compliance", "security", "governance", "legal", "engineering"]),
            },
            "annotations": {
                "summary": f"{rule['name']} triggered on {rule['agent']}",
                "dashboard": f"https://compliance-swarm.internal/d/{rule['id']}",
                "spec_reference": "PDF §3.1 / §7.1 / §9.2",
            },
            "metrics": {
                "current_value": round(random.uniform(0.5, 2.5) * threshold, 2) if threshold else None,
                "threshold": threshold if threshold else None,
            },
        }
        if state in ("resolved", "acknowledged"):
            alert["resolvedAt"] = ts(minutes_ago=random.randint(0, 50))
            alert["durationMinutes"] = random.randint(2, 30)

        alerts.append(alert)

    alerts.sort(key=lambda x: x["firedAt"], reverse=True)
    return alerts


# ══════════════════════════════════════════════════════════════════════════════
# Stage 5: Agent Topology & Imperative Registry (NEW — per SKILLS.md matrix)
# ══════════════════════════════════════════════════════════════════════════════

def generate_agent_topology():
    """Maps to SKILLS.md §1-§4 agent capability matrix."""
    return [
        {
            "name": "Ingestion_Agent",
            "role": "Deterministic Parser",
            "spec_section": "PDF §3 — Agent 1",
            "state": rand_choice(["processing", "idle", "processing", "completed"]),
            "skills": [
                {"name": "Source Polling & Web Scraping", "level": "L2", "artifacts": "Raw regulatory text corpus"},
                {"name": "Boilerplate Stripping", "level": "L3", "artifacts": "Cleaned regulatory text"},
                {"name": "JSON Schema Enforcement", "level": "L3", "artifacts": "Validated JSON envelope"},
                {"name": "Priority Scoring", "level": "L2", "artifacts": "Ranked ingestion queue"},
            ],
            "throughput_per_hour": random.randint(12, 18),
            "success_rate_pct": round(random.uniform(97.5, 99.8), 1),
            "schema_compliance_pct": 100.0,
        },
        {
            "name": "Legal_Analyst_Agent",
            "role": "Rules Engine",
            "spec_section": "PDF §4 — Agent 2",
            "state": rand_choice(["processing", "processing", "completed", "escalated"]),
            "skills": [
                {"name": "Statutory Deconstruction", "level": "L2", "artifacts": "Clause tree (JSON)"},
                {"name": "Obligation Extraction", "level": "L2", "artifacts": "Normalized obligation records"},
                {"name": "Logic Formalization", "level": "L3", "artifacts": "Machine-readable rule set"},
                {"name": "Cross-Reference Resolution", "level": "L3", "artifacts": "Dependency graph"},
                {"name": "Risk Categorization", "level": "L2", "artifacts": "Risk-tagged clause index"},
            ],
            "throughput_per_hour": random.randint(32, 45),
            "success_rate_pct": round(random.uniform(94.0, 98.5), 1),
            "schema_compliance_pct": 100.0,
        },
        {
            "name": "Prosecutor_Agent",
            "role": "Adversarial Evaluator",
            "spec_section": "PDF §5 — Agent 3",
            "state": rand_choice(["processing", "processing", "completed"]),
            "skills": [
                {"name": "Phase I Vector Search", "level": "L2", "artifacts": "Policy conflict report"},
                {"name": "Phase II SQL Execution", "level": "L2", "artifacts": "Technical violation report"},
                {"name": "Violation Detection", "level": "L3", "artifacts": "Violation ticket (JSON)"},
                {"name": "Temporal Compliance Tracking", "level": "L2", "artifacts": "Deadline dashboard feed"},
                {"name": "Audit Trail Generation", "level": "L3", "artifacts": "Signed audit log"},
            ],
            "throughput_per_hour": random.randint(3, 6),
            "success_rate_pct": round(random.uniform(91.0, 96.5), 1),
            "violation_detection_rate_pct": round(random.uniform(42, 58), 1),
        },
        {
            "name": "Defender_Agent",
            "role": "Remediation Engineer",
            "spec_section": "PDF §6 — Agent 4",
            "state": rand_choice(["processing", "completed", "escalated"]),
            "skills": [
                {"name": "Remediation Planning", "level": "L2", "artifacts": "Remediation plan (JSON + summary)"},
                {"name": "Policy Generation", "level": "L2", "artifacts": "Policy document (DOCX/PDF)"},
                {"name": "Human-in-the-Loop Routing", "level": "L2", "artifacts": "Escalation ticket"},
                {"name": "Engineering Ticket Generation", "level": "L3", "artifacts": "Jira/GitHub ticket with criteria"},
                {"name": "Exception & Waiver Management", "level": "L3", "artifacts": "Exception record"},
            ],
            "throughput_per_hour": random.randint(2, 5),
            "success_rate_pct": round(random.uniform(95.5, 99.0), 1),
            "traceability_enforced_pct": 100.0,
        },
    ]


def generate_imperative_registry(traces):
    """Aggregate imperatives from all traces — PDF §4 mandates unique IDs."""
    registry = []
    for t in traces:
        for imp in t["imperatives"]:
            registry.append(imp)
    return registry


def generate_violations(traces):
    """Extract violations from traces where Prosecutor found non-compliance."""
    violations = []
    for t in traces:
        if not t["violationDetected"]:
            continue
        for imp in t["imperatives"][:1]:  # 1 violation per violating scenario
            violations.append({
                "violation_id": f"VIO-{uuid.uuid4().hex[:8].upper()}",
                "scenario_id": t["scenarioId"],
                "trace_id": t["traceId"],
                "regulation_id": t["regulation"]["id"],
                "regulation_name": t["regulation"]["name"],
                "jurisdiction": t["regulation"]["jurisdiction"],
                "imperative_id": imp["id"],
                "imperative_text": imp["text"],
                "imperative_query": imp["query"],
                "risk_tier": imp["risk_tier"],
                "detected_at": t["startedAt"],
                "audit_phase": rand_choice(["I", "II"]),
                "phase_i_conflict": rand_choice([True, False]),
                "phase_ii_breach": True,
                "penalty_exposure_usd": round(random.uniform(50000, 4500000), 2),
                "remediation_status": rand_choice(["pending", "in_progress", "completed", "completed"]),
                "artifacts": t["artifactsGenerated"],
                "human_approval": rand_choice(["pending", "approved", "approved", "rejected"]),
            })
    return violations


# ══════════════════════════════════════════════════════════════════════════════
# Stage 6: Orchestration Layer (SKILLS.md §5)
#   - Compliance State Machine (6 states, valid transitions)
#   - Event Bus (topics, partitions, consumer groups, lag)
#   - Conflict Resolution (overlapping regulations)
#   - Immutable Audit Chain (append-only hash chain)
# ══════════════════════════════════════════════════════════════════════════════

# Compliance state machine (matches state_machine_conflict_engine.py reference)
COMPLIANCE_STATES = ["compliant", "at_risk", "non_compliant", "under_remediation", "escalated", "audit_pending"]

VALID_TRANSITIONS = {
    "compliant":          ["at_risk", "audit_pending"],
    "at_risk":            ["compliant", "non_compliant", "under_remediation"],
    "non_compliant":      ["under_remediation", "escalated"],
    "under_remediation":  ["compliant", "at_risk", "non_compliant"],
    "escalated":          ["under_remediation", "non_compliant"],
    "audit_pending":      ["compliant", "at_risk", "non_compliant"],
}

STATE_SCORE_DELTA = {
    "compliant": 25, "at_risk": -15, "non_compliant": -30,
    "under_remediation": -5, "escalated": -25, "audit_pending": -5,
}

TRIGGERS = [
    "regulatory_change_detected", "violation_confirmed", "remediation_started",
    "remediation_completed", "human_approval_granted", "human_approval_denied",
    "audit_initiated", "audit_completed_pass", "audit_completed_fail",
    "risk_threshold_exceeded", "deadline_approaching",
]

ENTITY_TYPES = [
    ("data_store", "PHI Database", "HIPAA"),
    ("api_endpoint", "Patient Access API", "HIPAA"),
    ("iam_policy", "Admin Role IAM", "PCI-DSS"),
    ("data_store", "Customer PII Store", "GDPR"),
    ("ai_system", "Loan Decision Model", "EU-AI-ACT"),
    ("infrastructure", "CDE Network Segment", "PCI-DSS"),
    ("application", "Trading Platform", "SEC"),
    ("data_store", "Audit Log Store", "ISO27001"),
]


def generate_state_machine(num_transitions=40):
    """SKILLS.md §5: State Management — compliance state machine."""
    entities = []
    for i, (etype, edesc, jurisdiction) in enumerate(ENTITY_TYPES):
        eid = f"ENT-{etype.upper()[:3]}-{i+1:03d}"
        entities.append({
            "id": eid,
            "type": etype,
            "description": edesc,
            "jurisdiction": jurisdiction,
            "current_state": "compliant",
            "registered_at": ts(minutes_ago=240 - i * 10),
            "compliance_score": 100.0,
            "risk_factors": [],
        })

    transitions = []
    state_histories = {e["id"]: [e["current_state"]] for e in entities}
    metrics = {"transitions": 0, "escalations": 0, "resolutions": 0, "invalid_attempts": 0}

    for i in range(num_transitions):
        entity = rand_choice(entities)
        from_state = entity["current_state"]
        valid_targets = VALID_TRANSITIONS.get(from_state, [])
        if not valid_targets:
            continue
        to_state = rand_choice(valid_targets)
        trigger = rand_choice(TRIGGERS)
        transition_id = f"TRN-{uuid.uuid4().hex[:8].upper()}"
        approved_by = None
        if to_state == "under_remediation" or to_state == "escalated":
            approved_by = rand_choice(["cco@company.com", "ciso@company.com", "legal-counsel@company.com"])

        transition = {
            "transition_id": transition_id,
            "entity_id": entity["id"],
            "entity_type": entity["type"],
            "entity_description": entity["description"],
            "from_state": from_state,
            "to_state": to_state,
            "trigger": trigger,
            "evidence": [
                f"Triggered by: {trigger}",
                f"Trace ID: {uuid.uuid4().hex[:16]}",
                f"Regulation: {entity['jurisdiction']}",
            ],
            "timestamp": ts(minutes_ago=random.randint(0, 200)),
            "trace_id": uuid.uuid4().hex[:16],
            "approved_by": approved_by,
            "compliance_score_before": entity["compliance_score"],
            "compliance_score_after": round(max(0, min(100, entity["compliance_score"] + STATE_SCORE_DELTA[to_state])), 1),
        }
        transitions.append(transition)
        entity["current_state"] = to_state
        entity["compliance_score"] = transition["compliance_score_after"]
        state_histories[entity["id"]].append(to_state)
        metrics["transitions"] += 1
        if to_state == "escalated":
            metrics["escalations"] += 1
        if to_state == "compliant" and from_state != "audit_pending":
            metrics["resolutions"] += 1

    transitions.sort(key=lambda t: t["timestamp"], reverse=True)
    return {
        "entities": entities,
        "total_transitions": len(transitions),
        "transitions": transitions[:30],  # Top 30 most recent
        "state_histories": state_histories,
        "valid_transitions": VALID_TRANSITIONS,
        "metrics": metrics,
        "state_distribution": {
            state: len([e for e in entities if e["current_state"] == state])
            for state in COMPLIANCE_STATES
        },
    }


# Event bus topics (matches agent_swarm_core.py reference)
EVENT_BUS_TOPICS = [
    {"name": "regulatory.changes", "partitions": 3, "consumer_group": "legal_analysts",
     "description": "Raw regulation events from Agent 1"},
    {"name": "analysis.results", "partitions": 3, "consumer_group": "prosecutors",
     "description": "Imperative extraction results from Agent 2"},
    {"name": "gap.findings", "partitions": 3, "consumer_group": "defenders",
     "description": "Violation reports from Agent 3"},
    {"name": "remediation.plans", "partitions": 3, "consumer_group": "auditors",
     "description": "Remediation artifacts from Agent 4"},
    {"name": "governance.audit", "partitions": 5, "consumer_group": "auditors",
     "description": "Audit trail events (immutable)"},
    {"name": "escalation.requests", "partitions": 2, "consumer_group": "compliance_leads",
     "description": "Human-in-loop escalation requests"},
    {"name": "state.transitions", "partitions": 4, "consumer_group": "orchestrator",
     "description": "Compliance state machine transitions"},
    {"name": "conflict.alerts", "partitions": 2, "consumer_group": "legal_analysts",
     "description": "Regulatory conflict notifications"},
]


def generate_event_bus():
    """SKILLS.md §5: Event-Driven Dispatch."""
    topics = []
    for topic_def in EVENT_BUS_TOPICS:
        partitions = []
        for p in range(topic_def["partitions"]):
            messages = random.randint(120, 950)
            consumed = messages - random.randint(0, 35)
            partitions.append({
                "partition": p,
                "messages_total": messages,
                "messages_consumed": consumed,
                "lag": messages - consumed,
                "offset_latest": messages + 1000,
                "earliest_offset": 1000,
                "size_mb": round(messages * random.uniform(0.8, 2.4), 1),
            })
        topics.append({
            "name": topic_def["name"],
            "description": topic_def["description"],
            "consumer_group": topic_def["consumer_group"],
            "partitions": partitions,
            "total_messages": sum(p["messages_total"] for p in partitions),
            "total_lag": sum(p["lag"] for p in partitions),
            "total_size_mb": round(sum(p["size_mb"] for p in partitions), 1),
            "avg_throughput_per_min": round(random.uniform(50, 320), 1),
            "consumer_group_lag": random.randint(0, 35),
        })

    return {
        "topics": topics,
        "total_topics": len(topics),
        "total_messages": sum(t["total_messages"] for t in topics),
        "total_lag": sum(t["total_lag"] for t in topics),
        "total_size_mb": round(sum(t["total_size_mb"] for t in topics), 1),
        "metrics": {
            "published_total": sum(t["total_messages"] for t in topics),
            "consumed_total": sum(t["total_messages"] - t["total_lag"] for t in topics),
            "failed_total": random.randint(2, 18),
            "avg_latency_ms": round(random.uniform(8, 42), 1),
        },
    }


# Conflict resolution (matches state_machine_conflict_engine.py reference)
CONFLICT_TYPES = [
    "penalty_discrepancy",    # Different penalties for same violation
    "temporal_conflict",      # Different deadlines
    "jurisdictional_overlap", # Multiple jurisdictions claim authority
    "requirement_contradiction",  # Direct contradiction
    "scope_overlap",          # Regulations apply to same scope
]

CONFLICT_RESOLUTION_STRATEGIES = [
    ("apply_strictest", "Apply the most stringent requirement"),
    ("jurisdictional_split", "Apply different rules by geography"),
    ("regulation_a_takes_precedence", "Newer regulation supersedes older"),
    ("merge_requirements", "Combine all requirements"),
    ("escalate_to_legal", "Escalate to human legal review"),
    ("temporal_supersede", "Newer temporal rule wins"),
]


def generate_conflicts(num_conflicts=15):
    """SKILLS.md §5: Conflict Resolution — between overlapping regulations."""
    conflicts = []
    for i in range(num_conflicts):
        reg_a = rand_choice(REGULATORY_SOURCES)
        reg_b = rand_choice([r for r in REGULATORY_SOURCES if r["id"] != reg_a["id"]])
        conflict_type = rand_choice(CONFLICT_TYPES)
        strategy, strategy_desc = rand_choice(CONFLICT_RESOLUTION_STRATEGIES)
        is_resolved = random.random() < 0.7  # 70% resolved
        severity = rand_choice(["critical", "high", "high", "medium", "medium", "low"])

        clause_pairs = [
            ("30-day retention", "15-day retention"),
            ("AES-256 encryption", "AES-128 encryption acceptable"),
            ("Annual access review", "Quarterly access review"),
            ("MFA required for admin", "MFA optional for trusted networks"),
            ("365-day audit log", "7-year audit log"),
            ("Cross-border transfer allowed", "Cross-border transfer prohibited"),
            ("Human oversight mandatory", "Automated oversight acceptable"),
        ]
        clause_a, clause_b = rand_choice(clause_pairs)

        conflict = {
            "conflict_id": f"CNF-{uuid.uuid4().hex[:8].upper()}",
            "regulation_a": reg_a["name"],
            "regulation_b": reg_b["name"],
            "regulation_a_id": reg_a["id"],
            "regulation_b_id": reg_b["id"],
            "clause_a": clause_a,
            "clause_b": clause_b,
            "conflict_type": conflict_type,
            "severity": severity,
            "description": _build_conflict_description(conflict_type, reg_a, reg_b, clause_a, clause_b),
            "status": "resolved" if is_resolved else "pending",
            "resolution_strategy": strategy if is_resolved else None,
            "resolution_description": strategy_desc if is_resolved else None,
            "resolution": f"Resolved using strategy: {strategy}" if is_resolved else None,
            "resolved_at": ts(minutes_ago=random.randint(0, 100)) if is_resolved else None,
            "detected_at": ts(minutes_ago=random.randint(0, 200)),
            "winner": "regulation_a" if is_resolved and strategy in ("regulation_a_takes_precedence", "apply_strictest") and reg_a["tier"] == "Critical"
                     else "regulation_b" if is_resolved and strategy in ("regulation_a_takes_precedence", "apply_strictest") and reg_b["tier"] == "Critical"
                     else ("merged" if is_resolved and strategy == "merge_requirements"
                           else "split" if is_resolved and strategy == "jurisdictional_split"
                           else "legal" if is_resolved and strategy == "escalate_to_legal"
                           else None),
        }
        conflicts.append(conflict)

    conflicts.sort(key=lambda c: c["detected_at"], reverse=True)
    return {
        "total_detected": len(conflicts),
        "total_resolved": len([c for c in conflicts if c["status"] == "resolved"]),
        "total_pending": len([c for c in conflicts if c["status"] == "pending"]),
        "records": conflicts,
        "conflict_types": list(set(c["conflict_type"] for c in conflicts)),
        "resolution_strategies_used": list(set(c["resolution_strategy"] for c in conflicts if c["resolution_strategy"])),
        "by_severity": {
            sev: len([c for c in conflicts if c["severity"] == sev])
            for sev in ["critical", "high", "medium", "low"]
        },
    }


def _build_conflict_description(conflict_type, reg_a, reg_b, clause_a, clause_b):
    templates = {
        "penalty_discrepancy": f"{reg_a['name']} prescribes penalty for '{clause_a}' while {reg_b['name']} prescribes different penalty for '{clause_b}'",
        "temporal_conflict": f"{reg_a['name']} requires '{clause_a}' but {reg_b['name']} requires '{clause_b}' — incompatible timing",
        "jurisdictional_overlap": f"{reg_a['name']} ({reg_a['jurisdiction']}) and {reg_b['name']} ({reg_b['jurisdiction']}) both claim authority over '{clause_a}' vs '{clause_b}'",
        "requirement_contradiction": f"Direct contradiction: '{clause_a}' (from {reg_a['name']}) vs '{clause_b}' (from {reg_b['name']})",
        "scope_overlap": f"Both {reg_a['name']} and {reg_b['name']} apply to same scope — '{clause_a}' vs '{clause_b}'",
    }
    return templates.get(conflict_type, "Conflict detected between regulations")


def generate_audit_chain(num_entries=30):
    """SKILLS.md §5: Immutability & Versioning — append-only audit chain with hash linking."""
    entries = []
    prev_hash = "0" * 64  # Genesis block
    
    for i in range(num_entries):
        event_type = rand_choice([
            "state_transition", "agent_output_published", "violation_detected",
            "remediation_artifact_generated", "human_approval_granted", "human_approval_denied",
            "conflict_detected", "conflict_resolved", "schema_validation_passed",
            "audit_trail_signed", "evidence_collected",
        ])
        agent = rand_choice(AGENTS)["name"]
        entity_id = f"ENT-{rand_choice(['PHI','PII','API','IAM','AI','INF'])}-{random.randint(1,8):03d}"
        timestamp = ts(minutes_ago=(num_entries - i))
        
        payload = {
            "event_type": event_type,
            "agent": agent,
            "entity_id": entity_id,
            "trace_id": uuid.uuid4().hex[:16],
            "scenario_id": f"SCN-{uuid.uuid4().hex[:8].upper()}" if random.random() < 0.5 else None,
            "imperative_id": f"IMP-{random.randint(1000,9999)}" if random.random() < 0.4 else None,
            "details": f"{event_type.replace('_', ' ')} on {entity_id}",
        }
        payload_str = json.dumps(payload, sort_keys=True)
        current_hash = hashlib.sha256((prev_hash + payload_str).encode()).hexdigest()
        verification_status = "verified" if random.random() > 0.05 else "mismatch"  # 5% tampering simulation
        
        entries.append({
            "entry_id": f"AUD-{i+1:04d}",
            "sequence": i + 1,
            "timestamp": timestamp,
            "event_type": event_type,
            "agent": agent,
            "entity_id": entity_id,
            "payload": payload,
            "previous_hash": prev_hash[:32] + "..." if len(prev_hash) > 32 else prev_hash,
            "current_hash": current_hash[:32] + "..." if len(current_hash) > 32 else current_hash,
            "full_previous_hash": prev_hash,
            "full_current_hash": current_hash,
            "verification_status": verification_status,
            "storage_location": f"s3://compliance-audit-chain/{ts(0)[:10]}/{i+1:04d}.json",
            "signed_by": "compliance-audit-kms" if verification_status == "verified" else None,
            "signature_algorithm": "SHA-256 + RSA-4096" if verification_status == "verified" else None,
        })
        prev_hash = current_hash
    
    verified_count = len([e for e in entries if e["verification_status"] == "verified"])
    mismatch_count = len(entries) - verified_count
    return {
        "entries": entries,
        "total_entries": len(entries),
        "verified_entries": verified_count,
        "mismatch_entries": mismatch_count,
        "chain_integrity": "intact" if mismatch_count == 0 else "compromised",
        "genesis_hash": "0" * 64,
        "latest_hash": entries[-1]["full_current_hash"] if entries else None,
        "storage_backend": "S3 + DynamoDB (append-only, versioned)",
        "retention_policy": "7 years (regulatory requirement)",
        "signature_algorithm": "SHA-256 + RSA-4096 (HSM-backed)",
    }


# ══════════════════════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════════════════════

def main():
    print("=" * 70)
    print("  Autonomous Regulatory Compliance Agent Swarm — Observability")
    print("  Implements PDF §3-§7 + SKILLS.md §1-§5")
    print("=" * 70)

    print("\n[Stage 1] Generating 4-agent swarm traces (20 push-update scenarios)...")
    traces = generate_swarm_traces(num_scenarios=20)
    total_spans = sum(t["spanCount"] for t in traces)
    violations_count = sum(1 for t in traces if t["violationDetected"])
    print(f"       Generated {len(traces)} scenarios, {total_spans} spans")
    print(f"       Violations detected: {violations_count}/{len(traces)} (adversarial stance)")

    print("[Stage 2] Generating swarm-specific compliance metrics...")
    metrics = generate_metrics(num_points=60)
    print(f"       Generated {len(metrics['system'])} metric series")

    print("[Stage 3] Generating agent activity logs...")
    logs = generate_logs(num_logs=200)
    level_counts = {}
    for log in logs:
        level_counts[log["level"]] = level_counts.get(log["level"], 0) + 1
    print(f"       Generated {len(logs)} log entries")
    for level, count in sorted(level_counts.items()):
        print(f"         {level}: {count}")

    print("[Stage 4] Generating compliance alert rules & triggered alerts...")
    alert_rules = generate_alert_rules()
    triggered_alerts = generate_triggered_alerts(num_alerts=25)
    print(f"       Defined {len(alert_rules)} alert rules (mapped to PDF §3, §7, §9)")
    print(f"       Generated {len(triggered_alerts)} triggered alerts")

    print("[Stage 5] Generating agent topology & imperative registry...")
    agent_topology = generate_agent_topology()
    imperative_registry = generate_imperative_registry(traces)
    violations = generate_violations(traces)
    print(f"       Topology: {len(agent_topology)} agents (Ingestion→Analyst→Prosecutor→Defender)")
    print(f"       Imperative registry: {len(imperative_registry)} imperatives with unique IDs")
    print(f"       Violations: {len(violations)} (with full traceability chain)")

    # Stage 6: Orchestration Layer (SKILLS.md §5 + PDF §7)
    print("[Stage 6] Generating orchestration layer (state machine, event bus, conflicts, audit chain)...")
    state_machine = generate_state_machine(num_transitions=40)
    event_bus = generate_event_bus()
    conflicts = generate_conflicts(num_conflicts=15)
    audit_chain = generate_audit_chain(num_entries=30)
    print(f"       State machine: {len(state_machine['entities'])} entities, {state_machine['total_transitions']} transitions")
    print(f"       Event bus: {event_bus['total_topics']} topics, {event_bus['total_messages']} messages")
    print(f"       Conflicts: {conflicts['total_detected']} detected, {conflicts['total_resolved']} resolved")
    print(f"       Audit chain: {audit_chain['total_entries']} entries, integrity={audit_chain['chain_integrity']}")

    output = {
        "generatedAt": NOW.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z",
        "generator": "autonomous-compliance-agent-swarm",
        "version": "4.0.0",
        "project": "Autonomous Regulatory Compliance Agent Swarm",
        "specification": "Technical Specification v1.0 (July 2026)",
        "architecture": {
            "model": "Push-based 4-agent swarm (PDF §2)",
            "agents": ["Ingestion_Agent", "Legal_Analyst_Agent", "Prosecutor_Agent", "Defender_Agent"],
            "pipeline": "Ingestion → Imperative Extraction → Adversarial Audit → Remediation Engineering → Human-in-Loop",
            "guardrails": [
                "PDF §9.1 Source Fidelity — no external data, context only",
                "PDF §9.2 Traceable Remediation — all artifacts must map to imperative ID",
                "PDF §9.3 Deterministic Formatting — strict JSON schema between agents",
            ],
        },
        "data": {
            "traces": traces,
            "metrics": metrics,
            "logs": logs,
            "alerting": {"rules": alert_rules, "triggeredAlerts": triggered_alerts},
            "agentTopology": agent_topology,
            "imperativeRegistry": imperative_registry,
            "violations": violations,
            "stateMachine": state_machine,
            "eventBus": event_bus,
            "conflicts": conflicts,
            "auditChain": audit_chain,
        },
        "statistics": {
            "totalScenarios": len(traces),
            "totalSpans": total_spans,
            "violationScenarios": violations_count,
            "totalImperatives": len(imperative_registry),
            "totalViolations": len(violations),
            "totalLogs": len(logs),
            "errorLogs": level_counts.get("ERROR", 0) + level_counts.get("FATAL", 0),
            "totalAlertRules": len(alert_rules),
            "firingAlerts": len([a for a in triggered_alerts if a["state"] == "firing"]),
            "resolvedAlerts": len([a for a in triggered_alerts if a["state"] == "resolved"]),
            "frameworks": len(set(r["jurisdiction"] for r in REGULATORY_SOURCES)),
            "regulationsMonitored": len(REGULATORY_SOURCES),
            "agents": len(agent_topology),
            "stateEntities": len(state_machine["entities"]),
            "stateTransitions": state_machine["total_transitions"],
            "eventBusTopics": event_bus["total_topics"],
            "eventBusMessages": event_bus["total_messages"],
            "conflictsDetected": conflicts["total_detected"],
            "conflictsResolved": conflicts["total_resolved"],
            "auditChainEntries": audit_chain["total_entries"],
            "auditChainIntact": audit_chain["chain_integrity"] == "intact",
        }
    }

    with open(OUTPUT_PATH, "w") as f:
        json.dump(output, f, indent=2)

    print(f"\n{'=' * 70}")
    print(f"  Output: {OUTPUT_PATH}")
    print(f"  Size: {len(json.dumps(output)):,} bytes")
    print(f"{'=' * 70}")
    return output


if __name__ == "__main__":
    main()
