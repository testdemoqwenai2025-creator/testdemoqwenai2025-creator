"""
Agent Swarm Core — 4-Agent Regulatory Compliance Orchestration
===============================================================
Simulates the core agent swarm architecture:
  1. Ingestion Agent      — Monitors & ingests regulatory changes
  2. Legal Analyst Agent   — Analyzes regulatory text & extracts requirements
  3. Prosecutor Agent      — Identifies compliance gaps & risk assessments
  4. Defender Agent        — Generates remediation plans & control recommendations

Connected via an event bus with distributed tracing (OpenTelemetry-style spans).
"""

import json
import uuid
import hashlib
import datetime
import random
import time
import copy
from enum import Enum
from dataclasses import dataclass, field, asdict
from typing import Any, Optional


class AgentState(Enum):
    IDLE = "idle"
    PROCESSING = "processing"
    WAITING = "waiting"
    COMPLETED = "completed"
    ESCALATED = "escalated"
    FAILED = "failed"


class EventStatus(Enum):
    PUBLISHED = "published"
    CONSUMED = "consumed"
    ACKNOWLEDGED = "acknowledged"
    FAILED = "failed"


@dataclass
class TraceSpan:
    span_id: str
    trace_id: str
    parent_span_id: Optional[str]
    agent_name: str
    operation: str
    start_time: str
    end_time: Optional[str] = None
    status: str = "active"
    attributes: dict = field(default_factory=dict)
    events: list = field(default_factory=list)


@dataclass
class Event:
    event_id: str
    event_type: str
    source_agent: str
    payload: dict
    trace_id: str
    timestamp: str
    status: str = "published"
    correlation_id: Optional[str] = None
    metadata: dict = field(default_factory=dict)


@dataclass
class AgentMessage:
    msg_id: str
    from_agent: str
    to_agent: str
    msg_type: str
    content: dict
    trace_id: str
    timestamp: str
    priority: str = "normal"


class EventBus:
    """Simulated event bus with topics, partitions, and consumer groups."""

    def __init__(self):
        self.events = []
        self.topics = {
            "regulatory.changes": [],
            "analysis.results": [],
            "gap.findings": [],
            "remediation.plans": [],
            "governance.audit": [],
            "escalation.requests": [],
        }
        self.consumer_groups = {
            "legal_analysts": ["Legal_Analyst_Agent"],
            "prosecutors": ["Prosecutor_Agent"],
            "defenders": ["Defender_Agent"],
            "auditors": ["Compliance_Orchestrator"],
        }
        self.partition_counts = {
            "regulatory.changes": 3,
            "analysis.results": 3,
            "gap.findings": 3,
            "remediation.plans": 3,
        }
        self.metrics = {"published": 0, "consumed": 0, "failed": 0, "total_latency_ms": 0}

    def publish(self, topic, event_type, source_agent, payload, trace_id, correlation_id=None, metadata=None):
        event_id = f"EVT-{uuid.uuid4().hex[:8].upper()}"
        event = Event(
            event_id=event_id, event_type=event_type, source_agent=source_agent,
            payload=payload, trace_id=trace_id,
            timestamp=datetime.datetime.now().isoformat(),
            correlation_id=correlation_id or trace_id,
            metadata=metadata or {}
        )
        if topic in self.topics:
            partition = random.randint(0, self.partition_counts.get(topic, 1) - 1)
            event.metadata["partition"] = partition
            self.topics[topic].append(event)
        self.events.append(event)
        self.metrics["published"] += 1
        return event

    def consume(self, topic, consumer_agent):
        consumed = []
        if topic in self.topics:
            for evt in self.topics[topic]:
                if evt.status == "published":
                    evt.status = "consumed"
                    consumed.append(evt)
                    self.metrics["consumed"] += 1
        return consumed

    def get_topic_stats(self):
        return {topic: {"pending": sum(1 for e in evts if e.status == "published"),
                        "consumed": sum(1 for e in evts if e.status == "consumed"),
                        "total": len(evts)}
                for topic, evts in self.topics.items()}


