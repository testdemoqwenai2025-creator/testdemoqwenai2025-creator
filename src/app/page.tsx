'use client'

import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  BarChart3, Activity, Clock, FileText, Shield, Cpu, Github, RefreshCw,
  ShieldCheck, Database, Layers, Scale, Gavel, Network, GitBranch,
  Radio, Link2, Workflow, Boxes,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { MetricsCharts } from '@/components/dashboard/metrics-charts'
import { TracesPanel } from '@/components/dashboard/traces-panel'
import { LogsPanel } from '@/components/dashboard/logs-panel'
import { AlertsPanel } from '@/components/dashboard/alerts-panel'
import { AgentTopologyPanel } from '@/components/dashboard/agent-topology'
import { ImperativeRegistryPanel } from '@/components/dashboard/imperative-registry'
import { ViolationsPanel } from '@/components/dashboard/violations-panel'
import { StateMachinePanel } from '@/components/dashboard/state-machine-panel'
import { ConflictsPanel } from '@/components/dashboard/conflicts-panel'
import { OrchestrationPanel } from '@/components/dashboard/orchestration-panel'
import { ProvenancePanel } from '@/components/dashboard/provenance-panel'
import { GovernanceOrchestratorPanel } from '@/components/dashboard/governance-orchestrator-panel'

