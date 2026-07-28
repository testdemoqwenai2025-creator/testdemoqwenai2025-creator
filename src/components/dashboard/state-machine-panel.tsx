'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ArrowRight, CheckCircle2, AlertTriangle, ShieldAlert, Loader2, Circle, User } from 'lucide-react'

interface Entity {
  id: string
  type: string
  description: string
  jurisdiction: string
  current_state: string
  registered_at: string
  compliance_score: number
}

interface Transition {
  transition_id: string
  entity_id: string
  entity_type: string
  entity_description: string
  from_state: string
  to_state: string
  trigger: string
  evidence: string[]
  timestamp: string
  trace_id: string
  approved_by: string | null
  compliance_score_before: number
  compliance_score_after: number
}

interface StateMachineData {
  entities: Entity[]
  total_transitions: number
  transitions: Transition[]
  state_histories: Record<string, string[]>
  valid_transitions: Record<string, string[]>
  metrics: { transitions: number; escalations: number; resolutions: number; invalid_attempts: number }
  state_distribution: Record<string, number>
}

const STATE_COLORS: Record<string, { bg: string; border: string; text: string; icon: typeof Circle }> = {
  compliant: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-300 dark:border-emerald-800', text: 'text-emerald-700 dark:text-emerald-300', icon: CheckCircle2 },
  at_risk: { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-300 dark:border-amber-800', text: 'text-amber-700 dark:text-amber-300', icon: AlertTriangle },
  non_compliant: { bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-300 dark:border-red-800', text: 'text-red-700 dark:text-red-300', icon: ShieldAlert },
  under_remediation: { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-300 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-300', icon: Loader2 },
  escalated: { bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-300 dark:border-purple-800', text: 'text-purple-700 dark:text-purple-300', icon: ShieldAlert },
  audit_pending: { bg: 'bg-slate-50 dark:bg-slate-950/30', border: 'border-slate-300 dark:border-slate-800', text: 'text-slate-700 dark:text-slate-300', icon: Circle },
}

function StateIcon({ state }: { state: string }) {
  const config = STATE_COLORS[state] || STATE_COLORS.audit_pending
  const Icon = config.icon
  return <Icon className={`h-3.5 w-3.5 ${config.text}`} />
}

export function StateMachinePanel({ data }: { data: StateMachineData }) {
  const totalTransitions = data.metrics.transitions
  const escalations = data.metrics.escalations
  const resolutions = data.metrics.resolutions

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-blue-500">{data.entities.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Compliance Entities</div>
          </CardContent>
        </Card>
        <Card className="border-purple-500/20 bg-purple-500/5">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-purple-500">{totalTransitions}</div>
            <div className="text-xs text-muted-foreground mt-1">State Transitions</div>
          </CardContent>
        </Card>
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-amber-500">{escalations}</div>
            <div className="text-xs text-muted-foreground mt-1">Escalations</div>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-emerald-500">{resolutions}</div>
            <div className="text-xs text-muted-foreground mt-1">Resolutions</div>
          </CardContent>
        </Card>
      </div>

      {/* State distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Circle className="h-4 w-4" />
            Current State Distribution
            <span className="text-xs text-muted-foreground font-normal ml-2">SKILLS.md §5 — State Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(data.state_distribution).map(([state, count]) => {
              const config = STATE_COLORS[state] || STATE_COLORS.audit_pending
              return (
                <div key={state} className={`rounded-lg border p-3 ${config.bg} ${config.border}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <StateIcon state={state} />
                    <span className={`text-xs font-medium capitalize ${config.text}`}>
                      {state.replace('_', ' ')}
                    </span>
                  </div>
                  <div className={`text-2xl font-bold ${config.text}`}>{count}</div>
                  <Progress value={(count / data.entities.length) * 100} className="h-1 mt-1" />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Entity cards */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            Entity Compliance Lifecycle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.entities.map((entity) => {
              const config = STATE_COLORS[entity.current_state] || STATE_COLORS.audit_pending
              const history = data.state_histories[entity.id] || []
              return (
                <Card key={entity.id} className={`${config.border} ${config.bg}`}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <StateIcon state={entity.current_state} />
                          <span className="text-sm font-semibold">{entity.description}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1">
                          {entity.id} ({entity.type}) — {entity.jurisdiction}
                        </div>
                      </div>
                      <Badge className={`text-[10px] ${config.bg} ${config.text} border ${config.border}`}>
                        {entity.current_state.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">Score</span>
                      <Progress value={entity.compliance_score} className="h-2 flex-1" />
                      <span className={`text-xs font-bold ${entity.compliance_score >= 75 ? 'text-emerald-600' : entity.compliance_score >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                        {entity.compliance_score}%
                      </span>
                    </div>

                    {/* State history timeline */}
                    <div className="flex items-center gap-1 flex-wrap">
                      {history.map((h, i) => {
                        const hConfig = STATE_COLORS[h] || STATE_COLORS.audit_pending
                        return (
                          <span key={i} className="flex items-center gap-1">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded ${hConfig.bg} ${hConfig.text} capitalize`}>
                              {h.replace('_', ' ').slice(0, 6)}
                            </span>
                            {i < history.length - 1 && <ArrowRight className="h-2.5 w-2.5 text-muted-foreground" />}
                          </span>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent transitions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <ArrowRight className="h-4 w-4" />
            Recent State Transitions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[500px] rounded-md border">
            <div className="divide-y">
              {data.transitions.map((t) => {
                const fromConfig = STATE_COLORS[t.from_state] || STATE_COLORS.audit_pending
                const toConfig = STATE_COLORS[t.to_state] || STATE_COLORS.audit_pending
                const scoreDelta = t.compliance_score_after - t.compliance_score_before
                return (
                  <div key={t.transition_id} className="p-3 flex items-center gap-3 hover:bg-muted/50">
                    <Badge variant="outline" className="text-[9px] font-mono">{t.transition_id}</Badge>
                    <span className="text-[10px] text-muted-foreground w-24 truncate" title={t.entity_description}>
                      {t.entity_description}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded ${fromConfig.bg} ${fromConfig.text} capitalize`}>
                        {t.from_state.replace('_', ' ')}
                      </span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className={`text-[10px] px-2 py-0.5 rounded ${toConfig.bg} ${toConfig.text} capitalize`}>
                        {t.to_state.replace('_', ' ')}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-[9px]">{t.trigger.replace(/_/g, ' ')}</Badge>
                    <span className={`text-[10px] font-medium ${scoreDelta >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {scoreDelta >= 0 ? '+' : ''}{scoreDelta}%
                    </span>
                    {t.approved_by && (
                      <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
                        <User className="h-2.5 w-2.5" /> {t.approved_by.split('@')[0]}
                      </span>
                    )}
                    <span className="text-[9px] text-muted-foreground ml-auto">
                      {new Date(t.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })} UTC
                    </span>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Valid transitions reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xs text-muted-foreground">Valid State Transitions (enforced by orchestrator)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(data.valid_transitions).map(([from, targets]) => (
              <div key={from} className="flex items-center gap-2 text-[10px] flex-wrap p-2 bg-muted/30 rounded">
                <Badge variant="outline" className="text-[9px] capitalize">{from.replace('_', ' ')}</Badge>
                <span className="text-muted-foreground">&rarr;</span>
                {targets.map((t) => (
                  <Badge key={t} variant="secondary" className="text-[9px] capitalize">{t.replace('_', ' ')}</Badge>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
