"""
Stage 10: Predictive Regulatory Intelligence
=============================================
Generates forward-looking regulatory intelligence data including:
  - Regulatory Horizon Radar: 18-month forward view of predicted regulatory changes
  - Propagation Model: Cross-jurisdictional propagation graph
  - Impact Simulation: Delta analysis of predicted changes on current compliance
  - Temporal Forecast: Resource demand and compliance trajectory predictions

Input: none (self-contained generator)
Output: predictive intelligence dict merged into observability-data.json
"""

import random
import hashlib
import math
from datetime import datetime, timedelta, timezone

SEED = 42
random.seed(SEED)
NOW = datetime.now(timezone.utc)


def clamp(v, lo=0, hi=100):
    return max(lo, min(hi, v))


def rand_latency(lo=5, hi=500):
    return max(lo, min(hi, int(random.lognormvariate(math.log(50), 1.0))))


def hash_id(*parts):
    raw = ":".join(str(p) for p in parts)
    return hashlib.sha256(raw.encode()).hexdigest()[:12].upper()


# ── Regulatory Sources (pre-enactment) ──────────────────────────────
DRAFT_SOURCES = [
    {"id": "eu-ai-act-amendment", "jurisdiction": "EU", "title": "EU AI Act Amendment - High-Risk Classification Expansion",
     "type": "amendment", "agency": "European Commission", "status": "draft", "enactmentProbability": 0.78,
     "estimatedEnactment": "2027-03", "topic": "AI Governance", "affectedFrameworks": ["EU-AI-ACT", "ISO27001"]},
    {"id": "gdpr-ai-interaction", "jurisdiction": "EU", "title": "GDPR-AI Interaction Guidelines",
     "type": "guidance", "agency": "EDPB", "status": "consultation", "enactmentProbability": 0.85,
     "estimatedEnactment": "2026-12", "topic": "Privacy + AI", "affectedFrameworks": ["GDPR", "EU-AI-ACT"]},
    {"id": "hipaa-modernization", "jurisdiction": "US", "title": "HHS HIPAA Modernization Rule - Telehealth & AI",
     "type": "rule", "agency": "HHS/OCR", "status": "proposed", "enactmentProbability": 0.72,
     "estimatedEnactment": "2027-06", "topic": "Healthcare AI", "affectedFrameworks": ["HIPAA"]},
    {"id": "sec-ai-disclosure", "jurisdiction": "US", "title": "SEC AI Risk Disclosure Enhancement",
     "type": "rule", "agency": "SEC", "status": "proposed", "enactmentProbability": 0.65,
     "estimatedEnactment": "2027-09", "topic": "Financial AI", "affectedFrameworks": ["SEC", "SOC2"]},
    {"id": "pci-ai-fraud-detection", "jurisdiction": "Global", "title": "PCI-DSS v5.0 - AI Fraud Detection Requirements",
     "type": "standard", "agency": "PCI SSC", "status": "draft", "enactmentProbability": 0.58,
     "estimatedEnactment": "2028-01", "topic": "Payments AI", "affectedFrameworks": ["PCI-DSS"]},
    {"id": "canada-ai-act", "jurisdiction": "CA", "title": "Canada Artificial Intelligence and Data Act (AIDA)",
     "type": "legislation", "agency": "Innovation Canada", "status": "committee", "enactmentProbability": 0.70,
     "estimatedEnactment": "2027-06", "topic": "AI Governance", "affectedFrameworks": ["GDPR", "EU-AI-ACT"]},
    {"id": "uk-ai-regulation", "jurisdiction": "UK", "title": "UK AI Safety Framework - Sectoral Implementation",
     "type": "framework", "agency": "DSIT", "status": "consultation", "enactmentProbability": 0.62,
     "estimatedEnactment": "2027-12", "topic": "AI Safety", "affectedFrameworks": ["EU-AI-ACT", "ISO27001"]},
    {"id": "apac-data-sovereignty", "jurisdiction": "APAC", "title": "ASEAN Cross-Border Data Flow Framework v2",
     "type": "framework", "agency": "ASEAN", "status": "negotiation", "enactmentProbability": 0.55,
     "estimatedEnactment": "2028-03", "topic": "Data Sovereignty", "affectedFrameworks": ["GDPR", "HIPAA"]},
    {"id": "us-state-ai-bills", "jurisdiction": "US-State", "title": "Multi-State AI Accountability Compact",
     "type": "legislation", "agency": "NCSL", "status": "draft", "enactmentProbability": 0.45,
     "estimatedEnactment": "2028-06", "topic": "AI Governance", "affectedFrameworks": ["EU-AI-ACT", "SOC2"]},
    {"id": "iso-ai-risk-mgmt", "jurisdiction": "Global", "title": "ISO/IEC 42001 AI Risk Management Update",
     "type": "standard", "agency": "ISO/IEC", "status": "committee", "enactmentProbability": 0.82,
     "estimatedEnactment": "2027-03", "topic": "AI Risk", "affectedFrameworks": ["ISO27001", "EU-AI-ACT", "NIST-CSF"]},
    {"id": "nist-ai-rmf-update", "jurisdiction": "US", "title": "NIST AI RMF 2.0 - Generative AI Controls",
     "type": "framework", "agency": "NIST", "status": "draft", "enactmentProbability": 0.75,
     "estimatedEnactment": "2026-11", "topic": "AI Safety", "affectedFrameworks": ["NIST-CSF", "EU-AI-ACT"]},
    {"id": "china-ai-regulation-v2", "jurisdiction": "CN", "title": "China Algorithmic Recommendation Regulation Expansion",
     "type": "regulation", "agency": "CAC", "status": "draft", "enactmentProbability": 0.60,
     "estimatedEnactment": "2027-09", "topic": "AI Governance", "affectedFrameworks": ["GDPR"]},
]


