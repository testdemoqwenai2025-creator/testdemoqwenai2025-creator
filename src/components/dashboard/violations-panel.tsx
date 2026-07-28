'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Gavel, AlertOctagon, FileText, ArrowRight, DollarSign, Search, Database } from 'lucide-react'

interface Artifact {
  type: string
  id: string
  target_audience: string
  imperative_id: string
}

interface Violation {
  violation_id: string
  scenario_id: string
  trace_id: string
  regulation_id: string
  regulation_name: string
  jurisdiction: string
  imperative_id: string
  imperative_text: string
  imperative_query: string
  risk_tier: string
  detected_at: string
  audit_phase: string
  phase_i_conflict: boolean
  phase_ii_breach: boolean
  penalty_exposure_usd: number
  remediation_status: string
  artifacts: Artifact[]
  human_approval: string
}

interface ViolationsPanelProps {
  violations: Violation[]
}

const RISK_COLORS: Record<string, string> = {
  Critical: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  High: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  Moderate: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  Low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
}

const REMEDIATION_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
}

const APPROVAL_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
}

function formatUsd(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

export function ViolationsPanel({ violations }: ViolationsPanelProps) {
  const totalExposure = violations.reduce((sum, v) => sum + v.penalty_exposure_usd, 0)

  return (
    <div className="space-y-6">
      {/* Summary card */}
      <Card className="border-red-500/30 bg-red-50/30 dark:bg-red-950/10">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <div className="text-[10px] text-muted-foreground uppercase">Total Violations</div>
              <div className="text-2xl font-bold text-red-600">{violations.length}</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase">Total Penalty Exposure</div>
              <div className="text-2xl font-bold text-red-600">{formatUsd(totalExposure)}</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase">Phase I Conflicts</div>
              <div className="text-2xl font-bold text-amber-600">{violations.filter(v => v.phase_i_conflict).length}</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase">Phase II Breaches</div>
              <div className="text-2xl font-bold text-amber-600">{violations.filter(v => v.phase_ii_breach).length}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Gavel className="h-4 w-4" />
              Prosecutor Violations & Defender Remediation
              <span className="text-xs text-muted-foreground font-normal ml-2">PDF §5 (Agent 3) → §6 (Agent 4)</span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
            <AlertOctagon className="h-3 w-3" />
            Adversarial audit results — prosecutor assumes non-compliance by default (PDF §5)
          </div>
          <ScrollArea className="max-h-[600px] rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Violation</TableHead>
                  <TableHead>Imperative</TableHead>
                  <TableHead>Regulation</TableHead>
                  <TableHead>Audit Phase</TableHead>
                  <TableHead>Penalty</TableHead>
                  <TableHead>Remediation</TableHead>
                  <TableHead>Artifacts</TableHead>
                  <TableHead>Approval</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {violations.map((v) => (
                  <TableRow key={v.violation_id} className="hover:bg-muted/50">
                    <TableCell>
                      <Badge className="text-[10px] bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 font-mono">
                        {v.violation_id}
                      </Badge>
                      <div className="text-[10px] text-muted-foreground mt-1">{v.scenario_id}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className="text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-mono mb-1">
                        {v.imperative_id}
                      </Badge>
                      <div className="text-[10px] max-w-[200px] truncate" title={v.imperative_text}>{v.imperative_text}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">{v.regulation_id}</Badge>
                      <div className="text-[10px] text-muted-foreground">{v.jurisdiction}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {v.phase_i_conflict && (
                          <Badge variant="outline" className="text-[10px] gap-1">
                            <Search className="h-2.5 w-2.5" /> Phase I
                          </Badge>
                        )}
                        {v.phase_ii_breach && (
                          <Badge variant="outline" className="text-[10px] gap-1">
                            <Database className="h-2.5 w-2.5" /> Phase II
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-red-500" />
                        <span className="text-xs font-medium text-red-600">{formatUsd(v.penalty_exposure_usd)}</span>
                      </div>
                      <Badge className={`text-[10px] mt-1 ${RISK_COLORS[v.risk_tier] || ''}`}>{v.risk_tier}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] ${REMEDIATION_COLORS[v.remediation_status] || ''}`}>
                        {v.remediation_status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {v.artifacts.map((a, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <FileText className="h-2.5 w-2.5 text-emerald-500" />
                            <span className="text-[10px]">{a.type}</span>
                            <ArrowRight className="h-2 w-2 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">{a.target_audience}</span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] ${APPROVAL_COLORS[v.human_approval] || ''}`}>
                        {v.human_approval}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
