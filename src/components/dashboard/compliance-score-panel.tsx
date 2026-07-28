'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ShieldCheck, TrendingUp, TrendingDown, Minus, AlertTriangle,
  Gauge, BarChart3, Target, Activity, Clock, CheckCircle2,
  AlertCircle, XCircle, ArrowUpRight, ArrowDownRight, Layers,
} from 'lucide-react'

interface ComplianceScoreData {
  overallCompositeScore: number
  overallPosture: string
  overallTrend: string
  lastComputed: string
  scoringMethodology: string
  frameworkScores: FrameworkScore[]
  trendData: TrendDay[]
  riskMatrix: RiskItem[]
  summary: {
    frameworksAssessed: number
    dimensionsPerFramework: number
    trendDays: number
    totalRiskItems: number
    totalOpenViolations: number
    overallImperativeRate: number
  }
}

interface FrameworkScore {
  frameworkId: string
  frameworkName: string
  frameworkFullName: string
  category: string
  weight: number
  compositeScore: number
  previousScore: number
  trend: string
  dimensions: Record<string, number>
  riskPosture: string
  riskPostureDetail: string
  topViolations: { id: string; description: string; severity: string; imperativeRef: string; remediationDue: string; status: string }[]
  imperativeCoverage: { total: number; met: number; partial: number; failing: number; coverageRate: number }
  lastAssessment: string
  nextAssessment: string
}

interface TrendDay {
  date: string
  compositeScore: number
  frameworkScores: Record<string, number>
  violationsOpen: number
  violationsResolved: number
  alertsTriggered: number
  remediationActionsCompleted: number
}

interface RiskItem {
  id: string
  title: string
  framework: string
  likelihood: string
  impact: string
  riskLevel: string
  owner: string
  status: string
  mitigation: string
  imperativeRef: string
}

interface Props {
  data: unknown
}

function scoreColor(score: number): string {
  if (score >= 85) return 'text-emerald-500'
  if (score >= 70) return 'text-blue-500'
  if (score >= 55) return 'text-amber-500'
  return 'text-red-500'
}

function scoreBg(score: number): string {
  if (score >= 85) return 'bg-emerald-500/10 border-emerald-500/30'
  if (score >= 70) return 'bg-blue-500/10 border-blue-500/30'
  if (score >= 55) return 'bg-amber-500/10 border-amber-500/30'
  return 'bg-red-500/10 border-red-500/30'
}

function postureBadge(posture: string) {
  const map: Record<string, { variant: 'default' | 'destructive' | 'outline' | 'secondary'; label: string }> = {
    strong: { variant: 'default', label: 'Strong' },
    adequate: { variant: 'outline', label: 'Adequate' },
    at_risk: { variant: 'secondary', label: 'At Risk' },
    critical: { variant: 'destructive', label: 'Critical' },
  }
  const info = map[posture] ?? map.adequate
  return info
}

function trendIcon(trend: string) {
  if (trend === 'improving') return <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
  if (trend === 'declining') return <TrendingDown className="h-3.5 w-3.5 text-red-500" />
  return <Minus className="h-3.5 w-3.5 text-amber-500" />
}

function riskLevelColor(level: string): string {
  switch (level) {
    case 'extreme': return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
    case 'high': return 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
    case 'medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
    default: return 'bg-slate-100 text-slate-700 dark:bg-slate-950 dark:text-slate-300'
  }
}

function statusIcon(status: string) {
  if (status === 'mitigating' || status === 'in_progress') return <Activity className="h-3.5 w-3.5 text-amber-500" />
  if (status === 'resolved') return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
  return <AlertCircle className="h-3.5 w-3.5 text-red-500" />
}

