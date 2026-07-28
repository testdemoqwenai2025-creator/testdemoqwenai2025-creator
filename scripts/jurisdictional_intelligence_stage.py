"""
Stage 11: Jurisdictional Intelligence Engine
=============================================
Four interconnected capabilities:

  1. Enhanced State Machine — adds "Legally Ambiguous" and "Strategically Non-Compliant"
     states with fake data silos that execute dynamically.

  2. Jurisdictional Constraint Graph — a full graph where traversing one compliance
     path may close off others, with hypothetical scenarios.

  3. Pareto-optimal Compliance Strategies — when full compliance is impossible,
     surface the trade-off space with quantified risk per strategy.

  4. Regulatory Game Theory Modeling — predict how regulators will respond to
     your compliance posture (cooperative vs. adversarial jurisdictions).
"""

import json
import uuid
import hashlib
import random
import math
from datetime import datetime, timedelta, timezone
from itertools import combinations

NOW = datetime.now(timezone.utc)


def _ts(minutes_ago=0):
    dt = NOW - timedelta(minutes=minutes_ago)
    return dt.strftime("%Y-%m-%dT%H:%M:%S.") + f"{dt.microsecond // 1000:03d}Z"


def _uid():
    return uuid.uuid4().hex[:8].upper()


def _rand_choice(options, weights=None):
    return random.choices(options, weights=weights or [1] * len(options), k=1)[0]


# ═══════════════════════════════════════════════════════════════════════════════
# 1. ENHANCED STATE MACHINE — Two New States with Fake Data Silos
# ═══════════════════════════════════════════════════════════════════════════════

# Full 8-state model
ENHANCED_STATES = [
    "compliant", "at_risk", "non_compliant", "under_remediation",
    "escalated", "audit_pending",
    "legally_ambiguous",       # NEW — regulatory interpretation unclear
    "strategically_non_compliant",  # NEW — deliberate non-compliance with documented rationale
]

ENHANCED_VALID_TRANSITIONS = {
    "compliant":                    ["at_risk", "audit_pending", "legally_ambiguous"],
    "at_risk":                      ["compliant", "non_compliant", "under_remediation", "legally_ambiguous"],
    "non_compliant":                ["under_remediation", "escalated", "strategically_non_compliant"],
    "under_remediation":            ["compliant", "at_risk", "non_compliant", "legally_ambiguous"],
    "escalated":                    ["under_remediation", "non_compliant", "strategically_non_compliant"],
    "audit_pending":                ["compliant", "at_risk", "non_compliant", "legally_ambiguous"],
    "legally_ambiguous":           ["compliant", "at_risk", "non_compliant", "under_remediation", "escalated", "strategically_non_compliant"],
    "strategically_non_compliant":  ["compliant", "under_remediation", "escalated", "legally_ambiguous", "at_risk"],
}

STATE_SCORE_DELTA = {
    "compliant": 25, "at_risk": -15, "non_compliant": -30,
    "under_remediation": -5, "escalated": -25, "audit_pending": -5,
    "legally_ambiguous": -10, "strategically_non_compliant": -20,
}

STATE_DESCRIPTIONS = {
    "compliant": "All regulatory requirements met within defined tolerances.",
    "at_risk": "One or more compliance metrics trending toward breach thresholds.",
    "non_compliant": "Confirmed violation of one or more regulatory requirements.",
    "under_remediation": "Active remediation plan in execution with tracked milestones.",
    "escalated": "Violation severity exceeded auto-remediation capacity; human review required.",
    "audit_pending": "Scheduled or in-progress audit of compliance posture.",
    "legally_ambiguous": "Regulatory language or jurisdictional overlap creates unresolvable interpretation conflict. Requires legal precedent or regulator guidance.",
    "strategically_non_compliant": "Deliberate non-compliance with documented business rationale, accepted risk quantification, and board-level approval. Monitored for regulatory response.",
}

# Fake data silos — each silo populates entities in specific new states
FAKE_DATA_SILOS = [
    {
        "silo_id": "SILO-LA-001",
        "name": "EU-US Data Transfer Ambiguity",
        "jurisdictions": ["GDPR", "CCPA", "US-FEDERAL"],
        "description": "Post-Schrems-II uncertainty: data transfers to US cloud providers lack clear legal basis. EU guidance pending, DPF adequacy challenged by privacy advocates.",
        "entities": [
            {"type": "data_store", "description": "EU Customer PII on US Cloud", "jurisdiction": "GDPR", "target_state": "legally_ambiguous"},
            {"type": "api_endpoint", "description": "Cross-Border Analytics API", "jurisdiction": "GDPR", "target_state": "legally_ambiguous"},
            {"type": "data_store", "description": "Marketing Data Warehouse", "jurisdiction": "CCPA", "target_state": "legally_ambiguous"},
        ],
        "legal_references": ["Schrems II (C-311/18)", "EU-US DPF adequacy decision 2023", "EDPB Recommendations 01/2022"],
        "ambiguity_factors": ["No binding CJEU clarification on DPF validity", "Conflicting national DP authority interpretations", "Pending US reform of FISA 702"],
        "risk_score": 72,
        "created_at": _ts(minutes_ago=120),
        "last_updated": _ts(minutes_ago=5),
    },
    {
        "silo_id": "SILO-LA-002",
        "name": "AI Act High-Risk Classification Dispute",
        "jurisdictions": ["EU-AI-ACT", "Medical Device Reg (MDR)", "HIPAA"],
        "description": "Clinical decision support system classification disputed: FDA considers it Software as Medical Device, EU AI Act classifies as high-risk, HIPAA applies PHI rules. Three overlapping frameworks create compliance deadlock.",
        "entities": [
            {"type": "ai_system", "description": "CDSS Triage Algorithm v3.2", "jurisdiction": "EU-AI-ACT", "target_state": "legally_ambiguous"},
            {"type": "application", "description": "Diagnostic Imaging AI", "jurisdiction": "EU-AI-ACT", "target_state": "legally_ambiguous"},
        ],
        "legal_references": ["EU AI Act Art. 6(1)", "MDR 2017/745 Annex VIII", "HIPAA §164.502"],
        "ambiguity_factors": ["Converging regulatory scope without harmonization", "No joint guidance from EMA/EDPB/ECAI", "Member state transposition variations"],
        "risk_score": 85,
        "created_at": _ts(minutes_ago=72),
        "last_updated": _ts(minutes_ago=12),
    },
    {
        "silo_id": "SILO-SNC-001",
        "name": "Strategic Non-Compliance: Anti-Money Laundering Throttling",
        "jurisdictions": ["BSA/AML", "GDPR", "CCPA"],
        "description": "Board-approved decision to limit transaction monitoring coverage to 87% of threshold (below 100% BSA requirement) because full coverage would violate GDPR minimization and create disproportionate data retention. Risk accepted with $2.4M estimated penalty exposure vs $8.1M compliance cost.",
        "entities": [
            {"type": "infrastructure", "description": "AML Transaction Monitor", "jurisdiction": "BSA/AML", "target_state": "strategically_non_compliant"},
            {"type": "data_store", "description": "SAR Filing Database", "jurisdiction": "BSA/AML", "target_state": "strategically_non_compliant"},
        ],
        "business_rationale": "Full BSA/AML compliance at 100% transaction coverage requires retaining 3.2TB of customer transaction data for 7 years, directly conflicting with GDPR Article 5(1)(c) data minimization. Board calculated $8.1M infrastructure cost vs $2.4M estimated penalty exposure. Risk accepted.",
        "acceptance_documentation": ["Board Resolution BR-2026-0847", "CRO Risk Memo RM-2026-0312", "External Counsel Opinion LCO-2026-0091"],
        "estimated_penalty": 2400000,
        "compliance_cost_avoided": 8100000,
        "risk_acceptance_expiry": "2027-03-31",
        "regulatory_response_prediction": "Medium likelihood of FinCEN enforcement action; low likelihood of criminal referral given documented good-faith conflict analysis.",
        "risk_score": 58,
        "created_at": _ts(minutes_ago=200),
        "last_updated": _ts(minutes_ago=2),
    },
    {
        "silo_id": "SILO-SNC-002",
        "name": "Strategic Non-Compliance: Cookie Consent UI Dark Pattern",
        "jurisdictions": ["GDPR", "ePrivacy Directive", "DMA"],
        "description": "Competitive pressure forces non-compliant cookie consent UX: industry-standard 'Accept All' prominence vs EDPB guidance on equal prominence. Board approved with $4.8M revenue protection vs $1.2M estimated fine exposure.",
        "entities": [
            {"type": "application", "description": "Web Consent Management Platform", "jurisdiction": "GDPR", "target_state": "strategically_non_compliant"},
            {"type": "api_endpoint", "description": "Consent Preference API", "jurisdiction": "ePrivacy", "target_state": "strategically_non_compliant"},
        ],
        "business_rationale": "Implementing fully EDPB-compliant consent UI (equal reject prominence, no bundling) would reduce ad revenue by 34% ($4.8M/yr). Industry competitors use non-compliant patterns. Board accepted $1.2M estimated fine risk as cost of competitive parity.",
        "acceptance_documentation": ["Board Resolution BR-2026-0915", "CMO Revenue Impact Analysis RIA-2026-0044", "DPA Opinion Requested (awaiting response)"],
        "estimated_penalty": 1200000,
        "compliance_cost_avoided": 4800000,
        "risk_acceptance_expiry": "2026-12-31",
        "regulatory_response_prediction": "High likelihood of DPA investigation triggered by competitor complaint; settlement expected within 18 months.",
        "risk_score": 64,
        "created_at": _ts(minutes_ago=150),
        "last_updated": _ts(minutes_ago=8),
    },
]


