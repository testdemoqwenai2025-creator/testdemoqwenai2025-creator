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
  Link2, Shield, Lock, CheckCircle2, AlertTriangle, FileText,
  ChevronDown, ChevronUp, Hash, Search,
} from 'lucide-react'

interface AuditEntry {
  entry_id: string
  sequence: number
  timestamp: string
  event_type: string
  agent: string
  entity_id: string
  payload: Record<string, any>
  previous_hash: string
  current_hash: string
  full_previous_hash: string
  full_current_hash: string
  verification_status: string
  storage_location: string
  signed_by: string | null
  signature_algorithm: string | null
}

interface AuditChainData {
  entries: AuditEntry[]
  total_entries: number
  verified_entries: number
  mismatch_entries: number
  chain_integrity: string
  genesis_hash: string
  latest_hash: string
  storage_backend: string
  retention_policy: string
  signature_algorithm: string
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  state_transition: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  agent_output_published: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  violation_detected: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  remediation_artifact_generated: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  human_approval_granted: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
  human_approval_denied: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  conflict_detected: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  conflict_resolved: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
  schema_validation_passed: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  audit_trail_signed: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  evidence_collected: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
}

export function ProvenancePanel({ data }: { data: AuditChainData }) {
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null)

  const integrityOk = data.chain_integrity === 'intact'
  const integrityPct = Math.round((data.verified_entries / data.total_entries) * 100)

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className={`border p-4 rounded-lg ${integrityOk ? 'border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/10' : 'border-red-500/30 bg-red-50/30 dark:bg-red-950/10'}`}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="flex items-center gap-2">
            {integrityOk ? <Shield className="h-5 w-5 text-emerald-500" /> : <AlertTriangle className="h-5 w-5 text-red-500" />}
            <div>
              <div className="text-xs font-semibold">{data.chain_integrity.toUpperCase()}</div>
              <div className="text-[10px] text-muted-foreground">Chain Integrity</div>
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold">{data.total_entries}</div>
            <div className="text-[10px] text-muted-foreground">Total Entries</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600">{data.verified_entries}</div>
            <div className="text-[10px] text-muted-foreground">Verified</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">{data.mismatch_entries}</div>
            <div className="text-[10px] text-muted-foreground">Mismatches</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{integrityPct}%</div>
            <div className="text-[10px] text-muted-foreground">Verification Rate</div>
          </div>
        </div>
      </div>

      {/* Chain metadata */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs flex items-center gap-2">
            <Lock className="h-3.5 w-3.5" />
            Immutable Audit Chain Configuration
            <span className="text-xs text-muted-foreground font-normal ml-2">SKILLS.md §5 — Immutability & Versioning</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px]">
            <div>
              <div className="text-muted-foreground">Storage Backend</div>
              <div className="font-medium">{data.storage_backend}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Retention</div>
              <div className="font-medium">{data.retention_policy}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Signature Algorithm</div>
              <div className="font-medium">{data.signature_algorithm}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Genesis Hash</div>
              <div className="font-mono text-[8px]">{data.genesis_hash.slice(0, 16)}...</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chain entries table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Append-Only Audit Chain
              <Badge variant="outline" className="text-[10px]">{data.total_entries} entries</Badge>
            </CardTitle>
            <div className="flex items-center gap-2 text-[10px]">
              <Search className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Hash-linked for tamper detection</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[600px] rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">#</TableHead>
                  <TableHead>Entry ID</TableHead>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Hash</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[40px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.entries.map((entry) => {
                  const isExpanded = expandedEntry === entry.entry_id
                  return (
                    <>
                      <TableRow
                        key={entry.entry_id}
                        className={`hover:bg-muted/50 cursor-pointer ${entry.verification_status === 'mismatch' ? 'bg-red-50/30 dark:bg-red-950/10' : ''}`}
                        onClick={() => setExpandedEntry(isExpanded ? null : entry.entry_id)}
                      >
                        <TableCell className="text-[10px] text-muted-foreground">{entry.sequence}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[9px] font-mono">{entry.entry_id}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-[9px] ${EVENT_TYPE_COLORS[entry.event_type] || 'bg-slate-100 text-slate-700'}`}>
                            {entry.event_type.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[10px]">{entry.agent.replace('_', ' ')}</TableCell>
                        <TableCell className="text-[10px] font-mono">{entry.entity_id}</TableCell>
                        <TableCell className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {new Date(entry.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })} UTC
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-[8px] text-muted-foreground">{entry.current_hash.slice(0, 16)}...</span>
                        </TableCell>
                        <TableCell>
                          {entry.verification_status === 'verified' ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                            {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          </Button>
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow key={`${entry.entry_id}-detail`}>
                          <TableCell colSpan={9} className="bg-muted/20 p-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px]">
                              <div>
                                <div className="font-medium mb-1">Full Hash Link</div>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1">
                                    <span className="text-muted-foreground w-20">Previous:</span>
                                    <code className="font-mono text-[8px] break-all">{entry.full_previous_hash}</code>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-muted-foreground w-20">Current:</span>
                                    <code className="font-mono text-[8px] break-all">{entry.full_current_hash}</code>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <div className="font-medium mb-1">Event Payload</div>
                                <div className="space-y-1">
                                  {Object.entries(entry.payload).map(([k, v]) => (
                                    <div key={k} className="flex items-center gap-1">
                                      <span className="text-muted-foreground w-20">{k}:</span>
                                      <span className="font-mono truncate">{typeof v === 'string' ? v : JSON.stringify(v)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <div className="font-medium mb-1">Signature</div>
                                {entry.signed_by ? (
                                  <div>
                                    <span className="text-muted-foreground">Signed by:</span> {entry.signed_by}
                                    <br />
                                    <span className="text-muted-foreground">Algorithm:</span> {entry.signature_algorithm}
                                  </div>
                                ) : (
                                  <span className="text-red-500">Unsigned (verification failed)</span>
                                )}
                              </div>
                              <div>
                                <div className="font-medium mb-1">Storage</div>
                                <code className="font-mono text-[8px] break-all">{entry.storage_location}</code>
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
    </div>
  )
}
