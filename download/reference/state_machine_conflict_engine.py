import json
import uuid
import hashlib
import datetime
import random
from enum import Enum
from dataclasses import dataclass, field
from typing import Optional, List, Dict


class ComplianceState(Enum):
    COMPLIANT = "compliant"
    AT_RISK = "at_risk"
    NON_COMPLIANT = "non_compliant"
    UNDER_REMEDIATION = "under_remediation"
    ESCALATED = "escalated"
    AUDIT_PENDING = "audit_pending"


VALID_TRANSITIONS = {
    ComplianceState.COMPLIANT: [ComplianceState.AT_RISK, ComplianceState.AUDIT_PENDING],
    ComplianceState.AT_RISK: [ComplianceState.COMPLIANT, ComplianceState.NON_COMPLIANT, ComplianceState.UNDER_REMEDIATION],
    ComplianceState.NON_COMPLIANT: [ComplianceState.UNDER_REMEDIATION, ComplianceState.ESCALATED],
    ComplianceState.UNDER_REMEDIATION: [ComplianceState.COMPLIANT, ComplianceState.AT_RISK, ComplianceState.NON_COMPLIANT],
    ComplianceState.ESCALATED: [ComplianceState.UNDER_REMEDIATION, ComplianceState.NON_COMPLIANT],
    ComplianceState.AUDIT_PENDING: [ComplianceState.COMPLIANT, ComplianceState.AT_RISK, ComplianceState.NON_COMPLIANT],
}


@dataclass
class StateTransition:
    transition_id: str
    entity_id: str
    entity_type: str
    from_state: str
    to_state: str
    trigger: str
    evidence: list
    timestamp: str
    trace_id: str
    approved_by: Optional[str] = None


@dataclass
class ConflictRecord:
    conflict_id: str
    regulation_a: str
    regulation_b: str
    clause_a: str
    clause_b: str
    conflict_type: str
    severity: str
    description: str
    resolution: Optional[str] = None
    resolution_strategy: Optional[str] = None
    status: str = "detected"


class ComplianceStateMachine:
    def __init__(self):
        self.entities = {}
        self.transitions = []
        self.state_history = {}
        self.metrics = {"transitions": 0, "escalations": 0, "resolutions": 0}

    def register_entity(self, entity_id, entity_type, initial_state=ComplianceState.COMPLIANT):
        self.entities[entity_id] = {
            "id": entity_id, "type": entity_type,
            "current_state": initial_state.value,
            "registered_at": datetime.datetime.now().isoformat(),
            "compliance_score": 100.0, "risk_factors": [],
        }
        self.state_history[entity_id] = [initial_state.value]
        return self.entities[entity_id]

    def transition(self, entity_id, to_state, trigger, evidence=None, approved_by=None):
        current = self.entities.get(entity_id)
        if not current:
            return None, {"error": "Entity not found"}
        from_s = ComplianceState(current["current_state"])
        to_s = ComplianceState(to_state)
        if to_s not in VALID_TRANSITIONS.get(from_s, []):
            return None, {"error": f"Invalid transition: {from_s.value} -> {to_s.value}"}
        tid = f"TRN-{uuid.uuid4().hex[:8].upper()}"
        tr = StateTransition(
            transition_id=tid, entity_id=entity_id, entity_type=current["type"],
            from_state=from_s.value, to_state=to_s.value, trigger=trigger,
            evidence=evidence or [], timestamp=datetime.datetime.now().isoformat(),
            trace_id=uuid.uuid4().hex[:16], approved_by=approved_by,
        )
        self.transitions.append(tr)
        current["current_state"] = to_s.value
        self.state_history[entity_id].append(to_s.value)
        self.metrics["transitions"] += 1
        if to_s == ComplianceState.ESCALATED:
            self.metrics["escalations"] += 1
        if to_s == ComplianceState.COMPLIANT and from_s != ComplianceState.AUDIT_PENDING:
            self.metrics["resolutions"] += 1
        score_delta = {"at_risk": -15, "non_compliant": -30, "under_remediation": -5, "escalated": -25, "audit_pending": -5, "compliant": 25}
        current["compliance_score"] = max(0, min(100, current["compliance_score"] + score_delta.get(to_s.value, 0)))
        return {"transition": asdict(tr), "entity": current}, None

    def get_entity_timeline(self, entity_id):
        return [t for t in self.transitions if t.entity_id == entity_id]


