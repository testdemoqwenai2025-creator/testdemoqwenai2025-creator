'use client'

import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  BarChart3,
  Activity,
  Clock,
  FileText,
  Bell,
  Layers,
  Cpu,
  Shield,
  Github,
  RefreshCw,
  Database,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { MetricsCharts } from '@/components/dashboard/metrics-charts'
import { TracesPanel } from '@/components/dashboard/traces-panel'
import { LogsPanel } from '@/components/dashboard/logs-panel'
import { AlertsPanel } from '@/components/dashboard/alerts-panel'

interface ObservabilityData {
  generatedAt: string
  generator: string
  version: string
  statistics: {
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
  data: {
    traces: any[]
    metrics: any
    logs: any[]
    alerting: {
      rules: any[]
      triggeredAlerts: any[]
    }
  }
}

export default function Home() {
  const [data, setData] = useState<ObservabilityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/observability')
      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error('Failed to fetch observability data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin" />
          <p className="text-muted-foreground text-sm">Loading observability data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-emerald-500" />
              <h1 className="text-lg font-bold tracking-tight">Observability Dashboard</h1>
            </div>
            <Badge variant="outline" className="text-xs hidden sm:inline-flex">
              <Database className="h-3 w-3 mr-1" />
              {data.statistics.services} services
            </Badge>
            <Badge variant="outline" className="text-xs hidden sm:inline-flex">
              <Layers className="h-3 w-3 mr-1" />
              {data.statistics.totalTraces} traces
            </Badge>
            {data.statistics.firingAlerts > 0 && (
              <Badge variant="destructive" className="text-xs animate-pulse">
                <Bell className="h-3 w-3 mr-1" />
                {data.statistics.firingAlerts} firing
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={fetchData} className="text-xs">
              <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" className="text-xs" asChild>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-3.5 w-3.5 mr-1" />
                GitHub
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex-wrap h-auto">
            <TabsTrigger value="overview" className="text-xs gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="metrics" className="text-xs gap-1.5">
              <Cpu className="h-3.5 w-3.5" />
              Metrics
            </TabsTrigger>
            <TabsTrigger value="traces" className="text-xs gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Traces
            </TabsTrigger>
            <TabsTrigger value="logs" className="text-xs gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Logs
            </TabsTrigger>
            <TabsTrigger value="alerts" className="text-xs gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              Alerts
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Hero Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="border-emerald-500/20 bg-emerald-500/5">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-emerald-500">{data.statistics.services}</div>
                  <div className="text-xs text-muted-foreground mt-1">Services Monitored</div>
                </CardContent>
              </Card>
              <Card className="border-blue-500/20 bg-blue-500/5">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-blue-500">{data.statistics.totalTraces}</div>
                  <div className="text-xs text-muted-foreground mt-1">Distributed Traces</div>
                </CardContent>
              </Card>
              <Card className="border-amber-500/20 bg-amber-500/5">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-amber-500">{data.statistics.totalLogs}</div>
                  <div className="text-xs text-muted-foreground mt-1">Log Entries</div>
                </CardContent>
              </Card>
              <Card className="border-red-500/20 bg-red-500/5">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-red-500">{data.statistics.firingAlerts}</div>
                  <div className="text-xs text-muted-foreground mt-1">Firing Alerts</div>
                </CardContent>
              </Card>
            </div>

            {/* KPI Cards */}
            <StatsCards stats={data.statistics} metricsSummary={data.data.metrics.summary} />

            {/* Mini Metrics Preview */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Quick Metrics Glance</h3>
                <Button variant="link" size="sm" className="text-xs" onClick={() => setActiveTab('metrics')}>
                  View all metrics →
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MetricsQuickChart
                  title="CPU Usage"
                  data={data.data.metrics.system.cpu_usage_percent.data}
                  unit="%"
                  color="#ef4444"
                  threshold={80}
                />
                <MetricsQuickChart
                  title="Request Rate"
                  data={data.data.metrics.application.request_rate_per_min.data}
                  unit="req/min"
                  color="#22c55e"
                />
                <MetricsQuickChart
                  title="Error Rate"
                  data={data.data.metrics.application.error_rate_percent.data}
                  unit="%"
                  color="#ef4444"
                  threshold={5}
                />
                <MetricsQuickChart
                  title="P99 Latency"
                  data={data.data.metrics.application.latency_p99_ms.data}
                  unit="ms"
                  color="#8b5cf6"
                  threshold={1000}
                />
              </div>
            </div>
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics">
            <MetricsCharts metrics={data.data.metrics} />
          </TabsContent>

          {/* Traces Tab */}
          <TabsContent value="traces">
            <TracesPanel traces={data.data.traces} />
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs">
            <LogsPanel logs={data.data.logs} />
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts">
            <AlertsPanel
              rules={data.data.alerting.rules}
              alerts={data.data.alerting.triggeredAlerts}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Activity className="h-3.5 w-3.5" />
            <span>Observability Infrastructure Dashboard</span>
            <Separator orientation="vertical" className="h-3" />
            <span>Data generated: {new Date(data.generatedAt).toLocaleString()} UTC</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">{data.version}</Badge>
            <span>Built with Next.js + Recharts + shadcn/ui</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ── Quick Mini Chart (for Overview tab) ──────────────────────────────────────

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

function MetricsQuickChart({
  title,
  data,
  unit,
  color,
  threshold,
}: {
  title: string
  data: { timestamp: string; value: number }[]
  unit: string
  color: string
  threshold?: number
}) {
  const chartData = data.map((d) => ({
    ...d,
    time: new Date(d.timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    }),
  }))
  const latest = data[data.length - 1]?.value ?? 0
  const isOverThreshold = threshold !== undefined && latest > threshold

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{title}</span>
          <span className={`text-lg font-bold ${isOverThreshold ? 'text-red-500' : ''}`}>
            {Math.round(latest * 10) / 10}
            <span className="text-xs font-normal text-muted-foreground ml-0.5">{unit}</span>
          </span>
        </div>
        <div className="h-[120px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`quick-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" hide />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  fontSize: '11px',
                }}
                formatter={(value: number) => [`${value} ${unit}`, title]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                fill={`url(#quick-${title})`}
                strokeWidth={1.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