def generate_enhanced_state_machine(num_transitions=60):
    """Enhanced state machine with 8 states including legally_ambiguous and strategically_non_compliant."""

    # Base entities (existing)
    base_entities = [
        ("data_store", "PHI Database", "HIPAA"),
        ("api_endpoint", "Patient Access API", "HIPAA"),
        ("iam_policy", "Admin Role IAM", "PCI-DSS"),
        ("data_store", "Customer PII Store", "GDPR"),
        ("ai_system", "Loan Decision Model", "EU-AI-ACT"),
        ("infrastructure", "CDE Network Segment", "PCI-DSS"),
        ("application", "Trading Platform", "SEC"),
        ("data_store", "Audit Log Store", "ISO27001"),
    ]

    entities = []
    for i, (etype, edesc, jurisdiction) in enumerate(base_entities):
        eid = f"ENT-{etype.upper()[:3]}-{i+1:03d}"
        entities.append({
            "id": eid,
            "type": etype,
            "description": edesc,
            "jurisdiction": jurisdiction,
            "current_state": "compliant",
            "registered_at": _ts(minutes_ago=240 - i * 10),
            "compliance_score": 100.0,
            "risk_factors": [],
        })

    # Add entities from fake data silos (dynamically populated)
    silo_entities_map = {}  # silo_id -> [entity_ids]
    entity_offset = len(entities)
    for silo in FAKE_DATA_SILOS:
        silo_entity_ids = []
        for j, se in enumerate(silo["entities"]):
            eid = f"ENT-{se['type'].upper()[:3]}-{entity_offset + j + 1:03d}"
            entities.append({
                "id": eid,
                "type": se["type"],
                "description": se["description"],
                "jurisdiction": se["jurisdiction"],
                "current_state": se["target_state"],
                "registered_at": silo["created_at"],
                "compliance_score": max(0, 100 + STATE_SCORE_DELTA.get(se["target_state"], -15)),
                "risk_factors": silo.get("ambiguity_factors", [silo.get("business_rationale", "")]),
                "silo_id": silo["silo_id"],
            })
            silo_entity_ids.append(eid)
            entity_offset += 1
        silo_entities_map[silo["silo_id"]] = silo_entity_ids

    # Generate transitions
    triggers = [
        "regulatory_change_detected", "violation_confirmed", "remediation_started",
        "remediation_completed", "human_approval_granted", "human_approval_denied",
        "audit_initiated", "audit_completed_pass", "audit_completed_fail",
        "risk_threshold_exceeded", "deadline_approaching",
        "legal_ambiguity_detected", "jurisdictional_conflict_identified",
        "strategic_risk_accepted", "board_approval_obtained",
        "regulator_guidance_received", "precedent_established",
        "compliance_cost_exceeds_benefit", "data_silo_triggered",
    ]

    transitions = []
    state_histories = {e["id"]: [e["current_state"]] for e in entities}
    metrics = {
        "transitions": 0, "escalations": 0, "resolutions": 0,
        "invalid_attempts": 0, "ambiguity_entries": 0,
        "strategic_non_compliance_entries": 0, "silo_triggered_transitions": 0,
    }

    for i in range(num_transitions):
        entity = _rand_choice(entities)
        from_state = entity["current_state"]
        valid_targets = ENHANCED_VALID_TRANSITIONS.get(from_state, [])
        if not valid_targets:
            continue
        to_state = _rand_choice(valid_targets)
        trigger = _rand_choice(triggers)
        transition_id = f"TRN-{_uid()}"
        approved_by = None
        if to_state in ("under_remediation", "escalated", "strategically_non_compliant"):
            approved_by = _rand_choice(["cco@company.com", "ciso@company.com", "legal-counsel@company.com", "board@company.com"])

        # Add rationale for strategic non-compliance
        rationale = None
        if to_state == "strategically_non_compliant":
            rationale = _rand_choice([
                "Cost-benefit analysis shows compliance cost exceeds estimated penalty by 3.4x",
                "Competitive parity requires non-compliant posture; industry standard deviation",
                "Regulatory conflict with another jurisdiction makes full compliance impossible",
                "Interim measure pending regulatory reform expected within 12 months",
                "Board-approved risk acceptance with documented financial justification",
            ])
        elif to_state == "legally_ambiguous":
            rationale = _rand_choice([
                "No binding precedent for this regulatory intersection",
                "Conflicting guidance from two regulatory bodies",
                "Jurisdictional overlap creates unresolvable compliance conflict",
                "Awaiting regulatory clarification expected Q1 2027",
                "Legal counsel opinion divided on interpretation",
            ])

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
            "rationale": rationale,
            "timestamp": _ts(minutes_ago=random.randint(0, 200)),
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
        if to_state == "compliant" and from_state not in ("audit_pending",):
            metrics["resolutions"] += 1
        if to_state == "legally_ambiguous":
            metrics["ambiguity_entries"] += 1
        if to_state == "strategically_non_compliant":
            metrics["strategic_non_compliance_entries"] += 1

    transitions.sort(key=lambda t: t["timestamp"], reverse=True)

    # Populate silo dynamic execution status
    silo_status = []
    for silo in FAKE_DATA_SILOS:
        silo_entity_ids = silo_entities_map.get(silo["silo_id"], [])
        silo_transitions = [t for t in transitions if t["entity_id"] in silo_entity_ids]
        silo_status.append({
            **silo,
            "entity_ids": silo_entity_ids,
            "total_entities": len(silo_entity_ids),
            "transition_count": len(silo_transitions),
            "current_states": {eid: next((e["current_state"] for e in entities if e["id"] == eid), "unknown") for eid in silo_entity_ids},
            "status": "active" if len(silo_transitions) > 0 else "dormant",
            "last_transition": silo_transitions[0]["timestamp"] if silo_transitions else None,
        })

    return {
        "entities": entities,
        "total_entities": len(entities),
        "total_transitions": len(transitions),
        "transitions": transitions[:40],
        "state_histories": state_histories,
        "valid_transitions": ENHANCED_VALID_TRANSITIONS,
        "state_descriptions": STATE_DESCRIPTIONS,
        "metrics": metrics,
        "state_distribution": {
            state: len([e for e in entities if e["current_state"] == state])
            for state in ENHANCED_STATES
        },
        "fake_data_silos": FAKE_DATA_SILOS,
        "silo_execution_status": silo_status,
        "new_states_summary": {
            "legally_ambiguous": {
                "count": len([e for e in entities if e["current_state"] == "legally_ambiguous"]),
                "description": STATE_DESCRIPTIONS["legally_ambiguous"],
            },
            "strategically_non_compliant": {
                "count": len([e for e in entities if e["current_state"] == "strategically_non_compliant"]),
                "description": STATE_DESCRIPTIONS["strategically_non_compliant"],
            },
        },
    }