class ConflictResolutionEngine:
    def __init__(self):
        self.conflicts = []
        self.resolution_strategies = ["regulation_a_takes_precedence", "regulation_b_takes_precedence", "merge_requirements", "escalate_to_legal", "apply_strictest", "jurisdictional_split"]
        self.conflict_types = ["contradictory_obligation", "overlapping_scope", "temporal_conflict", "jurisdictional_overlap", "penalty_discrepancy", "definition_mismatch"]

    def detect_conflict(self, reg_a, clause_a, reg_b, clause_b):
        cid = f"CNF-{uuid.uuid4().hex[:8].upper()}"
        ct = random.choice(self.conflict_types)
        sev = random.choice(["low", "medium", "high", "critical"])
        descs = {
            "contradictory_obligation": f"{reg_a} {clause_a} requires action X while {reg_b} {clause_b} requires contradictory action Y",
            "overlapping_scope": f"Both {reg_a} and {reg_b} claim jurisdiction over the same data processing activity",
            "temporal_conflict": f"{reg_a} requires compliance by date D1 while {reg_b} sets a different deadline D2",
            "jurisdictional_overlap": f"{reg_a} (federal) and {reg_b} (state) impose conflicting requirements",
            "penalty_discrepancy": f"{reg_a} prescribes penalty P1 while {reg_b} prescribes a different penalty P2 for the same violation",
            "definition_mismatch": f"{reg_a} and {reg_b} define 'protected health information' differently",
        }
        conflict = ConflictRecord(
            conflict_id=cid, regulation_a=reg_a, regulation_b=reg_b,
            clause_a=clause_a, clause_b=clause_b, conflict_type=ct,
            severity=sev, description=descs.get(ct, "Conflict detected"),
        )
        self.conflicts.append(conflict)
        return conflict

    def resolve_conflict(self, conflict_id, strategy=None):
        for c in self.conflicts:
            if c.conflict_id == conflict_id:
                strat = strategy or random.choice(self.resolution_strategies)
                c.resolution = f"Resolved using strategy: {strat}"
                c.resolution_strategy = strat
                c.status = "resolved"
                return c, None
        return None, {"error": "Conflict not found"}

    def auto_resolve_all(self):
        results = []
        for c in self.conflicts:
            if c.status == "detected":
                r, err = self.resolve_conflict(c.conflict_id)
                if r:
                    results.append(r)
        return results


def asdict(obj):
    if hasattr(obj, '__dataclass_fields__'):
        return {k: (asdict(v) if hasattr(v, '__dataclass_fields__') else v) for k, v in obj.__dict__.items()}
    return obj


