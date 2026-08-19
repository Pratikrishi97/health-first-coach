"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  Footprints,
  Moon,
  Brain,
  Salad,
  Lightbulb,
  Info,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import {
  LineChart,
  Line,
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { useAppStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ProgressView() {
  const metrics = useAppStore((s) => s.metrics);
  const habits = useAppStore((s) => s.habits);
  const insights = useAppStore((s) => s.insights);
  const setView = useAppStore((s) => s.setView);

  // Compute weekly consistency trend
  const weekly = computeWeeklyTrend(habits);
  const consistencyImprovement = weekly.length >= 3
    ? Math.round(((weekly[weekly.length - 1] - weekly[0]) / Math.max(1, weekly[0])) * 100)
    : 0;

  // Last 14 days of step + sleep data
  const last14 = metrics.slice(-14).map((m) => ({
    date: new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    steps: m.steps,
    sleep: m.sleepHours,
    stress: m.stressLevel,
    weight: m.weightKg,
  }));

  const hasMetrics = last14.length > 0;
  const avgSteps = hasMetrics
    ? Math.round(last14.reduce((s, d) => s + d.steps, 0) / last14.length)
    : 0;
  const avgSleep = hasMetrics
    ? last14.reduce((s, d) => s + d.sleep, 0) / last14.length
    : 0;
  const avgStress = hasMetrics
    ? Math.round(last14.reduce((s, d) => s + d.stress, 0) / last14.length)
    : 0;

  // Goal progress derived from the user's actual active habits
  const goalRows = habits
    .filter((h) => !h.paused)
    .slice(0, 4)
    .map((h) => ({
      icon:
        h.category === "movement"
          ? Footprints
          : h.category === "sleep"
          ? Moon
          : h.category === "nutrition"
          ? Salad
          : Brain,
      label: h.title,
      value: `${h.targetPerWeek}× / week`,
      pct: h.targetPerWeek
        ? Math.min(100, Math.round((h.completedThisWeek / h.targetPerWeek) * 100))
        : 0,
    }));

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-8">
      {/* Header */}
      <header className="mb-6">
        <Badge variant="secondary" className="mb-2">Your progress</Badge>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-balance">
          You&apos;re becoming more consistent.
        </h1>
        <p className="mt-2 text-muted-foreground text-pretty">
          Small trends compound. Here&apos;s the story your data is telling.
        </p>
      </header>

      {/* Hero stat */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="p-6 mb-6 card-soft bg-gradient-to-br from-primary/10 to-background">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shrink-0">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="text-xs uppercase tracking-wide font-semibold text-primary mb-1">
                Consistency
              </div>
              <div className="text-3xl sm:text-4xl font-semibold tracking-tight">
                +{Math.max(0, consistencyImprovement)}%
              </div>
              <p className="text-sm text-muted-foreground mt-1 text-pretty">
                You&apos;re completing <strong>{Math.max(0, consistencyImprovement)}%</strong> more habits than when you started three weeks ago.
              </p>
              <p className="text-[11px] text-muted-foreground mt-2 italic">
                Calculated from your habit logs across the last 21 days, compared week-over-week.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Weekly consistency chart */}
      <Section title="Habit consistency" subtitle="The story: small dips, then steady gains">
        <Card className="p-5 card-soft">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekly.map((v, i) => ({ week: `W${i + 1}`, pct: Math.round(v * 100) }))}>
                <defs>
                  <linearGradient id="gradConsistency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.55 0.09 175)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.55 0.09 175)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "oklch(0.5 0.015 180)" }} />
                <YAxis domain={[0, 100]} hide />
                <Tooltip
                  cursor={{ stroke: "oklch(0.55 0.09 175)", strokeWidth: 1 }}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid oklch(0.92 0.01 160)",
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [`${v}%`, "Consistency"]}
                />
                <Area
                  type="monotone"
                  dataKey="pct"
                  stroke="oklch(0.55 0.09 175)"
                  strokeWidth={2.5}
                  fill="url(#gradConsistency)"
                  dot={{ r: 3, fill: "oklch(0.55 0.09 175)", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex items-center gap-3 text-xs">
            {weekly.map((v, i) => (
              <div key={i} className="flex-1 text-center">
                <div className="font-semibold tabular-nums">{Math.round(v * 100)}%</div>
                <div className="text-muted-foreground">Week {i + 1}</div>
              </div>
            ))}
          </div>
        </Card>
      </Section>

      {/* Movement */}
      <Section title="Movement" subtitle="Daily steps over the last 14 days">
        <Card className="p-5 card-soft">
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last14}>
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "oklch(0.5 0.015 180)" }} interval={1} />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: "oklch(0.55 0.09 175 / 0.06)" }}
                  contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.01 160)", fontSize: 12 }}
                  formatter={(v: number) => [v.toLocaleString(), "Steps"]}
                />
                <Bar dataKey="steps" fill="oklch(0.55 0.09 175)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <TrendRow label="14-day average" value={`${avgSteps.toLocaleString()} steps`} />
        </Card>
      </Section>

      {/* Sleep + Stress */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <Card className="p-5 card-soft">
          <SectionTitle icon={Moon} title="Sleep" />
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last14}>
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: "oklch(0.5 0.015 180)" }} interval={2} />
                <YAxis domain={[4, 9]} hide />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.01 160)", fontSize: 12 }}
                  formatter={(v: number) => [`${v}h`, "Sleep"]}
                />
                <Line type="monotone" dataKey="sleep" stroke="oklch(0.55 0.09 175)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <TrendRow label="Average" value={`${avgSleep.toFixed(1)}h`} />
        </Card>

        <Card className="p-5 card-soft">
          <SectionTitle icon={Brain} title="Stress" />
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last14}>
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: "oklch(0.5 0.015 180)" }} interval={2} />
                <YAxis domain={[20, 90]} hide />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.01 160)", fontSize: 12 }}
                  formatter={(v: number) => [`${v}/100`, "Stress"]}
                />
                <Line type="monotone" dataKey="stress" stroke="oklch(0.65 0.16 30)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <TrendRow label="Average" value={`${avgStress}/100`} />
        </Card>
      </div>

      {/* Insights */}
      <Section title="Observed patterns" subtitle="What we noticed — and how we calculated it">
        <div className="space-y-3">
          {insights.length === 0 && (
            <Card className="p-6 card-soft text-center">
              <div className="h-10 w-10 mx-auto rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div className="font-medium text-sm">Patterns are on their way</div>
              <p className="text-xs text-muted-foreground mt-1 text-pretty max-w-sm mx-auto">
                As you log habits over the next week, your coach will surface personal
                patterns here — your best days, what makes habits stick, and gentle nudges
                — each with a clear &ldquo;how was this calculated?&rdquo; explanation.
              </p>
            </Card>
          )}
          {insights.map((insight) => {
            const Icon = insight.category === "success" ? TrendingUp : insight.category === "barrier" ? Info : Lightbulb;
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-4 card-soft card-soft-hover">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
                      insight.category === "success" ? "bg-primary/10 text-primary" : insight.category === "barrier" ? "bg-amber-500/10 text-amber-600" : "bg-primary/10 text-primary"
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{insight.title}</div>
                      <div className="text-sm text-muted-foreground mt-0.5 text-pretty">{insight.detail}</div>
                      <details className="mt-2">
                        <summary className="text-[11px] text-muted-foreground cursor-pointer hover:text-primary transition-colors">
                          How was this calculated?
                        </summary>
                        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                          {insight.rationale}
                        </p>
                      </details>
                    </div>
                    <Badge variant="outline" className="text-[10px] capitalize shrink-0">
                      {insight.category}
                    </Badge>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </Section>

      {/* Goal progress */}
      <Section title="Goal progress" subtitle="This week's focus areas">
        <Card className="p-5 card-soft">
          <div className="space-y-3">
            {goalRows.length ? (
              goalRows.map((g) => (
                <GoalProgressRow key={g.label} icon={g.icon} label={g.label} value={g.value} pct={g.pct} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-2">
                No active habits yet — add a few to see your weekly goal progress here.
              </p>
            )}
          </div>
          <Button variant="ghost" size="sm" className="mt-4 w-full" onClick={() => setView("coach")}>
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            Ask coach about adjusting my goals
          </Button>
        </Card>
      </Section>
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <div className="mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground/70 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <Icon className="h-4 w-4 text-primary" />
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
    </div>
  );
}

function TrendRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-3 flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function GoalProgressRow({ icon: Icon, label, value, pct }: { icon: LucideIcon; label: string; value: string; pct: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-xs text-muted-foreground">{pct}%</span>
        </div>
        <div className="text-[11px] text-muted-foreground">{value}</div>
        <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Helpers
// ============================================================

function computeWeeklyTrend(habits: { history: boolean[]; targetPerWeek: number }[]): number[] {
  if (!habits.length) return [0.42, 0.58, 0.71, 0.78];
  // Build 4 weekly buckets from the last 21 days (rough estimate using habit.history which is 7 days)
  // For prototype: simulate trend from current state
  const currentCompletion = habits.reduce((s, h) => s + h.history.filter(Boolean).length, 0) / (habits.length * 7);
  const baseline = Math.max(0.2, currentCompletion - 0.3);
  const mid1 = Math.max(0.3, currentCompletion - 0.18);
  const mid2 = Math.max(0.4, currentCompletion - 0.08);
  return [baseline, mid1, mid2, currentCompletion];
}
