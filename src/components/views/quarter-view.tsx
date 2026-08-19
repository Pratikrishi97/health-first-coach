"use client";

import { motion } from "framer-motion";
import {
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressRing, FadeIn, StaggerGroup, StaggerItem, AnimatedNumber, MOTION } from "@/lib/motion";
import { PlanStatusBadge, PlanHealthCard, PlanningInsights } from "./plan-view";
import { getPlanHealth } from "@/lib/planning-engine";
import { cn } from "@/lib/utils";

const TREND_ICONS = { up: TrendingUp, down: TrendingDown, flat: Minus };

export function QuarterView() {
  const planHierarchy = useAppStore((s) => s.planHierarchy);
  const setPlanHorizon = useAppStore((s) => s.setPlanHorizon);
  const track = useAppStore((s) => s.track);

  if (!planHierarchy) return null;

  const { quarter } = planHierarchy;
  const health = getPlanHealth(planHierarchy);

  return (
    <div>
      {/* Quarter header */}
      <FadeIn>
        <Card className="p-6 mb-6 card-premium bg-gradient-to-br from-primary/10 to-background border-beam">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-xs uppercase tracking-wide font-semibold text-primary mb-1">
                {quarter.quarterLabel}
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-balance text-pretty">
                {quarter.primaryObjective}
              </h2>
            </div>
            <PlanStatusBadge status={quarter.status} />
          </div>
          <p className="text-sm text-muted-foreground text-pretty">
            {new Date(quarter.startDate).toLocaleDateString("en-US", { month: "long", day: "numeric" })} — {new Date(quarter.endDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </Card>
      </FadeIn>

      {/* Plan health */}
      <FadeIn delay={0.05}>
        <PlanHealthCard status={health.overall} summary={health.summary} />
      </FadeIn>

      {/* Quarterly outcomes */}
      <FadeIn delay={0.1}>
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Quarterly outcomes
            </h3>
          </div>
          <StaggerGroup className="grid sm:grid-cols-2 gap-3" stagger={MOTION.stagger.standard}>
            {quarter.outcomes.map((outcome) => {
              const TrendIcon = TREND_ICONS[outcome.trend];
              const progressPct = Math.round(((outcome.current - outcome.baseline) / (outcome.target - outcome.baseline)) * 100);
              return (
                <StaggerItem key={outcome.id}>
                  <Card className="p-5 card-premium card-premium-hover">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{outcome.label}</div>
                        <PlanStatusBadge status={outcome.status} className="mt-1" />
                      </div>
                      <ProgressRing value={Math.max(0, Math.min(100, progressPct))} size={48} strokeWidth={5} showLabel={false} label={<span className="text-[10px] font-semibold">{progressPct}%</span>} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Baseline</div>
                        <div className="font-semibold tabular-nums">{outcome.baseline}{outcome.unit}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Target</div>
                        <div className="font-semibold tabular-nums">{outcome.target}{outcome.unit}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Current</div>
                        <div className="font-semibold tabular-nums text-primary">
                          <AnimatedNumber value={outcome.current} />{outcome.unit}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs">
                      <TrendIcon className={cn(
                        "h-3.5 w-3.5",
                        outcome.trend === "up" && "text-primary",
                        outcome.trend === "down" && "text-amber-600",
                        outcome.trend === "flat" && "text-muted-foreground"
                      )} />
                      <span className="text-muted-foreground">
                        {progressPct}% toward quarterly target
                      </span>
                      <Badge variant="outline" className="text-[10px] ml-auto capitalize">
                        {outcome.confidence} confidence
                      </Badge>
                    </div>
                    {outcome.rationale && (
                      <p className="mt-2 text-[11px] text-muted-foreground/70 italic text-pretty">
                        {outcome.rationale}
                      </p>
                    )}
                  </Card>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </section>
      </FadeIn>

      {/* Monthly milestones timeline */}
      <FadeIn delay={0.15}>
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Monthly milestones
            </h3>
          </div>
          <Card className="p-5 card-premium">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-5 top-2 bottom-2 w-px bg-border" />
              <StaggerGroup className="space-y-4" stagger={MOTION.stagger.standard}>
                {quarter.milestones.map((milestone) => (
                  <StaggerItem key={milestone.id}>
                    <div className="flex items-start gap-3">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ ease: MOTION.easing.spring, duration: 0.4 }}
                        className={cn(
                          "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 z-10 relative",
                          milestone.status === "completed"
                            ? "bg-primary text-primary-foreground"
                            : milestone.current
                            ? "bg-primary/10 text-primary ring-2 ring-primary/30"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {milestone.status === "completed" ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <span className="text-sm font-semibold">{milestone.monthNumber}</span>
                        )}
                      </motion.div>
                      <button
                        onClick={() => {
                          setPlanHorizon("month");
                          track("milestone_viewed", { month: milestone.monthNumber });
                        }}
                        className="flex-1 text-left"
                      >
                        <Card className={cn(
                          "p-4 card-premium card-premium-hover transition-all",
                          milestone.current && "border-primary/30 bg-primary/5"
                        )}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-semibold text-sm">{milestone.monthLabel}</div>
                            <div className="flex items-center gap-1.5">
                              {milestone.current && (
                                <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
                                  Current
                                </Badge>
                              )}
                              <PlanStatusBadge status={milestone.status} />
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground text-pretty">{milestone.focus}</p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {milestone.goals.map((g) => (
                              <span key={g.id} className="text-[11px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                                {g.current}/{g.target} {g.label.toLowerCase()}
                              </span>
                            ))}
                          </div>
                          {milestone.current && (
                            <div className="mt-3 flex items-center gap-1 text-xs text-primary font-medium">
                              View month details
                              <ArrowRight className="h-3 w-3" />
                            </div>
                          )}
                        </Card>
                      </button>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerGroup>
            </div>
          </Card>
        </section>
      </FadeIn>

      {/* Planning insights */}
      <FadeIn delay={0.2}>
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Planning insights
            </h3>
          </div>
          <PlanningInsights scope="quarter" />
        </section>
      </FadeIn>
    </div>
  );
}
