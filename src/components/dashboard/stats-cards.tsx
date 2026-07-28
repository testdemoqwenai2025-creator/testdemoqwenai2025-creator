'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ShieldCheck,
  AlertTriangle,
  FileWarning,
  Activity,
  Cpu,
  MemoryStick,
  BarChart3,
  Zap,
  Layers,
  Bell,
  Lock,
  ClipboardCheck,
} from 'lucide-react'

interface StatsCardsProps {
  stats: {
    totalTraces: number
    totalSpans: number
    errorTraces: number
    totalLogs: number
    errorLogs: number
    totalAlertRules: number
    firingAlerts: number
    resolvedAlerts: number
    services: number
    frameworks: number
  }
  metricsSummary: {
    current_cpu: number
    current_memory: number
    compliance_score: number
    violation_rate: number
    policy_eval_rate: number
    risk_score: number
    audit_coverage: number
    evidence_collection: number
    peak_violation_rate: number
    min_compliance_score: number
  }
}

function SeverityBadge({ value, warnThreshold, critThreshold }: { value: number; warnThreshold: number; critThreshold: number }) {
  if (value >= critThreshold) return <Badge variant="destructive" className="text-xs">Critical</Badge>
  if (value >= warnThreshold) return <Badge variant="secondary" className="text-xs">Warning</Badge>
  return <Badge variant="outline" className="text-xs">Normal</Badge>
}

function ComplianceHealthBadge({ score }: { score: number }) {
  if (score >= 85) return <Badge className="text-xs bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">Healthy</Badge>
  if (score >= 75) return <Badge variant="secondary" className="text-xs">At Risk</Badge>
  return <Badge variant="destructive" className="text-xs">Breach</Badge>
}

export function StatsCards({ stats, metricsSummary }: StatsCardsProps) {
  const cards = [
    {
      title: 'Compliance Score',
      value: `${metricsSummary.compliance_score}%`,
      subtitle: `Min: ${metricsSummary.min_compliance_score}%`,
      icon: ShieldCheck,
      badge: <ComplianceHealthBadge score={metricsSummary.compliance_score} />,
    },
    {
      title: 'Risk Score',
      value: `${metricsSummary.risk_score}`,
      subtitle: 'Lower is better (0-100)',
      icon: Activity,
      badge: <SeverityBadge value={metricsSummary.risk_score} warnThreshold={40} critThreshold={60} />,
    },
    {
      title: 'Violation Rate',
      value: `${metricsSummary.violation_rate}/min`,
      subtitle: `Peak: ${metricsSummary.peak_violation_rate}/min`,
      icon: FileWarning,
      badge: <SeverityBadge value={metricsSummary.violation_rate} warnThreshold={3} critThreshold={5} />,
    },
    {
      title: 'Policy Evals',
      value: `${Math.round(metricsSummary.policy_eval_rate)}/min`,
      subtitle: 'Evaluation throughput',
      icon: Zap,
      badge: null,
    },
    {
      title: 'Audit Coverage',
      value: `${metricsSummary.audit_coverage}%`,
      subtitle: 'Trail completeness',
      icon: ClipboardCheck,
      badge: <SeverityBadge value={100 - metricsSummary.audit_coverage} warnThreshold={10} critThreshold={20} />,
    },
    {
      title: 'Evidence Collection',
      value: `${metricsSummary.evidence_collection}%`,
      subtitle: 'Period completeness',
      icon: Lock,
      badge: <SeverityBadge value={100 - metricsSummary.evidence_collection} warnThreshold={15} critThreshold={30} />,
    },
    {
      title: 'CPU Usage',
      value: `${metricsSummary.current_cpu}%`,
      subtitle: 'Compliance nodes',
      icon: Cpu,
      badge: <SeverityBadge value={metricsSummary.current_cpu} warnThreshold={75} critThreshold={90} />,
    },
    {
      title: 'Firing Alerts',
      value: stats.firingAlerts.toString(),
      subtitle: `${stats.errorLogs} critical log events`,
      icon: Bell,
      badge: stats.firingAlerts > 0 ? <Badge variant="destructive" className="text-xs">Active</Badge> : null,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold">{card.value}</div>
              {card.badge}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
