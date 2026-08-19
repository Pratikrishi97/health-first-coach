"use client";

import {
  Sparkles,
  Footprints,
  Moon,
  Droplets,
  Brain,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { getNextBestAction } from "@/lib/coach-engine";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Habit } from "@/lib/types";

export function HomeView() {
  const profile = useAppStore((s) => s.profile);
  const metrics = useAppStore((s) => s.metrics);
  const habits = useAppStore((s) => s.habits);
  const toggleHabitToday = useAppStore((s) => s.toggleHabitToday);
  const setView = useAppStore((s) => s.setView);

  if (!profile) return null;

  const today = metrics[metrics.length - 1];
  const greeting = getGreeting();
  const firstName = profile.name.split(" ")[0];

  const nextAction = getNextBestAction(useAppStore.getState());

  const dailyBalance = computeDailyBalance(today, habits);
  const momentum = computeWeeklyMomentum(habits);
  const streak = Math.max(0, ...habits.map((h) => h.currentStreak));

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-8">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
          <span>{greeting}</span>
          <span>·</span>
          <span>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          {greeting}, {firstName}.
        </h1>
        <p className="mt-1 text-muted-foreground text-pretty">
          {today && today.sleepHours < 6
            ? "Your sleep was shorter than usual. Today's plan is gentler — small actions still count."
            : today && today.stressLevel >= 65
            ? "Your stress looks elevated. A 5-minute reset can shift the rest of your day."
            : momentum >= 0.7
            ? "You're on a strong streak. Let's keep it going with one focused action."
            : "You've got a busy day ahead. Let's keep today's plan simple."}
        </p>
      </motion.div>

      {/* Daily Balance + Next best action */}
      <div className="grid sm:grid-cols-5 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="sm:col-span-2"
        >
          <Card className="p-5 h-full card-soft flex flex-col justify-between">
            <div>
              <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wide font-medium">
                Daily Balance
              </div>
              <div className="flex items-end gap-2">
                <div className="text-5xl font-semibold tracking-tight tabular-nums">
                  {dailyBalance}
                </div>
                <div className="text-sm text-muted-foreground pb-2">
                  {dailyBalance >= 80 ? "On track" : dailyBalance >= 60 ? "Steady" : "Needs attention"}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                A holistic indicator across movement, sleep, nutrition, and stress.
                <span className="text-muted-foreground/70"> Not a medical score.</span>
              </p>
            </div>
            <button
              onClick={() => setView("progress")}
              className="text-xs text-primary font-medium mt-4 flex items-center gap-1 hover:underline"
            >
              See breakdown
              <ChevronRight className="h-3 w-3" />
            </button>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="sm:col-span-3"
        >
          <Card className="p-5 h-full card-soft bg-gradient-to-br from-primary/5 to-background">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs uppercase tracking-wide font-medium text-muted-foreground">
                {nextAction.title}
              </span>
            </div>
            <p className="text-base font-medium leading-snug text-pretty">
              {nextAction.body}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <Button size="sm" onClick={() => setView(nextAction.action === "start_walk" ? "habits" : "coach")}>
                {nextAction.action === "start_walk" ? "Start walk" : nextAction.action === "adjust_plan" ? "Adjust plan" : nextAction.action === "schedule_habit" ? "Reschedule" : "Ask coach"}
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
              <button
                onClick={() => setView("coach")}
                className="text-xs text-muted-foreground hover:text-foreground px-2"
              >
                Why this?
              </button>
            </div>
            <div className="mt-3 text-[11px] text-muted-foreground/80 leading-snug border-l-2 border-primary/30 pl-2">
              {nextAction.reason}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Habit cards */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Today&apos;s habits
          </h2>
          <button
            onClick={() => setView("habits")}
            className="text-xs text-primary font-medium hover:underline"
          >
            View all
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <HabitMiniCard
            icon={Footprints}
            label="Movement"
            value={today ? `${formatSteps(today.steps)}` : "—"}
            sub={today ? `of ${formatSteps(today.stepsGoal)}` : ""}
            progress={today ? (today.steps / today.stepsGoal) * 100 : 0}
          />
          <HabitMiniCard
            icon={Moon}
            label="Sleep"
            value={today ? `${Math.floor(today.sleepHours)}h ${Math.round((today.sleepHours % 1) * 60)}m` : "—"}
            sub={today ? `goal ${today.sleepGoalHours}h` : ""}
            progress={today ? (today.sleepHours / today.sleepGoalHours) * 100 : 0}
          />
          <HabitMiniCard
            icon={Droplets}
            label="Hydration"
            value={today ? `${today.hydrationGlasses}/${today.hydrationGoal}` : "—"}
            sub="glasses"
            progress={today ? (today.hydrationGlasses / today.hydrationGoal) * 100 : 0}
          />
          <HabitMiniCard
            icon={Brain}
            label="Stress reset"
            value={today ? `${today.stressResetsCompleted}/1` : "—"}
            sub="completed"
            progress={today ? today.stressResetsCompleted * 100 : 0}
          />
        </div>
      </section>

      {/* Active habits checklist */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          Today&apos;s checklist
        </h2>
        <Card className="card-soft divide-y divide-border">
          {habits.filter((h) => !h.paused).map((h) => (
            <HabitRow key={h.id} habit={h} onToggle={() => toggleHabitToday(h.id)} />
          ))}
        </Card>
      </section>

      {/* Coach insight */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-6"
      >
        <Card className="p-5 card-soft bg-gradient-to-br from-primary/10 to-background">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs uppercase tracking-wide font-semibold text-primary mb-1">
                Coach insight
              </div>
              <p className="text-sm leading-relaxed text-pretty">
                {buildCoachInsight(habits, today)}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Button size="sm" variant="secondary" onClick={() => setView("coach")}>
                  Ask Coach
                </Button>
                <span className="text-[11px] text-muted-foreground">Personalized from your last 7 days</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.section>

      {/* Weekly momentum */}
      <section>
        <Card className="p-5 card-soft">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">
                Weekly momentum
              </div>
              <div className="text-2xl font-semibold mt-1">
                {streak}-day consistency streak
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Completion</div>
              <div className="text-xl font-semibold tabular-nums">
                {Math.round(momentum * 100)}%
              </div>
            </div>
          </div>
          <div className="flex gap-1.5">
            {habits[0]?.history.map((done, i) => (
              <div
                key={i}
                className={cn(
                  "h-8 flex-1 rounded-md flex items-center justify-center text-[10px] font-medium",
                  done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}
              >
                {["M", "T", "W", "T", "F", "S", "S"][i]}
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              Up 13% vs. last week
            </span>
            <button onClick={() => setView("progress")} className="text-primary font-medium hover:underline">
              See progress →
            </button>
          </div>
        </Card>
      </section>
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================

function HabitMiniCard({
  icon: Icon,
  label,
  value,
  sub,
  progress,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub: string;
  progress: number;
}) {
  return (
    <Card className="p-4 card-soft card-soft-hover">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <Icon className="h-3.5 w-3.5" />
        </div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="text-xl font-semibold tabular-nums tracking-tight">{value}</div>
      <div className="text-[11px] text-muted-foreground">{sub}</div>
      <Progress value={Math.min(100, progress)} className="h-1.5 mt-2" />
    </Card>
  );
}

function HabitRow({ habit, onToggle }: { habit: Habit; onToggle: () => void }) {
  const completed = habit.history[habit.history.length - 1];
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-3 p-4 hover:bg-muted/40 transition-colors text-left"
    >
      <div
        className={cn(
          "h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
          completed ? "bg-primary border-primary text-primary-foreground" : "border-border"
        )}
      >
        {completed && <span className="text-[10px]">✓</span>}
      </div>
      <div className="flex-1 min-w-0">
        <div className={cn("text-sm font-medium", completed && "text-muted-foreground line-through")}>
          {habit.title}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {habit.scheduledTime} · {habit.currentStreak}-day streak
        </div>
      </div>
      <Badge variant="outline" className="text-[10px]">
        {habit.completedThisWeek}/{habit.targetPerWeek}
      </Badge>
    </button>
  );
}

// ============================================================
// Helpers
// ============================================================

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Burning the midnight oil";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Winding down";
}

function computeDailyBalance(
  today: { steps: number; stepsGoal: number; sleepHours: number; sleepGoalHours: number; hydrationGlasses: number; hydrationGoal: number; stressLevel: number } | undefined,
  habits: Habit[]
): number {
  if (!today) return 50;
  const stepScore = Math.min(1, today.steps / today.stepsGoal) * 25;
  const sleepScore = Math.min(1, today.sleepHours / today.sleepGoalHours) * 25;
  const hydrationScore = Math.min(1, today.hydrationGlasses / today.hydrationGoal) * 20;
  const activeHabits = habits.filter((h) => !h.paused);
  const habitDone = activeHabits.filter((h) => h.history[h.history.length - 1]).length;
  const habitScore = (activeHabits.length ? habitDone / activeHabits.length : 0) * 20;
  const stressPenalty = Math.max(0, (today.stressLevel - 50) / 100) * 10;
  const total = stepScore + sleepScore + hydrationScore + habitScore - stressPenalty;
  return Math.max(0, Math.min(100, Math.round(total + 30))); // baseline 30 so empty days aren't 0
}

function computeWeeklyMomentum(habits: Habit[]): number {
  const active = habits.filter((h) => !h.paused);
  if (!active.length) return 0;
  const total = active.reduce((s, h) => s + h.targetPerWeek, 0);
  const done = active.reduce((s, h) => s + h.completedThisWeek, 0);
  return total ? done / total : 0;
}

function formatSteps(n: number): string {
  return n.toLocaleString("en-US");
}

function buildCoachInsight(habits: Habit[], today: { sleepHours: number; steps: number } | undefined) {
  const walkHabit = habits.find((h) => h.id === "walk-20");
  if (walkHabit && walkHabit.currentStreak >= 4) {
    return `You've completed your evening walk ${walkHabit.currentStreak} days in a row. Let's use that momentum to add one short morning movement session this week.`;
  }
  if (today && today.sleepHours < 6) {
    return `Your sleep was short last night (${Math.floor(today.sleepHours)}h ${Math.round((today.sleepHours % 1) * 60)}m). Today's plan keeps movement gentle — a 15-minute walk counts.`;
  }
  const bestHabit = [...habits].sort((a, b) => b.currentStreak - a.currentStreak)[0];
  if (bestHabit) {
    return `Your strongest habit right now is "${bestHabit.title}" with a ${bestHabit.currentStreak}-day streak. That's the anchor to build from.`;
  }
  return "Pick one small habit to start today. Even 5 minutes counts as showing up.";
}