class BaseAgent:
    """Base class for all swarm agents with tracing support."""

    def __init__(self, name, agent_type, event_bus):
        self.name = name
        self.agent_type = agent_type
        self.event_bus = event_bus
        self.state = AgentState.IDLE
        self.spans = []
        self.messages_sent = []
        self.messages_received = []
        self.processed_count = 0
        self.error_count = 0
        self.capabilities = []
        self.current_trace_id = None

    def start_span(self, operation, parent_span_id=None, trace_id=None):
        tid = trace_id or self.current_trace_id or uuid.uuid4().hex[:16]
        self.current_trace_id = tid
        span = TraceSpan(
            span_id=f"SPAN-{uuid.uuid4().hex[:8].upper()}",
            trace_id=tid,
            parent_span_id=parent_span_id,
            agent_name=self.name,
            operation=operation,
            start_time=datetime.datetime.now().isoformat(),
            attributes={"agent_type": self.agent_type}
        )
        self.spans.append(span)
        return span

    def end_span(self, span, status="completed", result=None):
        span.end_time = datetime.datetime.now().isoformat()
        span.status = status
        if result:
            span.events.append({"name": "result", "time": span.end_time, "attributes": result})
        self.state = AgentState.COMPLETED if status == "completed" else AgentState.FAILED
        return span

    def send_message(self, to_agent, msg_type, content, trace_id, priority="normal"):
        msg = AgentMessage(
            msg_id=f"MSG-{uuid.uuid4().hex[:8].upper()}",
            from_agent=self.name, to_agent=to_agent,
            msg_type=msg_type, content=content,
            trace_id=trace_id,
            timestamp=datetime.datetime.now().isoformat(),
            priority=priority
        )
        self.messages_sent.append(msg)
        return msg

    def process(self, *args, **kwargs):
        raise NotImplementedError

    def get_stats(self):
        return {
            "name": self.name, "type": self.agent_type,
            "state": self.state.value,
            "processed": self.processed_count,
            "errors": self.error_count,
            "spans": len(self.spans),
            "messages_sent": len(self.messages_sent),
            "messages_received": len(self.messages_received),
            "capabilities": self.capabilities
        }


class IngestionAgent(BaseAgent):
    """Agent 1: Monitors regulatory sources and ingests changes."""

    def __init__(self, event_bus):
        super().__init__("Ingestion_Agent", "ingestion", event_bus)
        self.monitored_sources = [
            {"name": "Federal Register", "url": "https://www.federalregister.gov", "frequency": "15min", "active": True},
            {"name": "HHS/OCR Guidance", "url": "https://www.hhs.gov/ocr", "frequency": "30min", "active": True},
            {"name": "ONC Standards", "url": "https://www.healthit.gov", "frequency": "1h", "active": True},
            {"name": "NIST Cybersecurity", "url": "https://www.nist.gov", "frequency": "2h", "active": True},
            {"name": "State Health Dept", "url": "https://state.health.gov", "frequency": "4h", "active": False},
        ]
        self.capabilities = ["web_scraping", "document_parsing", "change_detection", "normalization", "schema_validation"]

    def detect_change(self, source, regulation_title, change_summary, severity, affected_sections):
        span = self.start_span("detect_regulatory_change")
        self.state = AgentState.PROCESSING
        change_id = f"CHG-{uuid.uuid4().hex[:8].upper()}"
        raw_event = {
            "change_id": change_id,
            "source": source,
            "regulation_title": regulation_title,
            "change_summary": change_summary,
            "severity": severity,
            "affected_sections": affected_sections,
            "detected_at": datetime.datetime.now().isoformat(),
            "raw_text_hash": hashlib.sha256(change_summary.encode()).hexdigest()[:16],
            "document_type": "federal_register_notice",
        }
        # Publish to event bus
        event = self.event_bus.publish(
            topic="regulatory.changes",
            event_type="REGULATORY_CHANGE_DETECTED",
            source_agent=self.name,
            payload=raw_event,
            trace_id=self.current_trace_id,
            metadata={"source_system": source, "severity": severity}
        )
        self.processed_count += 1
        result = {"change_id": change_id, "event_id": event.event_id, "status": "ingested"}
        self.end_span(span, status="completed", result=result)
        return raw_event, event

    def process(self, regulatory_changes):
        """Process multiple regulatory changes."""
        results = []
        for change in regulatory_changes:
            raw, evt = self.detect_change(
                source=change["source"],
                regulation_title=change["title"],
                change_summary=change["summary"],
                severity=change["severity"],
                affected_sections=change["sections"]
            )
            results.append({"raw": raw, "event": evt})
        return results


