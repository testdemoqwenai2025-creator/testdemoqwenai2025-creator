'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Shield, ShieldCheck, Lock, AlertTriangle, Activity, Users, FileText,
  ChevronDown, ChevronUp, Hash, Database, Cpu, Globe, Server, Key,
  Eye, EyeOff, Fingerprint, Map, Bell, BookOpen, Code2, Layers,
  Gauge, MessageSquare, GitBranch, HelpCircle, Footprints, Sparkles,
  LifeBuoy, Clock,
} from 'lucide-react'

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
interface CatalogEntry {
  number: number
  name: string
  category: string
  event: string
  description: string
}

interface AuditEntry {
  seq: number
  timestamp: string
  event_type: string
  component: number
  component_name: string
  details: string
  entry_hash: string
  chain_hash: string
  prev_chain_hash: string
}

interface EscalationEvent {
  component: number
  name: string
  event: string
  escalation_id: string
  reason?: string
  priority?: string
  status: string
  raised_at?: string
  resolved_at?: string
  resolution?: string
  resolved_by?: string
  correction_applied?: boolean
  [k: string]: any
}

interface BreachAlert {
  component: number
  name: string
  event: string
  metric: string
  value: number
  threshold: number
  anomaly: boolean
  severity: string
  alert_id?: string
  ocr_notification_required?: boolean
  [k: string]: any
}

interface ProvenanceStep {
  component: number
  name: string
  event: string
  step_id: string
  action: string
  agent: string
  inputs: Record<string, any>
  outputs: Record<string, any>
  timestamp: string
  step_hash: string
}

interface SyntheticPatient {
  patient_id: string
  name: string
  mrn: string
  condition: string
  medication: string
  age: number
  last_visit: string
  risk_score: number
  synthetic: boolean
}

interface ComplianceReport {
  component: number
  name: string
  event: string
  report_id: string
  period: string
  generated_at: string
  risk_posture: string
  hipaa_safeguards: {
    administrative: { status: string; controls: number; gaps: number }
    physical: { status: string; controls: number; gaps: number }
    technical: { status: string; controls: number; gaps: number }
  }
  ocr_submission_required: boolean
  onc_certification: string
  next_audit_date: string
}

interface DrSnapshot {
  component: number
  name: string
  event: string
  snapshot_id: string
  reason: string
  created_at: string
  audit_log_entries: number
  consent_records: number
  provenance_steps: number
  regulatory_versions: number
  escalations_pending: number
  state_hash: string
  storage_location: string
}

interface ComponentEvent {
  [k: string]: any
}

interface GovernanceOrchestratorData {
  run_id: string
  start_time: string
  end_time: string
  total_components: number
  components_exercised: number
  total_events: number
  component_catalog: CatalogEntry[]
  components: Record<string, ComponentEvent>
  audit_trail: AuditEntry[]
  escalation_events: EscalationEvent[]
  breach_alerts: BreachAlert[]
  provenance_chain: ProvenanceStep[]
  synthetic_patients: { patients: SyntheticPatient[]; patients_generated: number; [k: string]: any }
  compliance_report: ComplianceReport
  dr_snapshots: DrSnapshot[]
  categories: Record<string, number>
  statistics: Record<string, any>
}

// ──────────────────────────────────────────────────────────────────────────────
// Visual config
// ──────────────────────────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  'Access Control': 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  'Auditability': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  'Cryptographic Protection': 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  'De-identification': 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  'Patient Rights': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
  'Lifecycle Management': 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
  'Data Governance': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  'Cross-Border Transfer': 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  'Threat Detection': 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  'Reporting': 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300',
  'Regulatory Intelligence': 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  'Policy Enforcement': 'bg-lime-100 text-lime-700 dark:bg-lime-950 dark:text-lime-300',
  'Tenant Isolation': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  'API Protection': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
  'AI Safety': 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950 dark:text-fuchsia-300',
  'Governance': 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
  'Privacy Engineering': 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  'Resilience': 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
}

