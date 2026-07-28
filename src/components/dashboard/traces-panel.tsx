'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronDown, ChevronRight, Clock, CheckCircle2, XCircle, Timer, ShieldCheck } from 'lucide-react'

interface Span {
  traceId: string
  spanId: string
  parentSpanId: string | null
  service: string
  operation: string
  startTime: string
  durationMs: number
  status: string
  tags: Record<string, string | null | undefined>
}

interface Trace {
  traceId: string
  service: string
  operation: string
  startTime: string
  durationMs: number
  status: string
  spanCount: number
  tags?: Record<string, string>
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
  if (ms < 50) return 'text-green-500'
  if (ms < 200) return 'text-amber-500'
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
            Compliance Workflow Traces
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
                {f === 'all' ? 'All' : f === 'ok' ? 'OK' : 'Error'}
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
                <TableHead>Trace ID</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Operation</TableHead>
                <TableHead>Framework</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-right">Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Spans</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((trace) => {
                const isExpanded = expandedTrace === trace.traceId
                const framework = trace.tags?.['compliance.framework'] || trace.spans?.[0]?.tags?.['compliance.framework']
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
                          <TableCell className="font-mono text-xs">
                            {trace.traceId.slice(0, 12)}...
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {trace.service}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs max-w-[200px] truncate">
                            {trace.operation}
                          </TableCell>
                          <TableCell>
                            {framework && (
                              <Badge className="text-[10px] h-5 bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300">
                                {framework}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatTime(trace.startTime)}
                          </TableCell>
                          <TableCell className={`text-right font-mono text-xs ${getDurationColor(trace.durationMs)}`}>
                            {trace.durationMs}ms
                          </TableCell>
                          <TableCell>
                            <StatusIcon status={trace.status} />
                          </TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">
                            {trace.spanCount}
                          </TableCell>
                        </TableRow>
                      </CollapsibleTrigger>
                      <CollapsibleContent asChild>
                        <TableRow>
                          <TableCell colSpan={9} className="bg-muted/20 p-0">
                            <div className="p-4 pl-12 space-y-1">
                              <div className="text-xs font-medium text-muted-foreground mb-2">
                                Compliance Workflow Spans ({trace.spanCount} spans)
                              </div>
                              {trace.spans.map((span) => {
                                const depth = span.parentSpanId ? 1 : 0
                                return (
                                  <div
                                    key={span.spanId}
                                    className="flex items-center gap-2 py-1 border-l-2 border-border"
                                    style={{ paddingLeft: `${depth * 16 + 8}px` }}
                                  >
                                    <StatusIcon status={span.status} />
                                    <span className="text-xs font-mono text-muted-foreground w-16">
                                      {span.spanId.slice(0, 8)}
                                    </span>
                                    <Badge variant="outline" className="text-[10px] h-5 shrink-0">
                                      {span.service}
                                    </Badge>
                                    <span className="text-xs truncate max-w-[160px]">{span.operation}</span>
                                    {span.tags?.['compliance.check_type'] && (
                                      <Badge className="text-[10px] h-5 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 shrink-0">
                                        {span.tags['compliance.check_type']}
                                      </Badge>
                                    )}
                                    <div className="flex-1" />
                                    <div
                                      className={`h-2 rounded-full ${span.status === 'error' ? 'bg-red-500/60' : span.status === 'ok' ? 'bg-green-500/60' : 'bg-amber-500/60'}`}
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

import { useState } from 'react'
