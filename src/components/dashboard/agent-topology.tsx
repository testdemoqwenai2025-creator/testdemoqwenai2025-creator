'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Database, Search, Scale, Hammer, ArrowRight, Cpu,
  CheckCircle2, AlertCircle, Loader2, ShieldAlert,
} from 'lucide-react'

interface AgentSkill {
  name: string
  level: string
  artifacts: string
}

interface AgentTopology {
  name: string
  role: string
  spec_section: string
  state: string
  skills: AgentSkill[]
  throughput_per_hour: number
  success_rate_pct: number
  schema_compliance_pct?: number
  violation_detection_rate_pct?: number
  traceability_enforced_pct?: number
}

interface AgentTopologyProps {
  agents: AgentTopology[]
}

const AGENT_ICONS: Record<string, typeof Database> = {
  Ingestion_Agent: Database,
  Legal_Analyst_Agent: Scale,
  Prosecutor_Agent: Search,
  Defender_Agent: Hammer,
}

const AGENT_COLORS: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  Ingestion_Agent: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-900',
    text: 'text-blue-700 dark:text-blue-300',
    icon: 'text-blue-500',
  },
  Legal_Analyst_Agent: {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    border: 'border-purple-200 dark:border-purple-900',
    text: 'text-purple-700 dark:text-purple-300',
    icon: 'text-purple-500',
  },
  Prosecutor_Agent: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-900',
    text: 'text-red-700 dark:text-red-300',
    icon: 'text-red-500',
  },
  Defender_Agent: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-900',
    text: 'text-emerald-700 dark:text-emerald-300',
    icon: 'text-emerald-500',
  },
}

function StateIcon({ state }: { state: string }) {
  if (state === 'completed') return <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
  if (state === 'processing') return <Loader2 className="h-3.5 w-3.5 text-blue-500 animate-spin" />
  if (state === 'escalated') return <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
  if (state === 'idle') return <Cpu className="h-3.5 w-3.5 text-slate-400" />
  return <AlertCircle className="h-3.5 w-3.5 text-red-500" />
}

export function AgentTopologyPanel({ agents }: AgentTopologyProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            4-Agent Swarm Topology
            <span className="text-xs text-muted-foreground font-normal ml-2">PDF §2 — Push-Based Cascade</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Topology diagram */}
          <div className="flex items-center gap-2 flex-wrap justify-center mb-6 p-4 bg-muted/30 rounded-lg">
            {agents.map((agent, i) => {
              const Icon = AGENT_ICONS[agent.name] || Database
              const colors = AGENT_COLORS[agent.name] || AGENT_COLORS.Ingestion_Agent
              return (
                <div key={agent.name} className="flex items-center gap-2">
                  <div className={`p-3 rounded-lg border-2 ${colors.bg} ${colors.border} flex flex-col items-center gap-1 min-w-[140px]`}>
                    <Icon className={`h-5 w-5 ${colors.icon}`} />
                    <div className={`text-xs font-semibold ${colors.text}`}>{agent.name.replace('_', ' ')}</div>
                    <div className="text-[10px] text-muted-foreground">{agent.role}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <StateIcon state={agent.state} />
                      <span className="text-[10px] capitalize">{agent.state}</span>
                    </div>
                  </div>
                  {i < agents.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              )
            })}
          </div>

          {/* Agent cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents.map((agent) => {
              const colors = AGENT_COLORS[agent.name] || AGENT_COLORS.Ingestion_Agent
              return (
                <Card key={agent.name} className={`${colors.border} ${colors.bg}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className={`text-sm ${colors.text}`}>{agent.name.replace('_', ' ')}</CardTitle>
                      <Badge variant="outline" className="text-[10px]">{agent.spec_section}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{agent.role}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* KPIs */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-muted-foreground text-[10px]">Throughput</div>
                        <div className="font-medium">{agent.throughput_per_hour}/hr</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-[10px]">Success Rate</div>
                        <div className="font-medium">{agent.success_rate_pct}%</div>
                      </div>
                    </div>
                    <Progress value={agent.success_rate_pct} className="h-1.5" />

                    {/* Agent-specific KPIs */}
                    {agent.schema_compliance_pct !== undefined && (
                      <div className="flex items-center gap-2 text-[10px]">
                        <Badge variant="outline" className="text-[10px]">Schema compliance</Badge>
                        <span className="text-emerald-600 font-medium">{agent.schema_compliance_pct}%</span>
                      </div>
                    )}
                    {agent.violation_detection_rate_pct !== undefined && (
                      <div className="flex items-center gap-2 text-[10px]">
                        <Badge variant="outline" className="text-[10px]">Adversarial detection</Badge>
                        <span className="text-amber-600 font-medium">{agent.violation_detection_rate_pct}%</span>
                      </div>
                    )}
                    {agent.traceability_enforced_pct !== undefined && (
                      <div className="flex items-center gap-2 text-[10px]">
                        <Badge variant="outline" className="text-[10px]">Traceability enforced (§9.2)</Badge>
                        <span className="text-emerald-600 font-medium">{agent.traceability_enforced_pct}%</span>
                      </div>
                    )}

                    {/* Skills */}
                    <div>
                      <div className="text-[10px] font-medium text-muted-foreground mb-1">Skills (SKILLS.md matrix)</div>
                      <div className="space-y-1">
                        {agent.skills.map((skill) => (
                          <div key={skill.name} className="flex items-start gap-2 text-[10px]">
                            <Badge variant="secondary" className="text-[9px] h-4 px-1 shrink-0">{skill.level}</Badge>
                            <div className="flex-1">
                              <span className="font-medium">{skill.name}</span>
                              <span className="text-muted-foreground"> → {skill.artifacts}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