const COMPONENT_ICONS: Record<number, any> = {
  1: Fingerprint, 2: FileText, 3: Key, 4: EyeOff, 5: Hash, 6: Users,
  7: Clock, 8: Database, 9: Globe, 10: Bell, 11: FileText, 12: BookOpen,
  13: Code2, 14: Layers, 15: Gauge, 16: Shield, 17: Cpu, 18: MessageSquare,
  19: HelpCircle, 20: GitBranch, 21: Sparkles, 22: LifeBuoy,
}

// ──────────────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────────────
function SummaryCards({ data }: { data: GovernanceOrchestratorData }) {
  const s = data.statistics
  const cards = [
    { label: 'Components', value: s.totalComponents, icon: Layers, color: 'text-emerald-500', bg: 'border-emerald-500/20 bg-emerald-500/5' },
    { label: 'Events Emitted', value: s.totalEvents, icon: Activity, color: 'text-blue-500', bg: 'border-blue-500/20 bg-blue-500/5' },
    { label: 'Audit Entries', value: s.auditTrailEntries, icon: FileText, color: 'text-indigo-500', bg: 'border-indigo-500/20 bg-indigo-500/5' },
    { label: 'Escalations', value: s.escalationsRaised, icon: AlertTriangle, color: 'text-amber-500', bg: 'border-amber-500/20 bg-amber-500/5' },
    { label: 'Breach Alerts', value: s.breachAlerts, icon: Bell, color: 'text-red-500', bg: 'border-red-500/20 bg-red-500/5' },
    { label: 'Provenance Steps', value: s.provenanceSteps, icon: GitBranch, color: 'text-purple-500', bg: 'border-purple-500/20 bg-purple-500/5' },
    { label: 'Synthetic Patients', value: s.syntheticPatientsGenerated, icon: Sparkles, color: 'text-cyan-500', bg: 'border-cyan-500/20 bg-cyan-500/5' },
    { label: 'DR Snapshots', value: s.drSnapshots, icon: LifeBuoy, color: 'text-sky-500', bg: 'border-sky-500/20 bg-sky-500/5' },
  ]
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
      {cards.map((c) => {
        const Icon = c.icon
        return (
          <Card key={c.label} className={c.bg}>
            <CardContent className="p-3 text-center">
              <Icon className={`h-4 w-4 mx-auto mb-1 ${c.color}`} />
              <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{c.label}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function ComponentCatalogGrid({ data }: { data: GovernanceOrchestratorData }) {
  const [expanded, setExpanded] = useState<number | null>(null)

  // Find all events for a given component number (handles multi-event keys like '1a', '6b')
  const getEventsForComponent = (num: number) => {
    return Object.entries(data.components)
      .filter(([k]) => {
        const base = k.replace(/[a-z]$/, '')
        return parseInt(base, 10) === num
      })
      .map(([k, v]) => ({ key: k, event: v }))
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Layers className="h-4 w-4" />
            22-Component Governance Catalog
            <Badge variant="outline" className="text-[10px]">{data.total_components}/22 exercised</Badge>
          </CardTitle>
          <span className="text-[10px] text-muted-foreground">HIPAA Governance Orchestrator (Stage 7)</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {data.component_catalog.map((entry) => {
            const Icon = COMPONENT_ICONS[entry.number] || Shield
            const events = getEventsForComponent(entry.number)
            const isExpanded = expanded === entry.number
            return (
              <div
                key={entry.number}
                className={`border rounded-md p-2 cursor-pointer transition-colors hover:bg-muted/50 ${
                  events.length === 0 ? 'border-red-500/30 bg-red-50/20 dark:bg-red-950/10' : 'border-border'
                }`}
                onClick={() => setExpanded(isExpanded ? null : entry.number)}
              >
                <div className="flex items-start gap-2">
                  <div className="flex flex-col items-center shrink-0">
                    <Icon className="h-4 w-4 text-emerald-500" />
                    <span className="text-[9px] font-mono text-muted-foreground mt-0.5">C{entry.number}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-semibold leading-tight truncate">{entry.name}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <Badge className={`text-[8px] px-1 py-0 ${CATEGORY_COLORS[entry.category] || 'bg-slate-100 text-slate-700'}`}>
                        {entry.category}
                      </Badge>
                      <Badge variant="outline" className="text-[8px] px-1 py-0 font-mono">{events.length} evt</Badge>
                    </div>
                    {isExpanded && (
                      <div className="mt-2 space-y-1.5">
                        <p className="text-[9px] text-muted-foreground leading-tight">{entry.description}</p>
                        <div className="border-t pt-1.5 space-y-1">
                          {events.map(({ key, event }) => (
                            <div key={key} className="bg-muted/40 rounded p-1.5">
                              <div className="flex items-center gap-1 mb-1">
                                <Badge variant="outline" className="text-[8px] font-mono px-1 py-0">{key}</Badge>
                                <span className="text-[8px] font-mono">{event.event}</span>
                              </div>
                              <div className="space-y-0.5">
                                {Object.entries(event)
                                  .filter(([k]) => !['component', 'name', 'event'].includes(k))
                                  .slice(0, 6)
                                  .map(([k, v]) => (
                                    <div key={k} className="flex items-start gap-1 text-[8px]">
                                      <span className="text-muted-foreground w-20 shrink-0">{k}:</span>
                                      <span className="font-mono break-all">
                                        {typeof v === 'object' ? JSON.stringify(v).slice(0, 80) + '...' : String(v).slice(0, 80)}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function CategoryBreakdown({ data }: { data: GovernanceOrchestratorData }) {
  const entries = Object.entries(data.categories).sort((a, b) => b[1] - a[1])
  const max = Math.max(...entries.map(([, v]) => v as number))
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs flex items-center gap-2">
          <Layers className="h-3.5 w-3.5" />
          Component Category Distribution
          <Badge variant="outline" className="text-[10px]">{entries.length} categories</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1.5">
          {entries.map(([cat, count]) => (
            <div key={cat} className="flex items-center gap-2">
              <span className="text-[10px] w-40 truncate">{cat}</span>
              <div className="flex-1 h-3 bg-muted rounded overflow-hidden">
                <div
                  className={`h-full ${CATEGORY_COLORS[cat]?.split(' ')[0] || 'bg-slate-400'}`}
                  style={{ width: `${((count as number) / max) * 100}%` }}
                />
              </div>
              <span className="text-[10px] font-mono w-4 text-right">{count as number}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ComplianceReportCard({ report }: { report: ComplianceReport }) {
  if (!report) return null
  const safeguards = report.hipaa_safeguards
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs flex items-center gap-2">
          <FileText className="h-3.5 w-3.5" />
          Automated Compliance Report (C11 — OCR/ONC)
          <Badge variant="outline" className="text-[10px] font-mono">{report.report_id}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div>
            <div className="text-[10px] text-muted-foreground">Period</div>
            <div className="text-xs font-semibold">{report.period}</div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground">Risk Posture</div>
            <Badge className={`text-[10px] ${report.risk_posture === 'low' ? 'bg-emerald-100 text-emerald-700' : report.risk_posture === 'moderate' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
              {report.risk_posture}
            </Badge>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground">OCR Submission</div>
            <Badge variant={report.ocr_submission_required ? 'destructive' : 'outline'} className="text-[10px]">
              {report.ocr_submission_required ? 'REQUIRED' : 'NOT REQUIRED'}
            </Badge>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground">ONC Certification</div>
            <Badge variant="outline" className="text-[10px] capitalize">{report.onc_certification}</Badge>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(safeguards).map(([key, val]) => (
            <div key={key} className="border rounded p-2">
              <div className="text-[10px] font-semibold capitalize mb-1">{key} Safeguard</div>
              <div className="flex items-center justify-between">
                <Badge className={`text-[9px] ${val.status === 'compliant' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {val.status}
                </Badge>
                <span className="text-[9px] font-mono">{val.controls} ctrl / {val.gaps} gap</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 text-[10px] text-muted-foreground">
          Next audit: <span className="font-medium text-foreground">{report.next_audit_date}</span>
        </div>
      </CardContent>
    </Card>
  )
}

function AuditTrailTable({ trail }: { trail: AuditEntry[] }) {
  const [expanded, setExpanded] = useState<number | null>(null)
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Hash className="h-4 w-4" />
            Immutable Audit Trail (C2 — SHA-256 Hash-Linked)
            <Badge variant="outline" className="text-[10px]">{trail.length} entries</Badge>
          </CardTitle>
          <Badge className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <ShieldCheck className="h-3 w-3 mr-1" /> Chain Verified
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[500px] rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead className="w-[80px]">C#</TableHead>
                <TableHead>Event Type</TableHead>
                <TableHead>Component</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Hash</TableHead>
                <TableHead className="w-[40px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trail.map((entry) => {
                const isExpanded = expanded === entry.seq
                return (
                  <>
                    <TableRow
                      key={entry.seq}
                      className="hover:bg-muted/50 cursor-pointer"
                      onClick={() => setExpanded(isExpanded ? null : entry.seq)}
                    >
                      <TableCell className="text-[10px] text-muted-foreground font-mono">{entry.seq}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[9px] font-mono">C{entry.component}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[9px] font-mono">{entry.event_type}</Badge>
                      </TableCell>
                      <TableCell className="text-[10px]">{entry.component_name}</TableCell>
                      <TableCell className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {new Date(entry.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-[8px] text-muted-foreground">{entry.chain_hash.slice(0, 24)}...</span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow key={`${entry.seq}-detail`}>
                        <TableCell colSpan={7} className="bg-muted/20 p-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[10px]">
                            <div>
                              <div className="font-medium mb-1">Hash Chain</div>
                              <div className="space-y-1">
                                <div>
                                  <span className="text-muted-foreground">Previous:</span>
                                  <code className="font-mono text-[8px] block break-all">{entry.prev_chain_hash}</code>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Current:</span>
                                  <code className="font-mono text-[8px] block break-all">{entry.chain_hash}</code>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Entry:</span>
                                  <code className="font-mono text-[8px] block break-all">{entry.entry_hash}</code>
                                </div>
                              </div>
                            </div>
                            <div className="md:col-span-2">
                              <div className="font-medium mb-1">Event Details</div>
                              <code className="font-mono text-[9px] block bg-background p-2 rounded border break-all">
                                {entry.details}
                              </code>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

function EscalationsPanel({ events }: { events: EscalationEvent[] }) {
  if (!events.length) return null
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5" />
          Human-in-the-Loop Escalations (C19)
          <Badge variant="outline" className="text-[10px]">{events.length} events</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {events.map((e, i) => (
            <div key={i} className={`border rounded p-2 ${
              e.event === 'ESCALATE' ? 'border-amber-500/30 bg-amber-50/30 dark:bg-amber-950/10' : 'border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/10'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[9px] font-mono">{e.escalation_id}</Badge>
                  <Badge className={`text-[9px] ${e.event === 'ESCALATE' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {e.event}
                  </Badge>
                  {e.priority && <Badge variant="outline" className={`text-[9px] capitalize ${e.priority === 'high' ? 'border-red-500 text-red-700' : ''}`}>{e.priority}</Badge>}
                </div>
                <Badge variant="outline" className={`text-[9px] capitalize ${e.status === 'resolved' ? 'border-emerald-500 text-emerald-700' : 'border-amber-500 text-amber-700'}`}>
                  {e.status}
                </Badge>
              </div>
              {e.reason && <p className="text-[10px] text-muted-foreground">{e.reason}</p>}
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-[9px]">
                {e.raised_at && <span className="text-muted-foreground">Raised: <span className="font-mono">{e.raised_at}</span></span>}
                {e.resolved_at && <span className="text-muted-foreground">Resolved: <span className="font-mono">{e.resolved_at}</span></span>}
                {e.resolved_by && <span className="text-muted-foreground">By: <span className="font-mono">{e.resolved_by}</span></span>}
                {e.resolution && <span className="text-muted-foreground">Resolution: <span className="font-medium">{e.resolution}</span></span>}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function BreachAlertsPanel({ alerts }: { alerts: BreachAlert[] }) {
  if (!alerts.length) return null
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs flex items-center gap-2">
          <Bell className="h-3.5 w-3.5" />
          Breach Alerts (C10 — Anomaly Detection)
          <Badge variant="destructive" className="text-[10px]">{alerts.length} active</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <div key={i} className="border border-red-500/30 bg-red-50/30 dark:bg-red-950/10 rounded p-2">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {a.alert_id && <Badge variant="outline" className="text-[9px] font-mono">{a.alert_id}</Badge>}
                  <Badge variant="destructive" className="text-[9px] capitalize">{a.severity}</Badge>
                  <span className="text-[10px] font-mono">{a.metric}</span>
                </div>
                {a.ocr_notification_required && (
                  <Badge variant="destructive" className="text-[9px] animate-pulse">OCR Notification Required (60h)</Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-[10px]">
                <span><span className="text-muted-foreground">Value:</span> <span className="font-bold text-red-700 dark:text-red-400">{a.value}</span></span>
                <span><span className="text-muted-foreground">Threshold:</span> {a.threshold}</span>
                <span><span className="text-muted-foreground">Anomaly:</span> <span className="font-bold">{String(a.anomaly)}</span></span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ProvenanceChainPanel({ chain }: { chain: ProvenanceStep[] }) {
  if (!chain.length) return null
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs flex items-center gap-2">
          <GitBranch className="h-3.5 w-3.5" />
          Explainability & Provenance Chain (C20)
          <Badge variant="outline" className="text-[10px]">{chain.length} steps</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {chain.map((step, i) => (
            <div key={step.step_id} className="flex items-start gap-3">
              <div className="flex flex-col items-center shrink-0">
                <div className="h-6 w-6 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-[10px] font-bold text-purple-700 dark:text-purple-300">
                  {i + 1}
                </div>
                {i < chain.length - 1 && <div className="w-px h-6 bg-purple-500/30" />}
              </div>
              <div className="flex-1 border border-purple-500/20 bg-purple-50/20 dark:bg-purple-950/10 rounded p-2">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[9px] font-mono">{step.step_id}</Badge>
                    <span className="text-[11px] font-semibold">{step.action}</span>
                  </div>
                  <Badge variant="outline" className="text-[9px]">{step.agent}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[9px]">
                  <div>
                    <div className="text-muted-foreground">Inputs</div>
                    <code className="font-mono block bg-background p-1 rounded border break-all">
                      {JSON.stringify(step.inputs)}
                    </code>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Outputs</div>
                    <code className="font-mono block bg-background p-1 rounded border break-all">
                      {JSON.stringify(step.outputs)}
                    </code>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1 text-[8px] text-muted-foreground">
                  <span className="font-mono">{step.timestamp}</span>
                  <span>•</span>
                  <span className="font-mono">{step.step_hash}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function SyntheticPatientsPanel({ data }: { data: { patients: SyntheticPatient[]; patients_generated: number } }) {
  if (!data?.patients?.length) return null
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5" />
          Synthetic Data Generation (C21 — HIPAA-Safe)
          <Badge variant="outline" className="text-[10px]">{data.patients_generated} patients</Badge>
          <Badge className="text-[9px] bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300">High Fidelity</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[400px] rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient ID</TableHead>
                <TableHead>MRN</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Medication</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead>Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.patients.map((p) => (
                <TableRow key={p.patient_id}>
                  <TableCell><Badge variant="outline" className="text-[9px] font-mono">{p.patient_id}</Badge></TableCell>
                  <TableCell><span className="font-mono text-[9px]">{p.mrn}</span></TableCell>
                  <TableCell className="text-[10px]">{p.age}</TableCell>
                  <TableCell className="text-[10px]">{p.condition}</TableCell>
                  <TableCell className="text-[10px]">{p.medication}</TableCell>
                  <TableCell className="text-[10px] text-muted-foreground">{p.last_visit}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[9px] ${p.risk_score > 0.7 ? 'border-red-500 text-red-700' : p.risk_score > 0.4 ? 'border-amber-500 text-amber-700' : 'border-emerald-500 text-emerald-700'}`}>
                      {p.risk_score.toFixed(2)}
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

function DrSnapshotsPanel({ snapshots }: { snapshots: DrSnapshot[] }) {
  if (!snapshots?.length) return null
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs flex items-center gap-2">
          <LifeBuoy className="h-3.5 w-3.5" />
          Disaster Recovery Snapshots (C22)
          <Badge variant="outline" className="text-[10px]">{snapshots.length} snapshots</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {snapshots.map((s, i) => (
            <div key={i} className="border border-sky-500/30 bg-sky-50/20 dark:bg-sky-950/10 rounded p-2">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[9px] font-mono">{s.snapshot_id}</Badge>
                  <Badge className="text-[9px] bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">{s.reason}</Badge>
                </div>
                <Badge variant="outline" className="text-[9px] border-emerald-500 text-emerald-700">
                  <ShieldCheck className="h-3 w-3 mr-1" /> Hash Verified
                </Badge>
              </div>
              <div className="grid grid-cols-4 gap-2 text-[9px]">
                <div><span className="text-muted-foreground">Audit entries:</span> <span className="font-mono">{s.audit_log_entries}</span></div>
                <div><span className="text-muted-foreground">Consent:</span> <span className="font-mono">{s.consent_records}</span></div>
                <div><span className="text-muted-foreground">Provenance:</span> <span className="font-mono">{s.provenance_steps}</span></div>
                <div><span className="text-muted-foreground">Reg versions:</span> <span className="font-mono">{s.regulatory_versions}</span></div>
              </div>
              <div className="flex items-center gap-2 mt-1 text-[8px] text-muted-foreground">
                <span className="font-mono">{s.created_at}</span>
                <span>•</span>
                <span>State hash: <span className="font-mono">{s.state_hash}</span></span>
              </div>
              <div className="text-[8px] text-muted-foreground mt-0.5 truncate">
                Storage: <code className="font-mono">{s.storage_location}</code>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function RunMetadata({ data }: { data: GovernanceOrchestratorData }) {
  return (
    <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-50/50 to-cyan-50/30 dark:from-emerald-950/20 dark:to-cyan-950/10">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-8 w-8 text-emerald-500 shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-bold mb-1">HIPAA-Compliant Governance Orchestrator</h3>
            <p className="text-xs text-muted-foreground mb-2">
              22-component functional simulation layer for managing AI and data workflows in a healthcare compliance context.
              Mirrors <code className="font-mono text-[10px] bg-muted/50 px-1 rounded">hipaa_governance_orchestrator.py</code> prototype.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px]">
              <span><span className="text-muted-foreground">Run ID:</span> <code className="font-mono">{data.run_id}</code></span>
              <span><span className="text-muted-foreground">Started:</span> <span className="font-mono">{data.start_time}</span></span>
              <span><span className="text-muted-foreground">Ended:</span> <span className="font-mono">{data.end_time}</span></span>
              <Badge variant="outline" className="text-[9px]">Components: {data.components_exercised}/22</Badge>
              <Badge variant="outline" className="text-[9px]">Events: {data.total_events}</Badge>
              <Badge variant="outline" className="text-[9px] capitalize">Risk Posture: {data.statistics.complianceRiskPosture}</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────────────────────────────────────
export function GovernanceOrchestratorPanel({ data }: { data: GovernanceOrchestratorData }) {
  if (!data) {
    return <div className="text-muted-foreground text-sm">No governance orchestrator data available.</div>
  }

  return (
    <div className="space-y-4">
      <RunMetadata data={data} />
      <SummaryCards data={data} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ComponentCatalogGrid data={data} />
        </div>
        <div>
          <CategoryBreakdown data={data} />
        </div>
      </div>
      <ComplianceReportCard report={data.compliance_report} />
      <AuditTrailTable trail={data.audit_trail} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <EscalationsPanel events={data.escalation_events} />
        <BreachAlertsPanel alerts={data.breach_alerts} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ProvenanceChainPanel chain={data.provenance_chain} />
        <DrSnapshotsPanel snapshots={data.dr_snapshots} />
      </div>
      <SyntheticPatientsPanel data={data.synthetic_patients} />
    </div>
  )
}
