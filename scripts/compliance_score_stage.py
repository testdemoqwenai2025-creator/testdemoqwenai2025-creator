#!/usr/bin/env python3
"""
Stage 9: Compliance Scoring Engine
=====================================
Computes composite compliance scores per framework and overall,
generates 30-day historical trends, risk posture assessment,
and top-priority risk items with remediation mapping.

Input: none (self-contained generator)
Output: compliance score dict to be merged into observability-data.json
"""

import random
import hashlib
import math
from datetime import datetime, timedelta, timezone

SEED = 42
random.seed(SEED)
NOW = datetime.now(timezone.utc)

FRAMEWORKS = [
    {"id": "HIPAA",     "name": "HIPAA",         "full_name": "Health Insurance Portability and Accountability Act", "category": "Healthcare",   "weight": 0.20},
    {"id": "GDPR",      "name": "GDPR",          "full_name": "General Data Protection Regulation",               "category": "Privacy",       "weight": 0.18},
    {"id": "SOC2",       "name": "SOC 2",         "full_name": "Service Organization Control Type II",            "category": "Trust Services", "weight": 0.15},
    {"id": "PCI-DSS",    "name": "PCI-DSS v4.1",  "full_name": "Payment Card Industry Data Security Standard",      "category": "Payments",      "weight": 0.15},
    {"id": "EU-AI-ACT",  "name": "EU AI Act",     "full_name": "European Union Artificial Intelligence Act",       "category": "AI Safety",      "weight": 0.12},
    {"id": "ISO27001",   "name": "ISO 27001",     "full_name": "Information Security Management Systems",           "category": "InfoSec",       "weight": 0.10},
    {"id": "SEC",        "name": "SEC Rule",      "full_name": "SEC Cybersecurity Disclosure Rule",              "category": "Financial",      "weight": 0.10},
]

# Risk dimensions per framework (what contributes to the score)
DIMENSIONS = [
    "policy_coverage",      # % of required policies defined
    "control_effectiveness", # % of controls passing audit
    "remediation_velocity",  # avg days to close violations
    "evidence_completeness", # % of audit evidence artifacts present
    "monitoring_coverage",   # % of systems under active monitoring
    "training_compliance",   # % of personnel with current training
]


def clamp(v, lo=0, hi=100):
    return max(lo, min(hi, v))


