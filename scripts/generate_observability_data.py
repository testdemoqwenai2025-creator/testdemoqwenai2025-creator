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

    output = {
        "generatedAt": NOW.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z",
        "generator": "autonomous-compliance-agent-swarm",
        "version": "3.0.0",
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
