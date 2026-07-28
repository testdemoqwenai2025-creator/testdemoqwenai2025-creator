'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Activity,
  Cpu,
  MemoryStick,
  AlertTriangle,
  FileText,
  Zap,
  Layers,
  BarChart3,
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
  }
  metricsSummary: {
    current_cpu: number
    current_memory: number
    current_request_rate: number
    current_error_rate: number
    current_p50_latency: number
    current_p99_latency: number
    peak_cpu: number
    peak_memory: number
    avg_request_rate: number
  }
}

function getSeverityColor(value: number, warnThreshold: number, critThreshold: number) {
  if (value >= critThreshold) return 'destructive'
  if (value >= warnThreshold) return 'secondary'
  return 'default'
}

export function StatsCards({ stats, metricsSummary }: StatsCardsProps) {
  const cards = [
    {
      title: 'CPU Usage',
      value: `${metricsSummary.current_cpu}%`,
      subtitle: `Peak: ${metricsSummary.peak_cpu}%`,
      icon: Cpu,
      severity: getSeverityColor(metricsSummary.current_cpu, 75, 90),
    },
    {
      title: 'Memory',
      value: `${metricsSummary.current_memory}%`,
      subtitle: `Peak: ${metricsSummary.peak_memory}%`,
      icon: MemoryStick,
      severity: getSeverityColor(metricsSummary.current_memory, 80, 90),
    },
    {
      title: 'Request Rate',
      value: `${Math.round(metricsSummary.current_request_rate)}/min`,
      subtitle: `Avg: ${Math.round(metricsSummary.avg_request_rate)}/min`,
      icon: Zap,
      severity: 'default',
    },
    {
      title: 'Error Rate',
      value: `${metricsSummary.current_error_rate}%`,
      subtitle: `${stats.errorTraces} error traces`,
      icon: AlertTriangle,
      severity: getSeverityColor(metricsSummary.current_error_rate, 3, 8),
    },
    {
      title: 'P50 Latency',
      value: `${metricsSummary.current_p50_latency}ms`,
      subtitle: '50th percentile',
      icon: Activity,
      severity: getSeverityColor(metricsSummary.current_p50_latency, 100, 250),
    },
    {
      title: 'P99 Latency',
      value: `${metricsSummary.current_p99_latency}ms`,
      subtitle: '99th percentile',
      icon: BarChart3,
      severity: getSeverityColor(metricsSummary.current_p99_latency, 500, 1000),
    },
    {
      title: 'Active Traces',
      value: stats.totalTraces.toString(),
      subtitle: `${stats.totalSpans} spans across ${stats.services} services`,
      icon: Layers,
      severity: 'default',
    },
    {
      title: 'Firing Alerts',
      value: stats.firingAlerts.toString(),
      subtitle: `${stats.errorLogs} error logs`,
      icon: FileText,
      severity: stats.firingAlerts > 0 ? 'destructive' : 'default',
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
              {card.severity !== 'default' && (
                <Badge variant={card.severity as "default" | "destructive" | "secondary"} className="text-xs">
                  {card.severity === 'destructive' ? 'Critical' : card.severity === 'secondary' ? 'Warning' : 'Normal'}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