interface ObservabilityData {
  generatedAt: string
  generator: string
  version: string
  project: string
  specification: string
  architecture: {
    model: string
    agents: string[]
    pipeline: string
    guardrails: string[]
  }
  statistics: {
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
    // Orchestration (Stage 6)
    conflictsDetected?: number
    conflictsResolved?: number
    eventBusTopics?: number
    eventBusMessages?: number
    auditChainEntries?: number
    auditChainIntact?: boolean
    stateEntities?: number
    stateTransitions?: number
    // Governance Orchestrator (Stage 7)
    governanceComponents?: number
    governanceEvents?: number
    governanceAuditEntries?: number
    governanceEscalations?: number
    governanceBreachAlerts?: number
    governanceProvenanceSteps?: number
    governanceSyntheticPatients?: number
    governanceDrSnapshots?: number
    governanceRiskPosture?: string
    [key: string]: any
  }
  data: {
    traces: any[]
    metrics: { system: Record<string, any>; summary: Record<string, number> }
    logs: any[]
    alerting: { rules: any[]; triggeredAlerts: any[] }
    agentTopology: any[]
    imperativeRegistry: any[]
    violations: any[]
    stateMachine: any
    eventBus: any
    conflicts: any
    auditChain: any
    governanceOrchestrator: any
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
          <p className="text-muted-foreground text-sm">Loading agent swarm observability data...</p>
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
              <Network className="h-6 w-6 text-emerald-500" />
              <h1 className="text-lg font-bold tracking-tight">Autonomous Compliance Agent Swarm</h1>
              <Badge variant="outline" className="text-xs hidden sm:inline-flex">Observability</Badge>
            </div>
            <Badge variant="outline" className="text-xs hidden md:inline-flex">
              <Layers className="h-3 w-3 mr-1" />
              {data.statistics.agents} agents
            </Badge>
            <Badge variant="outline" className="text-xs hidden md:inline-flex">
              <Shield className="h-3 w-3 mr-1" />
              {data.statistics.frameworks} frameworks
            </Badge>
            <Badge variant="outline" className="text-xs hidden lg:inline-flex">
              <GitBranch className="h-3 w-3 mr-1" />
              {data.statistics.conflictsDetected} conflicts
            </Badge>
            <Badge variant="outline" className="text-xs hidden lg:inline-flex">
              <Radio className="h-3 w-3 mr-1" />
              {data.statistics.eventBusTopics} topics
            </Badge>
            <Badge variant="outline" className="text-xs hidden lg:inline-flex">
              <Boxes className="h-3 w-3 mr-1" />
              {data.statistics.governanceComponents} governance
            </Badge>
            {data.statistics.firingAlerts > 0 && (
              <Badge variant="destructive" className="text-xs animate-pulse">
                <Shield className="h-3 w-3 mr-1" />
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
              <a href="https://github.com/testdemoqwenai2025-creator/testdemoqwenai2025-creator" target="_blank" rel="noopener noreferrer">
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
            <TabsTrigger value="topology" className="text-xs gap-1.5">
              <Network className="h-3.5 w-3.5" />
              Agent Topology
            </TabsTrigger>
            <TabsTrigger value="metrics" className="text-xs gap-1.5">
              <Activity className="h-3.5 w-3.5" />
              Metrics
            </TabsTrigger>
            <TabsTrigger value="traces" className="text-xs gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Pipeline Traces
            </TabsTrigger>
            <TabsTrigger value="imperatives" className="text-xs gap-1.5">
              <Scale className="h-3.5 w-3.5" />
              Imperatives
            </TabsTrigger>
            <TabsTrigger value="violations" className="text-xs gap-1.5">
              <Gavel className="h-3.5 w-3.5" />
              Violations
            </TabsTrigger>
            <TabsTrigger value="logs" className="text-xs gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Audit Logs
            </TabsTrigger>
            <TabsTrigger value="alerts" className="text-xs gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="state-machine" className="text-xs gap-1.5">
              <Workflow className="h-3.5 w-3.5" />
              State Machine
            </TabsTrigger>
            <TabsTrigger value="orchestration" className="text-xs gap-1.5">
              <Radio className="h-3.5 w-3.5" />
              Orchestration
            </TabsTrigger>
            <TabsTrigger value="conflicts" className="text-xs gap-1.5">
              <GitBranch className="h-3.5 w-3.5" />
              Conflicts
            </TabsTrigger>
            <TabsTrigger value="provenance" className="text-xs gap-1.5">
              <Link2 className="h-3.5 w-3.5" />
              Audit Chain
            </TabsTrigger>
            <TabsTrigger value="governance" className="text-xs gap-1.5">
              <Boxes className="h-3.5 w-3.5" />
              Governance Orchestrator
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Hero — Architecture summary */}
            <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-50/50 to-blue-50/30 dark:from-emerald-950/20 dark:to-blue-950/10">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 flex-wrap">
                  <ShieldCheck className="h-10 w-10 text-emerald-500 shrink-0" />
                  <div className="flex-1 min-w-[260px]">
                    <h2 className="text-xl font-bold mb-1">Push-Based 4-Agent Compliance Swarm</h2>
                    <p className="text-sm text-muted-foreground mb-3">{data.architecture.model}</p>
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      {data.architecture.agents.map((agent, i) => (
                        <span key={agent} className="flex items-center gap-1">
                          <Badge variant="outline" className="text-[10px]">{agent.replace('_', ' ')}</Badge>
                          {i < data.architecture.agents.length - 1 && <span className="text-muted-foreground">→</span>}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{data.architecture.pipeline}</p>
                  </div>
                  <div className="flex flex-col gap-1 text-[10px]">
                    {data.architecture.guardrails.map((g, i) => (
                      <Badge key={i} variant="outline" className="text-[9px] py-0.5 px-1.5">{g}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hero Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="border-emerald-500/20 bg-emerald-500/5">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-emerald-500">{data.statistics.regulationsMonitored}</div>
                  <div className="text-xs text-muted-foreground mt-1">Regulations Monitored</div>
                </CardContent>
              </Card>
              <Card className="border-purple-500/20 bg-purple-500/5">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-purple-500">{data.statistics.totalImperatives}</div>
                  <div className="text-xs text-muted-foreground mt-1">Active Imperatives</div>
                </CardContent>
              </Card>
              <Card className="border-amber-500/20 bg-amber-500/5">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-amber-500">{data.statistics.totalScenarios}</div>
                  <div className="text-xs text-muted-foreground mt-1">Pipeline Scenarios</div>
                </CardContent>
              </Card>
              <Card className="border-red-500/20 bg-red-500/5">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-red-500">{data.statistics.totalViolations}</div>
                  <div className="text-xs text-muted-foreground mt-1">Violations Detected</div>
                </CardContent>
              </Card>
            </div>

            {/* KPI Cards */}
            <StatsCards stats={data.statistics} metricsSummary={data.data.metrics.summary as any} />

            {/* API Endpoints */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    API Endpoints
                  </h3>
                  <Badge variant="outline" className="text-[10px]">REST</Badge>
                </div>
                <div className="space-y-2">
                  {[
                    { method: 'GET', path: '/api/observability', desc: 'Full swarm observability data', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
                    { method: 'GET', path: '/api/observability/traces', desc: '4-agent pipeline traces', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
                    { method: 'GET', path: '/api/observability/metrics', desc: 'Swarm pipeline metrics', color: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' },
                    { method: 'GET', path: '/api/observability/logs', desc: 'Agent activity & audit logs', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
                    { method: 'GET', path: '/api/observability/alerts', desc: 'Swarm alert rules & triggered alerts', color: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' },
                    { method: 'GET', path: '/api/observability/topology', desc: '4-agent swarm topology & skills', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300' },
                    { method: 'GET', path: '/api/observability/imperatives', desc: 'Imperative registry (PDF §4)', color: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300' },
                    { method: 'GET', path: '/api/observability/violations', desc: 'Prosecutor violations & remediation', color: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' },
                    { method: 'GET', path: '/api/observability/state-machine', desc: 'Compliance state machine (SKILLS §5)', color: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300' },
                    { method: 'GET', path: '/api/observability/orchestration', desc: 'Event bus + conflicts (SKILLS §5)', color: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300' },
                    { method: 'GET', path: '/api/observability/conflicts', desc: 'Regulatory conflict resolution', color: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300' },
                    { method: 'GET', path: '/api/observability/audit-chain', desc: 'Immutable append-only audit chain', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' },
                    { method: 'GET', path: '/api/observability/governance-orchestrator', desc: '22-component HIPAA governance orchestrator (Stage 7)', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
                  ].map((ep) => (
                    <div key={ep.path} className="flex items-center gap-3 py-1.5 px-3 rounded-md bg-muted/50 hover:bg-muted transition-colors">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${ep.color}`}>{ep.method}</span>
                      <code className="text-xs font-mono flex-1">{ep.path}</code>
                      <span className="text-[10px] text-muted-foreground hidden lg:inline">{ep.desc}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[10px] px-2 shrink-0"
                        onClick={() => navigator.clipboard.writeText(window.location.origin + ep.path)}
                      >
                        Copy
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="topology">
            <AgentTopologyPanel agents={data.data.agentTopology} />
          </TabsContent>

          <TabsContent value="metrics">
            <MetricsCharts metrics={data.data.metrics} />
          </TabsContent>

          <TabsContent value="traces">
            <TracesPanel traces={data.data.traces} />
          </TabsContent>

          <TabsContent value="imperatives">
            <ImperativeRegistryPanel imperatives={data.data.imperativeRegistry} />
          </TabsContent>

          <TabsContent value="violations">
            <ViolationsPanel violations={data.data.violations} />
          </TabsContent>

          <TabsContent value="logs">
            <LogsPanel logs={data.data.logs} />
          </TabsContent>

          <TabsContent value="alerts">
            <AlertsPanel
              rules={data.data.alerting.rules}
              alerts={data.data.alerting.triggeredAlerts}
            />
          </TabsContent>

          <TabsContent value="state-machine">
            <StateMachinePanel data={data.data.stateMachine} />
          </TabsContent>

          <TabsContent value="orchestration">
            <OrchestrationPanel data={data.data.eventBus} />
          </TabsContent>

          <TabsContent value="conflicts">
            <ConflictsPanel data={data.data.conflicts} />
          </TabsContent>

          <TabsContent value="provenance">
            <ProvenancePanel data={data.data.auditChain} />
          </TabsContent>

          <TabsContent value="governance">
            <GovernanceOrchestratorPanel data={data.data.governanceOrchestrator} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Autonomous Regulatory Compliance Agent Swarm — Observability</span>
            <Separator orientation="vertical" className="h-3" />
            <span>{data.specification}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">{data.version}</Badge>
            <span>Generated: {new Date(data.generatedAt).toLocaleString()} UTC</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
