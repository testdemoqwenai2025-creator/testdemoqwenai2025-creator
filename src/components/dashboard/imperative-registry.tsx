'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Scale, Link2, FileText } from 'lucide-react'

interface Imperative {
  id: string
  text: string
  query: string
  risk_tier: string
  jurisdiction: string
  regulation_id: string
  scenario_id: string
  trace_id: string
  extracted_at: string
}

interface ImperativeRegistryProps {
  imperatives: Imperative[]
}

const RISK_COLORS: Record<string, string> = {
  Critical: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  High: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  Moderate: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  Low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
}

const JURISDICTION_COLORS: Record<string, string> = {
  HIPAA: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  GDPR: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  SOC2: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  'PCI-DSS': 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  'EU-AI-ACT': 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
  ISO27001: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  SEC: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
}

export function ImperativeRegistryPanel({ imperatives }: ImperativeRegistryProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Imperative Registry
            <span className="text-xs text-muted-foreground font-normal ml-2">PDF §4 — Agent 2 Rules Engine</span>
          </CardTitle>
          <Badge variant="outline">{imperatives.length} imperatives with unique IDs</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
          <Link2 className="h-3 w-3" />
          Each imperative carries a unique ID — the spine of the traceability chain (Regulation → Imperative → Violation → Remediation)
        </div>
        <ScrollArea className="max-h-[600px] rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imperative ID</TableHead>
                <TableHead>Text</TableHead>
                <TableHead>System Query</TableHead>
                <TableHead>Risk Tier</TableHead>
                <TableHead>Jurisdiction</TableHead>
                <TableHead>Regulation</TableHead>
                <TableHead>Extracted At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {imperatives.map((imp) => (
                <TableRow key={imp.id + imp.scenario_id} className="hover:bg-muted/50">
                  <TableCell>
                    <Badge className="text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-mono">
                      <FileText className="h-3 w-3 mr-1" />
                      {imp.id}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs max-w-[280px]">{imp.text}</div>
                  </TableCell>
                  <TableCell>
                    <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded block max-w-[280px] truncate" title={imp.query}>
                      {imp.query}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] ${RISK_COLORS[imp.risk_tier] || ''}`}>{imp.risk_tier}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] ${JURISDICTION_COLORS[imp.jurisdiction] || ''}`}>{imp.jurisdiction}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">{imp.regulation_id}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(imp.extracted_at).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })} UTC
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