# ═══════════════════════════════════════════════════════════════════════════════
# 2. JURISDICTIONAL CONSTRAINT GRAPH
# ═══════════════════════════════════════════════════════════════════════════════

JURISDICTIONS = [
    {"id": "GDPR", "name": "GDPR / EU Data Protection", "region": "EU/EEA", "cooperative_score": 0.7, "adversarial_score": 0.3},
    {"id": "HIPAA", "name": "HIPAA / US Health Privacy", "region": "US", "cooperative_score": 0.5, "adversarial_score": 0.5},
    {"id": "PCI-DSS", "name": "PCI-DSS Payment Security", "region": "Global", "cooperative_score": 0.8, "adversarial_score": 0.2},
    {"id": "EU-AI-ACT", "name": "EU AI Act", "region": "EU/EEA", "cooperative_score": 0.4, "adversarial_score": 0.6},
    {"id": "SEC", "name": "SEC Cyber Disclosure", "region": "US", "cooperative_score": 0.6, "adversarial_score": 0.4},
    {"id": "CCPA", "name": "CCPA / CPRA Privacy", "region": "US-CA", "cooperative_score": 0.65, "adversarial_score": 0.35},
    {"id": "ISO27001", "name": "ISO 27001 InfoSec", "region": "Global", "cooperative_score": 0.9, "adversarial_score": 0.1},
    {"id": "BSA-AML", "name": "BSA/AML Anti-Money Laundering", "region": "US", "cooperative_score": 0.45, "adversarial_score": 0.55},
    {"id": "SOC2", "name": "SOC 2 Type II", "region": "US", "cooperative_score": 0.85, "adversarial_score": 0.15},
    {"id": "NIST-CSF", "name": "NIST Cybersecurity Framework", "region": "US", "cooperative_score": 0.88, "adversarial_score": 0.12},
]

# Constraint edges: path A closes off path B
CONSTRAINT_EDGES = [
    {"source": "GDPR", "target": "BSA-AML", "type": "data_minimization_vs_retention",
     "description": "GDPR data minimization (Art. 5(1)(c)) conflicts with BSA/AML 5-7 year transaction retention mandate.",
     "severity": "critical", "mutually_exclusive": False, "trade_off_possible": True},
    {"source": "GDPR", "target": "SEC", "type": "right_to_erasure_vs_disclosure",
     "description": "GDPR right to erasure (Art. 17) conflicts with SEC mandatory 4-year cybersecurity disclosure retention.",
     "severity": "high", "mutually_exclusive": False, "trade_off_possible": True},
    {"source": "EU-AI-ACT", "target": "HIPAA", "type": "ai_transparency_vs_phi_protection",
     "description": "EU AI Act model explainability requirements may expose PHI training data, conflicting with HIPAA minimum necessary standard.",
     "severity": "high", "mutually_exclusive": False, "trade_off_possible": True},
    {"source": "GDPR", "target": "CCPA", "type": "consent_model_divergence",
     "description": "GDPR opt-in consent model vs CCPA opt-out model creates incompatible consent management architectures.",
     "severity": "medium", "mutually_exclusive": False, "trade_off_possible": True},
    {"source": "PCI-DSS", "target": "EU-AI-ACT", "type": "log_retention_vs_ai_training_data",
     "description": "PCI-DSS 1-year log retention creates GDPR training data exposure risk when used for AI model development under EU AI Act.",
     "severity": "medium", "mutually_exclusive": False, "trade_off_possible": True},
    {"source": "BSA-AML", "target": "HIPAA", "type": "transaction_monitoring_vs_phi_minimization",
     "description": "BSA/AML requires monitoring all transactions including healthcare payments; HIPAA restricts PHI access scope.",
     "severity": "critical", "mutually_exclusive": False, "trade_off_possible": False},
    {"source": "GDPR", "target": "EU-AI-ACT", "type": "automated_decision_vs_human_oversight",
     "description": "GDPR Art. 22 right to human review of automated decisions may conflict with EU AI Act permitted fully automated high-risk systems.",
     "severity": "high", "mutually_exclusive": False, "trade_off_possible": True},
    {"source": "SEC", "type": "ISO27001", "target": "SOC2", "type": "audit_frequency_divergence",
     "description": "SEC requires continuous cybersecurity monitoring; ISO27001/SOC2 prescribe periodic assessment cycles.",
     "severity": "low", "mutually_exclusive": False, "trade_off_possible": True},
    {"source": "CCPA", "target": "BSA-AML", "type": "consumer_rights_vs_sar_confidentiality",
     "description": "CCPA consumer data access rights conflict with BSA/AML SAR confidentiality provisions (31 USC 5318(g)(2)).",
     "severity": "critical", "mutually_exclusive": True, "trade_off_possible": False},
    {"source": "NIST-CSF", "target": "PCI-DSS", "type": "framework_alignment_gap",
     "description": "NIST CSF and PCI-DSS have overlapping but non-identical control sets, creating redundant compliance effort.",
     "severity": "low", "mutually_exclusive": False, "trade_off_possible": True},
    {"source": "GDPR", "target": "NIST-CSF", "type": "privacy_by_design_vs_security_first",
     "description": "GDPR privacy-by-design (Art. 25) prioritizes data protection; NIST CSF prioritizes security outcomes which may conflict.",
     "severity": "medium", "mutually_exclusive": False, "trade_off_possible": True},
]