export function ComplianceScorePanel({ data }: Props) {
  const cs = data as ComplianceScoreData

  return (
    <div className="space-y-6">
      {/* Hero: Overall Composite Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={`md:col-span-1 border ${scoreBg(cs.overallCompositeScore)}`}>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <Gauge className={`h-12 w-12 ${scoreColor(cs.overallCompositeScore)} mb-2`} />
            <div className={`text-5xl font-bold ${scoreColor(cs.overallCompositeScore)}`}>
              {cs.overallCompositeScore.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Overall Composite Score</div>
            <Badge variant="outline" className="mt-2 text-[10px]">
              {postureBadge(cs.overallPosture).variant === 'destructive' ? (
                <Badge variant="destructive" className="text-[10px]">{cs.overallPosture.replace('_', ' ')}</Badge>
              ) : (
                cs.overallPosture.replace('_', ' ')
              )}
            </Badge>
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              {trendIcon(cs.overallTrend)}
              <span className="capitalize">{cs.overallTrend}</span>
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">
              Last computed: {new Date(cs.lastComputed).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        {/* Framework Score Cards */}
        <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {cs.frameworkScores.map((fw) => (
            <Card key={fw.frameworkId} className={`border ${scoreBg(fw.compositeScore)}`}>
              <CardContent className="p-3 text-center">
                <div className="text-[10px] text-muted-foreground font-medium">{fw.frameworkName}</div>
                <div className={`text-2xl font-bold ${scoreColor(fw.compositeScore)}`}>
                  {fw.compositeScore.toFixed(1)}
                </div>
                <div className="flex items-center justify-center gap-1 text-[10px] mt-1">
                  {trendIcon(fw.trend)}
                  <span className="text-muted-foreground capitalize">{fw.trend}</span>
                </div>
                <Badge variant="outline" className="text-[9px] mt-1">
                  {fw.weight * 100}% weight
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">{cs.summary.frameworksAssessed}</div>
            <div className="text-xs text-muted-foreground mt-1">Frameworks Assessed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-500">{cs.summary.dimensionsPerFramework}</div>
            <div className="text-xs text-muted-foreground mt-1">Dimensions Each</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-500">{cs.summary.totalRiskItems}</div>
            <div className="text-xs text-muted-foreground mt-1">Risk Items Tracked</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-500">{cs.summary.overallImperativeRate}%</div>
            <div className="text-xs text-muted-foreground mt-1">Imperative Coverage</div>
          </CardContent>
        </Card>
      </div>

      {/* Framework Detail Cards */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
            <Layers className="h-4 w-4" />
            Framework Breakdown
          </h3>
          <div className="space-y-4">
            {cs.frameworkScores.map((fw) => (
              <div key={fw.frameworkId} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`text-lg font-bold ${scoreColor(fw.compositeScore)}`}>
                      {fw.compositeScore.toFixed(1)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{fw.frameworkName}</div>
                      <div className="text-[10px] text-muted-foreground">{fw.frameworkFullName}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[9px]">{fw.category}</Badge>
                    <div className="flex items-center gap-1 text-xs">
                      {trendIcon(fw.trend)}
                      <span className="text-muted-foreground capitalize">{fw.trend}</span>
                    </div>
                  </div>
                </div>

                {/* Dimension bars */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                  {Object.entries(fw.dimensions).map(([dim, val]) => (
                    <div key={dim} className="text-[10px]">
                      <div className="flex justify-between mb-0.5">
                        <span className="text-muted-foreground capitalize">{dim.replace(/_/g, ' ')}</span>
                        <span className="font-mono">{val.toFixed(1)}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            val >= 85 ? 'bg-emerald-500' : val >= 70 ? 'bg-blue-500' : val >= 55 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(val, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Imperative coverage + posture */}
                <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                  <span>Imperatives: <span className="font-semibold text-foreground">{fw.imperativeCoverage.coverageRate}%</span> met ({fw.imperativeCoverage.met}/{fw.imperativeCoverage.total})</span>
                  <span>Posture: <span className="font-semibold capitalize">{fw.riskPosture.replace('_', ' ')}</span></span>
                  <span>Next assessment: {fw.nextAssessment}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 30-Day Trend */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4" />
            30-Day Compliance Trend
          </h3>
          <div className="text-[10px] text-muted-foreground mb-2">
            Each bar represents the daily weighted composite score across all frameworks
          </div>
          <div className="flex items-end gap-0.5 h-32">
            {cs.trendData.map((day, i) => {
              const h = Math.max(4, (day.compositeScore / 100) * 128)
              const color = day.compositeScore >= 85 ? 'bg-emerald-400' : day.compositeScore >= 70 ? 'bg-blue-400' : day.compositeScore >= 55 ? 'bg-amber-400' : 'bg-red-400'
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                  <div
                    className={`w-full rounded-t ${color} opacity-80 hover:opacity-100 transition-opacity cursor-default min-w-[2px]`}
                    style={{ height: `${h}px` }}
                    title={`${day.date}: ${day.compositeScore} (open: ${day.violationsOpen}, resolved: ${day.violationsResolved})`}
                  />
                </div>
              )
            })}
          </div>
          <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
            <span>{cs.trendData[0]?.date}</span>
            <span className="text-center">{cs.summary.trendDays} days</span>
            <span>{cs.trendData[cs.trendData.length - 1]?.date}</span>
          </div>
        </CardContent>
      </Card>

      {/* Risk Matrix */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
            <Target className="h-4 w-4" />
            Cross-Framework Risk Matrix
          </h3>
          <div className="space-y-2">
            {cs.riskMatrix.map((risk) => (
              <div key={risk.id} className="flex items-start gap-3 py-2 px-3 rounded-md bg-muted/30 hover:bg-muted/60 transition-colors">
                <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                  <span className="text-[10px] font-mono text-muted-foreground">{risk.id}</span>
                  {statusIcon(risk.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{risk.title}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{risk.mitigation}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[9px]">{risk.framework}</Badge>
                    <Badge variant="outline" className="text-[9px]">L: {risk.likelihood}</Badge>
                    <Badge variant="outline" className="text-[9px]">I: {risk.impact}</Badge>
                    <Badge variant="outline" className="text-[9px]">{risk.owner}</Badge>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${riskLevelColor(risk.riskLevel)}`}>
                      {risk.riskLevel}
                    </span>
                    <span className="text-[9px] font-mono text-muted-foreground">{risk.imperativeRef}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scoring Methodology */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
            <ShieldCheck className="h-4 w-4" />
            Scoring Methodology
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{cs.scoringMethodology}</p>
        </CardContent>
      </Card>
    </div>
  )
}
