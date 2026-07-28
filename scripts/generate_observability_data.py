#!/usr/bin/env python3
"""
Autonomous Compliance – Observability Infrastructure Data Generator
====================================================================
Generates domain-specific simulated observability data for an Autonomous
Compliance platform covering:
  - Distributed Tracing  (compliance workflow spans, policy evaluations)
  - Compliance Metrics   (policy checks, violation rates, risk scores,
                         audit coverage, framework posture)
  - Structured Logs      (audit events, policy violations, governance)
  - Alerting             (compliance drift, regulatory deadlines, breaches)

Output: /home/z/my-project/download/observability-data.json
"""

import json
import random
import uuid
import math
from datetime import datetime, timedelta, timezone

# ── Configuration ────────────────────────────────────────────────────────────
SEED = 42
OUTPUT_PATH = "/home/z/my-project/download/observability-data.json"
NOW = datetime.now(timezone.utc)
random.seed(SEED)

# ── Helper Utilities ──────────────────────────────────────────────────────────

def ts(minutes_ago=0, seconds_offset=0):
    dt = NOW - timedelta(minutes=minutes_ago, seconds=seconds_offset)
    return dt.strftime("%Y-%m-%dT%H:%M:%S.") + f"{dt.microsecond // 1000:03d}Z"

def rand_latency(lo=5, hi=500):
    return max(lo, min(hi, int(random.lognormvariate(math.log(50), 1.0))))

def rand_choice(options, weights=None):
    return random.choices(options, weights=weights or [1]*len(options), k=1)[0]

# ══════════════════════════════════════════════════════════════════════════════
# 1. DISTRIBUTED TRACING — Compliance Workflows
# ══════════════════════════════════════════════════════════════════════════════

SERVICES = [
    "compliance-gateway",
    "policy-engine",
    "audit-logger",
    "risk-assessor",
    "compliance-checker",
    "data-governor",
    "identity-verifier",
    "evidence-collector",
    "control-mapper",
    "reporting-service",
]

OPERATIONS = {
    "compliance-gateway": [
        "HTTP POST /api/v1/compliance/evaluate",
        "HTTP GET /api/v1/compliance/status",
        "HTTP POST /api/v1/compliance/report",
        "HTTP GET /api/v1/policies",
        "HTTP POST /api/v1/audit/trail",
    ],
    "policy-engine": [
        "EvaluatePolicy",
        "CompilePolicySet",
        "ResolvePolicyConflicts",
        "VersionPolicy",
        "DeployPolicyUpdate",
    ],
    "audit-logger": [
        "RecordAuditEvent",
        "QueryAuditTrail",
        "ExportAuditLog",
        "ArchiveAuditRecords",
        "ValidateAuditIntegrity",
    ],
    "risk-assessor": [
        "CalculateRiskScore",
        "AssessControlEffectiveness",
        "RunThreatModeling",
        "EvaluateResidualRisk",
        "UpdateRiskRegister",
    ],
    "compliance-checker": [
        "RunSOCCheck",
        "RunGDPRCheck",
        "RunHIPAACheck",
        "RunISO27001Check",
        "RunPCIDSSCheck",
        "CheckFrameworkDrift",
        "ValidateControlEvidence",
    ],
    "data-governor": [
        "ClassifyData",
        "EnforceRetentionPolicy",
        "CheckAccessAuthorization",
        "ValidateDataLineage",
        "ApplyDataMasking",
    ],
    "identity-verifier": [
        "AuthenticateUser",
        "AuthorizeAccess",
        "RunAccessReview",
        "ValidateMFA",
        "CheckRoleEntitlement",
    ],
    "evidence-collector": [
        "CollectEvidence",
        "ValidateEvidenceChain",
        "LinkControlToFramework",
        "ArchiveEvidenceArtifact",
        "GenerateAttestation",
    ],
    "control-mapper": [
        "MapControlToFramework",
        "SyncNISTControls",
        "UpdateCISBenchmarks",
        "MapRiskToTreatment",
        "GenerateControlMatrix",
    ],
    "reporting-service": [
        "GenerateComplianceReport",
        "ExportExecutiveSummary",
        "GenerateAuditReport",
        "ProduceRiskHeatmap",
        "CreateComplianceDashboard",
    ],
}

