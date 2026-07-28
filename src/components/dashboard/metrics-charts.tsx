'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart,
} from 'recharts'

interface MetricSeries {
  unit: string
  description: string
  data: { timestamp: string; value: number }[]
}

interface MetricsChartsProps {
  metrics: {
    system: Record<string, MetricSeries>
    compliance: Record<string, MetricSeries>
  }
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts)
  return `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`
}

const METRIC_COLORS: Record<string, string> = {
  cpu_usage_percent: '#ef4444',
  memory_usage_percent: '#f97316',
  compliance_score_percent: '#22c55e',
  violation_rate_per_min: '#ef4444',
  policy_evaluations_per_min: '#3b82f6',
  risk_score: '#f97316',
  audit_coverage_percent: '#8b5cf6',
  evidence_collection_percent: '#06b6d4',
}

const METRIC_THRESHOLDS: Record<string, number> = {
  compliance_score_percent: 75,
  violation_rate_per_min: 5,
  risk_score: 60,
  evidence_collection_percent: 70,
}

const AREA_METRICS = ['compliance_score_percent', 'policy_evaluations_per_min', 'cpu_usage_percent', 'audit_coverage_percent']

function MetricChart({
  title,
  metricName,
  data,
  unit,
  description,
}: {
  title: string
  metricName: string
  data: { timestamp: string; value: number }[]
  unit: string
  description: string
}) {
  const color = METRIC_COLORS[metricName] || '#6b7280'
  const threshold = METRIC_THRESHOLDS[metricName]
  const chartData = data.map((d) => ({
    ...d,
    time: formatTimestamp(d.timestamp),
  }))
  const isFill = AREA_METRICS.includes(metricName)

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <span className="text-xs text-muted-foreground">{unit}</span>
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {isFill ? (
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={`grad-${metricName}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={45} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  labelFormatter={(l) => `Time: ${l} UTC`}
                  formatter={(value: number) => [`${value} ${unit}`, title]}
                />
                {threshold !== undefined && (
                  <Line type="monotone" dataKey={() => threshold} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1} dot={false} />
                )}
                <Area type="monotone" dataKey="value" stroke={color} fill={`url(#grad-${metricName})`} strokeWidth={2} />
              </AreaChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={45} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  labelFormatter={(l) => `Time: ${l} UTC`}
                  formatter={(value: number) => [`${value} ${unit}`, title]}
                />
                {threshold !== undefined && (
                  <Line type="monotone" dataKey={() => threshold} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1} dot={false} />
                )}
                <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function friendlyName(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function MetricsCharts({ metrics }: MetricsChartsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Compliance Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(metrics.compliance).map(([name, series]) => (
            <MetricChart
              key={name}
              title={friendlyName(name)}
              metricName={name}
              data={series.data}
              unit={series.unit}
              description={series.description}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-slate-400" />
          System Infrastructure
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(metrics.system).map(([name, series]) => (
            <MetricChart
              key={name}
              title={friendlyName(name)}
              metricName={name}
              data={series.data}
              unit={series.unit}
              description={series.description}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
