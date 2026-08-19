"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  TrendingUp,
  Calendar,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Pencil,
  type LucideIcon,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FadeIn, StaggerGroup, StaggerItem, AnimatedNumber, MOTION } from "@/lib/motion";
import { PlanStatusBadge, PlanHealthCard, PlanningInsights } from "./plan-view";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function MonthView() {
  const planHierarchy = useAppStore((s) => s.planHierarchy);
  const adjustMonthlyGoal = useAppStore((s) => s.adjustMonthlyGoal);
  const acceptMonthlyAdjustment = useAppStore((s) => s.acceptMonthlyAdjustment);
  const setPlanHorizon = useAppStore((s) => s.setPlanHorizon);

  const [editingGoal, setEditingGoal] = useState<string | null>(null);

  if (!planHierarchy) return null;

  const { currentMonth, quarter } = planHierarchy;
  const monthName = new Date(currentMonth.startDate).toLocaleDateString("en-US", { month: "long" });

  // Month progress
  const totalGoals = currentMonth.goals.length;
  const completedGoals = currentMonth.goals.filter((g) => g.status === "completed").length;
  const totalTarget = currentMonth.goals.reduce((s, g) => s + g.target, 0);
  const totalCurrent = currentMonth.goals.reduce((s, g) => s + g.current, 0);
  const monthProgress = Math.round((totalCurrent / totalTarget) * 100);

  return (
    <div>
      {/* Month header */}
      <FadeIn>
        <Card className="p-6 mb-6 card-premium bg-gradient-to-br from-primary/10 to-background border-beam">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="text-xs uppercase tracking-wide font-semibold text-primary mb-1">
                {currentMonth.monthLabel}
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-balance">
                {monthName}
              </h2>
              <p className="text-sm text-muted-foreground mt-1 text-pretty italic">
                Your focus this month: {currentMonth.focus.toLowerCase()}.
              </p>
            </div>
            <PlanStatusBadge status={currentMonth.status} />
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs">
            <span className="text-muted-foreground">
              {monthProgress}% complete · {completedGoals}/{totalGoals} goals
            </span>
          </div>
        </Card>
      </FadeIn>

      {/* Month progress */}
      <FadeIn delay={0.05}>
        <Card className="p-5 mb-6 card-premium">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">
                Monthly progress
              </div>
              <div className="text-2xl font-semibold tabular-nums mt-0.5">
                <AnimatedNumber value={totalCurrent} /> / {totalTarget}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Trend</div>
              <div className="flex items-center gap-1 text-primary font-semibold">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">+8%</span>
              </div>
            </div>
          </div>
          <Progress value={monthProgress} className="h-2" />
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Started {new Date(currentMonth.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
            <span>Ends {new Date(currentMonth.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
          </div>
        </Card>
      </FadeIn>

      {/* Monthly goals with adjustment recommendations */}
      <FadeIn delay={0.1}>
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Monthly goals
            </h3>
          </div>
          <StaggerGroup className="space-y-3" stagger={MOTION.stagger.standard}>
            {currentMonth.goals.map((goal) => {
              const pct = Math.round((goal.current / goal.target) * 100);
              const projectedPct = Math.round((goal.projected / goal.target) * 100);
              const isEditing = editingGoal === goal.id;
              return (
                <StaggerItem key={goal.id}>
                  <Card className={cn(
                    "p-4 card-premium",
                    goal.adjustmentRecommended && "border-amber-500/30 bg-amber-500/5"
                  )}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{goal.label}</span>
                          <PlanStatusBadge status={goal.status} />
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">{goal.unit}</div>
                      </div>
                      <button
                        onClick={() => setEditingGoal(isEditing ? null : goal.id)}
                        className="text-xs text-muted-foreground hover:text-primary p-1.5 rounded-md hover:bg-muted transition-colors"
                        aria-label="Adjust goal"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Goal numbers */}
                    <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                      <div>
                        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Current</div>
                        <div className="text-lg font-semibold tabular-nums">
                          <AnimatedNumber value={goal.current} />
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Target</div>
                        <div className="text-lg font-semibold tabular-nums">{goal.target}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Projected</div>
                        <div className={cn(
                          "text-lg font-semibold tabular-nums",
                          goal.projected >= goal.target ? "text-primary" : "text-amber-600"
                        )}>
                          {goal.projected}
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: MOTION.easing.out }}
                        className="absolute h-full bg-primary rounded-full"
                      />
                      {projectedPct > pct && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${projectedPct}%` }}
                          transition={{ duration: 0.8, delay: 0.2, ease: MOTION.easing.out }}
                          className="absolute h-full bg-primary/30 rounded-full border-r border-primary/50"
                        />
                      )}
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{pct}% complete</span>
                      <span>Projected: {projectedPct}%</span>
                    </div>

                    {/* Adjustment recommendation */}
                    <AnimatePresence>
                      {goal.adjustmentRecommended && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: MOTION.duration.standard }}
                          className="mt-3 pt-3 border-t border-amber-500/30"
                        >
                          <div className="flex items-start gap-2">
                            <Sparkles className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
                                Adjustment recommended
                              </div>
                              <p className="text-xs text-muted-foreground text-pretty">
                                {goal.adjustmentRecommended.reason}
                              </p>
                              <div className="mt-2 flex items-center gap-2">
                                <Button
                                  size="sm"
                                  className="text-xs h-7"
                                  onClick={() => {
                                    acceptMonthlyAdjustment(goal.id);
                                    toast.success(`Goal adjusted to ${goal.adjustmentRecommended!.newTarget} sessions`);
                                  }}
                                >
                                  Accept adjustment
                                </Button>
                                <Badge variant="outline" className="text-[10px] capitalize">
                                  {goal.adjustmentRecommended.difficulty.replace("_", " ")}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Adjust panel */}
                    <AnimatePresence>
                      {isEditing && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: MOTION.duration.fast }}
                          className="mt-3 pt-3 border-t border-border"
                        >
                          <div className="text-xs text-muted-foreground mb-2">Adjust target:</div>
                          <div className="flex gap-1.5">
                            {[goal.target - 4, goal.target - 2, goal.target, goal.target + 2].map((t) => (
                              <button
                                key={t}
                                onClick={() => {
                                  adjustMonthlyGoal(goal.id, t);
                                  setEditingGoal(null);
                                  toast.success(`Target set to ${t} ${goal.unit}`);
                                }}
                                className={cn(
                                  "flex-1 py-2 rounded-lg text-sm font-medium border transition-colors",
                                  goal.target === t
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "border-border hover:border-primary/40"
                                )}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                          <div className="mt-2 text-[11px] text-muted-foreground">
                            {[goal.target - 4, goal.target - 2, goal.target, goal.target + 2].map((t) => {
                              const diff = t - goal.target;
                              const label = diff < -1 ? "Likely easier to sustain" : diff < 0 ? "Slightly easier" : diff === 0 ? "Current target" : diff < 2 ? "Slightly more demanding" : "More demanding";
                              return (
                                <div key={t} className="flex items-center justify-between py-0.5">
                                  <span className="tabular-nums">{t} {goal.unit}</span>
                                  <span className="italic">{label}</span>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </section>
      </FadeIn>

      {/* Planning insights */}
      <FadeIn delay={0.15}>
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Planning insights
            </h3>
          </div>
          <PlanningInsights scope="month" />
        </section>
      </FadeIn>

      {/* Navigation to quarter */}
      <FadeIn delay={0.2}>
        <Card className="p-4 card-premium bg-muted/40">
          <button
            onClick={() => setPlanHorizon("quarter")}
            className="w-full flex items-center justify-between"
          >
            <div className="text-left">
              <div className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">
                View quarter
              </div>
              <div className="text-sm font-medium">{quarter.quarterLabel} — {quarter.primaryObjective}</div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </Card>
      </FadeIn>
    </div>
  );
}