STATUSES = ["ok", "ok", "ok", "ok", "ok", "ok", "ok", "error", "error", "timeout"]

COMPLIANCE_FRAMEWORKS = ["SOC2", "GDPR", "HIPAA", "ISO27001", "PCI-DSS", "NIST-CSF", "CIS"]

def generate_traces(num_traces=50):
    traces = []
    trace_ids_used = set()

    for i in range(num_traces):
        trace_id = str(uuid.uuid4())
        while trace_id in trace_ids_used:
            trace_id = str(uuid.uuid4())
        trace_ids_used.add(trace_id)

        root_service = "compliance-gateway"
        root_operation = rand_choice(OPERATIONS[root_service])
        root_status = rand_choice(STATUSES)
        root_start = ts(minutes_ago=random.randint(0, 60))
        root_latency = rand_latency(20, 800)
        root_span_id = str(uuid.uuid4())[:16]
        framework = rand_choice(COMPLIANCE_FRAMEWORKS)

        spans = [{
            "traceId": trace_id,
            "spanId": root_span_id,
            "parentSpanId": None,
            "service": root_service,
            "operation": root_operation,
            "startTime": root_start,
            "durationMs": root_latency,
            "status": root_status,
            "tags": {
                "http.method": root_operation.split()[1] if "HTTP" in root_operation else None,
                "http.url": root_operation.split()[-1] if "HTTP" in root_operation else None,
                "compliance.framework": framework,
            }
        }]

        num_children = random.randint(2, 5)
        for j in range(num_children):
            child_service = rand_choice(SERVICES)
            child_op = rand_choice(OPERATIONS.get(child_service, ["unknown"]))
            child_status = rand_choice(STATUSES)
            child_start = ts(minutes_ago=random.randint(0, 59), seconds_offset=random.randint(0, 59))
            child_latency = rand_latency(3, 300)
            child_span_id = str(uuid.uuid4())[:16]

            span_tags = {
                "compliance.framework": framework,
            }
            if "HTTP" in child_op:
                parts = child_op.split()
                span_tags["http.method"] = parts[1]
                span_tags["http.url"] = parts[-1]
            if any(f in child_op for f in ["SOC", "GDPR", "HIPAA", "ISO", "PCI"]):
                span_tags["compliance.check_type"] = child_op.replace("Run", "").replace("Check", "")
            if "Risk" in child_op:
                span_tags["risk.category"] = rand_choice(["operational", "strategic", "compliance", "financial", "cyber"])

            spans.append({
                "traceId": trace_id,
                "spanId": child_span_id,
                "parentSpanId": root_span_id if j < 3 else spans[random.randint(1, len(spans)-1)]["spanId"],
                "service": child_service,
                "operation": child_op,
                "startTime": child_start,
                "durationMs": child_latency,
                "status": child_status,
                "tags": span_tags
            })

        has_error = any(s["status"] == "error" for s in spans)
        traces.append({
            "traceId": trace_id,
            "service": root_service,
            "operation": root_operation,
            "startTime": root_start,
            "durationMs": root_latency,
            "status": "error" if has_error else root_status,
            "spanCount": len(spans),
            "tags": { "compliance.framework": framework },
            "spans": spans
        })

    return traces


# ══════════════════════════════════════════════════════════════════════════════
# 2. COMPLIANCE METRICS
# ══════════════════════════════════════════════════════════════════════════════