def generate_framework_scores():
    """Generate per-framework compliance scores with dimension breakdown."""
    framework_scores = []
    for fw in FRAMEWORKS:
        # Base score biased by weight (heavier frameworks have tighter scrutiny)
        base = random.gauss(78, 12)
        # Add some realistic variation per framework
        if fw["id"] == "HIPAA":
            base += random.gauss(5, 3)   # Generally well-controlled
        elif fw["id"] == "EU-AI-ACT":
            base -= random.gauss(8, 4)  # Newer regulation, gaps expected
        elif fw["id"] == "PCI-DSS":
            base += random.gauss(3, 5)  # Mature standard

        dimensions = {}
        for dim in DIMENSIONS:
            dim_val = clamp(base + random.gauss(0, 10))
            dimensions[dim] = round(dim_val, 1)

        composite = clamp(sum(dimensions.values()) / len(dimensions) + random.gauss(0, 2))

        # Risk posture classification
        if composite >= 85:
            posture = "strong"
            posture_detail = "All critical controls passing; minor improvement opportunities"
        elif composite >= 70:
            posture = "adequate"
            posture_detail = "Core controls in place; some gaps in secondary controls"
        elif composite >= 55:
            posture = "at_risk"
            posture_detail = "Significant control gaps detected; remediation required within 30 days"
        else:
            posture = "critical"
            posture_detail = "Major non-conformances; immediate executive escalation required"

        # Top violations for this framework
        top_violations = []
        num_violations = random.randint(1, 4)
        violation_templates = {
            "HIPAA": [
                "PHI access logging gap in 3 of 12 subsystems",
                "Encryption-at-rest not verified for legacy data stores",
                "BAA renewal overdue for 2 business associates",
                "Minimum Necessary standard not enforced on reporting API",
            ],
            "GDPR": [
                "Data Processing Impact Assessment missing for 2 high-risk processes",
                "Cookie consent mechanism does not honor global opt-out",
                "Data Subject Access Request response time exceeding 30-day SLA",
                "Cross-border transfer mechanism (SCCs) not updated post-Schrems II",
            ],
            "SOC2": [
                "Change management audit trail incomplete for Q2 releases",
                "Vendor risk assessment not performed for 3 critical vendors",
                "Incident response plan not tested within 12-month window",
                "Logical access review backlog exceeds 45 days",
            ],
            "PCI-DSS": [
                "MFA not enforced on 2 CDE administrative systems",
                "Network segmentation validation overdue by 90 days",
                "Cardholder data scanning frequency below quarterly requirement",
                "Wireless access point detection not performed in current quarter",
            ],
            "EU-AI-ACT": [
                "High-risk AI system conformity assessment not initiated",
                "Training data bias audit not documented for credit decisioning model",
                "Human oversight mechanism missing for automated denial decisions",
                "Technical documentation incomplete for deployed AI systems",
            ],
            "ISO27001": [
                "Asset inventory not reconciled in 6 months",
                "Business continuity plan not tested annually",
                "Security awareness training completion rate at 72% (target: 95%)",
                "Patch management SLA breached for 5 medium-severity CVEs",
            ],
            "SEC": [
                "Material cybersecurity incident disclosure timeline not documented",
                "Board cybersecurity risk reporting frequency below quarterly",
                "Third-party penetration test findings not remediated within 90 days",
                "Cybersecurity risk management program not formally approved by board",
            ],
        }

        for i in range(num_violations):
            templates = violation_templates.get(fw["id"], ["Generic compliance gap detected"])
            template = templates[i % len(templates)]
            top_violations.append({
                "id": f"RV-{fw['id']}-{i+1:03d}",
                "description": template,
                "severity": random.choice(["high", "medium", "medium", "low"]),
                "imperativeRef": f"IMP-{hashlib.sha256(f'{fw['id']}{i}'.encode()).hexdigest()[:6].upper()}",
                "remediationDue": (NOW + timedelta(days=random.randint(7, 60))).strftime("%Y-%m-%d"),
                "status": random.choice(["open", "open", "in_progress", "in_progress"]),
            })

        # Imperative coverage
        imperatives_total = random.randint(20, 60)
        imperatives_met = random.randint(int(imperatives_total * 0.6), imperatives_total)
        imperatives_partial = random.randint(0, imperatives_total - imperatives_met)
        imperatives_failing = imperatives_total - imperatives_met - imperatives_partial

        framework_scores.append({
            "frameworkId": fw["id"],
            "frameworkName": fw["name"],
            "frameworkFullName": fw["full_name"],
            "category": fw["category"],
            "weight": fw["weight"],
            "compositeScore": round(composite, 1),
            "previousScore": round(composite + random.gauss(-2, 5), 1),  # 30-day-ago score
            "trend": "improving" if composite > 72 else ("stable" if composite > 60 else "declining"),
            "dimensions": dimensions,
            "riskPosture": posture,
            "riskPostureDetail": posture_detail,
            "topViolations": top_violations,
            "imperativeCoverage": {
                "total": imperatives_total,
                "met": imperatives_met,
                "partial": imperatives_partial,
                "failing": imperatives_failing,
                "coverageRate": round(imperatives_met / imperatives_total * 100, 1),
            },
            "lastAssessment": (NOW - timedelta(days=random.randint(1, 14))).strftime("%Y-%m-%d"),
            "nextAssessment": (NOW + timedelta(days=random.randint(14, 45))).strftime("%Y-%m-%d"),
        })

    return framework_scores


