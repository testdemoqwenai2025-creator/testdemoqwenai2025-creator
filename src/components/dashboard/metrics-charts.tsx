'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart,
} from 'recharts'
import { Cpu, Activity } from 'lucide-react'

interface MetricSeries {
  unit: string
  description: string
  data: { timestamp: string; value: number }[]
  owner_agent: string
}

interface MetricsChartsProps {
  metrics: {
    system: Record<string, MetricSeries>
    summary: Record<string, number>
  }
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts)
  return `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`
}

const METRIC_COLORS: Record<string, string> = {
  ingestion_throughput: '#3b82f6',
  imperative_extraction_rate: '#8b5cf6',
  violation_detection_rate: '#ef4444',
  remediation_completion_rate: '#22c55e',
  boilerplate_reduction_pct: '#06b6d4',
  compliance_posture_score: '#10b981',
  adversarial_audit_pass_rate: '#f97316',
  human_approval_latency_hr: '#eab308',
  token_cost_saved_usd: '#14b8a6',
}

const METRIC_THRESHOLDS: Record<string, number> = {
  compliance_posture_score: 75,
  violation_detection_rate: 10,
  remediation_completion_rate: 85,
  boilerplate_reduction_pct: 60,
  human_approval_latency_hr: 2,
}

const AREA_METRICS = ['ingestion_throughput', 'compliance_posture_score', 'token_cost_saved_usd', 'remediation_completion_rate']

const AGENT_COLORS: Record<string, string> = {
  Ingestion_Agent: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  Legal_Analyst_Agent: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  Prosecutor_Agent: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  Defender_Agent: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  Orchestrator: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
}

function friendlyName(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function MetricChart({
  title, metricName, data, unit, description, ownerAgent,
}: {
  title: string
  metricName: string
  data: { timestamp: string; value: number }[]
  unit: string
  description: string
  ownerAgent: string
}) {
  const color = METRIC_COLORS[metricName] || '#6b7280'
  const threshold = METRIC_THRESHOLDS[metricName]
  const chartData = data.map((d) => ({ ...d, time: formatTimestamp(d.timestamp) }))
  const isFill = AREA_METRICS.includes(metricName)

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Badge className={`text-[10px] h-5 ${AGENT_COLORS[ownerAgent] || ''}`}>{ownerAgent.replace('_', ' ')}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="h-[180px] w-full">
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
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
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
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
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

export function MetricsCharts({ metrics }: MetricsChartsProps) {
  const entries = Object.entries(metrics.system)
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Activity className="h-4 w-4" />
        Swarm Pipeline Metrics
        <span className="text-xs text-muted-foreground font-normal ml-2">color-coded by owning agent</span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {entries.map(([name, series]) => (
          <MetricChart
            key={name}
            title={friendlyName(name)}
            metricName={name}
            data={series.data}
            unit={series.unit}
            description={series.description}
            ownerAgent={series.owner_agent}
          />
        ))}
      </div>
    </div>
  )
}