# Hypothetical scenarios traversing the constraint graph
HYPOTHETICAL_SCENARIOS = [
    {
        "scenario_id": "HYP-001",
        "name": "Fintech Cross-Border Expansion",
        "description": "A US fintech expanding to EU must satisfy GDPR, PCI-DSS, and BSA/AML simultaneously. The GDPR-BSA/AML edge (data minimization vs retention) creates the critical constraint.",
        "affected_jurisdictions": ["GDPR", "BSA-AML", "PCI-DSS", "CCPA"],
        "constraint_path": ["GDPR → BSA-AML (critical)", "GDPR → CCPA (medium)", "CCPA → BSA-AML (critical)"],
        "closure_analysis": "Full GDPR compliance requires data minimization that conflicts with BSA/AML retention. CCPA-BSA/AML is mutually exclusive (SAR confidentiality). Optimal path: regional data partitioning with EU-only minimization.",
        "estimated_risk_per_jurisdiction": {
            "GDPR": {"penalty_max": "4% global revenue", "probability": 0.35, "effort_months": 8},
            "BSA-AML": {"penalty_max": "$500K per violation", "probability": 0.55, "effort_months": 12},
            "PCI-DSS": {"penalty_max": "$100K/month", "probability": 0.15, "effort_months": 4},
            "CCPA": {"penalty_max": "$7,500 per record", "probability": 0.25, "effort_months": 6},
        },
        "optimal_strategy": "Regional partitioning with EU-only GDPR full compliance and US-only BSA/AML compliance via data silo separation.",
    },
    {
        "scenario_id": "HYP-002",
        "name": "Healthcare AI Diagnostic Tool",
        "description": "An AI-powered diagnostic tool deployed across US and EU must comply with HIPAA, EU AI Act, GDPR, and potentially FDA medical device regulations.",
        "affected_jurisdictions": ["HIPAA", "EU-AI-ACT", "GDPR", "ISO27001"],
        "constraint_path": ["EU-AI-ACT → HIPAA (high)", "GDPR → EU-AI-ACT (high)"],
        "closure_analysis": "EU AI Act explainability may expose PHI; HIPAA minimum necessary restricts PHI access. GDPR-EU AI Act automated decision rights may conflict. Requires explainability engine that respects PHI boundaries.",
        "estimated_risk_per_jurisdiction": {
            "HIPAA": {"penalty_max": "$1.5M per violation category", "probability": 0.40, "effort_months": 10},
            "EU-AI-ACT": {"penalty_max": "€15M or 3% revenue", "probability": 0.50, "effort_months": 14},
            "GDPR": {"penalty_max": "€20M or 4% global revenue", "probability": 0.30, "effort_months": 8},
            "ISO27001": {"penalty_max": "Certification loss", "probability": 0.10, "effort_months": 3},
        },
        "optimal_strategy": "PHI-aware explainability layer with synthetic data proxy for EU AI Act demonstrations; regional model instances.",
    },
    {
        "scenario_id": "HYP-003",
        "name": "Ad-Tech Data Broker Compliance",
        "description": "A global ad-tech data broker must manage GDPR, CCPA, ePrivacy, and SOC2 obligations while maximizing data utility for ad targeting.",
        "affected_jurisdictions": ["GDPR", "CCPA", "SOC2", "SEC"],
        "constraint_path": ["GDPR → CCPA (medium)", "GDPR → SEC (high)"],
        "closure_analysis": "GDPR consent-based model vs CCPA opt-out creates incompatible consent architectures. GDPR erasure rights conflict with SEC disclosure retention. Optimal: unified consent layer with regional variants.",
        "estimated_risk_per_jurisdiction": {
            "GDPR": {"penalty_max": "4% global revenue", "probability": 0.60, "effort_months": 6},
            "CCPA": {"penalty_max": "$7,500 per intentional violation", "probability": 0.45, "effort_months": 4},
            "SOC2": {"penalty_max": "Client contract breach", "probability": 0.20, "effort_months": 5},
            "SEC": {"penalty_max": "Undetermined (emerging rule)", "probability": 0.15, "effort_months": 8},
        },
        "optimal_strategy": "Dual consent architecture (opt-in EU, opt-out CA) with unified preference store; data residency segregation.",
    },
]