def generate_metrics(num_points=60):
    cpu_points = []
    memory_points = []
    compliance_score_points = []
    violation_rate_points = []
    policy_eval_rate_points = []
    risk_score_points = []
    audit_coverage_points = []
    evidence_collection_points = []

    base_cpu = 45
    base_mem = 62
    base_comp_score = 87
    base_violation = 1.2
    base_policy_eval = 340
    base_risk = 32
    base_audit_cov = 91
    base_evidence = 78

    for i in range(num_points):
        t = ts(minutes_ago=(num_points - i))

        time_factor = math.sin(i / num_points * 2 * math.pi) * 8
        spike_factor = 25 if 18 <= i <= 23 else 0  # compliance scan burst
        drift_factor = -i * 0.05 if i > 35 else 0  # gradual compliance drift

        cpu = round(max(5, min(98, base_cpu + time_factor + spike_factor + random.gauss(0, 5))), 1)
        mem = round(max(30, min(95, base_mem + i * 0.08 + random.gauss(0, 2))), 1)
        comp_score = round(max(45, min(100, base_comp_score + drift_factor + time_factor * 0.3 + spike_factor * (-0.8) + random.gauss(0, 1.5))), 1)
        violation_rate = round(max(0, min(20, base_violation + spike_factor * 0.2 + (-drift_factor) * 0.1 + random.gauss(0, 0.5))), 2)
        policy_eval = round(max(50, base_policy_eval + spike_factor * 40 + random.gauss(0, 30)), 0)
        risk = round(max(5, min(95, base_risk + (-drift_factor) * 0.3 + spike_factor * 0.5 + random.gauss(0, 3))), 1)
        audit_cov = round(max(50, min(100, base_audit_cov + time_factor * 0.2 + random.gauss(0, 1))), 1)
        evidence = round(max(30, min(100, base_evidence + i * 0.05 + random.gauss(0, 2))), 1)

        cpu_points.append({"timestamp": t, "value": cpu})
        memory_points.append({"timestamp": t, "value": mem})
        compliance_score_points.append({"timestamp": t, "value": comp_score})
        violation_rate_points.append({"timestamp": t, "value": violation_rate})
        policy_eval_rate_points.append({"timestamp": t, "value": policy_eval})
        risk_score_points.append({"timestamp": t, "value": risk})
        audit_coverage_points.append({"timestamp": t, "value": audit_cov})
        evidence_collection_points.append({"timestamp": t, "value": evidence})

    return {
        "system": {
            "cpu_usage_percent": {"unit": "%", "description": "CPU utilization across compliance nodes", "data": cpu_points},
            "memory_usage_percent": {"unit": "%", "description": "Memory utilization (policy engine + audit store)", "data": memory_points},
        },
        "compliance": {
            "compliance_score_percent": {"unit": "%", "description": "Aggregate compliance posture score (0-100)", "data": compliance_score_points},
            "violation_rate_per_min": {"unit": "violations/min", "description": "Policy violation detection rate", "data": violation_rate_points},
            "policy_evaluations_per_min": {"unit": "evals/min", "description": "Policy engine evaluation throughput", "data": policy_eval_rate_points},
            "risk_score": {"unit": "score", "description": "Aggregate risk score (lower is better)", "data": risk_score_points},
            "audit_coverage_percent": {"unit": "%", "description": "Audit trail coverage across all frameworks", "data": audit_coverage_points},
            "evidence_collection_percent": {"unit": "%", "description": "Evidence collection completeness for current period", "data": evidence_collection_points},
        },
        "summary": {
            "current_cpu": cpu_points[-1]["value"],
            "current_memory": memory_points[-1]["value"],
            "compliance_score": compliance_score_points[-1]["value"],
            "violation_rate": violation_rate_points[-1]["value"],
            "policy_eval_rate": policy_eval_rate_points[-1]["value"],
            "risk_score": risk_score_points[-1]["value"],
            "audit_coverage": audit_coverage_points[-1]["value"],
            "evidence_collection": evidence_collection_points[-1]["value"],
            "peak_violation_rate": max(p["value"] for p in violation_rate_points),
            "min_compliance_score": min(p["value"] for p in compliance_score_points),
        }
    }


# ══════════════════════════════════════════════════════════════════════════════
# 3. STRUCTURED LOGS — Compliance & Audit Events
# ══════════════════════════════════════════════════════════════════════════════

LOG_LEVELS = ["DEBUG", "INFO", "INFO", "INFO", "INFO", "WARN", "WARN", "ERROR", "ERROR", "FATAL"]

