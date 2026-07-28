'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AlertTriangle, CheckCircle2, Clock, GitBranch, Scale, ArrowRight } from 'lucide-react'

interface ConflictRecord {
  conflict_id: string
  regulation_a: string
  regulation_b: string
  regulation_a_id: string
  regulation_b_id: string
  clause_a: string
  clause_b: string
  conflict_type: string
  severity: string
  description: string
  status: string
  resolution_strategy: string | null
  resolution_description: string | null
  resolution: string | null
  resolved_at: string | null
  detected_at: string
  winner: string | null
}

interface ConflictsData {
  total_detected: number
  total_resolved: number
  total_pending: number
  records: ConflictRecord[]
  conflict_types: string[]
  resolution_strategies_used: string[]
  by_severity: Record<string, number>
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  high: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  medium: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
}

const CONFLICT_TYPE_LABELS: Record<string, string> = {
  penalty_discrepancy: 'Penalty Discrepancy',
  temporal_conflict: 'Temporal Conflict',
  jurisdictional_overlap: 'Jurisdictional Overlap',
  requirement_contradiction: 'Requirement Contradiction',
  scope_overlap: 'Scope Overlap',
}

export function ConflictsPanel({ data }: { data: ConflictsData }) {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-red-500">{data.total_detected}</div>
            <div className="text-xs text-muted-foreground mt-1">Conflicts Detected</div>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-emerald-500">{data.total_resolved}</div>
            <div className="text-xs text-muted-foreground mt-1">Resolved</div>
          </CardContent>
        </Card>
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-amber-500">{data.total_pending}</div>
            <div className="text-xs text-muted-foreground mt-1">Pending Review</div>
          </CardContent>
        </Card>
        <Card className="border-purple-500/20 bg-purple-500/5">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-purple-500">{data.conflict_types.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Conflict Types</div>
          </CardContent>
        </Card>
      </div>

      {/* Conflict type breakdown + resolution strategies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-2">
              <GitBranch className="h-3.5 w-3.5" />
              By Severity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(data.by_severity)
                .sort((a, b) => b[1] - a[1])
                .map(([sev, count]) => (
                  <div key={sev} className="flex items-center justify-between">
                    <Badge className={`text-[10px] ${SEVERITY_COLORS[sev] || ''}`}>
                      {sev.charAt(0).toUpperCase() + sev.slice(1)}
                    </Badge>
                    <div className="flex items-center gap-2 flex-1 mx-3">
                      <div className="h-2 rounded-full bg-muted flex-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${sev === 'critical' ? 'bg-red-500' : sev === 'high' ? 'bg-amber-500' : sev === 'medium' ? 'bg-orange-500' : 'bg-slate-400'}`}
                          style={{ width: `${(count / data.total_detected) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-medium w-6 text-right">{count}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Resolution Strategies Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {data.resolution_strategies_used.map((strategy) => (
                <Badge key={strategy} variant="outline" className="text-[9px]">
                  {strategy.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conflict records table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Regulatory Conflict Register
            <span className="text-xs text-muted-foreground font-normal ml-2">SKILLS.md §5 — Conflict Resolution</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[600px] rounded-md border">
            <div className="divide-y">
              {data.records.map((c) => (
                <div key={c.conflict_id} className="p-3 hover:bg-muted/50">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <Badge variant="outline" className="text-[9px] font-mono">{c.conflict_id}</Badge>
                    <Badge className={`text-[10px] ${SEVERITY_COLORS[c.severity] || ''}`}>
                      {c.severity.charAt(0).toUpperCase() + c.severity.slice(1)}
                    </Badge>
                    <Badge variant="secondary" className="text-[9px]">
                      {CONFLICT_TYPE_LABELS[c.conflict_type] || c.conflict_type.replace(/_/g, ' ')}
                    </Badge>
                    <Badge className={`text-[10px] ${c.status === 'resolved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'}`}>
                      {c.status}
                    </Badge>
                  </div>

                  {/* Regulation clash */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="text-[10px] bg-muted px-2 py-1 rounded flex-1 truncate">
                      <span className="font-medium">{c.regulation_a.slice(0, 40)}</span>
                      <span className="text-muted-foreground ml-1">&ldquo;{c.clause_a}&rdquo;</span>
                    </div>
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <div className="text-[10px] bg-muted px-2 py-1 rounded flex-1 truncate">
                      <span className="font-medium">{c.regulation_b.slice(0, 40)}</span>
                      <span className="text-muted-foreground ml-1">&ldquo;{c.clause_b}&rdquo;</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-muted-foreground mb-2">{c.description}</p>

                  {/* Resolution info */}
                  {c.resolution_strategy && (
                    <div className="flex items-center gap-2 text-[10px]">
                      <ArrowRight className="h-2.5 w-2.5 text-emerald-500" />
                      <span className="font-medium text-emerald-600">Strategy:</span>
                      <span>{c.resolution_strategy.replace(/_/g, ' ')}</span>
                      <span className="text-muted-foreground">— {c.resolution_description}</span>
                      {c.winner && (
                        <Badge variant="outline" className="text-[9px]">Winner: {c.winner}</Badge>
                      )}
                    </div>
                  )}
                  {c.winner === 'merged' && (
                    <div className="text-[10px] text-purple-600 mt-1">Requirements merged into unified control</div>
                  )}
                  {c.winner === 'split' && (
                    <div className="text-[10px] text-blue-600 mt-1">Jurisdictional split applied — each region follows its own regulation</div>
                  )}
                  {c.winner === 'legal' && (
                    <div className="text-[10px] text-amber-600 mt-1">Escalated to human legal counsel for binding decision</div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