def generate_jurisdictional_constraint_graph():
    """Build full constraint graph with hypothetical scenario traversal."""

    # Build adjacency and closure info
    graph_adjacency = {j["id"]: [] for j in JURISDICTIONS}
    closure_effects = []  # When you comply with source, these targets become harder

    for edge in CONSTRAINT_EDGES:
        source = edge["source"]
        targets = edge["target"] if isinstance(edge["target"], list) else [edge["target"]]
        for target in targets:
            if target in graph_adjacency:
                graph_adjacency[source].append({
                    "target": target,
                    "type": edge["type"],
                    "severity": edge["severity"],
                    "mutually_exclusive": edge["mutually_exclusive"],
                    "trade_off_possible": edge["trade_off_possible"],
                    "description": edge["description"],
                })
                closure_effects.append({
                    "source_jurisdiction": source,
                    "constrained_jurisdiction": target,
                    "constraint_type": edge["type"],
                    "severity": edge["severity"],
                    "closure_probability": round(random.uniform(0.3, 0.85), 2),
                    "description": edge["description"],
                })

    # Path analysis: enumerate constraint chains
    path_chains = []
    for start in JURISDICTIONS:
        visited = set()
        queue = [(start["id"], [start["id"]])]
        while queue:
            current, path = queue.pop(0)
            if current in visited and len(path) > 1:
                continue
            visited.add(current)
            for adj in graph_adjacency.get(current, []):
                new_path = path + [adj["target"]]
                if len(new_path) >= 2:
                    # Compute max severity along the chain
                    chain_sevs = []
                    for ci in range(len(new_path) - 1):
                        edge_sevs = [
                            a["severity"] for a in graph_adjacency.get(new_path[ci], [])
                            if a["target"] == new_path[ci + 1]
                        ]
                        if edge_sevs:
                            chain_sevs.append(edge_sevs[0])
                    sev_rank = {"critical": 4, "high": 3, "medium": 2, "low": 1}
                    max_sev = max(chain_sevs, key=lambda s: sev_rank.get(s, 0)) if chain_sevs else "low"
                    path_chains.append({
                        "chain": " → ".join(new_path),
                        "length": len(new_path),
                        "jurisdictions": new_path,
                        "max_severity": max_sev,
                    })
                if adj["target"] not in visited:
                    queue.append((adj["target"], new_path))

    # Deduplicate and limit
    seen_chains = set()
    unique_chains = []
    for pc in path_chains:
        if pc["chain"] not in seen_chains:
            seen_chains.add(pc["chain"])
            unique_chains.append(pc)
    unique_chains.sort(key=lambda x: x["length"], reverse=True)

    return {
        "jurisdictions": JURISDICTIONS,
        "total_jurisdictions": len(JURISDICTIONS),
        "constraint_edges": CONSTRAINT_EDGES,
        "total_constraints": len(CONSTRAINT_EDGES),
        "graph_adjacency": graph_adjacency,
        "closure_effects": closure_effects[:15],
        "path_chains": unique_chains[:30],
        "hypothetical_scenarios": HYPOTHETICAL_SCENARIOS,
        "constraint_severity_breakdown": {
            sev: len([e for e in CONSTRAINT_EDGES if e["severity"] == sev])
            for sev in ["critical", "high", "medium", "low"]
        },
        "mutually_exclusive_pairs": [
            {"source": e["source"], "target": e["target"], "description": e["description"]}
            for e in CONSTRAINT_EDGES if e["mutually_exclusive"]
        ],
    }


# ═══════════════════════════════════════════════════════════════════════════════
# 3. PARETO-OPTIMAL COMPLIANCE STRATEGIES
# ═══════════════════════════════════════════════════════════════════════════════