class LegalAnalystAgent(BaseAgent):
    """Agent 2: Analyzes regulatory text and extracts requirements."""

    def __init__(self, event_bus):
        super().__init__("Legal_Analyst_Agent", "legal_analysis", event_bus)
        self.analysis_methods = ["statutory_interpretation", "case_law_mapping", "precedent_analysis", "impact_assessment"]
        self.capabilities = ["nlp_analysis", "requirement_extraction", "obligation_mapping", "risk_classification", "cross_reference_analysis"]
        self.requirement_templates = [
            "must_implement", "must_document", "must_train", "must_audit",
            "must_encrypt", "must_restrict_access", "must_retain", "must_notify"
        ]

    def analyze(self, regulatory_event):
        span = self.start_span("analyze_regulatory_change", parent_span_id=None, trace_id=regulatory_event.trace_id)
        self.state = AgentState.PROCESSING
        self.messages_received.append(AgentMessage(
            msg_id=f"MSG-RECV-{uuid.uuid4().hex[:6]}",
            from_agent=regulatory_event.source_agent, to_agent=self.name,
            msg_type="regulatory_change", content=regulatory_event.payload,
            trace_id=regulatory_event.trace_id,
            timestamp=datetime.datetime.now().isoformat()
        ))

        # Extract requirements
        num_requirements = random.randint(3, 8)
        requirements = []
        for i in range(num_requirements):
            req = {
                "req_id": f"REQ-{uuid.uuid4().hex[:6].upper()}",
                "type": random.choice(self.requirement_templates),
                "description": f"Requirement extracted from {regulatory_event.payload.get('regulation_title', 'regulation')}: "
                              f"Obligation {i+1} related to {random.choice(regulatory_event.payload.get('affected_sections', ['general']))}",
                "priority": random.choice(["critical", "high", "medium", "low"]),
                "source_section": random.choice(regulatory_event.payload.get("affected_sections", ["Section 1"])),
                "compliance_deadline": (datetime.datetime.now() + datetime.timedelta(days=random.randint(30, 180))).strftime("%Y-%m-%d"),
                "estimated_effort": random.choice(["small", "medium", "large", "xlarge"]),
            }
            requirements.append(req)

        analysis_result = {
            "analysis_id": f"ANL-{uuid.uuid4().hex[:8].upper()}",
            "source_change_id": regulatory_event.payload.get("change_id"),
            "regulation": regulatory_event.payload.get("regulation_title"),
            "severity": regulatory_event.payload.get("severity"),
            "requirements": requirements,
            "total_requirements": len(requirements),
            "critical_count": sum(1 for r in requirements if r["priority"] == "critical"),
            "analysis_method": random.choice(self.analysis_methods),
            "confidence_score": round(random.uniform(0.82, 0.97), 3),
            "cross_references": random.randint(2, 7),
            "analyzed_at": datetime.datetime.now().isoformat(),
        }

        # Publish analysis result
        event = self.event_bus.publish(
            topic="analysis.results",
            event_type="ANALYSIS_COMPLETE",
            source_agent=self.name,
            payload=analysis_result,
            trace_id=self.current_trace_id,
            correlation_id=regulatory_event.event_id,
            metadata={"requirements_count": len(requirements)}
        )

        # Notify prosecutor
        msg = self.send_message(
            to_agent="Prosecutor_Agent",
            msg_type="analysis_ready",
            content={"analysis_id": analysis_result["analysis_id"], "event_id": event.event_id},
            trace_id=self.current_trace_id,
            priority="high" if analysis_result["critical_count"] > 0 else "normal"
        )

        self.processed_count += 1
        self.end_span(span, status="completed", result={"analysis_id": analysis_result["analysis_id"], "requirements": len(requirements)})
        return analysis_result, event, msg


