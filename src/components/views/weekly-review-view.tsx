"use client";

import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  CheckCircle2,
  Moon,
  Footprints,
  Brain,
  Salad,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressRing, ScrollReveal, FadeIn, AnimatedNumber, MOTION } from "@/lib/motion";

const IMPROVEMENT_ICONS: Record<string, LucideIcon> = {
  sleep: Moon,
  movement: Footprints,
  nutrition: Salad,
  stress: Brain,
};

export function WeeklyReviewView() {
  const weeklyReview = useAppStore((s) => s.weeklyReview);
  const habits = useAppStore((s) => s.habits);
  const setView = useAppStore((s) => s.setView);
  const track = useAppStore((s) => s.track);

  if (!weeklyReview) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 text-center">
        <p className="text-muted-foreground">No weekly review available yet.</p>
        <Button onClick={() => setView("home")} className="mt-4">Back to Home</Button>
      </div>
    );
  }

  const strongestHabit = habits.find((h) => h.id === weeklyReview.strongestHabitId);
  const improvementIcon = IMPROVEMENT_ICONS[weeklyReview.biggestImprovement] ?? TrendingUp;
  const ImprovementIcon = improvementIcon;
  const completionPct = Math.round(weeklyReview.actualCompletion * 100);
  const completionVsGoal = Math.round(weeklyReview.actualCompletion * 100);

  const handleBuildPlan = () => {
    track("weekly_plan_created", {});
    setView("plan_lab");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-8">
      <header className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => setView("home")} className="-ml-2 mb-2">
          <ArrowRight className="h-4 w-4 rotate-180" />
          Home
        </Button>
        <Badge variant="secondary" className="mb-2">
          <Calendar className="h-3 w-3 mr-1" />
          Week of {new Date(weeklyReview.weekStartDate).toLocaleDateString("en-US", { month: "long", day: "numeric" })}
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-balance">
          Your week in review.
        </h1>
      </header>

      {/* Hero stat */}
      <ScrollReveal>
        <Card className="p-6 mb-6 card-premium bg-gradient-to-br from-primary/10 to-background border-beam text-center">
          <div className="text-xs uppercase tracking-wide font-semibold text-primary mb-3">
            You showed up
          </div>
          <div className="text-6xl font-semibold tabular-nums tracking-tight">
            <AnimatedNumber value={weeklyReview.daysShownUp} duration={1.5} /> days
          </div>
          <p className="mt-2 text-sm text-muted-foreground text-pretty">
            {weeklyReview.daysShownUp >= 5
              ? "A strong week. Consistency is compounding."
              : weeklyReview.daysShownUp >= 3
              ? "A solid week with room to grow. Let's build from here."
              : "A tough week. Tomorrow is a fresh start — let's make the plan easier."}
          </p>
        </Card>
      </ScrollReveal>

      {/* Three key insights */}
      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        <FadeIn delay={0.1}>
          <Card className="p-4 card-premium h-full">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Strongest habit</div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div className="text-sm font-semibold leading-tight">
                {strongestHabit?.title ?? "Walking"}
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {strongestHabit?.currentStreak ?? 5}-day streak
            </div>
          </Card>
        </FadeIn>

        <FadeIn delay={0.15}>
          <Card className="p-4 card-premium h-full">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Biggest improvement</div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <ImprovementIcon className="h-4 w-4" />
              </div>
              <div className="text-sm font-semibold capitalize leading-tight">
                {weeklyReview.biggestImprovement}
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Trending up this week
            </div>
          </Card>
        </FadeIn>

        <FadeIn delay={0.2}>
          <Card className="p-4 card-premium h-full">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Completion</div>
            <div className="flex items-center gap-2">
              <ProgressRing value={completionPct} size={36} strokeWidth={4} showLabel={false} />
              <div className="text-sm font-semibold tabular-nums">
                {completionPct}%
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              vs. goal: {weeklyReview.currentGoal}
            </div>
          </Card>
        </FadeIn>
      </div>

      {/* Coach note */}
      <FadeIn delay={0.25}>
        <Card className="p-5 mb-6 card-premium bg-gradient-to-br from-primary/8 to-background">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shrink-0 shadow-premium-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="text-xs uppercase tracking-wide font-semibold text-primary mb-1">
                Your coach noticed
              </div>
              <p className="text-sm leading-relaxed text-pretty">
                {weeklyReview.coachNote}
              </p>
            </div>
          </div>
        </Card>
      </FadeIn>

      {/* Goal vs. actual */}
      <FadeIn delay={0.3}>
        <Card className="p-5 mb-6 card-premium">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            This week vs. plan
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Goal</span>
              <span className="text-sm font-medium">{weeklyReview.currentGoal}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">You completed</span>
              <span className="text-sm font-medium">
                {completionVsGoal}% of plan
              </span>
            </div>
            <div className="pt-3 border-t border-border">
              <p className="text-sm text-muted-foreground text-pretty">
                {completionVsGoal >= 80
                  ? "You hit your goal. Let's push gently next week."
                  : completionVsGoal >= 60
                  ? "You completed most of your plan. Let's tweak the goal to fit your week better."
                  : "Your plan was bigger than your week. Let's make it smaller and sustainable."}
              </p>
            </div>
          </div>
        </Card>
      </FadeIn>

      {/* Next week plan */}
      <FadeIn delay={0.35}>
        <Card className="p-5 mb-6 card-premium bg-gradient-to-br from-primary/10 to-background border-beam">
          <div className="text-xs uppercase tracking-wide font-semibold text-primary mb-1">
            Next week
          </div>
          <p className="text-lg font-semibold text-pretty leading-snug">
            {weeklyReview.nextWeekPlan}
          </p>
          <Button className="mt-4 shadow-premium-sm" onClick={handleBuildPlan}>
            Build next week&apos;s plan
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </Card>
      </FadeIn>
    </div>
  );
}