def generate_pareto_strategies():
    """When full compliance is impossible, surface the Pareto front with quantified risk."""

    strategies = [
        {
            "strategy_id": "STRAT-001",
            "name": "Maximum EU Compliance (GDPR First)",
            "description": "Prioritize full GDPR compliance across all operations. Accept partial non-compliance with US-specific regulations (BSA/AML, SEC) where conflicts are irreconcilable.",
            "compliance_profile": {
                "GDPR": 98, "HIPAA": 75, "PCI-DSS": 95, "EU-AI-ACT": 92,
                "SEC": 60, "CCPA": 88, "ISO27001": 97, "BSA-AML": 45,
                "SOC2": 90, "NIST-CSF": 94,
            },
            "total_compliance_score": round(sum([98, 75, 95, 92, 60, 88, 97, 45, 90, 94]) / 10, 1),
            "implementation_cost_usd": 4200000,
            "ongoing_annual_cost_usd": 1800000,
            "estimated_penalty_exposure_usd": 3100000,
            "total_risk_score": 62,
            "risk_breakdown": {
                "regulatory_fine_risk": 45,
                "reputational_risk": 30,
                "operational_disruption_risk": 25,
                "legal_challenge_risk": 55,
                "customer_trust_risk": 15,
            },
            "effort_months": 14,
            "pareto_optimal": True,
            "dominates": ["STRAT-004"],
            "trade_offs": [
                "BSA/AML coverage reduced to 45% — SAR filing gaps in cross-border transactions",
                "SEC cyber disclosure compliance at 60% — insufficient evidence retention for 4-year requirement",
                "Higher cost due to EU data residency requirements ($1.2M infrastructure)",
            ],
            "recommended_for": "Companies with EU revenue > 40% of total revenue",
        },
        {
            "strategy_id": "STRAT-002",
            "name": "Balanced Multi-Jurisdiction (Harmonized)",
            "description": "Achieve 80%+ compliance across all jurisdictions through harmonized controls. Accept no jurisdiction below 70%. Highest total compliance but requires custom middleware.",
            "compliance_profile": {
                "GDPR": 85, "HIPAA": 82, "PCI-DSS": 88, "EU-AI-ACT": 80,
                "SEC": 78, "CCPA": 85, "ISO27001": 90, "BSA-AML": 72,
                "SOC2": 87, "NIST-CSF": 88,
            },
            "total_compliance_score": round(sum([85, 82, 88, 80, 78, 85, 90, 72, 87, 88]) / 10, 1),
            "implementation_cost_usd": 5800000,
            "ongoing_annual_cost_usd": 2400000,
            "estimated_penalty_exposure_usd": 1800000,
            "total_risk_score": 42,
            "risk_breakdown": {
                "regulatory_fine_risk": 30,
                "reputational_risk": 20,
                "operational_disruption_risk": 35,
                "legal_challenge_risk": 40,
                "customer_trust_risk": 10,
            },
            "effort_months": 18,
            "pareto_optimal": True,
            "dominates": ["STRAT-003", "STRAT-004"],
            "trade_offs": [
                "Highest implementation cost ($5.8M) due to custom harmonization middleware",
                "Longest timeline (18 months) — may miss regulatory deadlines",
                "Requires cross-functional team of 15+ specialists",
                "No jurisdiction achieves 95%+ — may trigger enhanced scrutiny in all jurisdictions",
            ],
            "recommended_for": "Large enterprises with presence in 5+ jurisdictions and >$500M revenue",
        },
        {
            "strategy_id": "STRAT-003",
            "name": "US-First Compliance (Minimal EU)",
            "description": "Prioritize US regulations (BSA/AML, SEC, HIPAA, PCI-DSS). Achieve minimum viable GDPR compliance (70%) to maintain EU market access.",
            "compliance_profile": {
                "GDPR": 70, "HIPAA": 95, "PCI-DSS": 98, "EU-AI-ACT": 55,
                "SEC": 92, "CCPA": 80, "ISO27001": 85, "BSA-AML": 95,
                "SOC2": 95, "NIST-CSF": 92,
            },
            "total_compliance_score": round(sum([70, 95, 98, 55, 92, 80, 85, 95, 95, 92]) / 10, 1),
            "implementation_cost_usd": 3200000,
            "ongoing_annual_cost_usd": 1400000,
            "estimated_penalty_exposure_usd": 5200000,
            "total_risk_score": 58,
            "risk_breakdown": {
                "regulatory_fine_risk": 65,
                "reputational_risk": 45,
                "operational_disruption_risk": 20,
                "legal_challenge_risk": 70,
                "customer_trust_risk": 40,
            },
            "effort_months": 10,
            "pareto_optimal": False,
            "dominates": [],
            "dominated_by": "STRAT-002",
            "trade_offs": [
                "GDPR at 70% risks €20M+ fines — high regulatory fine risk",
                "EU AI Act at 55% risks €15M+ fines — AI systems may be banned in EU",
                "Reputational damage from EU privacy advocacy groups",
                "May face EU market access restrictions",
            ],
            "recommended_for": "US-centric companies with < 15% EU revenue",
        },
        {
            "strategy_id": "STRAT-004",
            "name": "Minimum Viable Compliance (Cost Optimized)",
            "description": "Achieve minimum compliance thresholds in all jurisdictions. Optimize for lowest cost rather than highest compliance score.",
            "compliance_profile": {
                "GDPR": 72, "HIPAA": 70, "PCI-DSS": 78, "EU-AI-ACT": 65,
                "SEC": 68, "CCPA": 72, "ISO27001": 75, "BSA-AML": 55,
                "SOC2": 72, "NIST-CSF": 75,
            },
            "total_compliance_score": round(sum([72, 70, 78, 65, 68, 72, 75, 55, 72, 75]) / 10, 1),
            "implementation_cost_usd": 1800000,
            "ongoing_annual_cost_usd": 900000,
            "estimated_penalty_exposure_usd": 7800000,
            "total_risk_score": 78,
            "risk_breakdown": {
                "regulatory_fine_risk": 85,
                "reputational_risk": 60,
                "operational_disruption_risk": 15,
                "legal_challenge_risk": 80,
                "customer_trust_risk": 55,
            },
            "effort_months": 6,
            "pareto_optimal": False,
            "dominates": [],
            "dominated_by": "STRAT-001, STRAT-002",
            "trade_offs": [
                "BSA/AML at 55% — significant SAR filing gaps, high FinCEN enforcement risk",
                "EU AI Act at 65% — below high-risk system threshold, potential market ban",
                "Highest penalty exposure ($7.8M) across all strategies",
                "Reputational risk from multiple below-threshold scores",
            ],
            "recommended_for": "Early-stage startups with limited budget and single-jurisdiction focus",
        },
        {
            "strategy_id": "STRAT-005",
            "name": "Privacy-First (Maximum Consumer Trust)",
            "description": "Maximize privacy and consumer rights compliance (GDPR, CCPA) while maintaining acceptable levels in security frameworks. Best for privacy-focused brands.",
            "compliance_profile": {
                "GDPR": 96, "HIPAA": 80, "PCI-DSS": 82, "EU-AI-ACT": 88,
                "SEC": 65, "CCPA": 96, "ISO27001": 80, "BSA-AML": 50,
                "SOC2": 82, "NIST-CSF": 80,
            },
            "total_compliance_score": round(sum([96, 80, 82, 88, 65, 96, 80, 50, 82, 80]) / 10, 1),
            "implementation_cost_usd": 3900000,
            "ongoing_annual_cost_usd": 1700000,
            "estimated_penalty_exposure_usd": 4200000,
            "total_risk_score": 55,
            "risk_breakdown": {
                "regulatory_fine_risk": 50,
                "reputational_risk": 10,
                "operational_disruption_risk": 30,
                "legal_challenge_risk": 60,
                "customer_trust_risk": 5,
            },
            "effort_months": 12,
            "pareto_optimal": True,
            "dominates": ["STRAT-003", "STRAT-004"],
            "trade_offs": [
                "BSA/AML at 50% — AML monitoring below FinCEN expectations",
                "SEC at 65% — insufficient cybersecurity evidence for disclosure requirements",
                "Highest consumer trust score but lowest financial regulatory compliance",
                "Privacy infrastructure cost premium of ~$600K over baseline",
            ],
            "recommended_for": "B2C companies where consumer trust is the primary revenue driver",
        },
    ]

    # Compute Pareto front (strategies where no other strategy has both higher compliance AND lower risk)
    pareto_front = [s for s in strategies if s.get("pareto_optimal", False)]

    return {
        "strategies": strategies,
        "total_strategies": len(strategies),
        "pareto_front": pareto_front,
        "pareto_front_count": len(pareto_front),
        "recommended_strategy": "STRAT-002",
        "cost_range_usd": {
            "min": min(s["implementation_cost_usd"] for s in strategies),
            "max": max(s["implementation_cost_usd"] for s in strategies),
        },
        "risk_range": {
            "min": min(s["total_risk_score"] for s in strategies),
            "max": max(s["total_risk_score"] for s in strategies),
        },
        "jurisdiction_coverage": {
            j["id"]: [s["compliance_profile"][j["id"]] for s in strategies]
            for j in JURISDICTIONS if j["id"] in strategies[0]["compliance_profile"]
        },
        "decision_matrix": {
            "criteria": ["Total Compliance", "Implementation Cost", "Annual Cost", "Penalty Exposure", "Risk Score", "Timeline"],
            "weights": [0.30, 0.20, 0.15, 0.15, 0.10, 0.10],
        },
    }


# ═══════════════════════════════════════════════════════════════════════════════
# 4. REGULATORY GAME THEORY MODELING
# ═══════════════════════════════════════════════════════════════════════════════