LOG_MESSAGES = {
    "DEBUG": [
        "Cache hit for policy cache key: {framework}:{control_id}:v{version}",
        "Audit trail query: {result_count} events returned in {elapsed_ms}ms",
        "Risk register cache refreshed for scope: {scope}",
        "Evidence validation pass: artifact {artifact_id} hash verified",
        "Control mapping lookup: {control_id} -> {framework} mapped in {elapsed_ms}ms",
    ],
    "INFO": [
        "Compliance check completed: {framework} {check_type} -> {status_code} in {elapsed_ms}ms",
        "Policy {policy_id} v{version} evaluated against {resource_type} {resource_id}: {verdict}",
        "Audit event recorded: {event_type} by {user_id} on {resource_type}/{resource_id}",
        "Risk assessment completed for scope {scope}: score={score}, level={risk_level}",
        "Data classification applied: {resource_type}/{resource_id} -> {classification}",
        "Evidence collected for control {control_id}: artifact {artifact_id} stored",
        "Access review completed for user {user_id}: {access_count} entitlements reviewed",
        "Compliance report generated: {report_type} for {framework} period {period}",
        "Framework drift check passed: {framework} posture stable at {score}%",
        "Control effectiveness updated: {control_id} now {effectiveness}%",
    ],
    "WARN": [
        "Compliance score trending down: {framework} at {score}% (threshold: {threshold}% - breach in {days_until_breach}d)",
        "Policy conflict detected between {policy_a} and {policy_b} for resource {resource_id}",
        "Evidence gap identified: control {control_id} has {gap_count} missing artifacts",
        "Audit trail integrity warning: sequence gap between {start_seq} and {end_seq}",
        "Risk score elevated: scope {scope} now at {score} (previous: {previous_score})",
        "Overdue access review: {overdue_count} reviews past SLA for team {team}",
        "Data retention policy approaching expiry: {resource_count} resources in scope",
        "Certificate for compliance signing authority expires in {days} days",
    ],
    "ERROR": [
        "Policy violation detected: {policy_id} violated by {resource_type}/{resource_id} - {violation_type}",
        "Compliance check FAILED: {framework} {check_type} - {failure_reason}",
        "Unauthorized access attempt: user {user_id} to {resource_type}/{resource_id} (denied)",
        "Audit evidence tampering alert: artifact {artifact_id} hash mismatch (expected vs actual)",
        "Risk assessment timeout: scope {scope} evaluation exceeded {timeout_ms}ms SLA",
        "Framework drift detected: {framework} score dropped {drop_points}pts in {hours}h",
        "Control evidence chain broken: {control_id} missing link to {framework} requirement",
        "Compliance reporting failure: {report_type} generation failed - {error_msg}",
    ],
    "FATAL": [
        "CRITICAL COMPLIANCE BREACH: {framework} posture below minimum threshold ({score}% < {threshold}%)",
        "Audit trail corruption: immutable log integrity compromised for period {period}",
        "Complete policy engine failure: all evaluations suspended for {framework}",
    ],
}

