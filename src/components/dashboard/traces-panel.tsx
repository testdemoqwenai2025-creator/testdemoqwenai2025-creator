'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  ChevronDown, ChevronRight, Clock, CheckCircle2, XCircle, Timer,
  Search, Database, FileText, Shield,
} from 'lucide-react'

const AGENT_COLORS: Record<string, string> = {
  Ingestion_Agent: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  Legal_Analyst_Agent: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  Prosecutor_Agent: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  Defender_Agent: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
}

interface Span {
  spanId: string
  traceId: string
  parentSpanId: string | null
  agent: string
  operation: string
  startTime: string
  durationMs: number
  status: string
  tags: Record<string, string>
  events: any[]
}

interface Trace {
  traceId: string
  scenarioId: string
  scenarioName: string
  regulation: { id: string; name: string; jurisdiction: string; tier: string }
  startedAt: string
  durationMs: number
  status: string
  spanCount: number
  imperatives: { id: string; text: string; risk_tier: string }[]
  violationDetected: boolean
  artifactsGenerated: { type: string; id: string; target_audience: string; imperative_id: string }[]
  spans: Span[]
}

interface TracesPanelProps {
  traces: Trace[]
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'ok') return <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
  if (status === 'error') return <XCircle className="h-3.5 w-3.5 text-red-500" />
  return <Timer className="h-3.5 w-3.5 text-amber-500" />
}

function getDurationColor(ms: number): string {
  if (ms < 100) return 'text-green-500'
  if (ms < 400) return 'text-amber-500'
  return 'text-red-500'
}

function formatTime(ts: string): string {
  const d = new Date(ts)
  return `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}:${d.getUTCSeconds().toString().padStart(2, '0')} UTC`
}

export function TracesPanel({ traces }: TracesPanelProps) {
  const [expandedTrace, setExpandedTrace] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'ok' | 'error'>('all')

  const filtered = filter === 'all' ? traces : traces.filter((t) => t.status === filter)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            4-Agent Pipeline Traces
          </CardTitle>
          <div className="flex gap-1">
            {(['all', 'ok', 'error'] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(f)}
                className="text-xs h-7"
              >
                {f === 'all' ? 'All' : f === 'ok' ? 'Compliant' : 'Violations'}
                <Badge variant="secondary" className="ml-1 text-[10px] px-1">
                  {f === 'all' ? traces.length : traces.filter((t) => t.status === f).length}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Scenario</TableHead>
                <TableHead>Regulation</TableHead>
                <TableHead>Jurisdiction</TableHead>
                <TableHead>Imperatives</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-right">Duration</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Artifacts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((trace) => {
                const isExpanded = expandedTrace === trace.traceId
                return (
                  <Collapsible
                    key={trace.traceId}
                    open={isExpanded}
                    onOpenChange={(open) => setExpandedTrace(open ? trace.traceId : null)}
                    asChild
                  >
                    <>
                      <CollapsibleTrigger asChild>
                        <TableRow className="cursor-pointer hover:bg-muted/50 transition-colors">
                          <TableCell className="w-8 p-1">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-xs font-medium">{trace.scenarioId}</div>
                            <div className="text-[10px] text-muted-foreground truncate max-w-[200px]">{trace.scenarioName}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px]">{trace.regulation.id}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className="text-[10px] bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300">
                              {trace.regulation.jurisdiction}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-[10px]">{trace.imperatives.length} extracted</div>
                            {trace.imperatives[0] && (
                              <div className="text-[9px] text-muted-foreground">{trace.imperatives[0].id}</div>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatTime(trace.startedAt)}
                          </TableCell>
                          <TableCell className={`text-right font-mono text-xs ${getDurationColor(trace.durationMs)}`}>
                            {trace.durationMs}ms
                          </TableCell>
                          <TableCell>
                            {trace.violationDetected ? (
                              <Badge variant="destructive" className="text-[10px]">
                                <XCircle className="h-3 w-3 mr-1" /> Violation
                              </Badge>
                            ) : (
                              <Badge className="text-[10px] bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
                                <CheckCircle2 className="h-3 w-3 mr-1" /> Compliant
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-[10px] text-muted-foreground">{trace.artifactsGenerated.length} artifacts</div>
                          </TableCell>
                        </TableRow>
                      </CollapsibleTrigger>
                      <CollapsibleContent asChild>
                        <TableRow>
                          <TableCell colSpan={9} className="bg-muted/20 p-0">
                            <div className="p-4 pl-12 space-y-1">
                              <div className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2">
                                <Shield className="h-3.5 w-3.5" />
                                Agent Cascade — Ingestion → Analyst → Prosecutor → Defender ({trace.spanCount} spans)
                              </div>
                              {trace.spans.map((span) => {
                                const depth = span.parentSpanId ? 1 : 0
                                const phaseTag = span.tags?.['audit.phase']
                                const impTag = span.tags?.['imperative.id']
                                return (
                                  <div
                                    key={span.spanId}
                                    className="flex items-center gap-2 py-1 border-l-2 border-border"
                                    style={{ paddingLeft: `${depth * 16 + 8}px` }}
                                  >
                                    <StatusIcon status={span.status} />
                                    <Badge className={`text-[10px] h-5 shrink-0 ${AGENT_COLORS[span.agent] || ''}`}>
                                      {span.agent.replace('_', ' ')}
                                    </Badge>
                                    <span className="text-xs truncate max-w-[160px]">{span.operation}</span>
                                    {phaseTag && (
                                      <Badge className="text-[10px] h-5 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 shrink-0">
                                        Phase {phaseTag}
                                      </Badge>
                                    )}
                                    {impTag && (
                                      <Badge className="text-[10px] h-5 bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 shrink-0">
                                        {impTag}
                                      </Badge>
                                    )}
                                    {span.tags?.['token.saved_pct'] && (
                                      <Badge variant="outline" className="text-[10px] h-5 shrink-0 text-cyan-600">
                                        -{span.tags['token.saved_pct']}% tokens
                                      </Badge>
                                    )}
                                    <div className="flex-1" />
                                    <div
                                      className={`h-2 rounded-full ${span.status === 'error' ? 'bg-red-500/60' : 'bg-green-500/60'}`}
                                      style={{
                                        width: `${Math.min(100, Math.max(3, (span.durationMs / trace.durationMs) * 100))}%`,
                                        maxWidth: '120px',
                                      }}
                                    />
                                    <span className={`text-xs font-mono ${getDurationColor(span.durationMs)}`}>
                                      {span.durationMs}ms
                                    </span>
                                  </div>
                                )
                              })}
                              {trace.artifactsGenerated.length > 0 && (
                                <div className="mt-4 p-3 rounded-md bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900">
                                  <div className="text-xs font-medium mb-2 flex items-center gap-2">
                                    <FileText className="h-3.5 w-3.5 text-emerald-600" />
                                    Remediation Artifacts Generated (PDF §6.1)
                                  </div>
                                  <div className="space-y-1">
                                    {trace.artifactsGenerated.map((art, i) => (
                                      <div key={i} className="flex items-center gap-2 text-xs">
                                        <Badge variant="outline" className="text-[10px]">{art.type}</Badge>
                                        <span className="font-mono text-[10px]">{art.id}</span>
                                        <span className="text-muted-foreground">→ {art.target_audience}</span>
                                        {art.imperative_id && (
                                          <Badge className="text-[9px] bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                                            ← {art.imperative_id}
                                          </Badge>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      </CollapsibleContent>
                    </>
                  </Collapsible>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