def generate_game_theory_model():
    """Predict how regulators will respond to compliance posture."""

    # Regulator profiles (cooperative vs adversarial)
    regulator_profiles = [
        {
            "jurisdiction": "GDPR",
            "regulator": "European Data Protection Board (EDPB)",
            "stance": "Adversarial-Protective",
            "cooperative_probability": 0.35,
            "adversarial_probability": 0.65,
            "typical_response_time_months": 6,
            "enforcement_style": "Proactive — initiates investigations based on public reports and complaints",
            "cooperative_signals": ["Proactive DPO engagement", "Prior binding corporate rules", "Standard contractual clauses in place", "Data Protection Impact Assessments completed"],
            "adversarial_signals": ["No DPO appointment", "Cross-border transfers without adequacy", "Consumer complaints filed", "Prior enforcement history"],
            "game_theory_posture": "Tit-for-tat with bias toward punishment — cooperation rewarded only after sustained good behavior",
            "likely_response_matrix": {
                "full_compliance": {"action": "No action", "probability": 0.85, "cost_impact": 0},
                "partial_compliance": {"action": "Warning + improvement notice", "probability": 0.60, "cost_impact": 50000},
                "non_compliance": {"action": "Formal investigation", "probability": 0.75, "cost_impact": 500000},
                "strategic_non_compliance": {"action": "Enhanced investigation + precedent-setting fine", "probability": 0.80, "cost_impact": 5000000},
            },
        },
        {
            "jurisdiction": "BSA-AML",
            "regulator": "FinCEN",
            "stance": "Adversarial-Mandatory",
            "cooperative_probability": 0.20,
            "adversarial_probability": 0.80,
            "typical_response_time_months": 3,
            "enforcement_style": "Mandatory — zero tolerance for SAR filing gaps; automated detection of transaction monitoring deficiencies",
            "cooperative_signals": ["SAR filing rate > 95%", "Independent AML audit completed", "BSA officer appointed", "Transaction monitoring covers all products"],
            "adversarial_signals": ["SAR filing gaps", "No independent audit", "Transaction monitoring below threshold", "Customer due diligence deficiencies"],
            "game_theory_posture": "Grim trigger — any deviation triggers full enforcement cascade; cooperation must be absolute",
            "likely_response_matrix": {
                "full_compliance": {"action": "No action", "probability": 0.90, "cost_impact": 0},
                "partial_compliance": {"action": "Civil money penalty + consent order", "probability": 0.70, "cost_impact": 500000},
                "non_compliance": {"action": "Criminal referral + civil penalty", "probability": 0.85, "cost_impact": 2000000},
                "strategic_non_compliance": {"action": "Criminal prosecution + enterprise-wide consent order", "probability": 0.90, "cost_impact": 10000000},
            },
        },
        {
            "jurisdiction": "EU-AI-ACT",
            "regulator": "EU AI Office (ECAI)",
            "stance": "Uncertain-Evolving",
            "cooperative_probability": 0.50,
            "adversarial_probability": 0.50,
            "typical_response_time_months": 12,
            "enforcement_style": "Developing — office established 2024, enforcement patterns still forming; expected to be principles-based initially",
            "cooperative_signals": ["Proactive conformity assessment", "Technical documentation published", "Human oversight mechanisms in place", "Registration in EU database"],
            "adversarial_signals": ["No conformity assessment", "High-risk AI deployed without registration", "Insufficient explainability", "No human oversight"],
            "game_theory_posture": "Pavlov — cooperate if you cooperated last round; defect if you defected. Establishes precedent early.",
            "likely_response_matrix": {
                "full_compliance": {"action": "No action / certification renewal", "probability": 0.75, "cost_impact": 0},
                "partial_compliance": {"action": "Warning + conformity assessment request", "probability": 0.55, "cost_impact": 200000},
                "non_compliance": {"action": "Market withdrawal order", "probability": 0.65, "cost_impact": 3000000},
                "strategic_non_compliance": {"action": "Precedent-setting fine + public naming", "probability": 0.70, "cost_impact": 15000000},
            },
        },
        {
            "jurisdiction": "SEC",
            "regulator": "SEC Division of Corporation Finance",
            "stance": "Cooperative-Guidance",
            "cooperative_probability": 0.70,
            "adversarial_probability": 0.30,
            "typical_response_time_months": 8,
            "enforcement_style": "Guidance-first — issues interpretive guidance before enforcement; encourages self-reporting",
            "cooperative_signals": ["Timely 8-K/6-K filings", "Proactive cybersecurity disclosure", "CISO reporting to board", "External audit completed"],
            "adversarial_signals": ["Material cybersecurity incident not disclosed within 4 days", "No CISO/board reporting", "Inadequate policies and procedures", "Prior SEC comment letters unresolved"],
            "game_theory_posture": "Generous tit-for-tat — rewards good-faith compliance efforts even if imperfect; punishes concealment severely",
            "likely_response_matrix": {
                "full_compliance": {"action": "No action", "probability": 0.90, "cost_impact": 0},
                "partial_compliance": {"action": "Comment letter + guidance", "probability": 0.50, "cost_impact": 25000},
                "non_compliance": {"action": "Investigation + civil injunction", "probability": 0.45, "cost_impact": 1000000},
                "strategic_non_compliance": {"action": "Enforcement action + monetary penalty", "probability": 0.55, "cost_impact": 5000000},
            },
        },
        {
            "jurisdiction": "CCPA",
            "regulator": "California Privacy Protection Agency (CPPA)",
            "stance": "Adversarial-Consumer Advocacy",
            "cooperative_probability": 0.40,
            "adversarial_probability": 0.60,
            "typical_response_time_months": 10,
            "enforcement_style": "Consumer-advocacy-driven — initiates investigations based on consumer complaints; parallel enforcement with AG possible",
            "cooperative_signals": ["Privacy policy updated per CPRA", "Global opt-out mechanism functional", "Data broker registration current", "Risk assessment completed"],
            "adversarial_signals": ["Consumer complaints > 100/month", "No global opt-out", "Dark patterns in consent UX", "Data broker registration lapsed"],
            "game_theory_posture": "Bayesian updating — adjusts enforcement intensity based on observed compliance trajectory; punishes repeat offenders exponentially",
            "likely_response_matrix": {
                "full_compliance": {"action": "No action", "probability": 0.80, "cost_impact": 0},
                "partial_compliance": {"action": "Notice of non-compliance + cure period", "probability": 0.55, "cost_impact": 75000},
                "non_compliance": {"action": "Formal investigation + civil penalty", "probability": 0.65, "cost_impact": 2500000},
                "strategic_non_compliance": {"action": "Exemplary fine + public enforcement action", "probability": 0.70, "cost_impact": 7500000},
            },
        },
    ]

    # Nash Equilibrium analysis for multi-jurisdiction compliance
    nash_equilibrium = {
        "description": "In a multi-jurisdiction game where regulators cannot coordinate, the Nash equilibrium occurs when the organization's compliance strategy is such that no single regulator can improve their outcome by unilaterally changing their enforcement posture.",
        "equilibrium_state": "Partial cooperative compliance in cooperative jurisdictions (SEC, ISO, NIST, SOC2) + maximum feasible compliance in adversarial jurisdictions (BSA-AML, GDPR) + strategic non-compliance only where mutually exclusive constraints make full compliance mathematically impossible.",
        "equilibrium_conditions": [
            "Regulators act independently with no enforcement coordination",
            "Organization has perfect information about each regulator's enforcement probability",
            "Penalty exposure is less than compliance cost for at least one mutually exclusive pair",
            "Regulators cannot observe compliance cost constraints (asymmetric information)",
        ],
        "deviation_analysis": [
            {"deviation": "Reduce GDPR compliance by 10%", "consequence": "EDPB switches to adversarial posture with 0.65 probability; expected cost increase: $3.2M", "rational": False},
            {"deviation": "Increase BSA-AML compliance by 15%", "consequence": "Requires GDPR minimization waiver; EDPB investigation probability rises to 0.40; expected net cost: $1.8M", "rational": False},
            {"deviation": "Maintain current posture with documented conflict analysis", "consequence": "All regulators maintain current enforcement probability; total expected penalty: $2.1M (optimal)", "rational": True},
        ],
    }

    # Regulator interaction prediction (how regulators influence each other)
    regulator_interactions = [
        {"source": "GDPR", "target": "CCPA", "type": "precedent_spillover", "description": "GDPR enforcement actions influence CPPA enforcement priorities. After GDPR fines, CPPA increases enforcement probability by ~15%.", "influence_strength": 0.75},
        {"source": "GDPR", "target": "EU-AI-ACT", "type": "institutional_alignment", "description": "EDPB and EU AI Office share enforcement philosophy. GDPRprecedent directly shapes AI Act enforcement approach.", "influence_strength": 0.85},
        {"source": "SEC", "target": "BSA-AML", "type": "information_sharing", "description": "SEC-BSA/AML information sharing agreements. SEC investigation findings often trigger FinCEN review.", "influence_strength": 0.60},
        {"source": "BSA-AML", "target": "GDPR", "type": "conflict_amplification", "description": "BSA/AML enforcement actions that require data retention trigger GDPR complaints, increasing cross-jurisdictional enforcement pressure.", "influence_strength": 0.70},
        {"source": "EU-AI-ACT", "target": "SEC", "type": "regulation_import", "description": "EU AI Act precedent influences SEC thinking on AI disclosure requirements for US companies.", "influence_strength": 0.40},
    ]

    # Simulate a multi-round game (10 rounds)
    rounds = []
    posture = {j: 0.80 for j in ["GDPR", "BSA-AML", "EU-AI-ACT", "SEC", "CCPA"]}
    for round_num in range(1, 11):
        round_events = []
        total_penalty = 0
        for j_id in posture:
            profile = next((p for p in regulator_profiles if p["jurisdiction"] == j_id), None)
            if not profile:
                continue
            # Determine regulator response based on current posture
            if posture[j_id] >= 0.90:
                response_key = "full_compliance"
            elif posture[j_id] >= 0.70:
                response_key = "partial_compliance"
            elif posture[j_id] >= 0.50:
                response_key = "non_compliance"
            else:
                response_key = "strategic_non_compliance"

            response = profile["likely_response_matrix"].get(response_key, {})
            action = response.get("action", "Monitoring")
            prob = response.get("probability", 0.3)
            cost = response.get("cost_impact", 0)

            if random.random() < prob:
                actual_cost = cost
                total_penalty += actual_cost
                round_events.append({
                    "jurisdiction": j_id,
                    "posture_level": round(posture[j_id] * 100, 1),
                    "response": action,
                    "cost_incurred": actual_cost,
                    "regulator": profile["regulator"],
                })

            # Regulator interaction spillover effects
            for interaction in regulator_interactions:
                if interaction["source"] == j_id:
                    affected = interaction["target"]
                    if affected in posture and posture[affected] < 0.80:
                        posture[affected] = min(1.0, posture[affected] + 0.02 * interaction["influence_strength"])

        # Organization adjusts posture based on penalty pressure
        for j_id in posture:
            if total_penalty > 1000000 and posture[j_id] < 0.95:
                posture[j_id] = min(1.0, posture[j_id] + random.uniform(0.01, 0.05))

        rounds.append({
            "round": round_num,
            "total_penalty_usd": total_penalty,
            "events_count": len(round_events),
            "events": round_events[:3],  # Limit to prevent bloat
            "posture_snapshot": {k: round(v * 100, 1) for k, v in posture.items()},
        })

    return {
        "regulator_profiles": regulator_profiles,
        "total_regulators": len(regulator_profiles),
        "nash_equilibrium": nash_equilibrium,
        "regulator_interactions": regulator_interactions,
        "game_simulation": {
            "total_rounds": len(rounds),
            "rounds": rounds,
            "cumulative_penalty_usd": sum(r["total_penalty_usd"] for r in rounds),
            "total_enforcement_events": sum(r["events_count"] for r in rounds),
            "final_posture": rounds[-1]["posture_snapshot"] if rounds else {},
            "posture_trend": "improving" if rounds[-1]["total_penalty_usd"] < rounds[0]["total_penalty_usd"] else "stable",
        },
        "enforcement_probability_heatmap": {
            profile["jurisdiction"]: {
                stance: round(profile["likely_response_matrix"].get(stance, {}).get("probability", 0) * 100, 1)
                for stance in ["full_compliance", "partial_compliance", "non_compliance", "strategic_non_compliance"]
            }
            for profile in regulator_profiles
        },
    }


