'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Bell, ExternalLink, Shield, AlertTriangle, AlertCircle, Info, CheckCircle2,
} from 'lucide-react'

interface AlertRule {
  id: string
  name: string
  description: string
  condition: string
  severity: string
  agent: string
  channel: string
  runbook: string
}

interface TriggeredAlert {
  alertId: string
  ruleId: string
  ruleName: string
  description: string
  severity: string
  state: string
  agent: string
  firedAt: string
  acknowledgedAt?: string
  resolvedAt?: string
  durationMinutes?: number
  channel: string
  runbook: string
  labels: { env: string; jurisdiction: string; team: string }
  annotations: { summary: string; dashboard: string; spec_reference: string }
  metrics: { current_value: number | null; threshold: number | null }
}

interface AlertsPanelProps {
  rules: AlertRule[]
  alerts: TriggeredAlert[]
}

const severityConfig: Record<string, { icon: typeof Bell; color: string; badge: 'destructive' | 'secondary' | 'default' | 'outline' }> = {
  critical: { icon: AlertCircle, color: 'text-red-500', badge: 'destructive' },
  high: { icon: AlertTriangle, color: 'text-amber-500', badge: 'secondary' },
  medium: { icon: Shield, color: 'text-orange-500', badge: 'secondary' },
  low: { icon: Info, color: 'text-blue-500', badge: 'outline' },
}

const stateConfig: Record<string, { icon: typeof Bell; label: string; color: string }> = {
  firing: { icon: AlertCircle, label: 'Firing', color: 'text-red-500' },
  resolved: { icon: CheckCircle2, label: 'Resolved', color: 'text-green-500' },
  acknowledged: { icon: Shield, label: 'Acknowledged', color: 'text-amber-500' },
}

const AGENT_COLORS: Record<string, string> = {
  Ingestion_Agent: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  Legal_Analyst_Agent: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  Prosecutor_Agent: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  Defender_Agent: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  Orchestrator: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
}

function formatTime(ts: string): string {
  const d = new Date(ts)
  return `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}:${d.getUTCSeconds().toString().padStart(2, '0')} UTC`
}

export function AlertsPanel({ rules, alerts }: AlertsPanelProps) {
  const firingCount = alerts.filter((a) => a.state === 'firing').length
  const resolvedCount = alerts.filter((a) => a.state === 'resolved').length
  const ackedCount = alerts.filter((a) => a.state === 'acknowledged').length

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Swarm Alert Rules
              <span className="text-xs text-muted-foreground font-normal ml-2">mapped to PDF §3, §7, §9</span>
            </CardTitle>
            <Badge variant="outline">{rules.length} rules</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rules.map((rule) => {
              const sev = severityConfig[rule.severity] || severityConfig.info
              const SevIcon = sev.icon
              return (
                <div key={rule.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                  <SevIcon className={`h-5 w-5 mt-0.5 shrink-0 ${sev.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium text-sm">{rule.name}</span>
                      <Badge variant={sev.badge} className="text-[10px] h-5">{rule.severity}</Badge>
                      <Badge className={`text-[10px] h-5 ${AGENT_COLORS[rule.agent] || ''}`}>{rule.agent.replace('_', ' ')}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{rule.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                      <code className="bg-muted px-1.5 py-0.5 rounded">{rule.condition}</code>
                      <span className="truncate">{rule.channel}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Triggered Swarm Alerts
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="destructive" className="text-xs">{firingCount} firing</Badge>
              <Badge variant="secondary" className="text-xs">{ackedCount} acked</Badge>
              <Badge variant="outline" className="text-xs">{resolvedCount} resolved</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>State</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Alert</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Jurisdiction</TableHead>
                  <TableHead>Spec Ref</TableHead>
                  <TableHead>Fired At</TableHead>
                  <TableHead>Metric</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert) => {
                  const sev = severityConfig[alert.severity] || severityConfig.info
                  const st = stateConfig[alert.state] || stateConfig.firing
                  return (
                    <TableRow key={alert.alertId}>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <st.icon className={`h-3.5 w-3.5 ${st.color}`} />
                          <span className="text-xs">{st.label}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <sev.icon className={`h-3.5 w-3.5 ${sev.color}`} />
                          <Badge variant={sev.badge} className="text-[10px] h-5">{alert.severity}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-medium">{alert.ruleName}</div>
                        <div className="text-[10px] text-muted-foreground">{alert.annotations.summary}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] ${AGENT_COLORS[alert.agent] || ''}`}>{alert.agent.replace('_', ' ')}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">{alert.labels.jurisdiction}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-[10px] text-muted-foreground">{alert.annotations.spec_reference}</span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTime(alert.firedAt)}
                        {alert.resolvedAt && (
                          <div className="text-[10px] text-green-600">Resolved ({alert.durationMinutes}m)</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {alert.metrics.current_value !== null && alert.metrics.threshold !== null ? (
                          <div className="text-xs">
                            <span className={alert.metrics.current_value > alert.metrics.threshold ? 'text-red-500 font-medium' : ''}>
                              {alert.metrics.current_value}
                            </span>
                            <span className="text-muted-foreground"> / {alert.metrics.threshold}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" asChild>
                          <a href={alert.runbook} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Runbook
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
