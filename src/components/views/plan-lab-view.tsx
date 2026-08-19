"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Footprints,
  Moon,
  Brain,
  Salad,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressRing, FadeIn, ScrollReveal, AnimatedNumber, MOTION } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface PlanPreset {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  duration: number;
  frequency: number;
  impactLabel: string;
  impactPct: number;
  impactTrend: "up" | "down" | "neutral";
  rationale: string;
}

const PRESETS: PlanPreset[] = [
  {
    id: "easier",
    label: "Make it easier",
    description: "Shorter sessions, fewer days. Best when you've been missing your plan.",
    icon: TrendingDown,
    duration: 15,
    frequency: 4,
    impactLabel: "+18% consistency",
    impactPct: 18,
    impactTrend: "up",
    rationale: "Past 3 weeks: shorter sessions have 2.1× your completion rate. Lowering the bar should lift consistency.",
  },
  {
    id: "current",
    label: "Keep current plan",
    description: "30-minute sessions, 5 days/week. Maintain the rhythm.",
    icon: Minus,
    duration: 30,
    frequency: 5,
    impactLabel: "Baseline",
    impactPct: 0,
    impactTrend: "neutral",
    rationale: "Your current plan. Stick with it if completion has been above 70%.",
  },
  {
    id: "ambitious",
    label: "Make it more ambitious",
    description: "Longer sessions, more days. Best when you've been hitting 80%+.",
    icon: TrendingUp,
    duration: 30,
    frequency: 6,
    impactLabel: "-12% consistency (estimated)",
    impactPct: -12,
    impactTrend: "down",
    rationale: "Past 3 weeks: ambitious plans have not sustained beyond 9 days for you. Proceed with caution.",
  },
];

export function PlanLabView() {
  const weeklyReview = useAppStore((s) => s.weeklyReview);
  const setView = useAppStore((s) => s.setView);
  const adjustHabit = useAppStore((s) => s.adjustHabit);
  const track = useAppStore((s) => s.track);
  const habits = useAppStore((s) => s.habits);

  const [selectedPreset, setSelectedPreset] = useState<string>("current");

  const applyPlan = () => {
    const preset = PRESETS.find((p) => p.id === selectedPreset);
    if (!preset) return;
    // Apply to all movement habits (or first habit as a representative)
    const walkHabit = habits.find((h) => h.id === "walk-20");
    if (walkHabit) {
      adjustHabit(walkHabit.id, {
        targetPerWeek: preset.frequency,
      });
    }
    track("weekly_plan_created", { preset: preset.id, duration: preset.duration, frequency: preset.frequency });
    toast.success(`Plan updated to ${preset.frequency}× ${preset.duration}-min sessions.`);
    setTimeout(() => setView("home"), 800);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-8">
      <header className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => setView("home")} className="-ml-2 mb-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Home
        </Button>
        <Badge variant="secondary" className="mb-2">
          <Sparkles className="h-3 w-3 mr-1" />
          Plan Lab
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-balance">
          Adjust your plan to fit your life.
        </h1>
        <p className="mt-2 text-muted-foreground text-pretty">
          Pick a path. We&apos;ll show you the estimated impact based on your last 3 weeks of behavior.
        </p>
      </header>

      {/* Current state */}
      {weeklyReview && (
        <FadeIn>
          <Card className="p-5 mb-6 card-premium">
            <div className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-3">
              This week
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-semibold tabular-nums">{weeklyReview.currentGoal}</div>
                <div className="text-[11px] text-muted-foreground">Goal</div>
              </div>
              <div>
                <div className="text-2xl font-semibold tabular-nums">
                  {Math.round(weeklyReview.actualCompletion * 100)}%
                </div>
                <div className="text-[11px] text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-semibold tabular-nums">{weeklyReview.daysShownUp}/7</div>
                <div className="text-[11px] text-muted-foreground">Days shown up</div>
              </div>
            </div>
          </Card>
        </FadeIn>
      )}

      {/* Plan presets */}
      <ScrollReveal>
        <div className="space-y-3 mb-6">
          {PRESETS.map((preset, i) => (
            <motion.div
              key={preset.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: MOTION.duration.standard, delay: i * 0.05 }}
            >
              <Card
                className={cn(
                  "p-5 card-premium cursor-pointer transition-all relative overflow-hidden",
                  selectedPreset === preset.id
                    ? "border-primary ring-2 ring-primary/30 bg-primary/5"
                    : "hover:border-primary/40 card-premium-hover"
                )}
                onClick={() => setSelectedPreset(preset.id)}
              >
                {selectedPreset === preset.id && (
                  <motion.div
                    layoutId="plan-glow"
                    className="absolute inset-0 bg-gradient-to-br from-primary/8 to-transparent pointer-events-none"
                  />
                )}
                <div className="flex items-start gap-3 relative">
                  <div className={cn(
                    "h-11 w-11 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                    selectedPreset === preset.id ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  )}>
                    <preset.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{preset.label}</h3>
                      {selectedPreset === preset.id && (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 text-pretty">{preset.description}</p>
                    <div className="mt-3 flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <strong>{preset.frequency} days/week</strong>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Footprints className="h-3.5 w-3.5 text-muted-foreground" />
                        <strong>{preset.duration}-min sessions</strong>
                      </span>
                    </div>
                  </div>
                  {/* Impact indicator */}
                  <div className="text-right shrink-0">
                    <div className={cn(
                      "text-xs font-semibold",
                      preset.impactTrend === "up" && "text-primary",
                      preset.impactTrend === "down" && "text-amber-600",
                      preset.impactTrend === "neutral" && "text-muted-foreground"
                    )}>
                      {preset.impactLabel}
                    </div>
                    {preset.impactTrend !== "neutral" && (
                      <div className={cn(
                        "mt-1 inline-flex items-center justify-center h-7 w-7 rounded-full",
                        preset.impactTrend === "up" ? "bg-primary/10 text-primary" : "bg-amber-500/10 text-amber-600"
                      )}>
                        {preset.impactTrend === "up" ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                      </div>
                    )}
                  </div>
                </div>

                {/* Why this impact */}
                <AnimatePresence>
                  {selectedPreset === preset.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: MOTION.duration.standard }}
                      className="mt-3 pt-3 border-t border-border/60 text-xs text-muted-foreground leading-relaxed text-pretty"
                    >
                      <strong className="text-foreground">Why this impact: </strong>
                      {preset.rationale}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </div>
      </ScrollReveal>

      {/* Apply */}
      <FadeIn delay={0.2}>
        <Card className="p-5 card-premium bg-gradient-to-br from-primary/8 to-background">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold">Apply this plan next week?</div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selectedPreset === "easier" && "We'll lower the bar — you can always adjust again."}
                {selectedPreset === "current" && "Keep going. Your plan stays the same."}
                {selectedPreset === "ambitious" && "Heads up — ambitious plans usually don't sustain. Be ready to scale back."}
              </p>
            </div>
            <Button className="shadow-premium-sm shrink-0" onClick={applyPlan}>
              Apply plan
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        </Card>
      </FadeIn>
    </div>
  );
}