def run_simulation():
    print("\n" + "#" * 60)
    print("# STATE MACHINE & CONFLICT RESOLUTION ENGINE")
    print("# Iteration 4 — Compliance Lifecycle Simulation")
    print("#" * 60)

    sm = ComplianceStateMachine()
    cr = ConflictResolutionEngine()

    # --- Register Entities ---
    print("\n--- REGISTERING COMPLIANCE ENTITIES ---")
    entities = [
        ("ENT-PHI-001", "data_store", ComplianceState.COMPLIANT),
        ("ENT-ACLS-002", "access_control", ComplianceState.COMPLIANT),
        ("ENT-AUDIT-003", "audit_system", ComplianceState.COMPLIANT),
        ("ENT-ENC-004", "encryption_service", ComplianceState.COMPLIANT),
        ("ENT-TRAIN-005", "training_program", ComplianceState.AT_RISK),
        ("ENT-BAAS-006", "business_associate", ComplianceState.COMPLIANT),
    ]
    for eid, etype, istate in entities:
        ent = sm.register_entity(eid, etype, istate)
        print(f"  {eid} ({etype}): {istate.value}")

    # --- State Transitions ---
    print("\n--- STATE TRANSITIONS ---")
    transitions_def = [
        ("ENT-PHI-001", "at_risk", "regulatory_change_detected", ["HIPAA Privacy Rule 2025 Amendment"]),
        ("ENT-PHI-001", "non_compliant", "gap_analysis_complete", ["3 critical gaps identified", "Breach notification timeline exceeded"]),
        ("ENT-PHI-001", "under_remediation", "remediation_plan_approved", ["Plan RMP-001 approved by CISO"], "ciso_johnson"),
        ("ENT-PHI-001", "compliant", "remediation_verified", ["All 3 gaps closed", "Audit evidence collected"], "compliance_team"),
        ("ENT-ACLS-002", "at_risk", "anomaly_detected", ["Unusual access pattern from research subnet", "15 failed login attempts"]),
        ("ENT-ACLS-002", "audit_pending", "security_review_triggered", ["IAM logs exported for review"]),
        ("ENT-ACLS-002", "at_risk", "audit_passed_with_conditions", ["2 minor findings require remediation"]),
        ("ENT-TRAIN-005", "non_compliant", "deadline_missed", ["Annual HIPAA training 30 days overdue", "47% staff non-compliant"]),
        ("ENT-TRAIN-005", "escalated", "regulatory_penalty_risk", ["Potential OCR enforcement action"], "chief_compliance_officer"),
        ("ENT-TRAIN-005", "under_remediation", "emergency_training_deployed", ["Mandatory training sessions scheduled"], "hr_director"),
        ("ENT-TRAIN-005", "compliant", "training_completion_verified", ["94% staff completed", "Audit trail updated"], "hr_director"),
        ("ENT-ENC-004", "audit_pending", "scheduled_audit", ["Quarterly encryption audit initiated"]),
        ("ENT-ENC-004", "compliant", "audit_passed", ["AES-256-GCM verified on all PHI stores"]),
    ]
    for eid, to_s, trigger, evidence, *approver in transitions_def:
        result, err = sm.transition(eid, to_s, trigger, evidence, approver[0] if approver else None)
        if err:
            print(f"  ERROR: {err['error']}")
        else:
            t = result["transition"]
            e = result["entity"]
            print(f"  {t['entity_id']}: {t['from_state']} -> {t['to_state']} | trigger: {trigger}")
            print(f"    Score: {e['compliance_score']}% | Approver: {t.get('approved_by') or 'auto'}")

    # --- Conflict Detection ---
    print("\n--- CONFLICT DETECTION ---")
    conflict_defs = [
        ("HIPAA Privacy Rule 164.524", "Patient access within 30 days", "HIPAA Privacy Rule 2025 Amendment", "Patient access within 15 days"),
        ("HIPAA Security Rule 164.312", "Encrypt ePHI at rest", "NIST SP 800-171", "Encrypt CUI using AES-256"),
        ("HIPAA Breach Notification", "Notify within 60 days", "State Health Breach Law", "Notify within 30 days"),
        ("GDPR Article 17", "Right to erasure", "HIPAA 164.524", "Retention requirement 6 years"),
        ("HIPAA 164.502", "PHI disclosure prohibition", "42 CFR Part 2", "Substance abuse record disclosure for treatment"),
        ("SOX Section 404", "Internal controls audit", "HIPAA 164.312(b)", "Technical safeguard assessment"),
    ]
    for reg_a, cl_a, reg_b, cl_b in conflict_defs:
        conflict = cr.detect_conflict(reg_a, cl_a, reg_b, cl_b)
        print(f"  {conflict.conflict_id}: {conflict.conflict_type}")
        print(f"    {reg_a} vs {reg_b}")
        print(f"    Severity: {conflict.severity} | Status: {conflict.status}")

    # --- Conflict Resolution ---
    print("\n--- CONFLICT RESOLUTION ---")
    strategies_map = {
        0: "apply_strictest",
        1: "jurisdictional_split",
        2: "apply_strictest",
        3: "escalate_to_legal",
        4: "merge_requirements",
        5: "regulation_a_takes_precedence",
    }
    for i, conflict in enumerate(cr.conflicts):
        strat = strategies_map.get(i)
        r, err = cr.resolve_conflict(conflict.conflict_id, strategy=strat)
        if r:
            print(f"  {r.conflict_id}: {r.conflict_type} -> {r.status}")
            print(f"    Strategy: {r.resolution_strategy}")

    # --- Compile Results ---
    results = {
        "run_id": uuid.uuid4().hex[:12],
        "run_time": datetime.datetime.now().isoformat(),
        "state_machine": {
            "entities": sm.entities,
            "total_transitions": len(sm.transitions),
            "transitions": [asdict(t) for t in sm.transitions],
            "state_histories": sm.state_history,
            "metrics": sm.metrics,
            "valid_transitions": {k.value: [v.value for v in vals] for k, vals in VALID_TRANSITIONS.items()},
        },
        "conflicts": {
            "total_detected": len(cr.conflicts),
            "total_resolved": sum(1 for c in cr.conflicts if c.status == "resolved"),
            "records": [asdict(c) for c in cr.conflicts],
            "conflict_types": list(set(c.conflict_type for c in cr.conflicts)),
            "resolution_strategies_used": list(set(c.resolution_strategy for c in cr.conflicts if c.resolution_strategy)),
        },
    }

    print(f"\n{'#'*60}")
    print(f"# SIMULATION COMPLETE")
    print(f"# Entities: {len(sm.entities)}")
    print(f"# State Transitions: {len(sm.transitions)}")
    print(f"# Conflicts Detected: {len(cr.conflicts)}")
    print(f"# Conflicts Resolved: {sum(1 for c in cr.conflicts if c.status == 'resolved')}")
    print(f"{'#'*60}")

    output_path = "/home/z/my-project/download/state_machine_output.json"
    with open(output_path, "w") as f:
        json.dump(results, f, indent=2, default=str)
    print(f"\nOutput: {output_path}")
    return results


if __name__ == "__main__":
    run_simulation()