def generate_logs(num_logs=200):
    logs = []

    for i in range(num_logs):
        level = rand_choice(LOG_LEVELS)
        service = rand_choice(SERVICES)
        message_template = rand_choice(LOG_MESSAGES[level])
        timestamp = ts(minutes_ago=random.randint(0, 60), seconds_offset=random.randint(0, 59))

        message = message_template.format(
            framework=rand_choice(COMPLIANCE_FRAMEWORKS),
            control_id=f"CTL-{random.randint(100,999)}",
            version=random.randint(1, 5),
            result_count=random.randint(10, 500),
            elapsed_ms=rand_latency(1, 3000),
            scope=rand_choice(["organization", "business-unit:A", "business-unit:B", "product:X", "env:production"]),
            artifact_id=f"EVD-{uuid.uuid4().hex[:8].upper()}",
            check_type=rand_choice(["SOC2.A1", "SOC2.A2", "GDPR.Art.6", "GDPR.Art.25", "HIPAA.164.312", "ISO.A.9", "PCI.1.2"]),
            status_code=rand_choice([200, 200, 200, 201, 403, 500]),
            policy_id=f"POL-{random.randint(1000,9999)}",
            resource_type=rand_choice(["data-store", "api-endpoint", "service-account", "user-account", "infrastructure", "application"]),
            resource_id=f"{random.choice(['RES', 'SRV', 'USR', 'DS'])}-{uuid.uuid4().hex[:8].upper()}",
            verdict=rand_choice(["COMPLIANT", "COMPLIANT", "COMPLIANT", "NON-COMPLIANT", "CONDITIONAL"]),
            event_type=rand_choice(["access", "modification", "deletion", "creation", "export", "policy-change"]),
            user_id=f"USR-{random.randint(1000,9999)}",
            score=random.randint(15, 95),
            risk_level=rand_choice(["LOW", "MEDIUM", "MEDIUM", "HIGH", "CRITICAL"]),
            classification=rand_choice(["PUBLIC", "INTERNAL", "CONFIDENTIAL", "RESTRICTED"]),
            report_type=rand_choice(["SOC2-Type-II", "GDPR-DPIA", "HIPAA-Security", "ISO-27001-Statement", "Risk-Register"]),
            period=f"{random.choice(['Q1', 'Q2', 'Q3', 'Q4'])}-{random.randint(2023, 2026)}",
            effectiveness=random.randint(40, 99),
            policy_a=f"POL-{random.randint(1000,9999)}",
            policy_b=f"POL-{random.randint(1000,9999)}",
            gap_count=random.randint(1, 8),
            start_seq=random.randint(10000, 99990),
            end_seq=random.randint(10000, 99990),
            previous_score=random.randint(20, 80),
            overdue_count=random.randint(1, 15),
            team=rand_choice(["engineering", "product", "security", "finance", "legal"]),
            resource_count=random.randint(50, 5000),
            days=random.randint(1, 30),
            violation_type=rand_choice(["access-control", "data-retention", "encryption-missing", "logging-gap", "separation-of-duty"]),
            failure_reason=rand_choice(["evidence-missing", "control-not-implemented", "policy-outdated", "threshold-exceeded"]),
            timeout_ms=30000,
            drop_points=random.randint(2, 15),
            hours=random.randint(1, 48),
            error_msg=rand_choice(["resource-exhausted", "timeout-exceeded", "data-corruption", "external-service-unavailable"]),
            threshold=rand_choice([70, 75, 80, 85]),
            days_until_breach=random.randint(1, 14),
            access_count=random.randint(5, 50),
        )

        fields = {
            "service": service,
            "instance": f"{service}-{random.randint(1,5)}",
            "traceId": str(uuid.uuid4())[:16],
            "spanId": str(uuid.uuid4())[:16],
            "hostname": f"{service}-{random.choice(['a','b','c'])}-{random.randint(1,10)}.{rand_choice(['us-east', 'eu-west', 'ap-south'])}.compliance.internal",
            "version": f"v{random.randint(1,3)}.{random.randint(0,15)}.{random.randint(0,50)}",
        }

        if level in ("WARN", "ERROR", "FATAL"):
            fields["alerting"] = True

        logs.append({
            "timestamp": timestamp,
            "level": level,
            "message": message,
            "service": service,
            "fields": fields,
        })

    logs.sort(key=lambda x: x["timestamp"], reverse=True)
    return logs


# ══════════════════════════════════════════════════════════════════════════════
# 4. COMPLIANCE ALERTING
# ══════════════════════════════════════════════════════════════════════════════

ALERT_SEVERITIES = ["critical", "critical", "high", "high", "high", "medium", "medium", "low", "info"]
ALERT_STATES = ["firing", "firing", "firing", "resolved", "resolved", "acknowledged"]