class ProsecutorAgent(BaseAgent):
    """Agent 3: Identifies compliance gaps and performs risk assessment."""

    def __init__(self, event_bus):
        super().__init__("Prosecutor_Agent", "prosecution", event_bus)
        self.current_controls = [
            {"control_id": "CTL-001", "name": "Access Control Policy", "status": "active", "coverage": "PHI_access"},
            {"control_id": "CTL-002", "name": "Encryption at Rest", "status": "active", "coverage": "data_at_rest"},
            {"control_id": "CTL-003", "name": "Audit Logging", "status": "active", "coverage": "audit_trail"},
            {"control_id": "CTL-004", "name": "Breach Notification", "status": "partial", "coverage": "incident_response"},
            {"control_id": "CTL-005", "name": "Workforce Training", "status": "active", "coverage": "training"},
            {"control_id": "CTL-006", "name": "Business Associate Agreements", "status": "active", "coverage": "baa"},
            {"control_id": "CTL-007", "name": "Risk Analysis", "status": "outdated", "coverage": "risk_mgmt"},
            {"control_id": "CTL-008", "name": "Minimum Necessary Standard", "status": "missing", "coverage": "data_minimization"},
        ]
        self.capabilities = ["gap_analysis", "risk_assessment", "control_mapping", "evidence_review", "compliance_scoring"]

    def identify_gaps(self, analysis_event):
        span = self.start_span("identify_compliance_gaps", trace_id=analysis_event.trace_id)
        self.state = AgentState.PROCESSING
        self.messages_received.append(AgentMessage(
            msg_id=f"MSG-RECV-{uuid.uuid4().hex[:6]}",
            from_agent=analysis_event.source_agent, to_agent=self.name,
            msg_type="analysis_result", content=analysis_event.payload,
            trace_id=analysis_event.trace_id,
            timestamp=datetime.datetime.now().isoformat()
        ))

        analysis = analysis_event.payload
        requirements = analysis.get("requirements", [])

        gaps = []
        for req in requirements:
            # Simulate gap detection: higher priority requirements more likely to have gaps
            gap_probability = {"critical": 0.7, "high": 0.5, "medium": 0.3, "low": 0.15}[req["priority"]]
            if random.random() < gap_probability:
                affected_control = random.choice(self.current_controls)
                gap = {
                    "gap_id": f"GAP-{uuid.uuid4().hex[:6].upper()}",
                    "requirement_id": req["req_id"],
                    "requirement_type": req["type"],
                    "description": f"Gap identified: {req['type']} obligation not fully covered by current control '{affected_control['name']}' ({affected_control['status']})",
                    "severity": req["priority"],
                    "affected_control": affected_control["control_id"],
                    "control_status": affected_control["status"],
                    "risk_score": round(random.uniform(0.4, 0.95), 2),
                    "evidence_status": random.choice(["insufficient", "missing", "outdated", "partial"]),
                    "remediation_complexity": random.choice(["low", "medium", "high", "critical"]),
                }
                gaps.append(gap)

        # Overall compliance score
        total_reqs = len(requirements)
        gapped = len(gaps)
        compliance_score = round((1 - gapped / max(total_reqs, 1)) * 100, 1)

        # Risk assessment
        risk_levels = {"critical": 4, "high": 3, "medium": 2, "low": 1}
        max_risk = max([risk_levels.get(g["severity"], 1) for g in gaps], default=0)
        avg_risk = round(sum(g["risk_score"] for g in gaps) / max(len(gaps), 1), 3) if gaps else 0

        gap_report = {
            "report_id": f"GAP-{uuid.uuid4().hex[:8].upper()}",
            "source_analysis_id": analysis.get("analysis_id"),
            "total_requirements": total_reqs,
            "gaps_found": gapped,
            "compliance_score": compliance_score,
            "overall_risk_level": ["LOW", "MODERATE", "HIGH", "CRITICAL"][min(max_risk - 1, 3)] if gaps else "COMPLIANT",
            "average_risk_score": avg_risk,
            "gaps": gaps,
            "risk_breakdown": {sev: sum(1 for g in gaps if g["severity"] == sev) for sev in ["critical", "high", "medium", "low"]},
            "prosecuted_at": datetime.datetime.now().isoformat(),
        }

        event = self.event_bus.publish(
            topic="gap.findings",
            event_type="GAPS_IDENTIFIED",
            source_agent=self.name,
            payload=gap_report,
            trace_id=self.current_trace_id,
            correlation_id=analysis_event.event_id,
            metadata={"gap_count": gapped, "risk_level": gap_report["overall_risk_level"]}
        )

        msg = self.send_message(
            to_agent="Defender_Agent",
            msg_type="gaps_ready",
            content={"report_id": gap_report["report_id"], "event_id": event.event_id, "urgent": max_risk >= 3},
            trace_id=self.current_trace_id,
            priority="critical" if max_risk >= 4 else ("high" if max_risk >= 3 else "normal")
        )

        self.processed_count += 1
        self.end_span(span, status="completed", result={"gaps_found": gapped, "compliance_score": compliance_score})
        return gap_report, event, msg


