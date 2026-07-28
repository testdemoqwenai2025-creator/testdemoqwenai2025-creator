'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { FileText, Search, ShieldAlert } from 'lucide-react'

interface LogEntry {
  timestamp: string
  level: string
  message: string
  service: string
  fields: {
    service: string
    instance: string
    traceId: string
    spanId: string
    hostname: string
    version: string
    alerting?: boolean
  }
}

interface LogsPanelProps {
  logs: LogEntry[]
}

const levelStyles: Record<string, string> = {
  DEBUG: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  INFO: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  WARN: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  ERROR: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
  FATAL: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

export function LogsPanel({ logs }: LogsPanelProps) {
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [serviceFilter, setServiceFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const services = useMemo(() => {
    const s = new Set(logs.map((l) => l.service))
    return Array.from(s).sort()
  }, [logs])

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      if (levelFilter !== 'all' && log.level !== levelFilter) return false
      if (serviceFilter !== 'all' && log.service !== serviceFilter) return false
      if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
  }, [logs, levelFilter, serviceFilter, searchQuery])

  function formatTimestamp(ts: string): string {
    const d = new Date(ts)
    return (
      `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}:${d.getUTCSeconds().toString().padStart(2, '0')}.${d.getUTCMilliseconds().toString().padStart(3, '0')} UTC`
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Compliance Audit Logs
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search audit events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 text-xs pl-8 w-[200px]"
              />
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="h-8 text-xs w-[110px]">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'].map((l) => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="h-8 text-xs w-[180px]">
                <SelectValue placeholder="Service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                {services.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground mb-2">
          Showing {filtered.length} of {logs.length} audit events
        </div>
        <ScrollArea className="h-[500px] rounded-md border">
          <div className="space-y-0.5 p-3 font-mono text-xs">
            {filtered.map((log, i) => (
              <div
                key={i}
                className={`flex flex-col gap-1 py-2 px-3 rounded-md transition-colors hover:bg-muted/50 ${
                  log.fields.alerting ? 'border-l-2 border-red-500 bg-red-50/50 dark:bg-red-950/20' : ''
                }`}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-muted-foreground whitespace-nowrap">
                    {formatTimestamp(log.timestamp)}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${levelStyles[log.level] || ''}`}>
                    {log.level}
                  </span>
                  <Badge variant="outline" className="text-[10px] h-5 shrink-0">
                    {log.service}
                  </Badge>
                  <span className="text-muted-foreground text-[10px]">{log.fields.instance}</span>
                  {log.fields.alerting && (
                    <ShieldAlert className="h-3 w-3 text-red-500" />
                  )}
                </div>
                <div className="text-foreground/90 pl-0 break-all">{log.message}</div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span>trace: {log.fields.traceId}</span>
                  <span>host: {log.fields.hostname}</span>
                  <span>v{log.fields.version}</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