# ── Propagation Graph ────────────────────────────────────────────────
PROPAGATION_EDGES = [
    {"source": "EU", "target": "UK", "strength": 0.85, "latency_months": 8, "mechanism": "regulatory_alignment"},
    {"source": "EU", "target": "CA", "strength": 0.72, "latency_months": 14, "mechanism": "policy_convergence"},
    {"source": "EU", "target": "APAC", "strength": 0.45, "latency_months": 20, "mechanism": "trade_pressure"},
    {"source": "EU", "target": "US-State", "strength": 0.55, "latency_months": 16, "mechanism": "legislative_modeling"},
    {"source": "US", "target": "CA", "strength": 0.78, "latency_months": 10, "mechanism": "regulatory_harmonization"},
    {"source": "US", "target": "UK", "strength": 0.65, "latency_months": 12, "mechanism": "bilateral_alignment"},
    {"source": "US", "target": "APAC", "strength": 0.40, "latency_months": 22, "mechanism": "trade_agreement"},
    {"source": "CN", "target": "APAC", "strength": 0.50, "latency_months": 10, "mechanism": "regional_influence"},
    {"source": "Global", "target": "EU", "strength": 0.90, "latency_months": 6, "mechanism": "standard_adoption"},
    {"source": "Global", "target": "US", "strength": 0.85, "latency_months": 8, "mechanism": "standard_adoption"},
    {"source": "Global", "target": "CA", "strength": 0.80, "latency_months": 10, "mechanism": "standard_adoption"},
]


# ── Signal Types ──────────────────────────────────────────────────────
SIGNAL_TYPES = [
    "draft_proposal", "consultation_paper", "agency_speech",
    "enforcement_trend", "legislative_calendar", "judicial_precedent",
    "industry_standard_draft", "international_treaty", "regulatory_sandbox_result"
]


def generate_regulatory_signals():
    """Generate 20 regulatory signals with confidence scoring."""
    signals = []
    for i in range(20):
        source = random.choice(DRAFT_SOURCES)
        signal_type = random.choice(SIGNAL_TYPES)
        confidence = round(random.uniform(0.25, 0.95), 2)
        days_ago = random.randint(0, 90)
        signals.append({
            "id": hash_id("signal", i),
            "sourceId": source["id"],
            "sourceTitle": source["title"],
            "jurisdiction": source["jurisdiction"],
            "signalType": signal_type,
            "topic": source["topic"],
            "confidence": confidence,
            "enactmentProbability": round(source["enactmentProbability"] * confidence, 2),
            "estimatedImpact": random.choice(["low", "medium", "high", "critical"]),
            "affectedFrameworks": source["affectedFrameworks"],
            "detectedAt": (NOW - timedelta(days=days_ago)).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "expiresAt": (NOW + timedelta(days=365)).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "sourceAgency": source["agency"],
            "status": source["status"],
        })
    signals.sort(key=lambda s: s["enactmentProbability"], reverse=True)
    return signals


def generate_horizon_radar():
    """Build the 18-month regulatory horizon radar."""
    # Group draft sources into topic clusters
    topic_clusters = {}
    for src in DRAFT_SOURCES:
        topic = src["topic"]
        if topic not in topic_clusters:
            topic_clusters[topic] = {"topic": topic, "regulations": [], "avgProbability": 0, "earliestEnactment": "2099-12"}
        topic_clusters[topic]["regulations"].append(src)

    clusters = []
    for topic, cluster in topic_clusters.items():
        regs = cluster["regulations"]
        avg_prob = sum(r["enactmentProbability"] for r in regs) / len(regs)
        earliest = min(r["estimatedEnactment"] for r in regs)
        cluster["avgProbability"] = round(avg_prob, 2)
        cluster["earliestEnactment"] = earliest
        cluster["regulationCount"] = len(regs)
        cluster["totalAffectedFrameworks"] = len(set(fw for r in regs for fw in r["affectedFrameworks"]))
        cluster["urgencyScore"] = round(avg_prob * (1 - int(earliest[:4]) / 2030) * 100, 1) if earliest != "2099-12" else 0
        cluster["clusterId"] = hash_id("cluster", topic)
        clusters.append(cluster)

    clusters.sort(key=lambda c: c["urgencyScore"], reverse=True)
    return {"clusters": clusters, "totalClusters": len(clusters), "radarHorizonMonths": 18}