class DefenderAgent(BaseAgent):
    """Agent 4: Generates remediation plans and control recommendations."""

    def __init__(self, event_bus):
        super().__init__("Defender_Agent", "defense", event_bus)
        self.capabilities = ["remediation_planning", "control_design", "policy_drafting", "implementation_roadmap", "cost_estimation"]
        self.remediation_strategies = {
            "critical": ["immediate_implementation", "emergency_policy_update", "escalate_to_ciso"],
            "high": ["scheduled_implementation", "policy_revision", "control_enhancement"],
            "medium": ["planned_improvement", "documentation_update", "training_deployment"],
            "low": ["monitor_and_review", "best_practice_adoption", "future_consideration"],
        }

    def generate_remediation(self, gap_event):
        span = self.start_span("generate_remediation_plan", trace_id=gap_event.trace_id)
        self.state = AgentState.PROCESSING
        self.messages_received.append(AgentMessage(
            msg_id=f"MSG-RECV-{uuid.uuid4().hex[:6]}",
            from_agent=gap_event.source_agent, to_agent=self.name,
            msg_type="gap_report", content=gap_event.payload,
            trace_id=gap_event.trace_id,
            timestamp=datetime.datetime.now().isoformat()
        ))

        gap_report = gap_event.payload
        gaps = gap_report.get("gaps", [])

        remediation_steps = []
        total_estimated_cost = 0
        total_effort_days = 0

        for i, gap in enumerate(gaps):
            severity = gap["severity"]
            strategies = self.remediation_strategies.get(severity, self.remediation_strategies["medium"])
            strategy = random.choice(strategies)
            effort_days = {"critical": random.randint(5, 30), "high": random.randint(10, 45),
                          "medium": random.randint(3, 20), "low": random.randint(1, 10)}[severity]
            cost = {"critical": random.randint(50000, 200000), "high": random.randint(20000, 100000),
                   "medium": random.randint(5000, 30000), "low": random.randint(1000, 10000)}[severity]

            step = {
                "step_id": f"REM-{uuid.uuid4().hex[:6].upper()}",
                "gap_id": gap["gap_id"],
                "order": i + 1,
                "strategy": strategy,
                "action_description": f"Implement {strategy.replace('_', ' ')} for gap in {gap['requirement_type']} affecting control {gap['affected_control']}",
                "assigned_team": random.choice(["Compliance", "Engineering", "Security", "Legal", "Operations"]),
                "priority": severity,
                "effort_days": effort_days,
                "estimated_cost_usd": cost,
                "deadline": (datetime.datetime.now() + datetime.timedelta(days=effort_days * 2)).strftime("%Y-%m-%d"),
                "dependencies": [f"REM-{uuid.uuid4().hex[:6].upper()}" for _ in range(random.randint(0, 2))] if i > 0 else [],
                "status": "planned",
                "verification_method": random.choice(["audit_review", "automated_test", "manual_inspection", "compliance_assessment"]),
            }
            remediation_steps.append(step)
            total_estimated_cost += cost
            total_effort_days += effort_days

        # Sort by priority
        priority_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
        remediation_steps.sort(key=lambda s: priority_order.get(s["priority"], 4))
        for i, step in enumerate(remediation_steps):
            step["order"] = i + 1

        remediation_plan = {
            "plan_id": f"RMP-{uuid.uuid4().hex[:8].upper()}",
            "source_gap_report_id": gap_report.get("report_id"),
            "source_analysis_id": gap_report.get("source_analysis_id"),
            "total_gaps_addressed": len(gaps),
            "total_steps": len(remediation_steps),
            "total_estimated_cost_usd": total_estimated_cost,
            "total_effort_days": total_effort_days,
            "remediation_steps": remediation_steps,
            "risk_reduction_target": round(gap_report.get("average_risk_score", 0) * 0.7, 3),
            "compliance_target_score": min(100, round(gap_report.get("compliance_score", 0) + (100 - gap_report.get("compliance_score", 0)) * 0.8, 1)),
            "created_at": datetime.datetime.now().isoformat(),
        }

        event = self.event_bus.publish(
            topic="remediation.plans",
            event_type="REMEDIATION_PLAN_READY",
            source_agent=self.name,
            payload=remediation_plan,
            trace_id=self.current_trace_id,
            correlation_id=gap_event.event_id,
            metadata={"steps": len(remediation_steps), "cost": total_estimated_cost}
        )

        # Escalate if critical gaps
        critical_gaps = [g for g in gaps if g["severity"] == "critical"]
        if critical_gaps:
            esc_msg = self.send_message(
                to_agent="Compliance_Orchestrator",
                msg_type="escalation_required",
                content={"plan_id": remediation_plan["plan_id"], "critical_gaps": len(critical_gaps),
                         "total_cost": total_estimated_cost},
                trace_id=self.current_trace_id,
                priority="critical"
            )
        else:
            esc_msg = None

        self.processed_count += 1
        self.end_span(span, status="completed", result={"plan_id": remediation_plan["plan_id"], "steps": len(remediation_steps)})
        return remediation_plan, event, esc_msg