def generate_alert_rules():
    return [
        {
            "id": "alert-rule-001",
            "name": "ComplianceScoreBreach",
            "description": "Trigger when aggregate compliance posture drops below 75% for any framework",
            "condition": "compliance_score_percent < 75 for 5m",
            "severity": "critical",
            "service": "compliance-checker",
            "channel": "#compliance-critical",
            "runbook": "https://wiki/runbooks/compliance-score-breach",
        },
        {
            "id": "alert-rule-002",
            "name": "PolicyViolationSurge",
            "description": "Trigger when violation rate exceeds 5/min over 3 minutes",
            "condition": "violation_rate_per_min > 5 for 3m",
            "severity": "critical",
            "service": "policy-engine",
            "channel": "#compliance-critical",
            "runbook": "https://wiki/runbooks/policy-violation-surge",
        },
        {
            "id": "alert-rule-003",
            "name": "AuditTrailGap",
            "description": "Trigger when audit trail sequence gap exceeds 10 events",
            "condition": "audit_gap_count > 10 for 2m",
            "severity": "high",
            "service": "audit-logger",
            "channel": "#compliance-high",
            "runbook": "https://wiki/runbooks/audit-trail-gap",
        },
        {
            "id": "alert-rule-004",
            "name": "RiskScoreSpike",
            "description": "Trigger when risk score exceeds 70 (high risk threshold)",
            "condition": "risk_score > 70 for 5m",
            "severity": "high",
            "service": "risk-assessor",
            "channel": "#compliance-high",
            "runbook": "https://wiki/runbooks/risk-score-spike",
        },
        {
            "id": "alert-rule-005",
            "name": "GDPRDataBreach",
            "description": "Trigger when unauthorized PII access is detected",
            "condition": "unauthorized_pii_access > 0 for 1m",
            "severity": "critical",
            "service": "data-governor",
            "channel": "#compliance-critical",
            "runbook": "https://wiki/runbooks/gdpr-data-breach",
        },
        {
            "id": "alert-rule-006",
            "name": "EvidenceCollectionSLABreach",
            "description": "Trigger when evidence collection completeness drops below 70%",
            "condition": "evidence_collection_percent < 70 for 10m",
            "severity": "medium",
            "service": "evidence-collector",
            "channel": "#compliance-medium",
            "runbook": "https://wiki/runbooks/evidence-collection-sla",
        },
        {
            "id": "alert-rule-007",
            "name": "SOC2FrameworkDrift",
            "description": "Trigger when SOC2 compliance score drops more than 5pts in 1 hour",
            "condition": "soc2_score_delta < -5 for 60m",
            "severity": "high",
            "service": "control-mapper",
            "channel": "#compliance-high",
            "runbook": "https://wiki/runbooks/soc2-framework-drift",
        },
        {
            "id": "alert-rule-008",
            "name": "AccessReviewOverdue",
            "description": "Trigger when more than 10 access reviews are past their SLA deadline",
            "condition": "overdue_access_reviews > 10",
            "severity": "medium",
            "service": "identity-verifier",
            "channel": "#compliance-medium",
            "runbook": "https://wiki/runbooks/access-review-overdue",
        },
        {
            "id": "alert-rule-009",
            "name": "RegulatoryDeadlineApproaching",
            "description": "Trigger when a regulatory submission deadline is within 7 days",
            "condition": "days_until_deadline < 7",
            "severity": "high",
            "service": "reporting-service",
            "channel": "#compliance-high",
            "runbook": "https://wiki/runbooks/regulatory-deadline",
        },
        {
            "id": "alert-rule-010",
            "name": "ComplianceEngineUnhealthy",
            "description": "Trigger when policy engine health check fails 3 consecutive times",
            "condition": "health_check_failures > 3 for 1m",
            "severity": "critical",
            "service": "policy-engine",
            "channel": "#incidents-critical",
            "runbook": "https://wiki/runbooks/compliance-engine-down",
        },
    ]


def generate_triggered_alerts(num_alerts=25):
    rules = generate_alert_rules()
    alerts = []

    for i in range(num_alerts):
        rule = rand_choice(rules)
        severity = rule["severity"]
        state = rand_choice(ALERT_STATES)
        fired_at = ts(minutes_ago=random.randint(0, 55))

        # Parse threshold from condition
        condition_parts = rule["condition"].split(">")[-1].split()[0] if ">" in rule["condition"] else \
                          rule["condition"].split("<")[-1].split()[0] if "<" in rule["condition"] else "0"
        try:
            threshold = float(condition_parts)
        except ValueError:
            threshold = 0

        alert = {
            "alertId": f"CALERT-{uuid.uuid4().hex[:8].upper()}",
            "ruleId": rule["id"],
            "ruleName": rule["name"],
            "description": rule["description"],
            "severity": severity,
            "state": state,
            "service": rule["service"],
            "firedAt": fired_at,
            "channel": rule["channel"],
            "runbook": rule["runbook"],
            "labels": {
                "env": rand_choice(["production", "production", "staging"]),
                "framework": rand_choice(COMPLIANCE_FRAMEWORKS),
                "team": rand_choice(["compliance", "security", "governance", "legal", "engineering"]),
            },
            "annotations": {
                "summary": f"{rule['name']} triggered on {rule['service']}",
                "dashboard": f"https://compliance-dashboard.internal/d/{rule['id']}",
            },
            "metrics": {
                "current_value": round(random.uniform(0.5, 2.5) * threshold, 2),
                "threshold": threshold,
            },
        }

        if state in ("resolved", "acknowledged"):
            alert["resolvedAt"] = ts(minutes_ago=random.randint(0, 50))
            alert["durationMinutes"] = random.randint(2, 30)

        alerts.append(alert)

    alerts.sort(key=lambda x: x["firedAt"], reverse=True)
    return alerts


