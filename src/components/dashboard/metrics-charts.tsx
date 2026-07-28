'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'

interface MetricSeries {
  unit: string
  description: string
  data: { timestamp: string; value: number }[]
}

interface MetricsChartsProps {
  metrics: {
    system: Record<string, MetricSeries>
    application: Record<string, MetricSeries>
  }
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts)
  return `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`
}

function getColorForMetric(name: string): string {
  const colors: Record<string, string> = {
    cpu_usage_percent: '#ef4444',
    memory_usage_percent: '#f97316',
    active_connections: '#eab308',
    request_rate_per_min: '#22c55e',
    error_rate_percent: '#ef4444',
    latency_p50_ms: '#3b82f6',
    latency_p99_ms: '#8b5cf6',
    queue_depth: '#f97316',
  }
  return colors[name] || '#6b7280'
}

function getThresholdLine(name: string): number | null {
  const thresholds: Record<string, number> = {
    cpu_usage_percent: 80,
    memory_usage_percent: 85,
    error_rate_percent: 5,
    latency_p99_ms: 1000,
  }
  return thresholds[name] ?? null
}

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
  const color = getColorForMetric(metricName)
  const threshold = getThresholdLine(metricName)
  const chartData = data.map((d) => ({
    ...d,
    time: formatTimestamp(d.timestamp),
  }))

  const isFillMetric = ['cpu_usage_percent', 'memory_usage_percent', 'request_rate_per_min'].includes(metricName)

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
            {isFillMetric ? (
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={`gradient-${metricName}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10 }}
                  stroke="hsl(var(--muted-foreground))"
                  interval="preserveStartEnd"
                />
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
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  fill={`url(#gradient-${metricName})`}
                  strokeWidth={2}
                />
              </AreaChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10 }}
                  stroke="hsl(var(--muted-foreground))"
                  interval="preserveStartEnd"
                />
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
                <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function MetricsCharts({ metrics }: MetricsChartsProps) {
  return (
    <div className="space-y-6">
      {/* System Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          System Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(metrics.system).map(([name, series]) => (
            <MetricChart
              key={name}
              title={name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              metricName={name}
              data={series.data}
              unit={series.unit}
              description={series.description}
            />
          ))}
        </div>
      </div>

      {/* Application Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Application Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(metrics.application).map(([name, series]) => (
            <MetricChart
              key={name}
              title={name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
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