class SwarmOrchestrator:
    """Orchestrates the 4-agent swarm through a complete regulatory compliance workflow."""

    def __init__(self):
        self.event_bus = EventBus()
        self.agents = {
            "ingestion": IngestionAgent(self.event_bus),
            "legal_analyst": LegalAnalystAgent(self.event_bus),
            "prosecutor": ProsecutorAgent(self.event_bus),
            "defender": DefenderAgent(self.event_bus),
        }
        self.run_id = uuid.uuid4().hex[:12]
        self.start_time = datetime.datetime.now().isoformat()
        self.workflow_steps = []
        self.scenarios_run = []

    def run_scenario(self, scenario_name, regulatory_changes):
        """Run a complete scenario: Ingest -> Analyze -> Prosecute -> Defend."""
        scenario_trace_id = uuid.uuid4().hex[:16]
        scenario_result = {
            "scenario_name": scenario_name,
            "trace_id": scenario_trace_id,
            "started_at": datetime.datetime.now().isoformat(),
            "phases": {},
        }

        # Phase 1: Ingestion
        print(f"\n{'='*60}")
        print(f"SCENARIO: {scenario_name}")
        print(f"Trace ID: {scenario_trace_id}")
        print(f"{'='*60}")

        print(f"\n--- PHASE 1: INGESTION ---")
        ingestion_agent = self.agents["ingestion"]
        ingestion_results = ingestion_agent.process(regulatory_changes)
        for r in ingestion_results:
            print(f"  Ingested: {r['raw']['change_id']} - {r['raw']['regulation_title'][:60]}...")
            print(f"    Event: {r['event'].event_id} -> topic: regulatory.changes")
        scenario_result["phases"]["ingestion"] = {
            "changes_ingested": len(ingestion_results),
            "events_published": len(ingestion_results),
        }

        # Phase 2: Legal Analysis
        print(f"\n--- PHASE 2: LEGAL ANALYSIS ---")
        legal_agent = self.agents["legal_analyst"]
        # Consume events from ingestion
        pending_changes = self.event_bus.consume("regulatory.changes", legal_agent.name)
        analysis_results = []
        for evt in pending_changes:
            analysis, a_event, a_msg = legal_agent.analyze(evt)
            analysis_results.append({"analysis": analysis, "event": a_event, "message": a_msg})
            print(f"  Analyzed: {analysis['analysis_id']} - {len(analysis['requirements'])} requirements extracted")
            print(f"    Critical: {analysis['critical_count']} | Confidence: {analysis['confidence_score']}")
            print(f"    Event: {a_event.event_id} -> topic: analysis.results")
            print(f"    Message: {a_msg.msg_id} -> {a_msg.to_agent}")
        scenario_result["phases"]["legal_analysis"] = {
            "analyses_completed": len(analysis_results),
            "total_requirements": sum(a["analysis"]["total_requirements"] for a in analysis_results),
            "critical_requirements": sum(a["analysis"]["critical_count"] for a in analysis_results),
        }

        # Phase 3: Prosecution (Gap Analysis)
        print(f"\n--- PHASE 3: PROSECUTION (GAP ANALYSIS) ---")
        prosecutor_agent = self.agents["prosecutor"]
        pending_analyses = self.event_bus.consume("analysis.results", prosecutor_agent.name)
        gap_results = []
        for evt in pending_analyses:
            gap_report, g_event, g_msg = prosecutor_agent.identify_gaps(evt)
            gap_results.append({"report": gap_report, "event": g_event, "message": g_msg})
            print(f"  Prosecuted: {gap_report['report_id']} - {gap_report['gaps_found']} gaps found")
            print(f"    Compliance Score: {gap_report['compliance_score']}% | Risk: {gap_report['overall_risk_level']}")
            print(f"    Risk Breakdown: {gap_report['risk_breakdown']}")
            print(f"    Event: {g_event.event_id} -> topic: gap.findings")
            print(f"    Message: {g_msg.msg_id} -> {g_msg.to_agent}")
        scenario_result["phases"]["prosecution"] = {
            "gap_reports": len(gap_results),
            "total_gaps": sum(g["report"]["gaps_found"] for g in gap_results),
            "avg_compliance_score": round(sum(g["report"]["compliance_score"] for g in gap_results) / max(len(gap_results), 1), 1),
            "risk_levels": list(set(g["report"]["overall_risk_level"] for g in gap_results)),
        }

        # Phase 4: Defense (Remediation)
        print(f"\n--- PHASE 4: DEFENSE (REMEDIATION) ---")
        defender_agent = self.agents["defender"]
        pending_gaps = self.event_bus.consume("gap.findings", defender_agent.name)
        remediation_results = []
        for evt in pending_gaps:
            plan, r_event, r_msg = defender_agent.generate_remediation(evt)
            remediation_results.append({"plan": plan, "event": r_event, "escalation": r_msg})
            print(f"  Defended: {plan['plan_id']} - {plan['total_steps']} remediation steps")
            print(f"    Total Cost: ${plan['total_estimated_cost_usd']:,} | Effort: {plan['total_effort_days']} days")
            print(f"    Compliance Target: {plan['compliance_target_score']}% | Risk Reduction: {plan['risk_reduction_target']}")
            print(f"    Event: {r_event.event_id} -> topic: remediation.plans")
            if r_msg:
                print(f"    ESCALATION: {r_msg.msg_id} -> {r_msg.to_agent} [{r_msg.priority}]")

            # Show top 3 remediation steps
            for step in plan["remediation_steps"][:3]:
                print(f"      Step {step['order']}: [{step['priority'].upper()}] {step['action_description'][:80]}...")
                print(f"        Team: {step['assigned_team']} | Cost: ${step['estimated_cost_usd']:,} | Days: {step['effort_days']}")
            if len(plan["remediation_steps"]) > 3:
                print(f"      ... and {len(plan['remediation_steps']) - 3} more steps")

        scenario_result["phases"]["defense"] = {
            "plans_generated": len(remediation_results),
            "total_steps": sum(r["plan"]["total_steps"] for r in remediation_results),
            "total_cost": sum(r["plan"]["total_estimated_cost_usd"] for r in remediation_results),
            "total_effort_days": sum(r["plan"]["total_effort_days"] for r in remediation_results),
            "escalations": sum(1 for r in remediation_results if r["escalation"]),
        }

        scenario_result["ended_at"] = datetime.datetime.now().isoformat()
        scenario_result["detailed_results"] = {
            "ingestion": [{"raw": r["raw"], "event_id": r["event"].event_id} for r in ingestion_results],
            "analyses": [{"analysis": r["analysis"], "event_id": r["event"].event_id, "msg_id": r["message"].msg_id} for r in analysis_results],
            "gap_reports": [{"report": r["report"], "event_id": r["event"].event_id, "msg_id": r["message"].msg_id} for r in gap_results],
            "remediations": [{"plan": r["plan"], "event_id": r["event"].event_id, "escalation_id": r["escalation"].msg_id if r["escalation"] else None} for r in remediation_results],
        }

        self.scenarios_run.append(scenario_result)
        return scenario_result

    def get_full_results(self):
        """Compile complete orchestration results."""
        all_spans = []
        for agent in self.agents.values():
            for span in agent.spans:
                all_spans.append({
                    "span_id": span.span_id, "trace_id": span.trace_id,
                    "parent_span_id": span.parent_span_id,
                    "agent_name": span.agent_name, "operation": span.operation,
                    "start_time": span.start_time, "end_time": span.end_time,
                    "status": span.status, "attributes": span.attributes,
                })

        all_messages = []
        for agent in self.agents.values():
            for msg in agent.messages_sent:
                all_messages.append({
                    "msg_id": msg.msg_id, "from_agent": msg.from_agent,
                    "to_agent": msg.to_agent, "msg_type": msg.msg_type,
                    "content": msg.content, "trace_id": msg.trace_id,
                    "timestamp": msg.timestamp, "priority": msg.priority,
                })

        return {
            "run_id": self.run_id,
            "start_time": self.start_time,
            "end_time": datetime.datetime.now().isoformat(),
            "agents": {name: agent.get_stats() for name, agent in self.agents.items()},
            "event_bus": {
                "total_events": len(self.event_bus.events),
                "topic_stats": self.event_bus.get_topic_stats(),
                "metrics": self.event_bus.metrics,
                "consumer_groups": self.event_bus.consumer_groups,
            },
            "traces": all_spans,
            "messages": all_messages,
            "scenarios": self.scenarios_run,
            "event_log": [{
                "event_id": e.event_id, "event_type": e.event_type,
                "source_agent": e.source_agent, "topic": next((t for t, evts in self.event_bus.topics.items() if e in evts), "unknown"),
                "trace_id": e.trace_id, "timestamp": e.timestamp,
                "status": e.status, "correlation_id": e.correlation_id,
                "payload_summary": {k: v for k, v in e.payload.items() if k in ["change_id", "analysis_id", "report_id", "plan_id", "regulation_title", "gaps_found", "total_requirements", "compliance_score", "total_steps"]}
            } for e in self.event_bus.events],
        }