# ══════════════════════════════════════════════════════════════════════════════
# MAIN – Generate & Output
# ══════════════════════════════════════════════════════════════════════════════

def main():
    print("=" * 65)
    print("  Autonomous Compliance – Observability Data Generator")
    print("=" * 65)

    print("\n[1/4] Generating compliance workflow traces...")
    traces = generate_traces(num_traces=50)
    print(f"       Generated {len(traces)} traces with "
          f"{sum(t['spanCount'] for t in traces)} total spans")
    print(f"       Frameworks: {', '.join(COMPLIANCE_FRAMEWORKS)}")

    print("[2/4] Generating compliance & system metrics...")
    metrics = generate_metrics(num_points=60)
    print(f"       Generated {len(metrics['system']) + len(metrics['compliance'])} metric series "
          f"({len(metrics['compliance']['compliance_score_percent']['data'])} data points each)")

    print("[3/4] Generating compliance audit logs...")
    logs = generate_logs(num_logs=200)
    level_counts = {}
    for log in logs:
        level_counts[log["level"]] = level_counts.get(log["level"], 0) + 1
    print(f"       Generated {len(logs)} log entries")
    for level, count in sorted(level_counts.items()):
        print(f"         {level}: {count}")

    print("[4/4] Generating compliance alerting rules & triggered alerts...")
    alert_rules = generate_alert_rules()
    triggered_alerts = generate_triggered_alerts(num_alerts=25)
    severity_counts = {}
    for alert in triggered_alerts:
        severity_counts[alert["severity"]] = severity_counts.get(alert["severity"], 0) + 1
    print(f"       Defined {len(alert_rules)} alert rules")
    print(f"       Generated {len(triggered_alerts)} triggered alerts")
    for sev, count in sorted(severity_counts.items()):
        print(f"         {sev}: {count}")

    output = {
        "generatedAt": NOW.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z",
        "generator": "autonomous-compliance-observability",
        "version": "2.0.0",
        "project": "Autonomous Compliance",
        "data": {
            "traces": traces,
            "metrics": metrics,
            "logs": logs,
            "alerting": {
                "rules": alert_rules,
                "triggeredAlerts": triggered_alerts,
            },
        },
        "statistics": {
            "totalTraces": len(traces),
            "totalSpans": sum(t["spanCount"] for t in traces),
            "errorTraces": len([t for t in traces if t["status"] == "error"]),
            "totalLogs": len(logs),
            "errorLogs": level_counts.get("ERROR", 0) + level_counts.get("FATAL", 0),
            "totalAlertRules": len(alert_rules),
            "firingAlerts": len([a for a in triggered_alerts if a["state"] == "firing"]),
            "resolvedAlerts": len([a for a in triggered_alerts if a["state"] == "resolved"]),
            "services": len(SERVICES),
            "frameworks": len(COMPLIANCE_FRAMEWORKS),
        }
    }

    with open(OUTPUT_PATH, "w") as f:
        json.dump(output, f, indent=2)

    print(f"\n{'=' * 65}")
    print(f"  Output saved to: {OUTPUT_PATH}")
    print(f"  File size: {len(json.dumps(output)):,} bytes")
    print(f"{'=' * 65}")

    return output


if __name__ == "__main__":
    main()
