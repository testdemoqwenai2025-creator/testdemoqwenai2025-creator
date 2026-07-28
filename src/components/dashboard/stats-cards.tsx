'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AlertTriangle, Clock, Zap, Activity, BarChart3, Cpu, Layers, Bell,
  ShieldCheck, Coins, TrendingDown, Timer,
} from 'lucide-react'

interface StatsCardsProps {
  stats: {
    totalScenarios: number
    totalSpans: number
    violationScenarios: number
    totalImperatives: number
    totalViolations: number
    totalLogs: number
    errorLogs: number
    firingAlerts: number
    resolvedAlerts: number
    frameworks: number
    regulationsMonitored: number
    agents: number
  }
  metricsSummary: {
    current_compliance_posture: number
    current_violation_rate: number
    current_remediation_rate: number
    current_boilerplate_reduction: number
    current_token_savings: number
    current_audit_pass_rate: number
    current_ingestion_rate: number
    current_imperative_rate: number
    current_approval_latency: number
    peak_violation_rate: number
    min_posture_score: number
    avg_token_savings: number
  }
}

function ComplianceHealthBadge({ score }: { score: number }) {
  if (score >= 85) return <Badge className="text-xs bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">Healthy</Badge>
  if (score >= 75) return <Badge variant="secondary" className="text-xs">At Risk</Badge>
  return <Badge variant="destructive" className="text-xs">Breach</Badge>
}

export function StatsCards({ stats, metricsSummary }: StatsCardsProps) {
  const cards = [
    {
      title: 'Compliance Posture',
      value: `${metricsSummary.current_compliance_posture}`,
      subtitle: `Min observed: ${metricsSummary.min_posture_score}`,
      icon: ShieldCheck,
      badge: <ComplianceHealthBadge score={metricsSummary.current_compliance_posture} />,
    },
    {
      title: 'Violation Rate',
      value: `${metricsSummary.current_violation_rate}/hr`,
      subtitle: `Peak: ${metricsSummary.peak_violation_rate}/hr`,
      icon: AlertTriangle,
      badge: metricsSummary.current_violation_rate > 6 ? <Badge variant="destructive" className="text-xs">Surge</Badge> : null,
    },
    {
      title: 'Adversarial Audit',
      value: `${metricsSummary.current_audit_pass_rate}%`,
      subtitle: 'Violation detection rate (Phase I+II)',
      icon: Activity,
      badge: null,
    },
    {
      title: 'Remediation SLA',
      value: `${metricsSummary.current_remediation_rate}%`,
      subtitle: 'Violations remediated on time',
      icon: Clock,
      badge: metricsSummary.current_remediation_rate < 85 ? <Badge variant="secondary" className="text-xs">Watch</Badge> : null,
    },
    {
      title: 'Boilerplate Reduction',
      value: `${metricsSummary.current_boilerplate_reduction}%`,
      subtitle: 'Token savings (PDF §3.1: 60-80% target)',
      icon: TrendingDown,
      badge: null,
    },
    {
      title: 'Token Cost Saved',
      value: `$${metricsSummary.current_token_savings}/hr`,
      subtitle: `Avg: $${metricsSummary.avg_token_savings}/hr`,
      icon: Coins,
      badge: null,
    },
    {
      title: 'Active Imperatives',
      value: stats.totalImperatives.toString(),
      subtitle: `Across ${stats.regulationsMonitored} regulations`,
      icon: Layers,
      badge: null,
    },
    {
      title: 'Approval Latency',
      value: `${metricsSummary.current_approval_latency}h`,
      subtitle: 'Detection → CCO approval (SLA: 2h)',
      icon: Timer,
      badge: metricsSummary.current_approval_latency > 2 ? <Badge variant="destructive" className="text-xs">SLA Breach</Badge> : null,
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