def main():
    print("\n" + "#" * 60)
    print("# AGENT SWARM CORE — REGULATORY COMPLIANCE ORCHESTRATION")
    print("# 4-Agent Event-Driven Architecture Simulation")
    print("#" * 60)

    orchestrator = SwarmOrchestrator()

    # Scenario 1: HIPAA Privacy Rule Update
    scenario1_changes = [
        {
            "source": "Federal Register",
            "title": "HIPAA Privacy Rule Modification — Enhanced Patient Access Rights (2025 Amendment)",
            "summary": "The Department of Health and Human Services proposes modifications to the HIPAA Privacy Rule to strengthen patients' rights to access their own health information. Key changes include: reduced response time from 30 to 15 days for record requests, mandatory electronic format delivery, expanded definition of electronic health information, and new penalties for non-compliance exceeding $2 million per violation category.",
            "severity": "high",
            "sections": ["Section 164.524 (Access)", "Section 164.530 (Compliance)", "Section 1176 (Penalties)"]
        },
    ]
    orchestrator.run_scenario("HIPAA Privacy Rule — Patient Access Enhancement", scenario1_changes)

    # Scenario 2: Multi-Regulation Update
    scenario2_changes = [
        {
            "source": "ONC Standards",
            "title": "21st Century Cures Act — Information Blocking Rule v3.0",
            "summary": "Updated information blocking regulations with new exceptions for privacy-protecting technologies, expanded API requirements for patient-facing applications, and revised anti-information blocking provisions affecting healthcare providers and health IT developers.",
            "severity": "high",
            "sections": ["Section 400.200 (Prohibited Practices)", "Section 400.202 (Exceptions)", "Section 400.204 (API Requirements)"]
        },
        {
            "source": "HHS/OCR Guidance",
            "title": "OCR Enforcement Guidance — Ransomware and HIPAA (2025 Update)",
            "summary": "New enforcement guidance addressing ransomware attacks affecting covered entities and business associates. Establishes updated breach notification timelines (now 24 hours for ransomware incidents), mandatory incident response plan requirements, and enhanced safeguard obligations for network segmentation and backup encryption.",
            "severity": "critical",
            "sections": ["Section 164.308 (Security Management)", "Section 164.310 (Physical Safeguards)", "Section 164.312 (Technical Safeguards)"]
        },
    ]
    orchestrator.run_scenario("Multi-Regulation Update — Cures Act + Ransomware Guidance", scenario2_changes)

    # Print summary
    results = orchestrator.get_full_results()
    print(f"\n{'#'*60}")
    print(f"# SWARM ORCHESTRATION COMPLETE")
    print(f"# Run ID: {results['run_id']}")
    print(f"# Events Published: {results['event_bus']['metrics']['published']}")
    print(f"# Events Consumed: {results['event_bus']['metrics']['consumed']}")
    print(f"# Traces: {len(results['traces'])}")
    print(f"# Messages: {len(results['messages'])}")
    print(f"# Scenarios: {len(results['scenarios'])}")
    for name, stats in results["agents"].items():
        print(f"#   {stats['name']}: {stats['processed']} processed, {stats['spans']} spans, {stats['messages_sent']} msgs sent")
    print(f"#" * 60)

    # Save output
    output_path = "/home/z/my-project/download/agent_swarm_output.json"
    with open(output_path, "w") as f:
        json.dump(results, f, indent=2, default=str)
    print(f"\nOutput saved to: {output_path}")

    return results


if __name__ == "__main__":
    main()