# ═══════════════════════════════════════════════════════════════════════════════
# TOP-LEVEL ENTRY POINT
# ═══════════════════════════════════════════════════════════════════════════════

def generate_jurisdictional_intelligence():
    """Generate all Stage 11 data: enhanced state machine, constraint graph, Pareto strategies, game theory."""

    print("    [11a] Enhanced State Machine (8 states, 4 fake data silos)...")
    enhanced_sm = generate_enhanced_state_machine(num_transitions=60)

    print("    [11b] Jurisdictional Constraint Graph (10 nodes, 11 edges)...")
    constraint_graph = generate_jurisdictional_constraint_graph()

    print("    [11c] Pareto-optimal Compliance Strategies (5 strategies)...")
    pareto_strategies = generate_pareto_strategies()

    print("    [11d] Regulatory Game Theory Modeling (5 regulators, 10 rounds)...")
    game_theory = generate_game_theory_model()

    statistics = {
        "totalEnhancedStates": len(ENHANCED_STATES),
        "totalEnhancedEntities": enhanced_sm["total_entities"],
        "totalEnhancedTransitions": enhanced_sm["total_transitions"],
        "legallyAmbiguousCount": enhanced_sm["new_states_summary"]["legally_ambiguous"]["count"],
        "strategicallyNonCompliantCount": enhanced_sm["new_states_summary"]["strategically_non_compliant"]["count"],
        "fakeDataSilos": len(FAKE_DATA_SILOS),
        "totalJurisdictions": constraint_graph["total_jurisdictions"],
        "totalConstraints": constraint_graph["total_constraints"],
        "mutuallyExclusivePairs": len(constraint_graph["mutually_exclusive_pairs"]),
        "totalStrategies": pareto_strategies["total_strategies"],
        "paretoFrontCount": pareto_strategies["pareto_front_count"],
        "totalRegulators": game_theory["total_regulators"],
        "gameRounds": game_theory["game_simulation"]["total_rounds"],
        "cumulativePenaltyUsd": game_theory["game_simulation"]["cumulative_penalty_usd"],
    }

    return {
        "enhancedStateMachine": enhanced_sm,
        "jurisdictionalConstraintGraph": constraint_graph,
        "paretoStrategies": pareto_strategies,
        "regulatoryGameTheory": game_theory,
        "statistics": statistics,
    }