def generate_trend_data(num_days=30):
    """Generate 30-day historical compliance trend with daily granularity."""
    trend = []
    for day in range(num_days - 1, -1, -1):
        date = (NOW - timedelta(days=day)).strftime("%Y-%m-%d")

        # Overall composite (weighted average of frameworks)
        daily_scores = {}
        for fw in FRAMEWORKS:
            # Simulate gradual improvement with random noise
            base = 72 + (day * 0.15) + random.gauss(0, 3)
            if fw["id"] == "EU-AI-ACT":
                base -= 10  # Newer regulation starts lower
            daily_scores[fw["id"]] = round(clamp(base + random.gauss(0, 5)), 1)

        # Weighted composite
        composite = sum(
            daily_scores[fw["id"]] * fw["weight"]
            for fw in FRAMEWORKS
        )

        trend.append({
            "date": date,
            "compositeScore": round(composite, 1),
            "frameworkScores": daily_scores,
            "violationsOpen": random.randint(8, 20),
            "violationsResolved": random.randint(2, 8),
            "alertsTriggered": random.randint(1, 6),
            "remediationActionsCompleted": random.randint(1, 5),
        })

    return trend


def generate_risk_matrix():
    """Cross-framework risk matrix: likelihood vs impact for top risks."""
    risks = [
        {"id": "RSK-001", "title": "PHI exposure via unencrypted legacy API",
         "framework": "HIPAA", "likelihood": "high", "impact": "critical", "riskLevel": "extreme",
         "owner": "CISO", "status": "mitigating",
         "mitigation": "Implement TLS 1.3 on all PHI endpoints; encrypt at rest with AES-256",
         "imperativeRef": "IMP-HIPAA-003"},
        {"id": "RSK-002", "title": "GDPR cross-border transfer without valid mechanism",
         "framework": "GDPR", "likelihood": "medium", "impact": "high", "riskLevel": "high",
         "owner": "DPO", "status": "open",
         "mitigation": "Deploy Binding Corporate Rules for EU-US data flows; update SCCs",
         "imperativeRef": "IMP-GDPR-007"},
        {"id": "RSK-003", "title": "PCI-DSS MFA gap on CDE administrative access",
         "framework": "PCI-DSS", "likelihood": "high", "impact": "high", "riskLevel": "extreme",
         "owner": "CISO", "status": "in_progress",
         "mitigation": "Enforce FIDO2/WebAuthn MFA on all CDE systems; remove legacy password fallback",
         "imperativeRef": "IMP-PCI-012"},
        {"id": "RSK-004", "title": "AI bias in automated credit decisioning model",
         "framework": "EU-AI-ACT", "likelihood": "medium", "impact": "critical", "riskLevel": "extreme",
         "owner": "CTO", "status": "open",
         "mitigation": "Conduct algorithmic impact assessment; implement fairness metrics monitoring",
         "imperativeRef": "IMP-AI-004"},
        {"id": "RSK-005", "title": "SOC2 vendor risk assessment gap for critical SaaS providers",
         "framework": "SOC2", "likelihood": "high", "impact": "medium", "riskLevel": "high",
         "owner": "VP Engineering", "status": "mitigating",
         "mitigation": "Complete SIG assessments for top 10 vendors; establish continuous monitoring",
         "imperativeRef": "IMP-SOC2-009"},
        {"id": "RSK-006", "title": "ISO 27001 asset inventory drift",
         "framework": "ISO27001", "likelihood": "medium", "impact": "medium", "riskLevel": "medium",
         "owner": "IT Operations", "status": "in_progress",
         "mitigation": "Automate CMDB reconciliation; implement asset discovery scanning",
         "imperativeRef": "IMP-ISO-006"},
        {"id": "RSK-007", "title": "SEC material incident disclosure timeline not formalized",
         "framework": "SEC", "likelihood": "medium", "impact": "high", "riskLevel": "high",
         "owner": "General Counsel", "status": "open",
         "mitigation": "Draft and board-approve 4-business-day disclosure SOP; integrate with incident response",
         "imperativeRef": "IMP-SEC-002"},
        {"id": "RSK-008", "title": "HIPAA minimum necessary standard violation on analytics pipeline",
         "framework": "HIPAA", "likelihood": "medium", "impact": "high", "riskLevel": "high",
         "owner": "Privacy Officer", "status": "mitigating",
         "mitigation": "Implement column-level access controls on analytics warehouse; audit PHI access patterns",
         "imperativeRef": "IMP-HIPAA-011"},
        {"id": "RSK-009", "title": "GDPR DSAR response time exceeding 30-day SLA",
         "framework": "GDPR", "likelihood": "high", "impact": "medium", "riskLevel": "high",
         "owner": "DPO", "status": "in_progress",
         "mitigation": "Automate DSAR intake and response workflow; pre-assemble common data packages",
         "imperativeRef": "IMP-GDPR-015"},
        {"id": "RSK-010", "title": "EU-AI-ACT human oversight gap in automated denial decisions",
         "framework": "EU-AI-ACT", "likelihood": "high", "impact": "critical", "riskLevel": "extreme",
         "owner": "CTO", "status": "open",
         "mitigation": "Implement human-in-the-loop review for all high-impact AI decisions; add appeal mechanism",
         "imperativeRef": "IMP-AI-009"},
    ]
    return risks


