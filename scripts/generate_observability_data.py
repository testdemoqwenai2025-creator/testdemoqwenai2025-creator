#!/usr/bin/env python3
"""
Observability Infrastructure Data Generator
=============================================
Generates comprehensive simulated observability data including:
  - Distributed Tracing (spans, services, operations, latencies)
  - System & Application Metrics (CPU, memory, request rates, error rates)
  - Structured Logs (multi-level, multi-service, with context)
  - Alerting (rules definitions, triggered alerts, severity)

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
    """Return ISO 8601 UTC timestamp relative to NOW."""
    dt = NOW - timedelta(minutes=minutes_ago, seconds=seconds_offset)
    return dt.strftime("%Y-%m-%dT%H:%M:%S.") + f"{dt.microsecond // 1000:03d}Z"

def rand_latency(lo=5, hi=500):
    """Random latency in ms with log-normal-ish distribution."""
    return max(lo, min(hi, int(random.lognormvariate(math.log(50), 1.0))))

def rand_choice(options, weights=None):
    """Weighted random choice."""
    return random.choices(options, weights=weights or [1]*len(options), k=1)[0]


# ══════════════════════════════════════════════════════════════════════════════
# 1. DISTRIBUTED TRACING
# ══════════════════════════════════════════════════════════════════════════════

SERVICES = [
    "api-gateway", "auth-service", "user-service", "order-service",
    "payment-service", "inventory-service", "notification-service",
    "cache-redis", "postgres-db", "message-queue"
]

OPERATIONS = {
    "api-gateway": ["HTTP GET /api/users", "HTTP POST /api/orders", "HTTP GET /api/products",
                     "HTTP POST /api/auth/login", "HTTP GET /api/health"],
    "auth-service": ["ValidateToken", "RefreshToken", "Authenticate", "RevokeSession"],
    "user-service": ["GetUserProfile", "UpdateUser", "ListUsers", "DeleteUser"],
    "order-service": ["CreateOrder", "GetOrder", "ListOrders", "CancelOrder", "UpdateOrderStatus"],
    "payment-service": ["ProcessPayment", "RefundPayment", "GetPaymentStatus", "ValidateCard"],
    "inventory-service": ["CheckStock", "ReserveStock", "ReleaseStock", "GetInventory"],
    "notification-service": ["SendEmail", "SendSMS", "SendPush", "QueueNotification"],
    "cache-redis": ["GET", "SET", "DEL", "EXPIRE", "HGETALL"],
    "postgres-db": ["SELECT", "INSERT", "UPDATE", "BEGIN", "COMMIT", "ROLLBACK"],
    "message-queue": ["PUBLISH", "CONSUME", "ACK", "NACK", "REQUEUE"]
}

STATUSES = ["ok", "ok", "ok", "ok", "ok", "ok", "ok", "error", "error", "timeout"]  # 70% ok

def generate_traces(num_traces=50):
    """Generate distributed trace data with realistic span hierarchies."""
    traces = []
    trace_ids_used = set()

    for i in range(num_traces):
        trace_id = str(uuid.uuid4())
        while trace_id in trace_ids_used:
            trace_id = str(uuid.uuid4())
        trace_ids_used.add(trace_id)

        # Pick a root service (typically api-gateway)
        root_service = "api-gateway"
        root_operation = rand_choice(OPERATIONS[root_service])
        root_status = rand_choice(STATUSES)
        root_start = ts(minutes_ago=random.randint(0, 60))
        root_latency = rand_latency(20, 800)
        root_span_id = str(uuid.uuid4())[:16]

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
            }
        }]

        # Generate child spans (2-5 per trace)
        num_children = random.randint(2, 5)
        for j in range(num_children):
            child_service = rand_choice(SERVICES)
            child_op = rand_choice(OPERATIONS.get(child_service, ["unknown"]))
            child_status = rand_choice(STATUSES)
            child_start = ts(minutes_ago=random.randint(0, 59), seconds_offset=random.randint(0, 59))
            child_latency = rand_latency(3, 300)
            child_span_id = str(uuid.uuid4())[:16]

            span_tags = {}
            if "HTTP" in child_op:
                parts = child_op.split()
                span_tags["http.method"] = parts[1]
                span_tags["http.url"] = parts[-1]
            elif child_op in ("SELECT", "INSERT", "UPDATE"):
                span_tags["db.system"] = "postgresql"
                span_tags["db.statement"] = child_op.lower()

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
            "spans": spans
        })

    return traces


# ══════════════════════════════════════════════════════════════════════════════
# 2. METRICS
# ══════════════════════════════════════════════════════════════════════════════

def generate_metrics(num_points=60):
    """Generate time-series metrics for system and application monitoring."""
    cpu_points = []
    memory_points = []
    request_rate_points = []
    error_rate_points = []
    p50_latency_points = []
    p99_latency_points = []
    active_connections_points = []
    queue_depth_points = []

    base_cpu = 45
    base_mem = 62
    base_req = 1200
    base_err = 0.8
    base_p50 = 45
    base_p99 = 350
    base_conn = 85
    base_queue = 12

    for i in range(num_points):
        t = ts(minutes_ago=(num_points - i))

        # Simulate realistic patterns: gradual increase, spike at ~40%, recovery
        time_factor = math.sin(i / num_points * 2 * math.pi) * 10
        spike_factor = 30 if 20 <= i <= 25 else 0  # traffic spike

        cpu = round(max(5, min(98, base_cpu + time_factor + spike_factor + random.gauss(0, 5))), 1)
        mem = round(max(30, min(95, base_mem + i * 0.1 + random.gauss(0, 2))), 1)
        req_rate = round(max(100, base_req + spike_factor * 80 + random.gauss(0, 100)), 0)
        err_rate = round(max(0, min(15, base_err + (spike_factor * 0.15) + random.gauss(0, 0.3))), 2)
        p50 = round(max(5, base_p50 + spike_factor * 0.5 + random.gauss(0, 8)), 1)
        p99 = round(max(50, base_p99 + spike_factor * 3 + random.gauss(0, 40)), 1)
        conn = round(max(10, base_conn + spike_factor * 1.5 + random.gauss(0, 8)), 0)
        queue = round(max(0, base_queue + spike_factor * 0.8 + random.gauss(0, 3)), 0)

        cpu_points.append({"timestamp": t, "value": cpu})
        memory_points.append({"timestamp": t, "value": mem})
        request_rate_points.append({"timestamp": t, "value": req_rate})
        error_rate_points.append({"timestamp": t, "value": err_rate})
        p50_latency_points.append({"timestamp": t, "value": p50})
        p99_latency_points.append({"timestamp": t, "value": p99})
        active_connections_points.append({"timestamp": t, "value": conn})
        queue_depth_points.append({"timestamp": t, "value": queue})

    return {
        "system": {
            "cpu_usage_percent": {"unit": "%", "description": "CPU utilization across all nodes", "data": cpu_points},
            "memory_usage_percent": {"unit": "%", "description": "Memory utilization (RSS + cache)", "data": memory_points},
            "active_connections": {"unit": "count", "description": "Active DB + cache connections", "data": active_connections_points},
        },
        "application": {
            "request_rate_per_min": {"unit": "req/min", "description": "Total incoming request rate", "data": request_rate_points},
            "error_rate_percent": {"unit": "%", "description": "5xx error rate as percentage of total", "data": error_rate_points},
            "latency_p50_ms": {"unit": "ms", "description": "50th percentile response latency", "data": p50_latency_points},
            "latency_p99_ms": {"unit": "ms", "description": "99th percentile response latency", "data": p99_latency_points},
            "queue_depth": {"unit": "count", "description": "Message queue pending messages", "data": queue_depth_points},
        },
        "summary": {
            "current_cpu": cpu_points[-1]["value"],
            "current_memory": memory_points[-1]["value"],
            "current_request_rate": request_rate_points[-1]["value"],
            "current_error_rate": error_rate_points[-1]["value"],
            "current_p50_latency": p50_latency_points[-1]["value"],
            "current_p99_latency": p99_latency_points[-1]["value"],
            "peak_cpu": max(p["value"] for p in cpu_points),
            "peak_memory": max(p["value"] for p in memory_points),
            "avg_request_rate": round(sum(p["value"] for p in request_rate_points) / len(request_rate_points), 0),
        }
    }


# ══════════════════════════════════════════════════════════════════════════════
# 3. STRUCTURED LOGS
# ══════════════════════════════════════════════════════════════════════════════

LOG_LEVELS = ["DEBUG", "INFO", "INFO", "INFO", "INFO", "WARN", "WARN", "ERROR", "ERROR", "FATAL"]

LOG_MESSAGES = {
    "DEBUG": [
        "Cache hit for key user:{user_id}:profile",
        "Connection pool stats: active={active}, idle={idle}, waiting={waiting}",
        "Request headers validated successfully",
        "GRPC message serialized in {elapsed_ms}ms",
        "Middleware chain executed: {middleware_count} middlewares",
    ],
    "INFO": [
        "Request completed: {method} {path} -> {status_code} in {elapsed_ms}ms",
        "User {user_id} authenticated successfully via {auth_method}",
        "Order {order_id} created with {item_count} items, total=${amount}",
        "Health check passed for {service_name} (latency: {elapsed_ms}ms)",
        "Deployment v{version} rolled out to {region} ({instances} instances)",
        "Database migration {migration_id} applied successfully",
        "Cache invalidated for pattern: user:{user_id}:*",
    ],
    "WARN": [
        "High memory usage detected: {percent}% utilization (threshold: 85%)",
        "Slow query detected: {query_type} on {table} took {elapsed_ms}ms (threshold: 200ms)",
        "Rate limit approaching for client {client_id}: {count}/{limit} requests",
        "Retry attempt {attempt}/{max_retries} for {service_name} after timeout",
        "Certificate for {domain} expires in {days} days",
        "Connection pool exhaustion imminent: {active}/{max_connections} connections used",
    ],
    "ERROR": [
        "Failed to process payment for order {order_id}: {error_code} - {error_msg}",
        "Database connection timeout after {elapsed_ms}ms: {connection_string}",
        "Unhandled exception in {service_name}.{function_name}: {error_msg}",
        "Kafka producer failed to publish to topic {topic}: {error_msg}",
        "TLS handshake failed with upstream {upstream}: {error_msg}",
        "Request to {service_name} failed after {max_retries} retries: circuit breaker OPEN",
    ],
    "FATAL": [
        "Out of memory: heap allocation failed for {size_mb}MB request in {service_name}",
        "Data corruption detected in table {table}: checksum mismatch at block {block_id}",
        "Primary node lost quorum: {alive_nodes}/{total_nodes} nodes responding",
    ],
}

def generate_logs(num_logs=200):
    """Generate structured log entries across multiple services."""
    logs = []

    for i in range(num_logs):
        level = rand_choice(LOG_LEVELS)
        service = rand_choice(SERVICES)
        message_template = rand_choice(LOG_MESSAGES[level])
        timestamp = ts(minutes_ago=random.randint(0, 60), seconds_offset=random.randint(0, 59))

        # Fill in template variables
        message = message_template.format(
            user_id=random.randint(1000, 9999),
            active=random.randint(5, 50),
            idle=random.randint(2, 20),
            waiting=random.randint(0, 10),
            elapsed_ms=rand_latency(1, 2000),
            middleware_count=random.randint(3, 8),
            method=rand_choice(["GET", "POST", "PUT", "DELETE"]),
            path=rand_choice(["/api/users", "/api/orders", "/api/products", "/api/auth", "/api/health"]),
            status_code=rand_choice([200, 200, 200, 201, 301, 400, 401, 404, 500, 502, 503]),
            auth_method=rand_choice(["JWT", "OAuth2", "API Key", "mTLS"]),
            order_id=f"ORD-{random.randint(10000, 99999)}",
            item_count=random.randint(1, 20),
            amount=f"{random.uniform(10, 500):.2f}",
            service_name=rand_choice(SERVICES),
            version=f"v{random.randint(1,5)}.{random.randint(0,20)}.{random.randint(0,99)}",
            region=rand_choice(["us-east-1", "eu-west-1", "ap-southeast-1"]),
            instances=random.randint(2, 10),
            migration_id=f"mig_{random.randint(100,999)}_{uuid.uuid4().hex[:6]}",
            percent=random.randint(80, 98),
            query_type=rand_choice(["SELECT", "JOIN", "UPDATE", "INSERT"]),
            table=rand_choice(["users", "orders", "products", "payments", "sessions"]),
            client_id=f"client_{uuid.uuid4().hex[:8]}",
            count=random.randint(80, 100),
            limit=100,
            attempt=random.randint(1, 3),
            max_retries=3,
            domain=rand_choice(["api.example.com", "auth.example.com", "cdn.example.com"]),
            days=random.randint(1, 30),
            max_connections=100,
            error_code=rand_choice(["PAYMENT_DECLINED", "INSUFFICIENT_FUNDS", "TIMEOUT", "CONNECTION_REFUSED", "SSL_ERROR"]),
            error_msg=rand_choice(["Connection refused", "Operation timed out", "Invalid argument", "Resource exhausted", "Internal error"]),
            function_name=rand_choice(["handleRequest", "processOrder", "validateToken", "sendNotification"]),
            topic=rand_choice(["orders.created", "payments.processed", "users.updated", "inventory.reserved"]),
            upstream=rand_choice(["postgres-primary", "redis-cluster", "kafka-broker-1"]),
            size_mb=random.randint(128, 2048),
            block_id=random.randint(0, 9999),
            alive_nodes=random.randint(1, 3),
            total_nodes=5,
            connection_string="postgresql://***:***@db-primary:5432/production",
        )

        # Only include fields relevant to the log level
        fields = {
            "service": service,
            "instance": f"{service}-{random.randint(1,5)}",
            "traceId": str(uuid.uuid4())[:16],
            "spanId": str(uuid.uuid4())[:16],
            "hostname": f"{service}-{random.choice(['a','b','c'])}-{random.randint(1,10)}.{rand_choice(['us-east', 'eu-west'])}.compute.internal",
            "version": f"v{random.randint(1,5)}.{random.randint(0,20)}.{random.randint(0,99)}",
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

    # Sort by timestamp descending (most recent first)
    logs.sort(key=lambda x: x["timestamp"], reverse=True)
    return logs


# ══════════════════════════════════════════════════════════════════════════════
# 4. ALERTING
# ══════════════════════════════════════════════════════════════════════════════

ALERT_SEVERITIES = ["critical", "critical", "high", "high", "high", "medium", "medium", "low", "info"]

ALERT_STATES = ["firing", "firing", "firing", "resolved", "resolved", "acknowledged"]

def generate_alert_rules():
    """Define alerting rules for the observability stack."""
    return [
        {
            "id": "alert-rule-001",
            "name": "HighErrorRate",
            "description": "Trigger when 5xx error rate exceeds 5% over 5 minutes",
            "condition": "error_rate_percent > 5 for 5m",
            "severity": "critical",
            "service": "api-gateway",
            "channel": "#incidents-critical",
            "runbook": "https://wiki/runbooks/high-error-rate",
        },
        {
            "id": "alert-rule-002",
            "name": "HighLatencyP99",
            "description": "Trigger when P99 latency exceeds 1000ms for 3 minutes",
            "condition": "latency_p99_ms > 1000 for 3m",
            "severity": "high",
            "service": "api-gateway",
            "channel": "#incidents-high",
            "runbook": "https://wiki/runbooks/high-latency",
        },
        {
            "id": "alert-rule-003",
            "name": "MemoryUsageCritical",
            "description": "Trigger when memory usage exceeds 90% for 5 minutes",
            "condition": "memory_usage_percent > 90 for 5m",
            "severity": "critical",
            "service": "infra-monitoring",
            "channel": "#incidents-critical",
            "runbook": "https://wiki/runbooks/memory-pressure",
        },
        {
            "id": "alert-rule-004",
            "name": "DatabaseConnectionPoolExhaustion",
            "description": "Trigger when active DB connections exceed 90% of pool size",
            "condition": "active_connections > 90 for 2m",
            "severity": "high",
            "service": "postgres-db",
            "channel": "#incidents-high",
            "runbook": "https://wiki/runbooks/db-connection-exhaustion",
        },
        {
            "id": "alert-rule-005",
            "name": "PaymentServiceDown",
            "description": "Trigger when payment service health check fails 3 consecutive times",
            "condition": "health_check_failures > 3 for 1m",
            "severity": "critical",
            "service": "payment-service",
            "channel": "#incidents-critical",
            "runbook": "https://wiki/runbooks/payment-service-down",
        },
        {
            "id": "alert-rule-006",
            "name": "QueueDepthHigh",
            "description": "Trigger when message queue depth exceeds 500 messages",
            "condition": "queue_depth > 500 for 5m",
            "severity": "medium",
            "service": "message-queue",
            "channel": "#incidents-medium",
            "runbook": "https://wiki/runbooks/queue-backlog",
        },
        {
            "id": "alert-rule-007",
            "name": "CPUUsageWarning",
            "description": "Trigger when CPU usage exceeds 80% for 10 minutes",
            "condition": "cpu_usage_percent > 80 for 10m",
            "severity": "medium",
            "service": "infra-monitoring",
            "channel": "#incidents-medium",
            "runbook": "https://wiki/runbooks/high-cpu",
        },
        {
            "id": "alert-rule-008",
            "name": "CertificateExpiry",
            "description": "Trigger when TLS certificate expires within 7 days",
            "condition": "certificate_expiry_days < 7",
            "severity": "low",
            "service": "infra-monitoring",
            "channel": "#ops-notifications",
            "runbook": "https://wiki/runbooks/cert-renewal",
        },
    ]


def generate_triggered_alerts(num_alerts=25):
    """Generate triggered alert instances."""
    rules = generate_alert_rules()
    alerts = []

    for i in range(num_alerts):
        rule = rand_choice(rules)
        severity = rule["severity"]
        state = rand_choice(ALERT_STATES)
        fired_at = ts(minutes_ago=random.randint(0, 55))

        alert = {
            "alertId": f"ALERT-{uuid.uuid4().hex[:8].upper()}",
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
                "region": rand_choice(["us-east-1", "eu-west-1", "ap-southeast-1"]),
                "team": rand_choice(["platform", "payments", "backend", "infra"]),
            },
            "annotations": {
                "summary": f"{rule['name']} triggered on {rule['service']}",
                "dashboard": f"https://grafana.internal/d/{rule['id']}",
            },
            "metrics": {
                "current_value": round(random.uniform(0.5, 3.0) * float(rule["condition"].split(">")[1].split()[0]), 2)
                if ">" in rule["condition"] else None,
                "threshold": float(rule["condition"].split(">")[1].split()[0])
                if ">" in rule["condition"] else None,
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
    print("=" * 60)
    print("  Observability Infrastructure Data Generator")
    print("=" * 60)

    print("\n[1/4] Generating distributed traces...")
    traces = generate_traces(num_traces=50)
    print(f"       Generated {len(traces)} traces with "
          f"{sum(t['spanCount'] for t in traces)} total spans")

    print("[2/4] Generating system & application metrics...")
    metrics = generate_metrics(num_points=60)
    print(f"       Generated {len(metrics['system']) + len(metrics['application'])} metric series "
          f"({len(metrics['system']['cpu_usage_percent']['data'])} data points each)")

    print("[3/4] Generating structured logs...")
    logs = generate_logs(num_logs=200)
    level_counts = {}
    for log in logs:
        level_counts[log["level"]] = level_counts.get(log["level"], 0) + 1
    print(f"       Generated {len(logs)} log entries")
    for level, count in sorted(level_counts.items()):
        print(f"         {level}: {count}")

    print("[4/4] Generating alerting rules & triggered alerts...")
    alert_rules = generate_alert_rules()
    triggered_alerts = generate_triggered_alerts(num_alerts=25)
    severity_counts = {}
    for alert in triggered_alerts:
        severity_counts[alert["severity"]] = severity_counts.get(alert["severity"], 0) + 1
    print(f"       Defined {len(alert_rules)} alert rules")
    print(f"       Generated {len(triggered_alerts)} triggered alerts")
    for sev, count in sorted(severity_counts.items()):
        print(f"         {sev}: {count}")

    # Assemble the full output
    output = {
        "generatedAt": NOW.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z",
        "generator": "observability-infrastructure-script",
        "version": "1.0.0",
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
        }
    }

    # Write to file
    with open(OUTPUT_PATH, "w") as f:
        json.dump(output, f, indent=2)

    print(f"\n{'=' * 60}")
    print(f"  Output saved to: {OUTPUT_PATH}")
    print(f"  File size: {len(json.dumps(output)):,} bytes")
    print(f"{'=' * 60}")

    return output


if __name__ == "__main__":
    main()
