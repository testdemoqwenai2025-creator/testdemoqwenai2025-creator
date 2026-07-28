'use client'

import { useState } from 'react'
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import {
  Network, GitFork, Scale, Trophy, Users, AlertTriangle, CheckCircle2,
  HelpCircle, ShieldAlert, ArrowRight, TrendingDown, TrendingUp,
  Globe, Target, DollarSign, Clock, Building2, SplitSquareVertical,
  BookOpen, Zap,
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface JiData {
  enhancedStateMachine: any
  jurisdictionalConstraintGraph: any
  paretoStrategies: any
  regulatoryGameTheory: any
  statistics: any
}

type SubSection = 'enhanced-sm' | 'constraint-graph' | 'pareto' | 'game-theory'

// ─────────────────────────────────────────────────────────────────────────────
// State styling helpers
// ─────────────────────────────────────────────────────────────────────────────

const STATE_META: Record<string, { bg: string; border: string; text: string; icon: any }> = {
  compliant:                   { bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-300 dark:border-emerald-800', text: 'text-emerald-700 dark:text-emerald-300', icon: CheckCircle2 },
  at_risk:                     { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-300 dark:border-amber-800', text: 'text-amber-700 dark:text-amber-300', icon: AlertTriangle },
  non_compliant:               { bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-300 dark:border-red-800', text: 'text-red-700 dark:text-red-300', icon: ShieldAlert },
  under_remediation:           { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-300 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-300', icon: Zap },
  escalated:                   { bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-300 dark:border-purple-800', text: 'text-purple-700 dark:text-purple-300', icon: ShieldAlert },
  audit_pending:               { bg: 'bg-slate-50 dark:bg-slate-950/30', border: 'border-slate-300 dark:border-slate-800', text: 'text-slate-700 dark:text-slate-300', icon: Clock },
  legally_ambiguous:           { bg: 'bg-cyan-50 dark:bg-cyan-950/30', border: 'border-cyan-400 dark:border-cyan-800', text: 'text-cyan-700 dark:text-cyan-300', icon: HelpCircle },
  strategically_non_compliant: { bg: 'bg-fuchsia-50 dark:bg-fuchsia-950/30', border: 'border-fuchsia-400 dark:border-fuchsia-800', text: 'text-fuchsia-700 dark:text-fuchsia-300', icon: SplitSquareVertical },
}

function StateBadge({ state }: { state: string }) {
  const meta = STATE_META[state] || STATE_META.audit_pending
  const Icon = meta.icon
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded ${meta.bg} ${meta.text} capitalize`}>
      <Icon className="h-3 w-3" />
      {state.replace(/_/g, ' ')}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 1: Enhanced State Machine
// ─────────────────────────────────────────────────────────────────────────────

function EnhancedStateMachineSection({ sm }: { sm: any }) {
  const { entities, transitions, state_distribution, fake_data_silos, silo_execution_status, new_states_summary, metrics } = sm

  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-cyan-500/20 bg-cyan-500/5">
          <CardContent className="p-4 text-center">
            <HelpCircle className="h-5 w-5 mx-auto text-cyan-500 mb-1" />
            <div className="text-3xl font-bold text-cyan-600">{new_states_summary.legally_ambiguous.count}</div>
            <div className="text-xs text-muted-foreground mt-1">Legally Ambiguous</div>
          </CardContent>
        </Card>
        <Card className="border-fuchsia-500/20 bg-fuchsia-500/5">
          <CardContent className="p-4 text-center">
            <SplitSquareVertical className="h-5 w-5 mx-auto text-fuchsia-500 mb-1" />
            <div className="text-3xl font-bold text-fuchsia-600">{new_states_summary.strategically_non_compliant.count}</div>
            <div className="text-xs text-muted-foreground mt-1">Strategic Non-Compliant</div>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="p-4 text-center">
            <Network className="h-5 w-5 mx-auto text-emerald-500 mb-1" />
            <div className="text-3xl font-bold text-emerald-600">{entities.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Total Entities</div>
          </CardContent>
        </Card>
        <Card className="border-purple-500/20 bg-purple-500/5">
          <CardContent className="p-4 text-center">
            <ArrowRight className="h-5 w-5 mx-auto text-purple-500 mb-1" />
            <div className="text-3xl font-bold text-purple-600">{metrics.transitions}</div>
            <div className="text-xs text-muted-foreground mt-1">Transitions (incl. new)</div>
          </CardContent>
        </Card>
      </div>

      {/* State Distribution with all 8 states */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <SplitSquareVertical className="h-4 w-4" />
            8-State Distribution
            <span className="text-xs text-muted-foreground font-normal ml-2">
              (legacy 6 + 2 new: Legally Ambiguous, Strategically Non-Compliant)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
            {Object.entries(state_distribution).map(([state, count]: [string, any]) => {
              const meta = STATE_META[state] || STATE_META.audit_pending
              const Icon = meta.icon
              const isNew = ['legally_ambiguous', 'strategically_non_compliant'].includes(state)
              return (
                <div key={state} className={`rounded-lg border p-2 ${meta.bg} ${meta.border} ${isNew ? 'ring-2 ring-offset-1 ring-offset-background' : ''}`}>
                  <div className="flex items-center gap-1 mb-1">
                    <Icon className={`h-3 w-3 ${meta.text}`} />
                    <span className={`text-[10px] font-medium ${meta.text} capitalize`}>
                      {state.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className={`text-xl font-bold ${meta.text}`}>{count}</div>
                  {isNew && (
                    <Badge variant="outline" className="text-[8px] mt-1 py-0 h-3">NEW</Badge>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Fake Data Silos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Fake Data Silos (Dynamic Execution)
            <Badge variant="outline" className="text-[10px] ml-2">{fake_data_silos.length} silos</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {silo_execution_status.map((silo: any) => (
            <div key={silo.silo_id} className={`rounded-lg border p-3 ${
              silo.silo_id.startsWith('SILO-LA')
                ? 'border-cyan-200 dark:border-cyan-900 bg-cyan-50/40 dark:bg-cyan-950/10'
                : 'border-fuchsia-200 dark:border-fuchsia-900 bg-fuchsia-50/40 dark:bg-fuchsia-950/10'
            }`}>
              <div className="flex items-start justify-between mb-2 gap-2 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[9px] font-mono">{silo.silo_id}</Badge>
                    <span className="text-sm font-semibold">{silo.name}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">{silo.description}</div>
                </div>
                <Badge className={silo.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                  {silo.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] mt-2">
                <div className="bg-muted/30 rounded p-1.5">
                  <div className="text-muted-foreground">Entities</div>
                  <div className="font-semibold">{silo.total_entities}</div>
                </div>
                <div className="bg-muted/30 rounded p-1.5">
                  <div className="text-muted-foreground">Transitions</div>
                  <div className="font-semibold">{silo.transition_count}</div>
                </div>
                <div className="bg-muted/30 rounded p-1.5">
                  <div className="text-muted-foreground">Risk Score</div>
                  <div className="font-semibold">{silo.risk_score}/100</div>
                </div>
                {silo.estimated_penalty && (
                  <div className="bg-muted/30 rounded p-1.5">
                    <div className="text-muted-foreground">Est. Penalty</div>
                    <div className="font-semibold text-red-600">${(silo.estimated_penalty / 1e6).toFixed(1)}M</div>
                  </div>
                )}
              </div>

              {/* Current states of silo entities */}
              <div className="flex items-center gap-1 flex-wrap mt-2">
                <span className="text-[10px] text-muted-foreground mr-1">Current states:</span>
                {Object.entries(silo.current_states).map(([eid, st]: [string, any]) => (
                  <StateBadge key={eid} state={st} />
                ))}
              </div>

              {silo.business_rationale && (
                <div className="mt-2 text-[10px] text-muted-foreground bg-muted/30 p-2 rounded italic">
                  <span className="font-semibold">Business rationale:</span> {silo.business_rationale.slice(0, 280)}{silo.business_rationale.length > 280 ? '...' : ''}
                </div>
              )}

              {silo.regulatory_response_prediction && (
                <div className="mt-2 text-[10px] text-amber-700 dark:text-amber-300 bg-amber-50/50 dark:bg-amber-950/20 p-2 rounded">
                  <span className="font-semibold">Regulator response prediction:</span> {silo.regulatory_response_prediction}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent transitions with new state highlights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <ArrowRight className="h-4 w-4" />
            Recent State Transitions
            <span className="text-xs text-muted-foreground font-normal ml-2">
              (highlighted rows show transitions into NEW states)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[400px] rounded-md border">
            <div className="divide-y">
              {transitions.slice(0, 20).map((t: any) => {
                const isNewTarget = ['legally_ambiguous', 'strategically_non_compliant'].includes(t.to_state)
                const isNewSource = ['legally_ambiguous', 'strategically_non_compliant'].includes(t.from_state)
                return (
                  <div key={t.transition_id} className={`p-3 flex items-center gap-2 hover:bg-muted/50 ${
                    (isNewTarget || isNewSource) ? 'bg-amber-50/40 dark:bg-amber-950/10' : ''
                  }`}>
                    <Badge variant="outline" className="text-[9px] font-mono">{t.transition_id}</Badge>
                    <span className="text-[10px] text-muted-foreground w-32 truncate" title={t.entity_description}>
                      {t.entity_description}
                    </span>
                    <StateBadge state={t.from_state} />
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <StateBadge state={t.to_state} />
                    <Badge variant="secondary" className="text-[9px]">{t.trigger.replace(/_/g, ' ')}</Badge>
                    {t.rationale && (
                      <span className="text-[9px] italic text-amber-700 dark:text-amber-300 truncate flex-1" title={t.rationale}>
                        📝 {t.rationale.slice(0, 60)}...
                      </span>
                    )}
                    {(isNewTarget || isNewSource) && (
                      <Badge className="text-[8px] bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                        NEW STATE
                      </Badge>
                    )}
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 2: Jurisdictional Constraint Graph
// ─────────────────────────────────────────────────────────────────────────────

function ConstraintGraphSection({ graph }: { graph: any }) {
  const { jurisdictions, constraint_edges, hypothetical_scenarios, mutually_exclusive_pairs, constraint_severity_breakdown, path_chains } = graph

  const severityMeta: Record<string, string> = {
    critical: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    low: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  }

  return (
    <div className="space-y-6">
      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="p-4 text-center">
            <Globe className="h-5 w-5 mx-auto text-blue-500 mb-1" />
            <div className="text-3xl font-bold text-blue-600">{jurisdictions.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Jurisdictions</div>
          </CardContent>
        </Card>
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="p-4 text-center">
            <GitFork className="h-5 w-5 mx-auto text-red-500 mb-1" />
            <div className="text-3xl font-bold text-red-600">{constraint_edges.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Constraint Edges</div>
          </CardContent>
        </Card>
        <Card className="border-purple-500/20 bg-purple-500/5">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-5 w-5 mx-auto text-purple-500 mb-1" />
            <div className="text-3xl font-bold text-purple-600">{mutually_exclusive_pairs.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Mutually Exclusive</div>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="p-4 text-center">
            <BookOpen className="h-5 w-5 mx-auto text-emerald-500 mb-1" />
            <div className="text-3xl font-bold text-emerald-600">{hypothetical_scenarios.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Hypothetical Scenarios</div>
          </CardContent>
        </Card>
      </div>

      {/* Severity breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Constraint Severity Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(constraint_severity_breakdown).map(([sev, cnt]: [string, any]) => (
              <div key={sev} className={`rounded-lg p-3 text-center ${severityMeta[sev] || ''}`}>
                <div className="text-2xl font-bold">{cnt}</div>
                <div className="text-[10px] capitalize">{sev}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Constraint edges */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <GitFork className="h-4 w-4" />
            Constraint Edges (path A closes off path B)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[500px]">
            <div className="space-y-2">
              {constraint_edges.map((edge: any, i: number) => (
                <div key={i} className={`rounded-md border p-2 ${
                  edge.mutually_exclusive
                    ? 'border-red-300 dark:border-red-800 bg-red-50/30 dark:bg-red-950/10'
                    : 'border-slate-200 dark:border-slate-800 bg-muted/20'
                }`}>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge variant="outline" className="text-[9px]">{edge.source}</Badge>
                    <span className="text-muted-foreground">↔</span>
                    <Badge variant="outline" className="text-[9px]">{edge.target}</Badge>
                    <Badge className={`text-[9px] ${severityMeta[edge.severity]}`} variant="secondary">
                      {edge.severity}
                    </Badge>
                    {edge.mutually_exclusive && (
                      <Badge variant="destructive" className="text-[9px]">MUTUALLY EXCLUSIVE</Badge>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground">{edge.description}</div>
                  <div className="text-[9px] text-muted-foreground mt-1 italic">
                    Type: {edge.type.replace(/_/g, ' ')} ·
                    Trade-off possible: {edge.trade_off_possible ? '✓' : '✗'}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Hypothetical scenarios */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Hypothetical Compliance Scenarios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {hypothetical_scenarios.map((scn: any) => (
            <div key={scn.scenario_id} className="rounded-lg border border-indigo-200 dark:border-indigo-900 bg-indigo-50/30 dark:bg-indigo-950/10 p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[9px] font-mono">{scn.scenario_id}</Badge>
                    <span className="text-sm font-semibold">{scn.name}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">{scn.description}</div>
                </div>
              </div>

              <div className="mt-2">
                <div className="text-[10px] text-muted-foreground mb-1 font-semibold">Constraint Path:</div>
                <div className="flex flex-wrap gap-1">
                  {scn.constraint_path.map((p: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-[9px] bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300">
                      {p}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-2 text-[10px] bg-muted/30 p-2 rounded">
                <span className="font-semibold">Closure analysis:</span> {scn.closure_analysis}
              </div>

              <div className="mt-2">
                <div className="text-[10px] text-muted-foreground mb-1 font-semibold">Risk per Jurisdiction:</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
                  {Object.entries(scn.estimated_risk_per_jurisdiction).map(([jur, r]: [string, any]) => (
                    <div key={jur} className="bg-muted/30 rounded p-1.5 text-[9px]">
                      <div className="font-semibold">{jur}</div>
                      <div className="text-muted-foreground">P:{r.probability} · {r.effort_months}mo</div>
                      <div className="text-red-600 dark:text-red-400">Max: {r.penalty_max}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-2 text-[10px] bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded text-emerald-800 dark:text-emerald-200">
                <span className="font-semibold">Optimal strategy:</span> {scn.optimal_strategy}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Path chains */}
      {path_chains && path_chains.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Network className="h-4 w-4" />
              Traversal Path Chains
              <span className="text-xs text-muted-foreground font-normal ml-2">
                (paths through the constraint graph that may close off other paths)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[250px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {path_chains.slice(0, 20).map((chain: any, i: number) => (
                  <div key={i} className="rounded border p-2 bg-muted/20 text-[10px]">
                    <div className="font-mono text-[10px]">{chain.chain}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[8px]">length {chain.length}</Badge>
                      <Badge className={`text-[8px] ${severityMeta[chain.max_severity] || ''}`} variant="secondary">
                        {chain.max_severity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 3: Pareto-optimal Compliance Strategies
// ─────────────────────────────────────────────────────────────────────────────

function ParetoSection({ pareto }: { pareto: any }) {
  const { strategies, pareto_front, recommended_strategy, cost_range_usd, risk_range, jurisdiction_coverage } = pareto

  return (
    <div className="space-y-6">
      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="border-purple-500/20 bg-purple-500/5">
          <CardContent className="p-4 text-center">
            <Trophy className="h-5 w-5 mx-auto text-purple-500 mb-1" />
            <div className="text-3xl font-bold text-purple-600">{strategies.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Strategies</div>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="p-4 text-center">
            <Trophy className="h-5 w-5 mx-auto text-emerald-500 mb-1" />
            <div className="text-3xl font-bold text-emerald-600">{pareto_front.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Pareto Front</div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="p-4 text-center">
            <DollarSign className="h-5 w-5 mx-auto text-blue-500 mb-1" />
            <div className="text-xl font-bold text-blue-600">
              ${(cost_range_usd.min / 1e6).toFixed(1)}–${(cost_range_usd.max / 1e6).toFixed(1)}M
            </div>
            <div className="text-xs text-muted-foreground mt-1">Impl. Cost Range</div>
          </CardContent>
        </Card>
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-5 w-5 mx-auto text-amber-500 mb-1" />
            <div className="text-3xl font-bold text-amber-600">{risk_range.min}–{risk_range.max}</div>
            <div className="text-xs text-muted-foreground mt-1">Risk Score Range</div>
          </CardContent>
        </Card>
        <Card className="border-fuchsia-500/20 bg-fuchsia-500/5">
          <CardContent className="p-4 text-center">
            <Target className="h-5 w-5 mx-auto text-fuchsia-500 mb-1" />
            <div className="text-[10px] font-mono text-fuchsia-600 mt-3">{recommended_strategy}</div>
            <div className="text-xs text-muted-foreground mt-1">Recommended</div>
          </CardContent>
        </Card>
      </div>

      {/* Strategies detail */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Compliance Strategies with Quantified Risk
            <span className="text-xs text-muted-foreground font-normal ml-2">
              (Pareto-optimal = ✓ — cannot be improved on one dimension without sacrificing another)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {strategies.map((s: any) => {
            const isPareto = s.pareto_optimal
            const isRecommended = s.strategy_id === recommended_strategy
            return (
              <div
                key={s.strategy_id}
                className={`rounded-lg border p-3 ${
                  isRecommended
                    ? 'border-emerald-400 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-950/15 ring-2 ring-emerald-400/50'
                    : isPareto
                      ? 'border-purple-300 dark:border-purple-800 bg-purple-50/30 dark:bg-purple-950/10'
                      : 'border-slate-200 dark:border-slate-800 bg-muted/10 opacity-90'
                }`}
              >
                <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-[9px] font-mono">{s.strategy_id}</Badge>
                      <span className="text-sm font-semibold">{s.name}</span>
                      {isPareto && <Badge className="text-[9px] bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200">PARETO ✓</Badge>}
                      {isRecommended && <Badge className="text-[9px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200">RECOMMENDED</Badge>}
                      {!isPareto && s.dominated_by && (
                        <Badge variant="outline" className="text-[9px] text-red-700 dark:text-red-300">
                          dominated by {s.dominated_by}
                        </Badge>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1">{s.description}</div>
                  </div>
                </div>

                {/* Compliance profile */}
                <div className="grid grid-cols-5 md:grid-cols-10 gap-1 mt-2">
                  {Object.entries(s.compliance_profile).map(([jur, score]: [string, any]) => (
                    <div key={jur} className="text-center">
                      <div className={`text-[10px] font-bold ${
                        score >= 90 ? 'text-emerald-600 dark:text-emerald-400'
                          : score >= 75 ? 'text-blue-600 dark:text-blue-400'
                            : score >= 60 ? 'text-amber-600 dark:text-amber-400'
                              : 'text-red-600 dark:text-red-400'
                      }`}>{score}</div>
                      <div className="text-[8px] text-muted-foreground truncate" title={jur}>{jur}</div>
                    </div>
                  ))}
                </div>

                {/* Cost & risk metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-[10px]">
                  <div className="bg-muted/30 rounded p-1.5">
                    <div className="text-muted-foreground">Implementation</div>
                    <div className="font-bold text-blue-700 dark:text-blue-300">${(s.implementation_cost_usd / 1e6).toFixed(1)}M</div>
                  </div>
                  <div className="bg-muted/30 rounded p-1.5">
                    <div className="text-muted-foreground">Annual Cost</div>
                    <div className="font-bold text-blue-700 dark:text-blue-300">${(s.ongoing_annual_cost_usd / 1e6).toFixed(1)}M</div>
                  </div>
                  <div className="bg-muted/30 rounded p-1.5">
                    <div className="text-muted-foreground">Penalty Exposure</div>
                    <div className="font-bold text-red-700 dark:text-red-300">${(s.estimated_penalty_exposure_usd / 1e6).toFixed(1)}M</div>
                  </div>
                  <div className="bg-muted/30 rounded p-1.5">
                    <div className="text-muted-foreground">Risk Score</div>
                    <div className={`font-bold ${
                      s.total_risk_score < 50 ? 'text-emerald-600' : s.total_risk_score < 70 ? 'text-amber-600' : 'text-red-600'
                    }`}>{s.total_risk_score}/100</div>
                  </div>
                </div>

                {/* Risk breakdown */}
                <div className="mt-2">
                  <div className="text-[10px] text-muted-foreground mb-1">Risk breakdown:</div>
                  <div className="space-y-1">
                    {Object.entries(s.risk_breakdown).map(([k, v]: [string, any]) => (
                      <div key={k} className="flex items-center gap-2">
                        <span className="text-[9px] w-32 capitalize">{k.replace(/_/g, ' ')}</span>
                        <Progress value={v} className="h-1.5 flex-1" />
                        <span className="text-[9px] w-8 text-right">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trade-offs */}
                <div className="mt-2">
                  <div className="text-[10px] text-muted-foreground mb-1 font-semibold">Trade-offs accepted:</div>
                  <ul className="text-[10px] space-y-0.5 list-disc list-inside text-amber-800 dark:text-amber-200">
                    {s.trade_offs.map((t: string, i: number) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-2 text-[10px] italic text-muted-foreground">
                  <span className="font-semibold">Recommended for:</span> {s.recommended_for}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 4: Regulatory Game Theory
// ─────────────────────────────────────────────────────────────────────────────

function GameTheorySection({ gt }: { gt: any }) {
  const { regulator_profiles, nash_equilibrium, regulator_interactions, game_simulation, enforcement_probability_heatmap } = gt

  const stanceMeta: Record<string, string> = {
    'Adversarial-Protective': 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
    'Adversarial-Mandatory': 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
    'Adversarial-Consumer Advocacy': 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
    'Cooperative-Guidance': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    'Uncertain-Evolving': 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  }

  return (
    <div className="space-y-6">
      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-purple-500/20 bg-purple-500/5">
          <CardContent className="p-4 text-center">
            <Building2 className="h-5 w-5 mx-auto text-purple-500 mb-1" />
            <div className="text-3xl font-bold text-purple-600">{regulator_profiles.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Regulators Modeled</div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="p-4 text-center">
            <Clock className="h-5 w-5 mx-auto text-blue-500 mb-1" />
            <div className="text-3xl font-bold text-blue-600">{game_simulation.total_rounds}</div>
            <div className="text-xs text-muted-foreground mt-1">Game Rounds Simulated</div>
          </CardContent>
        </Card>
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="p-4 text-center">
            <DollarSign className="h-5 w-5 mx-auto text-red-500 mb-1" />
            <div className="text-xl font-bold text-red-600">${(game_simulation.cumulative_penalty_usd / 1e6).toFixed(1)}M</div>
            <div className="text-xs text-muted-foreground mt-1">Cumulative Penalty</div>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="p-4 text-center">
            {game_simulation.posture_trend === 'improving' ? (
              <TrendingUp className="h-5 w-5 mx-auto text-emerald-500 mb-1" />
            ) : (
              <TrendingDown className="h-5 w-5 mx-auto text-amber-500 mb-1" />
            )}
            <div className="text-base font-bold capitalize mt-1">{game_simulation.posture_trend}</div>
            <div className="text-xs text-muted-foreground mt-1">Posture Trend</div>
          </CardContent>
        </Card>
      </div>

      {/* Regulator profiles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4" />
            Regulator Profiles (cooperative vs adversarial)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {regulator_profiles.map((rp: any) => (
            <div key={rp.jurisdiction} className="rounded-lg border p-3 bg-muted/20">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <Badge variant="outline" className="text-[10px]">{rp.jurisdiction}</Badge>
                <span className="text-sm font-semibold">{rp.regulator}</span>
                <Badge className={`text-[9px] ${stanceMeta[rp.stance] || ''}`} variant="secondary">
                  {rp.stance}
                </Badge>
                <Badge variant="outline" className="text-[9px]">
                  Coop: {Math.round(rp.cooperative_probability * 100)}% / Adv: {Math.round(rp.adversarial_probability * 100)}%
                </Badge>
                <Badge variant="outline" className="text-[9px]">
                  ~{rp.typical_response_time_months}mo response
                </Badge>
              </div>

              <div className="text-[11px] text-muted-foreground mb-2">{rp.enforcement_style}</div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                <div className="bg-emerald-50 dark:bg-emerald-950/20 p-2 rounded text-[10px]">
                  <div className="font-semibold text-emerald-700 dark:text-emerald-300 mb-1">Cooperative signals:</div>
                  <ul className="list-disc list-inside space-y-0.5">
                    {rp.cooperative_signals.map((s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-red-50 dark:bg-red-950/20 p-2 rounded text-[10px]">
                  <div className="font-semibold text-red-700 dark:text-red-300 mb-1">Adversarial signals:</div>
                  <ul className="list-disc list-inside space-y-0.5">
                    {rp.adversarial_signals.map((s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-muted/40 p-2 rounded text-[10px] italic mb-2">
                <span className="font-semibold">Game theory posture:</span> {rp.game_theory_posture}
              </div>

              {/* Response matrix */}
              <div className="grid grid-cols-4 gap-1 text-[9px]">
                {Object.entries(rp.likely_response_matrix).map(([posture, response]: [string, any]) => (
                  <div key={posture} className="bg-muted/30 rounded p-1.5">
                    <div className="font-semibold capitalize text-[9px]">{posture.replace(/_/g, ' ')}</div>
                    <div className="text-[9px] mt-0.5">{response.action}</div>
                    <div className="text-muted-foreground text-[8px] mt-0.5">P: {Math.round(response.probability * 100)}%</div>
                    <div className="text-red-700 dark:text-red-300 text-[8px]">${(response.cost_impact / 1e3).toFixed(0)}K</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Nash Equilibrium */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Nash Equilibrium Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-[11px] text-muted-foreground mb-3">{nash_equilibrium.description}</div>
          <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded text-[11px] text-amber-800 dark:text-amber-200 mb-3">
            <span className="font-semibold">Equilibrium state:</span> {nash_equilibrium.equilibrium_state}
          </div>

          <div className="mb-3">
            <div className="text-[10px] font-semibold text-muted-foreground mb-1">Equilibrium conditions:</div>
            <ul className="text-[10px] list-disc list-inside space-y-0.5">
              {nash_equilibrium.equilibrium_conditions.map((c: string, i: number) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-[10px] font-semibold text-muted-foreground mb-1">Deviation analysis (is it rational?):</div>
            <div className="space-y-1">
              {nash_equilibrium.deviation_analysis.map((d: any, i: number) => (
                <div key={i} className={`flex items-start gap-2 p-2 rounded text-[10px] ${
                  d.rational
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-200'
                    : 'bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-200'
                }`}>
                  <span className={`font-bold ${d.rational ? 'text-emerald-600' : 'text-red-600'}`}>
                    {d.rational ? '✓' : '✗'}
                  </span>
                  <div className="flex-1">
                    <div className="font-semibold">{d.deviation}</div>
                    <div className="text-muted-foreground mt-0.5">{d.consequence}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regulator interactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Network className="h-4 w-4" />
            Regulator Interaction Network
            <span className="text-xs text-muted-foreground font-normal ml-2">
              (how regulators influence each other's enforcement)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {regulator_interactions.map((ri: any, i: number) => (
              <div key={i} className="rounded-md border p-2 bg-muted/20 text-[10px]">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Badge variant="outline" className="text-[9px]">{ri.source}</Badge>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <Badge variant="outline" className="text-[9px]">{ri.target}</Badge>
                  <Badge variant="secondary" className="text-[9px]">{ri.type.replace(/_/g, ' ')}</Badge>
                  <Badge variant="outline" className="text-[9px]">
                    Influence: {Math.round(ri.influence_strength * 100)}%
                  </Badge>
                </div>
                <div className="text-muted-foreground">{ri.description}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Game simulation rounds */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Game Simulation — 10 Rounds
            <Badge variant="outline" className="text-[10px] ml-2">
              ${game_simulation.cumulative_penalty_usd.toLocaleString()} total penalty
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-2">
              {game_simulation.rounds.map((round: any) => (
                <div key={round.round} className="rounded border p-2 bg-muted/20">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                    <Badge variant="outline" className="text-[9px]">Round {round.round}</Badge>
                    <Badge variant={round.total_penalty_usd > 0 ? 'destructive' : 'secondary'} className="text-[9px]">
                      ${round.total_penalty_usd.toLocaleString()} penalty
                    </Badge>
                    <Badge variant="outline" className="text-[9px]">{round.events_count} events</Badge>
                  </div>
                  {round.events.length > 0 && (
                    <div className="space-y-1 mt-1">
                      {round.events.map((ev: any, i: number) => (
                        <div key={i} className="text-[9px] bg-red-50 dark:bg-red-950/20 rounded p-1.5 flex items-center gap-2">
                          <Badge variant="outline" className="text-[8px]">{ev.jurisdiction}</Badge>
                          <span>{ev.response}</span>
                          <span className="text-red-700 dark:text-red-300 ml-auto">${ev.cost_incurred.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-2 flex items-center gap-1 flex-wrap">
                    <span className="text-[9px] text-muted-foreground">Posture:</span>
                    {Object.entries(round.posture_snapshot).map(([jur, p]: [string, any]) => (
                      <Badge key={jur} variant="outline" className="text-[8px]">
                        {jur}: {p}%
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Enforcement heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Enforcement Probability Heatmap (% per posture × regulator)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Regulator</th>
                  <th className="text-center p-2">Full Compliance</th>
                  <th className="text-center p-2">Partial</th>
                  <th className="text-center p-2">Non-Compliance</th>
                  <th className="text-center p-2">Strategic Non-Comp.</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(enforcement_probability_heatmap).map(([reg, postures]: [string, any]) => (
                  <tr key={reg} className="border-b">
                    <td className="p-2 font-semibold">{reg}</td>
                    {['full_compliance', 'partial_compliance', 'non_compliance', 'strategic_non_compliance'].map((posture) => {
                      const val = postures[posture] || 0
                      const color = val < 50 ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : val < 70 ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                      return (
                        <td key={posture} className={`text-center p-2 ${color} font-bold`}>
                          {val}%
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Panel
// ─────────────────────────────────────────────────────────────────────────────

export default function JurisdictionalIntelligencePanel({ data }: { data: JiData }) {
  const [sub, setSub] = useState<SubSection>('enhanced-sm')

  const sections: { id: SubSection; label: string; icon: any; desc: string }[] = [
    { id: 'enhanced-sm', label: 'Enhanced State Machine', icon: SplitSquareVertical, desc: '8-state model + fake data silos' },
    { id: 'constraint-graph', label: 'Constraint Graph', icon: GitFork, desc: '10 jurisdictions, hypothetical scenarios' },
    { id: 'pareto', label: 'Pareto Strategies', icon: Trophy, desc: 'Trade-off space with quantified risk' },
    { id: 'game-theory', label: 'Game Theory', icon: Users, desc: 'Regulator response prediction' },
  ]

  return (
    <div className="space-y-4">
      {/* Sub-section nav */}
      <Card className="border-indigo-500/20 bg-gradient-to-br from-indigo-50/30 to-purple-50/20 dark:from-indigo-950/10 dark:to-purple-950/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Scale className="h-6 w-6 text-indigo-500 shrink-0" />
            <div className="flex-1">
              <h2 className="text-base font-bold">Stage 11 — Jurisdictional Intelligence Engine</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Enhanced state machine + Jurisdictional constraint graph + Pareto-optimal strategies + Regulatory game theory modeling
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {sections.map((s) => {
              const Icon = s.icon
              const active = sub === s.id
              return (
                <Button
                  key={s.id}
                  variant={active ? 'default' : 'outline'}
                  size="sm"
                  className={`h-auto py-2 flex-col items-start text-left justify-start ${
                    active ? 'bg-indigo-500 text-white' : ''
                  }`}
                  onClick={() => setSub(s.id)}
                >
                  <div className="flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5" />
                    <span className="text-[11px] font-semibold">{s.label}</span>
                  </div>
                  <div className={`text-[9px] mt-0.5 ${active ? 'text-indigo-100' : 'text-muted-foreground'}`}>
                    {s.desc}
                  </div>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Active section */}
      {sub === 'enhanced-sm' && <EnhancedStateMachineSection sm={data.enhancedStateMachine} />}
      {sub === 'constraint-graph' && <ConstraintGraphSection graph={data.jurisdictionalConstraintGraph} />}
      {sub === 'pareto' && <ParetoSection pareto={data.paretoStrategies} />}
      {sub === 'game-theory' && <GameTheorySection gt={data.regulatoryGameTheory} />}
    </div>
  )
}
