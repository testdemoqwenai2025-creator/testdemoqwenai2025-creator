'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Radio, ArrowRight, Inbox, Zap, AlertCircle, Clock,
  MessageSquare, Activity, Server,
} from 'lucide-react'

interface Partition {
  partition: number
  messages_total: number
  messages_consumed: number
  lag: number
  offset_latest: number
  earliest_offset: number
  size_mb: number
}

interface Topic {
  name: string
  description: string
  consumer_group: string
  partitions: Partition[]
  total_messages: number
  total_lag: number
  total_size_mb: number
  avg_throughput_per_min: number
  consumer_group_lag: number
}

interface EventBusData {
  topics: Topic[]
  total_topics: number
  total_messages: number
  total_lag: number
  total_size_mb: number
  metrics: {
    published_total: number
    consumed_total: number
    failed_total: number
    avg_latency_ms: number
  }
}

const TOPIC_ICONS: Record<string, typeof Radio> = {
  'regulatory.changes': Inbox,
  'analysis.results': Activity,
  'gap.findings': AlertCircle,
  'remediation.plans': Zap,
  'governance.audit': Server,
  'escalation.requests': Clock,
  'state.transitions': ArrowRight,
  'conflict.alerts': AlertCircle,
}

const TOPIC_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'regulatory.changes': { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
  'analysis.results': { bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
  'gap.findings': { bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-800' },
  'remediation.plans': { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
  'governance.audit': { bg: 'bg-slate-50 dark:bg-slate-950/30', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-800' },
  'escalation.requests': { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
  'state.transitions': { bg: 'bg-cyan-50 dark:bg-cyan-950/30', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-800' },
  'conflict.alerts': { bg: 'bg-orange-50 dark:bg-orange-950/30', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800' },
}

export function OrchestrationPanel({ data }: { data: EventBusData }) {
  const consumeRate = Math.round((data.metrics.consumed_total / data.metrics.published_total) * 100)

  return (
    <div className="space-y-6">
      {/* Summary metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">{data.total_topics}</div>
            <div className="text-[10px] text-muted-foreground mt-1">Event Bus Topics</div>
          </CardContent>
        </Card>
        <Card className="border-purple-500/20 bg-purple-500/5">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-500">{data.total_messages.toLocaleString()}</div>
            <div className="text-[10px] text-muted-foreground mt-1">Total Messages</div>
          </CardContent>
        </Card>
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-500">{data.total_lag}</div>
            <div className="text-[10px] text-muted-foreground mt-1">Consumer Lag</div>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-500">{consumeRate}%</div>
            <div className="text-[10px] text-muted-foreground mt-1">Consume Rate</div>
          </CardContent>
        </Card>
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-500">{data.metrics.failed_total}</div>
            <div className="text-[10px] text-muted-foreground mt-1">Failed Messages</div>
          </CardContent>
        </Card>
      </div>

      {/* Throughput + latency */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <div className="text-[10px] text-muted-foreground uppercase">Avg Latency</div>
              <div className="text-lg font-bold">{data.metrics.avg_latency_ms}ms</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase">Total Size</div>
              <div className="text-lg font-bold">{data.total_size_mb} MB</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase">Publish/Consume</div>
              <div className="text-lg font-bold">{data.metrics.published_total.toLocaleString()} / {data.metrics.consumed_total.toLocaleString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Bus flow diagram */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Radio className="h-4 w-4" />
            Event-Driven Dispatch — Agent Communication Topology
            <span className="text-xs text-muted-foreground font-normal ml-2">SKILLS.md §5 + PDF §7</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Visual topic flow */}
          <div className="flex items-center gap-2 flex-wrap justify-center mb-6 p-4 bg-muted/30 rounded-lg">
            {data.topics.map((topic, i) => {
              const Icon = TOPIC_ICONS[topic.name] || MessageSquare
              const colors = TOPIC_COLORS[topic.name] || TOPIC_COLORS['regulatory.changes']
              return (
                <div key={topic.name} className="flex items-center gap-2">
                  <div className={`p-3 rounded-lg border ${colors.bg} ${colors.border} flex flex-col items-center gap-1 min-w-[120px]`}>
                    <Icon className={`h-4 w-4 ${colors.text}`} />
                    <div className={`text-[10px] font-semibold ${colors.text}`}>{topic.name.replace(/\./g, ' ')}</div>
                    <div className="text-[9px] text-muted-foreground">{topic.total_messages.toLocaleString()} msgs</div>
                    {topic.total_lag > 15 && (
                      <Badge variant="destructive" className="text-[8px] h-3.5 px-1">lag: {topic.total_lag}</Badge>
                    )}
                  </div>
                  {i < data.topics.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Topic detail cards */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Server className="h-4 w-4" />
            Topic Partitions & Consumer Groups
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topics.map((topic) => {
              const colors = TOPIC_COLORS[topic.name] || TOPIC_COLORS['regulatory.changes']
              return (
                <div key={topic.name} className={`rounded-lg border p-3 ${colors.bg} ${colors.border}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] font-mono">{topic.name}</Badge>
                      <Badge variant="secondary" className="text-[9px]">{topic.consumer_group}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-[10px]">
                      <span className="text-muted-foreground">{topic.description}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-[10px]">
                    <div>
                      <div className="text-muted-foreground">Partitions</div>
                      <div className="font-medium">{topic.partitions.length}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Messages</div>
                      <div className="font-medium">{topic.total_messages.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Consumed</div>
                      <div className="font-medium">{(topic.total_messages - topic.total_lag).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Lag</div>
                      <div className={`font-medium ${topic.total_lag > 20 ? 'text-red-600' : 'text-emerald-600'}`}>{topic.total_lag}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Size</div>
                      <div className="font-medium">{topic.total_size_mb} MB</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Throughput</div>
                      <div className="font-medium">{topic.avg_throughput_per_min}/min</div>
                    </div>
                  </div>
                  {/* Partition bars */}
                  <div className="mt-2 flex items-center gap-1">
                    {topic.partitions.map((p) => (
                      <div key={p.partition} className="flex-1">
                        <Progress
                          value={p.messages_total > 0 ? (p.messages_consumed / p.messages_total) * 100 : 0}
                          className="h-1.5"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5 text-[8px] text-muted-foreground">
                    {topic.partitions.map((p) => (
                      <span key={p.partition} className="flex-1 text-center">P{p.partition}</span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