def generate_propagation_graph():
    """Generate the cross-jurisdictional propagation model."""
    nodes = list(set(
        [e["source"] for e in PROPAGATION_EDGES] +
        [e["target"] for e in PROPAGATION_EDGES]
    ))
    node_data = [{"jurisdiction": n, "regulationCount": random.randint(3, 12), "activePropagations": 0} for n in nodes]
    for edge in PROPAGATION_EDGES:
        for nd in node_data:
            if nd["jurisdiction"] == edge["target"]:
                nd["activePropagations"] += 1

    # Compute propagated signals: which draft regulations will propagate where
    propagated_signals = []
    for src in DRAFT_SOURCES[:8]:  # Top 8 most likely to propagate
        for edge in PROPAGATION_EDGES:
            if edge["source"] == src["jurisdiction"]:
                target_date = datetime.strptime(src["estimatedEnactment"], "%Y-%m") + timedelta(days=30 * edge["latency_months"])
                propagated_probability = round(src["enactmentProbability"] * edge["strength"], 2)
                if propagated_probability > 0.30:
                    propagated_signals.append({
                        "id": hash_id("prop", src["id"], edge["target"]),
                        "sourceRegulationId": src["id"],
                        "sourceTitle": src["title"],
                        "sourceJurisdiction": src["jurisdiction"],
                        "targetJurisdiction": edge["target"],
                        "propagationStrength": edge["strength"],
                        "estimatedLatencyMonths": edge["latency_months"],
                        "estimatedTargetDate": target_date.strftime("%Y-%m"),
                        "propagatedProbability": propagated_probability,
                        "mechanism": edge["mechanism"],
                    })

    return {
        "nodes": node_data,
        "edges": PROPAGATION_EDGES,
        "propagatedSignals": propagated_signals,
        "totalNodes": len(nodes),
        "totalEdges": len(PROPAGATION_EDGES),
        "totalPropagatedSignals": len(propagated_signals),
    }


def generate_impact_simulation():
    """Simulate the impact of predicted regulatory changes on current compliance."""
    impacts = []
    for i, src in enumerate(DRAFT_SOURCES[:8]):
        impact_score = round(random.uniform(20, 95), 1)
        controls_affected = random.randint(2, 15)
        new_controls_required = random.randint(0, 5)
        existing_controls_satisfied = controls_affected - new_controls_required
        remediation_effort_days = random.randint(10, 180)
        cost_estimate = round(random.uniform(50000, 2500000), -3)

        # Delta analysis: gap between predicted future and current state
        current_compliance = round(random.uniform(40, 85), 1)
        predicted_future_compliance = round(current_compliance - impact_score * 0.3, 1)
        remediation_target = round(min(100, current_compliance + random.uniform(10, 30)), 1)

        impacts.append({
            "id": hash_id("impact", i),
            "regulationId": src["id"],
            "regulationTitle": src["title"],
            "jurisdiction": src["jurisdiction"],
            "topic": src["topic"],
            "enactmentProbability": src["enactmentProbability"],
            "estimatedEnactment": src["estimatedEnactment"],
            "impactScore": impact_score,
            "impactLevel": "critical" if impact_score > 75 else "high" if impact_score > 50 else "medium" if impact_score > 25 else "low",
            "controlsAffected": controls_affected,
            "existingControlsSatisfied": existing_controls_satisfied,
            "newControlsRequired": new_controls_required,
            "currentCompliance": current_compliance,
            "predictedFutureCompliance": predicted_future_compliance,
            "remediationTarget": remediation_target,
            "complianceGap": round(current_compliance - predicted_future_compliance, 1),
            "remediationEffortDays": remediation_effort_days,
            "costEstimate": cost_estimate,
            "affectedFrameworks": src["affectedFrameworks"],
            "priority": "P0" if impact_score > 75 else "P1" if impact_score > 50 else "P2" if impact_score > 25 else "P3",
        })

    impacts.sort(key=lambda x: x["impactScore"], reverse=True)
    return {"impacts": impacts, "totalImpacts": len(impacts)}


