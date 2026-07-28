'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Radar, TrendingUp, Activity, Globe, ArrowRightLeft, Zap, Target,
  BarChart3, Clock, AlertTriangle, Shield, Brain,
} from 'lucide-react'

// ──────────────────────────────────────────────────────────────────────────────
// Visual config
// ──────────────────────────────────────────────────────────────────────────────
const IMPACT_COLORS: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
  low: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
}

const PRIORITY_COLORS: Record<string, string> = {
  P0: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  P1: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  P2: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  P3: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
}

const JURISDICTION_COLORS: Record<string, string> = {
  EU: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  US: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  'US-State': 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
  CA: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  UK: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  APAC: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  CN: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  Global: 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300',
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  consultation: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  proposed: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  committee: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  negotiation: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
}

const TREND_COLORS: Record<string, string> = {
  improving: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  stable: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  declining: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
}

// ──────────────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────────────

// 1. Run Metadata Card
function RunMetadataCard({ data }: { data: any }) {
  const systemTrend = data.statistics?.systemTrend || data.temporalForecast?.systemTrend || 'stable'
  const trendBadge = systemTrend === 'improving'
    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
    : systemTrend === 'declining'
      ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
      : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'

  return (
    <Card className="border-violet-500/30 bg-gradient-to-br from-violet-50/50 to-indigo-50/30 dark:from-violet-950/20 dark:to-indigo-950/10">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Brain className="h-8 w-8 text-violet-500 shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-bold mb-1">Predictive Regulatory Intelligence</h3>
            <p className="text-xs text-muted-foreground mb-2">
              Multi-horizon regulatory signal detection, cross-jurisdictional propagation modeling,
              impact simulation, and temporal compliance trajectory forecasting.
              Mirrors <code className="font-mono text-[10px] bg-muted/50 px-1 rounded">predictive_intelligence.py</code> prototype.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px]">
              <span><span className="text-muted-foreground">Run ID:</span> <code className="font-mono">{data.runId}</code></span>
              <span><span className="text-muted-foreground">Generated:</span> <span className="font-mono">{data.generatedAt}</span></span>
              <Badge variant="outline" className="text-[9px]">Signals: {data.statistics?.totalSignals ?? data.signals?.length ?? 0}</Badge>
              <Badge className={`text-[9px] capitalize ${trendBadge}`}>
                <TrendingUp className="h-3 w-3 mr-1" />
                System: {systemTrend}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// 2. Summary KPI Cards
function SummaryKPICards({ data }: { data: any }) {
  const s = data.statistics || {}
  const systemTrend = s.systemTrend || 'stable'
  const trendBadge = systemTrend === 'improving'
    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
    : systemTrend === 'declining'
      ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
      : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'

  const cards = [
    { label: 'Total Signals', value: s.totalSignals ?? 0, icon: Radar, color: 'text-violet-500', bg: 'border-violet-500/20 bg-violet-500/5' },
    { label: 'High Probability', value: s.highProbabilitySignals ?? 0, icon: Target, color: 'text-blue-500', bg: 'border-blue-500/20 bg-blue-500/5' },
    { label: 'Critical Impacts', value: s.criticalImpacts ?? 0, icon: AlertTriangle, color: 'text-red-500', bg: 'border-red-500/20 bg-red-500/5' },
    { label: 'Propagated', value: s.propagatedSignals ?? 0, icon: ArrowRightLeft, color: 'text-indigo-500', bg: 'border-indigo-500/20 bg-indigo-500/5' },
    { label: 'Radar Clusters', value: s.radarClusters ?? 0, icon: Zap, color: 'text-amber-500', bg: 'border-amber-500/20 bg-amber-500/5' },
    { label: 'Total Cost Est.', value: s.totalCostEstimate ?? 0, icon: BarChart3, color: 'text-emerald-500', bg: 'border-emerald-500/20 bg-emerald-500/5', format: 'currency' },
    { label: 'System Velocity', value: s.overallVelocity ?? 0, icon: Activity, color: 'text-cyan-500', bg: 'border-cyan-500/20 bg-cyan-500/5', format: 'decimal' },
    { label: '90-Day Horizon', value: systemTrend, icon: Clock, color: '', bg: `border-border bg-muted/30`, format: 'trend', trendBadge },
  ]
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
      {cards.map((c) => {
        const Icon = c.icon
        return (
          <Card key={c.label} className={c.bg}>
            <CardContent className="p-3 text-center">
              <Icon className={`h-4 w-4 mx-auto mb-1 ${c.color}`} />
              {c.format === 'currency' ? (
                <div className={`text-lg font-bold ${c.color}`}>${((c.value as number) / 1_000_000).toFixed(1)}M</div>
              ) : c.format === 'decimal' ? (
                <div className={`text-lg font-bold ${c.color}`}>{(c.value as number).toFixed(2)}</div>
              ) : c.format === 'trend' ? (
                <Badge className={`text-[10px] capitalize ${c.trendBadge}`}>{c.value as string}</Badge>
              ) : (
                <div className={`text-lg font-bold ${c.color}`}>{c.value}</div>
              )}
              <div className="text-[10px] text-muted-foreground mt-0.5">{c.label}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// 3. Regulatory Signals Table
function RegulatorySignalsTable({ signals }: { signals: any[] }) {
  if (!signals?.length) return null
  const sorted = [...signals].sort((a, b) => (b.enactmentProbability ?? 0) - (a.enactmentProbability ?? 0))
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Radar className="h-4 w-4" />
            Regulatory Signals
            <Badge variant="outline" className="text-[10px]">{signals.length} detected</Badge>
          </CardTitle>
          <span className="text-[10px] text-muted-foreground">Predictive Intelligence (Stage 10)</span>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[500px] rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Jurisdiction</TableHead>
                <TableHead>Source Title</TableHead>
                <TableHead className="w-[120px]">Topic</TableHead>
                <TableHead className="w-[80px]">Confidence</TableHead>
                <TableHead className="w-[80px]">Enact. Prob.</TableHead>
                <TableHead className="w-[80px]">Impact</TableHead>
                <TableHead className="w-[90px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((signal) => (
                <TableRow key={signal.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Badge className={`text-[9px] ${JURISDICTION_COLORS[signal.jurisdiction] || 'bg-slate-100 text-slate-700'}`}>
                      {signal.jurisdiction}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[10px] max-w-[200px] truncate" title={signal.sourceTitle}>
                    {signal.sourceTitle}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[9px]">{signal.topic}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <div className="w-10 h-1.5 bg-muted rounded overflow-hidden">
                        <div
                          className="h-full bg-violet-500 rounded"
                          style={{ width: `${(signal.confidence ?? 0) * 100}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-mono text-muted-foreground">{(signal.confidence ?? 0).toFixed(2)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-[10px] font-bold">{(signal.enactmentProbability ?? 0).toFixed(0)}%</span>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-[9px] capitalize ${IMPACT_COLORS[signal.estimatedImpact] || 'bg-slate-100 text-slate-700'}`}>
                      {signal.estimatedImpact}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-[9px] capitalize ${STATUS_COLORS[signal.status] || 'bg-slate-100 text-slate-700'}`}>
                      {signal.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

// 4. Horizon Radar Clusters
function HorizonRadarClusters({ radar }: { radar: any }) {
  if (!radar?.clusters?.length) return null
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Horizon Radar Clusters
            <Badge variant="outline" className="text-[10px]">{radar.totalClusters} clusters</Badge>
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">{radar.radarHorizonMonths}mo horizon</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {radar.clusters.map((cluster: any) => (
            <div key={cluster.clusterId} className="border rounded-lg p-3 bg-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold">{cluster.topic}</span>
                <Badge variant="outline" className="text-[9px]">{cluster.regulationCount} regs</Badge>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex items-center justify-between text-[10px] mb-0.5">
                    <span className="text-muted-foreground">Avg. Probability</span>
                    <span className="font-mono font-bold">{(cluster.avgProbability ?? 0).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded overflow-hidden">
                    <div
                      className={`h-full rounded ${
                        cluster.avgProbability >= 0.7 ? 'bg-red-500' :
                        cluster.avgProbability >= 0.5 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${(cluster.avgProbability ?? 0) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">Urgency Score</span>
                  <span className={`font-bold ${cluster.urgencyScore >= 40 ? 'text-red-600 dark:text-red-400' : cluster.urgencyScore >= 20 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {cluster.urgencyScore?.toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">Earliest Enactment</span>
                  <span className="font-mono">{cluster.earliestEnactment}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">Affected Frameworks</span>
                  <span className="font-mono">{cluster.totalAffectedFrameworks}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// 5. Propagation Graph Summary
function PropagationGraphSummary({ graph }: { graph: any }) {
  if (!graph) return null
  const nodes = graph.nodes?.length ?? 0
  const edges = graph.edges?.length ?? 0
  const propagated = graph.propagatedSignals?.length ?? 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4" />
            Cross-Jurisdictional Propagation Graph
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">{nodes} nodes</Badge>
            <Badge variant="outline" className="text-[10px]">{edges} edges</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Node summary chips */}
        {graph.nodes?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {graph.nodes.map((node: any) => (
              <div key={node.jurisdiction} className="flex items-center gap-1.5 border rounded-md px-2 py-1 bg-muted/30">
                <Globe className={`h-3 w-3 ${JURISDICTION_COLORS[node.jurisdiction]?.split(' ')[0]?.replace('bg-', 'text-') || 'text-slate-500'}`} />
                <span className="text-[10px] font-semibold">{node.jurisdiction}</span>
                <span className="text-[9px] text-muted-foreground font-mono">{node.regulationCount} regs</span>
                <span className="text-[9px] text-muted-foreground font-mono">{node.activePropagations} active</span>
              </div>
            ))}
          </div>
        )}

        {/* Propagated signals table */}
        {propagated > 0 && (
          <ScrollArea className="max-h-[300px] rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source Title</TableHead>
                  <TableHead className="w-[120px]">Source → Target</TableHead>
                  <TableHead className="w-[70px]">Strength</TableHead>
                  <TableHead className="w-[80px]">Prob.</TableHead>
                  <TableHead className="w-[70px]">Latency</TableHead>
                  <TableHead className="w-[100px]">Est. Date</TableHead>
                  <TableHead className="w-[120px]">Mechanism</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {graph.propagatedSignals.map((sig: any) => (
                  <TableRow key={sig.id} className="hover:bg-muted/50">
                    <TableCell className="text-[10px] max-w-[180px] truncate" title={sig.sourceTitle}>
                      {sig.sourceTitle}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-[9px]">
                        <Badge className={`text-[8px] ${JURISDICTION_COLORS[sig.sourceJurisdiction] || 'bg-slate-100 text-slate-700'}`}>
                          {sig.sourceJurisdiction}
                        </Badge>
                        <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
                        <Badge className={`text-[8px] ${JURISDICTION_COLORS[sig.targetJurisdiction] || 'bg-slate-100 text-slate-700'}`}>
                          {sig.targetJurisdiction}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <div className="w-8 h-1.5 bg-muted rounded overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded"
                            style={{ width: `${(sig.propagationStrength ?? 0) * 100}%` }}
                          />
                        </div>
                        <span className="text-[9px] font-mono">{(sig.propagationStrength ?? 0).toFixed(2)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[10px] font-bold">{(sig.propagatedProbability ?? 0).toFixed(0)}%</TableCell>
                    <TableCell className="text-[10px] font-mono">{sig.estimatedLatencyMonths}mo</TableCell>
                    <TableCell className="text-[10px] font-mono">{sig.estimatedTargetDate}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[8px] capitalize">{sig.mechanism?.replace(/_/g, ' ')}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}

// 6. Impact Simulation
function ImpactSimulationPanel({ simulation }: { simulation: any }) {
  if (!simulation?.impacts?.length) return null
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Impact Simulation
            <Badge variant="outline" className="text-[10px]">{simulation.impacts.length} simulations</Badge>
          </CardTitle>
          <span className="text-[10px] text-muted-foreground">What-if analysis on regulatory changes</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {simulation.impacts.map((impact: any) => (
            <div key={impact.id} className={`border rounded-lg p-3 bg-card ${
              impact.impactLevel === 'critical' ? 'border-red-500/30 bg-red-50/20 dark:bg-red-950/10' :
              impact.impactLevel === 'high' ? 'border-orange-500/30 bg-orange-50/20 dark:bg-orange-950/10' :
              'border-border'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold leading-tight line-clamp-2 max-w-[200px]">{impact.regulationTitle}</span>
                <Badge className={`text-[9px] font-bold ${PRIORITY_COLORS[impact.priority] || 'bg-slate-100 text-slate-700'}`}>
                  {impact.priority}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`text-[9px] ${JURISDICTION_COLORS[impact.jurisdiction] || 'bg-slate-100 text-slate-700'}`}>
                  {impact.jurisdiction}
                </Badge>
                <Badge variant="outline" className="text-[9px]">{impact.topic}</Badge>
                <Badge className={`text-[9px] capitalize ${IMPACT_COLORS[impact.impactLevel] || 'bg-slate-100 text-slate-700'}`}>
                  {impact.impactLevel}
                </Badge>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">Impact Score</span>
                  <div className="flex items-center gap-1">
                    <div className="w-12 h-1.5 bg-muted rounded overflow-hidden">
                      <div
                        className={`h-full rounded ${
                          impact.impactScore >= 80 ? 'bg-red-500' :
                          impact.impactScore >= 60 ? 'bg-orange-500' :
                          impact.impactScore >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(impact.impactScore ?? 0, 100)}%` }}
                      />
                    </div>
                    <span className="font-bold font-mono">{impact.impactScore?.toFixed(1)}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-3 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Compliance Gap</span>
                    <span className="font-mono text-red-600 dark:text-red-400">{impact.complianceGap?.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Enact. Prob.</span>
                    <span className="font-mono">{(impact.enactmentProbability ?? 0).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Remediation</span>
                    <span className="font-mono">{impact.remediationEffortDays}d</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cost Est.</span>
                    <span className="font-mono">${((impact.costEstimate ?? 0) / 1_000).toFixed(0)}K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Comp.</span>
                    <span className="font-mono">{impact.currentCompliance?.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Predicted</span>
                    <span className="font-mono text-amber-600 dark:text-amber-400">{impact.predictedFutureCompliance?.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Controls Hit</span>
                    <span className="font-mono">{impact.controlsAffected}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">New Required</span>
                    <span className="font-mono">{impact.newControlsRequired}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">Est. Enactment</span>
                  <span className="font-mono">{impact.estimatedEnactment}</span>
                </div>
                {impact.affectedFrameworks?.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1 border-t">
                    {impact.affectedFrameworks.map((fw: string) => (
                      <Badge key={fw} variant="outline" className="text-[8px] font-mono">{fw}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// 7. Temporal Forecast
function TemporalForecastPanel({ forecast }: { forecast: any }) {
  if (!forecast) return null

  return (
    <div className="space-y-4">
      {/* 7a. Framework Trajectories */}
      {forecast.frameworkTrajectories?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Compliance Trajectory Forecasts
                <Badge variant="outline" className="text-[10px]">{forecast.frameworkTrajectories.length} frameworks</Badge>
              </CardTitle>
              <Badge variant="outline" className="text-[10px]">{forecast.forecastHorizonDays}-day horizon</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {forecast.frameworkTrajectories.map((traj: any) => (
                <div key={traj.framework} className="border rounded-lg p-3 bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5 text-violet-500" />
                      {traj.framework}
                    </span>
                    <Badge className={`text-[9px] capitalize ${TREND_COLORS[traj.trend] || 'bg-slate-100 text-slate-700'}`}>
                      {traj.trend}
                    </Badge>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground">Current Score</span>
                      <span className="font-bold font-mono">{traj.currentScore?.toFixed(1)}</span>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-[10px] mb-0.5">
                        <span className="text-muted-foreground">Projected 90d</span>
                        <span className={`font-bold font-mono ${
                          (traj.projected90Day ?? 0) > (traj.currentScore ?? 0) ? 'text-emerald-600 dark:text-emerald-400' :
                          (traj.projected90Day ?? 0) < (traj.currentScore ?? 0) ? 'text-red-600 dark:text-red-400' :
                          'text-foreground'
                        }`}>
                          {traj.projected90Day?.toFixed(1)}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded overflow-hidden">
                        <div
                          className={`h-full rounded ${
                            (traj.projected90Day ?? 0) >= 80 ? 'bg-emerald-500' :
                            (traj.projected90Day ?? 0) >= 60 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(traj.projected90Day ?? 0, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-x-2 text-[10px]">
                      <div>
                        <span className="text-muted-foreground">Velocity</span>
                        <div className="font-mono">{traj.velocity?.toFixed(2)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Acceleration</span>
                        <div className="font-mono">{traj.acceleration?.toFixed(3)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Confidence</span>
                        <div className="font-mono">
                          {traj.trajectoryPoints?.[0]?.confidence
                            ? `${(traj.trajectoryPoints[0].confidence * 100).toFixed(0)}%`
                            : '—'}
                        </div>
                      </div>
                    </div>
                    {/* Mini trajectory sparkline */}
                    {traj.trajectoryPoints?.length > 1 && (
                      <div className="pt-1 border-t">
                        <div className="flex items-end gap-px h-8">
                          {traj.trajectoryPoints.map((pt: any, i: number) => (
                            <div
                              key={i}
                              className={`flex-1 rounded-t min-w-[2px] ${
                                pt.predictedScore >= 80 ? 'bg-emerald-400/60' :
                                pt.predictedScore >= 60 ? 'bg-amber-400/60' : 'bg-red-400/60'
                              }`}
                              style={{ height: `${Math.max((pt.predictedScore ?? 0) * 0.08, 2)}px` }}
                              title={`Day ${pt.day}: ${pt.predictedScore?.toFixed(1)} (±${pt.confidenceInterval?.toFixed(2)})`}
                            />
                          ))}
                        </div>
                        <div className="flex justify-between text-[8px] text-muted-foreground mt-0.5">
                          <span>Day 0</span>
                          <span>Day {traj.trajectoryPoints[traj.trajectoryPoints.length - 1]?.day ?? forecast.forecastHorizonDays}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 7b. Resource Demand Table */}
      {forecast.resourceDemands?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Resource Demand Forecast
              <Badge variant="outline" className="text-[10px]">{forecast.resourceDemands.length} resources</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[300px] rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resource Type</TableHead>
                    <TableHead className="w-[80px]">Current FTE</TableHead>
                    <TableHead className="w-[80px]">Projected 90d</TableHead>
                    <TableHead className="w-[70px]">Change</TableHead>
                    <TableHead className="w-[70px]">Change %</TableHead>
                    <TableHead>Rationale</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forecast.resourceDemands.map((res: any, i: number) => (
                    <TableRow key={i} className="hover:bg-muted/50">
                      <TableCell className="text-[10px] capitalize font-medium">{res.resourceType?.replace(/_/g, ' ')}</TableCell>
                      <TableCell className="text-[10px] font-mono">{res.currentFTE?.toFixed(1)}</TableCell>
                      <TableCell className="text-[10px] font-mono">{res.projectedFTE90Day?.toFixed(1)}</TableCell>
                      <TableCell>
                        <span className={`text-[10px] font-bold ${res.change > 0 ? 'text-amber-600 dark:text-amber-400' : res.change < 0 ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                          {res.change > 0 ? '+' : ''}{res.change?.toFixed(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-[9px] ${res.changePercent >= 30 ? 'bg-red-100 text-red-700' : res.changePercent >= 10 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {res.changePercent > 0 ? '+' : ''}{res.changePercent?.toFixed(0)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[10px] text-muted-foreground max-w-[250px] truncate" title={res.rationale}>
                        {res.rationale}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* 7c. Attractor Landscape */}
      {forecast.attractorLandscape?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4" />
              Attractor Landscape
              <Badge variant="outline" className="text-[10px]">{forecast.attractorLandscape.length} attractors</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {forecast.attractorLandscape.map((att: any, i: number) => (
                <div key={i} className="border rounded-lg p-3 bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold flex items-center gap-1.5">
                      <Target className={`h-3.5 w-3.5 ${att.direction === 'positive' ? 'text-emerald-500' : 'text-red-500'}`} />
                      {att.framework}
                    </span>
                    <Badge className={`text-[9px] capitalize ${
                      att.direction === 'positive'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                    }`}>
                      {att.direction}
                    </Badge>
                  </div>
                  <div className="space-y-1.5">
                    <div>
                      <div className="flex items-center justify-between text-[10px] mb-0.5">
                        <span className="text-muted-foreground">Pull Strength</span>
                        <span className="font-mono font-bold">{att.pullStrength?.toFixed(2)}</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded overflow-hidden">
                        <div
                          className={`h-full rounded ${att.direction === 'positive' ? 'bg-emerald-500' : 'bg-red-500'}`}
                          style={{ width: `${(att.pullStrength ?? 0) * 100}%` }}
                        />
                      </div>
                    </div>
                    {att.tensionWith && (
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">Tension with</span>
                        <span className="font-mono">{att.tensionWith}</span>
                      </div>
                    )}
                    {att.tensionScore != null && (
                      <div>
                        <div className="flex items-center justify-between text-[10px] mb-0.5">
                          <span className="text-muted-foreground">Tension Score</span>
                          <span className="font-mono">{att.tensionScore?.toFixed(2)}</span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded overflow-hidden">
                          <div
                            className="h-full rounded bg-amber-500"
                            style={{ width: `${(att.tensionScore ?? 0) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overall velocity / acceleration footer */}
      <div className="flex items-center justify-center gap-6 text-[10px] text-muted-foreground py-2">
        <span>Overall Velocity: <span className="font-mono font-bold text-foreground">{forecast.overallVelocity?.toFixed(2)}</span></span>
        <span>•</span>
        <span>Overall Acceleration: <span className="font-mono font-bold text-foreground">{forecast.overallAcceleration?.toFixed(3)}</span></span>
        <span>•</span>
        <span>System Trend: <Badge className={`text-[9px] capitalize ${TREND_COLORS[forecast.systemTrend] || 'bg-slate-100 text-slate-700'}`}>{forecast.systemTrend}</Badge></span>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────────────────────────────────────
export default function PredictiveIntelligencePanel({ data }: { data: any }) {
  if (!data) {
    return <div className="text-muted-foreground text-sm">No predictive intelligence data available.</div>
  }

  return (
    <div className="space-y-4">
      {/* 1. Run Metadata */}
      <RunMetadataCard data={data} />

      {/* 2. Summary KPI Cards */}
      <SummaryKPICards data={data} />

      {/* 3. Regulatory Signals Table */}
      <RegulatorySignalsTable signals={data.signals} />

      {/* 4. Horizon Radar Clusters */}
      <HorizonRadarClusters radar={data.horizonRadar} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 5. Propagation Graph Summary */}
        <PropagationGraphSummary graph={data.propagationGraph} />

        {/* 6. Impact Simulation (top portion) — full width below */}
        <div />
      </div>

      {/* 6. Impact Simulation — full width */}
      <ImpactSimulationPanel simulation={data.impactSimulation} />

      {/* 7. Temporal Forecast */}
      <TemporalForecastPanel forecast={data.temporalForecast} />
    </div>
  )
}