def generate_compliance_score():
    """Main Stage 9 generator."""
    print("[Stage 9] Generating compliance scoring engine...")

    framework_scores = generate_framework_scores()
    trend_data = generate_trend_data(num_days=30)
    risk_matrix = generate_risk_matrix()

    # Compute overall composite
    overall_composite = round(sum(
        fs["compositeScore"] * fs["weight"]
        for fs in framework_scores
    ), 1)

    # Overall posture
    if overall_composite >= 85:
        overall_posture = "strong"
    elif overall_composite >= 70:
        overall_posture = "adequate"
    elif overall_comure >= 55:
        overall_posture = "at_risk"
    else:
        overall_posture = "critical"

    total_open_violations = sum(
        len(fs["topViolations"]) for fs in framework_scores
    )
    total_imperatives = sum(
        fs["imperativeCoverage"]["total"] for fs in framework_scores
    )
    total_met = sum(
        fs["imperativeCoverage"]["met"] for fs in framework_scores
    )

    result = {
        "overallCompositeScore": overall_composite,
        "overallPosture": overall_posture,
        "overallTrend": "improving",
        "lastComputed": NOW.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z",
        "scoringMethodology": "Weighted composite across 7 frameworks, 6 dimensions per framework. Dimensions: policy_coverage, control_effectiveness, remediation_velocity, evidence_completeness, monitoring_coverage, training_compliance. Weights reflect regulatory materiality.",
        "frameworkScores": framework_scores,
        "trendData": trend_data,
        "riskMatrix": risk_matrix,
        "summary": {
            "frameworksAssessed": len(FRAMEWORKS),
            "dimensionsPerFramework": len(DIMENSIONS),
            "trendDays": len(trend_data),
            "totalRiskItems": len(risk_matrix),
            "totalOpenViolations": total_open_violations,
            "overallImperativeRate": round(total_met / max(total_imperatives, 1) * 100, 1),
        },
    }

    print(f"       Overall composite: {overall_composite}")
    print(f"       Posture: {overall_posture}")
    print(f"       Frameworks: {len(framework_scores)}")
    print(f"       Trend data: {len(trend_data)} days")
    print(f"       Risk matrix: {len(risk_matrix)} items")
    print(f"       Open violations: {total_open_violations}")

    return result


if __name__ == "__main__":
    result = generate_compliance_score()
    print(json.dumps(result, indent=2)[:500] + "...")