def generate_temporal_forecast():
    """Generate 90-day compliance trajectory and resource demand forecast."""
    # Framework-level trajectories
    frameworks = ["HIPAA", "GDPR", "SOC2", "PCI-DSS", "EU-AI-ACT", "ISO27001", "SEC"]
    trajectories = []
    for fw in frameworks:
        current_score = round(random.uniform(72, 92), 1)
        velocity = round(random.uniform(-0.5, 2.0), 2)  # points per day
        acceleration = round(random.uniform(-0.05, 0.15), 3)
        points = []
        for day in range(0, 91, 7):
            predicted = round(clamp(current_score + velocity * day + 0.5 * acceleration * day * day, 50, 100), 1)
            confidence = round(max(0.60, 0.95 - day * 0.003), 2)
            points.append({
                "day": day,
                "predictedScore": predicted,
                "confidenceInterval": round((1 - confidence) * 15, 1),
                "confidence": confidence,
            })
        trajectories.append({
            "framework": fw,
            "currentScore": current_score,
            "velocity": velocity,
            "acceleration": acceleration,
            "trend": "improving" if velocity > 0.5 else "stable" if velocity > -0.3 else "declining",
            "projected90Day": points[-1]["predictedScore"],
            "trajectoryPoints": points,
        })

    # Resource demand forecast
    resource_demands = []
    resource_types = ["compliance_analysts", "legal_counsel", "security_engineers", "auditors", "ai_governance_specialists"]
    for rt in resource_types:
        current_fte = round(random.uniform(1.0, 12.0), 1)
        demand_change = round(random.uniform(-1.5, 3.0), 1)
        resource_demands.append({
            "resourceType": rt,
            "currentFTE": current_fte,
            "projectedFTE90Day": round(max(0.5, current_fte + demand_change), 1),
            "change": demand_change,
            "changePercent": round((demand_change / current_fte) * 100, 1),
            "rationale": random.choice([
                "Regulatory volume increase",
                "New framework adoption",
                "AI governance requirements",
                "Cross-border compliance complexity",
                "Enforcement action preparation",
            ]),
        })

    # Attractor landscape
    attractors = []
    for fw in frameworks:
        pull_strength = round(random.uniform(0.3, 0.95), 2)
        direction = random.choice(["positive", "neutral", "negative"])
        attractors.append({
            "framework": fw,
            "pullStrength": pull_strength,
            "direction": direction,
            "tensionWith": random.choice([f for f in frameworks if f != fw]),
            "tensionScore": round(random.uniform(0.1, 0.6), 2),
        })

    return {
        "frameworkTrajectories": trajectories,
        "resourceDemands": resource_demands,
        "attractorLandscape": attractors,
        "forecastHorizonDays": 90,
        "overallVelocity": round(sum(t["velocity"] for t in trajectories) / len(trajectories), 2),
        "overallAcceleration": round(sum(t["acceleration"] for t in trajectories) / len(trajectories), 3),
        "systemTrend": "improving" if sum(t["velocity"] for t in trajectories) > 0 else "stable" if sum(t["velocity"] for t in trajectories) > -2 else "declining",
    }


def generate_predictive_intelligence():
    """Top-level entry point for Stage 10."""
    signals = generate_regulatory_signals()
    radar = generate_horizon_radar()
    propagation = generate_propagation_graph()
    impact = generate_impact_simulation()
    forecast = generate_temporal_forecast()

    # Compute summary statistics
    high_probability_count = len([s for s in signals if s["enactmentProbability"] > 0.7])
    critical_impacts = len([imp for imp in impact["impacts"] if imp["impactLevel"] == "critical"])
    total_propagated = propagation["totalPropagatedSignals"]

    statistics = {
        "totalSignals": len(signals),
        "highProbabilitySignals": high_probability_count,
        "criticalSignals": len([s for s in signals if s["estimatedImpact"] == "critical"]),
        "radarClusters": radar["totalClusters"],
        "highestUrgencyTopic": radar["clusters"][0]["topic"] if radar["clusters"] else "N/A",
        "propagationNodes": propagation["totalNodes"],
        "propagationEdges": propagation["totalEdges"],
        "propagatedSignals": total_propagated,
        "impactSimulations": impact["totalImpacts"],
        "criticalImpacts": critical_impacts,
        "totalRemediationEffortDays": sum(imp["remediationEffortDays"] for imp in impact["impacts"]),
        "totalCostEstimate": sum(imp["costEstimate"] for imp in impact["impacts"]),
        "frameworksTrajectoryCount": len(forecast["frameworkTrajectories"]),
        "overallVelocity": forecast["overallVelocity"],
        "systemTrend": forecast["systemTrend"],
    }

    return {
        "runId": hash_id("pred-intel", NOW.isoformat()),
        "generatedAt": NOW.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "signals": signals,
        "horizonRadar": radar,
        "propagationGraph": propagation,
        "impactSimulation": impact,
        "temporalForecast": forecast,
        "statistics": statistics,
    }
