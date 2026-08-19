"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Footprints,
  Moon,
  Droplets,
  Brain,
  ArrowRight,
  TrendingUp,
  ChevronRight,
  Play,
  Pause,
  CheckCircle2,
  X,
  Info,
  Heart,
  Calendar,
  Sun,
  Coffee,
  Sunset,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { getNextBestAction } from "@/lib/coach-engine";
import {
  generateRecommendation,
  assessLifeContext,
  assessHealthSignals,
  assessBehaviorHistory,
  getFrictionQuestion,
} from "@/lib/adaptation-engine";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { WhySheet, TrustPanel } from "@/components/why-sheet";
import { CoachModeSwitcher } from "@/components/coach-mode-switcher";
import { cn } from "@/lib/utils";
import type { Habit, LifeContextType } from "@/lib/types";
import {
  StaggerGroup,
  StaggerItem,
  FadeIn,
  ProgressRing,
  AnimatedNumber,
  ConfettiBurst,
  Tactile,
  MOTION,
} from "@/lib/motion";
import { toast } from "sonner";

export function HomeView() {
  const profile = useAppStore((s) => s.profile);
  const metrics = useAppStore((s) => s.metrics);
  const habits = useAppStore((s) => s.habits);
  const timeline = useAppStore((s) => s.timeline);
  const weeklyReview = useAppStore((s) => s.weeklyReview);
  const lifeContexts = useAppStore((s) => s.lifeContexts);
  const todayPlan = useAppStore((s) => s.todayPlan);
  const recovery = useAppStore((s) => s.recovery);
  const coachMode = useAppStore((s) => s.coachMode);
  const pendingAdaptation = useAppStore((s) => s.pendingAdaptation);
  const proactiveMessages = useAppStore((s) => s.proactiveMessages);
  const toggleHabitToday = useAppStore((s) => s.toggleHabitToday);
  const setView = useAppStore((s) => s.setView);
  const addLifeContext = useAppStore((s) => s.addLifeContext);
  const acceptPlanAdaptation = useAppStore((s) => s.acceptPlanAdaptation);
  const rejectPlanAdaptation = useAppStore((s) => s.rejectPlanAdaptation);
  const dismissProactiveMessage = useAppStore((s) => s.dismissProactiveMessage);
  const track = useAppStore((s) => s.track);

  const [balanceOpen, setBalanceOpen] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);
  const [celebrateHabit, setCelebrateHabit] = useState<string | null>(null);

  if (!profile) return null;

  const today = metrics[metrics.length - 1];
  const greeting = getGreeting();
  const firstName = profile.name.split(" ")[0];

  // Use the new adaptation engine for the recommendation
  const recommendation = generateRecommendation(useAppStore.getState());
  const life = assessLifeContext(useAppStore.getState());
  const health = assessHealthSignals(useAppStore.getState());
  const behavior = assessBehaviorHistory(useAppStore.getState());
  const frictionQuestion = getFrictionQuestion(useAppStore.getState());

  const nextAction = getNextBestAction(useAppStore.getState());

  const dailyBalance = computeDailyBalance(today, habits);
  const balanceBreakdown = computeBalanceBreakdown(today, habits);
  const momentum = computeWeeklyMomentum(habits);
  const streak = Math.max(0, ...habits.map((h) => h.currentStreak));

  // Filter proactive messages based on coach mode
  const visibleMessages = proactiveMessages.filter(
    (m) => !m.dismissed && m.shouldSpeak && (coachMode === "active" || m.priority === "high")
  );

  const handleToggleHabit = (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId);
    const wasCompleted = habit?.history[habit.history.length - 1];
    toggleHabitToday(habitId);
    if (!wasCompleted) {
      setCelebrateHabit(habitId);
      setTimeout(() => setCelebrateHabit(null), 1200);
    }
  };

  const handleAddContext = (type: LifeContextType, label: string) => {
    addLifeContext(type, label);
    toast.success(`Plan adapted for: ${label}`);
  };

  const completedPlanItems = todayPlan.filter((p) => p.completed).length;
  const totalPlanItems = todayPlan.length;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-8">
      {/* Greeting */}
      <FadeIn>
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <span>{greeting}</span>
            <span>·</span>
            <span>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span>
            <span>·</span>
            <span className="capitalize text-primary font-medium">{life.contextSummary}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-balance">
            {greeting}, {firstName}.
          </h1>
          <p className="mt-1 text-muted-foreground text-pretty">
            {recovery?.active
              ? "You're in Recovery Mode. Today is about showing up gently, not catching up."
              : today && today.sleepHours < 6
              ? "Your sleep was shorter than usual. Today's plan is gentler — small actions still count."
              : today && today.stressLevel >= 65
              ? "Your stress looks elevated. A 5-minute reset can shift the rest of your day."
              : momentum >= 0.7
              ? "You're on a strong streak. Let's keep it going with one focused action."
              : "You've got a busy day ahead. Let's keep today's plan simple."}
          </p>
        </div>
      </FadeIn>

      {/* Recovery banner */}
      <AnimatePresence>
        {recovery?.active && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: MOTION.duration.standard, ease: MOTION.easing.out }}
          >
            <Card className="p-4 mb-4 card-premium bg-gradient-to-br from-amber-500/10 to-background border-amber-500/30">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <Heart className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="text-xs uppercase tracking-wide font-semibold text-amber-700 dark:text-amber-400 mb-0.5">
                    Recovery Mode · {recovery.triggerLabel}
                  </div>
                  <div className="text-sm font-medium">Today got disrupted. Let&apos;s adjust.</div>
                  <p className="text-xs text-muted-foreground mt-1 text-pretty">
                    Your progress is not reset. Recovery consistency: {Math.round(recovery.recoveryConsistency * 100)}%
                  </p>
                  <Button size="sm" variant="outline" className="mt-2" onClick={() => setView("recovery")}>
                    View recovery plan
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plan adaptation banner */}
      <AnimatePresence>
        {pendingAdaptation && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: MOTION.duration.standard, ease: MOTION.easing.out }}
          >
            <Card className="p-4 mb-4 card-premium bg-gradient-to-br from-primary/10 to-background border-primary/30 border-beam">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shrink-0">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs uppercase tracking-wide font-semibold text-primary mb-0.5">
                    Plan adapted · {pendingAdaptation.triggerLabel}
                  </div>
                  <ul className="space-y-1 mt-2">
                    {pendingAdaptation.changes.slice(0, 2).map((change, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="text-sm flex items-start gap-2"
                      >
                        <span className="text-primary mt-0.5">→</span>
                        <span className="text-pretty">
                          <strong>{change.what}</strong>
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" onClick={acceptPlanAdaptation} className="shadow-premium-sm">
                      Accept
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={rejectPlanAdaptation}>
                      Use normal plan
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setView("today_plan")}>
                      View plan
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Friction Autopilot — smart question instead of asking user to log */}
      <AnimatePresence>
        {frictionQuestion && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: MOTION.duration.standard, ease: MOTION.easing.out }}
          >
            <Card className="p-4 mb-4 card-premium bg-muted/40">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Info className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{frictionQuestion.question}</div>
                  <p className="text-xs text-muted-foreground mt-0.5 text-pretty">{frictionQuestion.reason}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {frictionQuestion.options.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          if (opt.value === "busy") {
                            handleAddContext("busy", "Busy day");
                          } else if (opt.value === "skip") {
                            toast.success("Okay — I'll keep today light.");
                          }
                          track("friction_autopilot_event", { question: frictionQuestion.id, answer: opt.value });
                        }}
                        className="text-xs px-2.5 py-1 rounded-full bg-background border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daily Balance + Next best action */}
      <StaggerGroup className="grid sm:grid-cols-5 gap-4 mb-6" stagger={MOTION.stagger.standard}>
        <StaggerItem className="sm:col-span-2">
          <Card className="p-5 h-full card-premium flex flex-col justify-between cursor-pointer">
            <button onClick={() => setBalanceOpen(true)} className="text-left">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                  Daily Balance
                </div>
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="flex items-end gap-2">
                <div className="text-5xl font-semibold tracking-tight tabular-nums">
                  <AnimatedNumber value={dailyBalance} duration={1.2} />
                </div>
                <div className="text-sm text-muted-foreground pb-2">
                  {dailyBalance >= 80 ? "On track" : dailyBalance >= 60 ? "Steady" : "Needs attention"}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                A holistic indicator across movement, sleep, habits, and recovery.
                <span className="text-muted-foreground/70"> Not a medical score.</span>
              </p>
            </button>
            <button
              onClick={() => setBalanceOpen(true)}
              className="text-xs text-primary font-medium mt-4 flex items-center gap-1 hover:underline"
            >
              Why this score?
              <ChevronRight className="h-3 w-3" />
            </button>
          </Card>
        </StaggerItem>

        <StaggerItem className="sm:col-span-3">
          <Card className="p-5 h-full card-premium bg-gradient-to-br from-primary/8 to-background border-beam relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs uppercase tracking-wide font-medium text-muted-foreground">
                What matters today
              </span>
            </div>
            <p className="text-base font-medium leading-snug text-pretty">
              {recommendation.title}
            </p>
            <p className="text-sm text-muted-foreground mt-1 text-pretty">
              {recommendation.body}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <Tactile>
                <Button size="sm" onClick={() => setWhyOpen(true)} className="shadow-premium-sm">
                  Why this?
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Tactile>
              <button
                onClick={() => setView("today_plan")}
                className="text-xs text-muted-foreground hover:text-foreground px-2"
              >
                View today&apos;s plan
              </button>
            </div>
            <div className="mt-3">
              <TrustPanel recommendation={recommendation} compact />
            </div>
          </Card>
        </StaggerItem>
      </StaggerGroup>

      {/* Quick context chips — Friction Autopilot */}
      <FadeIn delay={0.1}>
        <Card className="p-4 mb-6 card-premium">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">
                What does today look like?
              </span>
            </div>
            <button
              onClick={() => setView("life_context")}
              className="text-xs text-primary font-medium hover:underline"
            >
              More →
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { type: "busy" as LifeContextType, label: "Busy day" },
              { type: "travel" as LifeContextType, label: "Travelling" },
              { type: "low_energy" as LifeContextType, label: "Low energy" },
              { type: "high_stress" as LifeContextType, label: "High stress" },
              { type: "more_time" as LifeContextType, label: "More free time" },
              { type: "social" as LifeContextType, label: "Social event" },
            ].map((chip) => {
              const active = lifeContexts.some((c) => c.type === chip.type);
              return (
                <button
                  key={chip.type}
                  onClick={() => handleAddContext(chip.type, chip.label)}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-full border font-medium transition-all",
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:border-primary/40 hover:bg-primary/5"
                  )}
                >
                  {active && "✓ "}
                  {chip.label}
                </button>
              );
            })}
          </div>
          {lifeContexts.length > 0 && (
            <div className="mt-2 text-[11px] text-muted-foreground">
              Active: {lifeContexts.map((c) => c.label).join(", ")}
            </div>
          )}
        </Card>
      </FadeIn>

      {/* Today's plan preview */}
      <FadeIn delay={0.15}>
        <Card className="p-5 mb-6 card-premium">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">
                Today&apos;s plan
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {completedPlanItems}/{totalPlanItems} complete
            </div>
          </div>
          <div className="space-y-2">
            {todayPlan.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center gap-3 text-sm">
                <div className="text-[11px] text-muted-foreground tabular-nums w-12 shrink-0">
                  {formatTime(item.time)}
                </div>
                <div className={cn(
                  "h-2 w-2 rounded-full shrink-0",
                  item.completed ? "bg-primary" : item.skipped ? "bg-muted-foreground/30" : "bg-muted-foreground/40"
                )} />
                <div className={cn("flex-1 truncate", item.completed && "text-muted-foreground line-through")}>
                  {item.title}
                </div>
                {item.adapted && (
                  <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
                    Adapted
                  </Badge>
                )}
                <span className="text-[11px] text-muted-foreground">{item.durationMin}m</span>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="mt-3 w-full" onClick={() => setView("today_plan")}>
            View full plan
            <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </Card>
      </FadeIn>

      {/* Proactive messages (respecting coach mode) */}
      {visibleMessages.length > 0 && (
        <FadeIn delay={0.2}>
          <section className="mb-6 space-y-2">
            {visibleMessages.slice(0, 2).map((msg) => (
              <Card key={msg.id} className="p-4 card-premium bg-gradient-to-br from-primary/8 to-background">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shrink-0">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs uppercase tracking-wide font-semibold text-primary">
                        {msg.title}
                      </span>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {msg.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-pretty">{msg.body}</p>
                    <div className="text-[11px] text-muted-foreground mt-1 italic">
                      Why: {msg.reason}
                    </div>
                    <div className="mt-2 flex gap-1.5">
                      <Button size="sm" variant="outline" onClick={() => setView("today_plan")}>
                        {msg.action}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => dismissProactiveMessage(msg.id)}>
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </section>
        </FadeIn>
      )}

      {/* Habit cards */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Today&apos;s habits
          </h2>
          <button onClick={() => setView("habits")} className="text-xs text-primary font-medium hover:underline">
            View all
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <HabitMiniCard icon={Footprints} label="Movement" value={today ? `${formatSteps(today.steps)}` : "—"} sub={today ? `of ${formatSteps(today.stepsGoal)}` : ""} progress={today ? (today.steps / today.stepsGoal) * 100 : 0} />
          <HabitMiniCard icon={Moon} label="Sleep" value={today ? `${Math.floor(today.sleepHours)}h ${Math.round((today.sleepHours % 1) * 60)}m` : "—"} sub={today ? `goal ${today.sleepGoalHours}h` : ""} progress={today ? (today.sleepHours / today.sleepGoalHours) * 100 : 0} />
          <HabitMiniCard icon={Droplets} label="Hydration" value={today ? `${today.hydrationGlasses}/${today.hydrationGoal}` : "—"} sub="glasses" progress={today ? (today.hydrationGlasses / today.hydrationGoal) * 100 : 0} />
          <HabitMiniCard icon={Brain} label="Stress reset" value={today ? `${today.stressResetsCompleted}/1` : "—"} sub="completed" progress={today ? today.stressResetsCompleted * 100 : 0} />
        </div>
      </section>

      {/* Active habits checklist */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          Today&apos;s checklist
        </h2>
        <Card className="card-premium divide-y divide-border overflow-hidden">
          {habits.filter((h) => !h.paused).map((h) => (
            <HabitRow
              key={h.id}
              habit={h}
              celebrate={celebrateHabit === h.id}
              onToggle={() => handleToggleHabit(h.id)}
            />
          ))}
        </Card>
      </section>

      {/* Coach insight + Coach mode */}
      <FadeIn delay={0.1}>
        <section className="mb-6">
          <Card className="p-5 card-premium bg-gradient-to-br from-primary/10 to-background border-beam">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shrink-0 shadow-premium-sm">
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
        </section>
      </FadeIn>

      {/* Coach mode switcher */}
      <FadeIn delay={0.15}>
        <section className="mb-6">
          <CoachModeSwitcher />
        </section>
      </FadeIn>

      {/* Weekly momentum + Timeline preview */}
      <section className="grid sm:grid-cols-2 gap-4">
        <Card className="p-5 card-premium">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">
                Weekly momentum
              </div>
              <div className="text-2xl font-semibold mt-1">
                {streak}-day streak
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Completion</div>
              <div className="text-xl font-semibold tabular-nums">
                <AnimatedNumber value={Math.round(momentum * 100)} />%
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

        {/* Timeline preview */}
        <Card className="p-5 card-premium cursor-pointer card-premium-hover" onClick={() => setView("timeline")}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">
              Your health journey
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            {timeline.slice(0, 3).map((event) => (
              <div key={event.id} className="flex items-start gap-2 text-sm">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{event.title}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-primary font-medium">
            See full timeline →
          </div>
        </Card>
      </section>

      {/* Daily Balance breakdown dialog */}
      <DailyBalanceDialog
        open={balanceOpen}
        onOpenChange={setBalanceOpen}
        total={dailyBalance}
        breakdown={balanceBreakdown}
      />

      {/* Why Sheet — the "Why?" Health Interpreter */}
      <WhySheet
        open={whyOpen}
        onOpenChange={setWhyOpen}
        recommendation={recommendation}
        onAccept={() => {
          toast.success("Recommendation accepted.");
          setWhyOpen(false);
          track("recommendation_accepted", { id: recommendation.id });
        }}
        onReject={() => {
          setWhyOpen(false);
          track("recommendation_rejected", { id: recommendation.id });
        }}
        onAlternative={() => {
          toast.success("Okay — let's try the alternative.");
          setWhyOpen(false);
          track("recommendation_accepted", { id: recommendation.id, alternative: true });
        }}
      />

      {/* Activity session modal */}
      <ActivitySession />
    </div>
  );
}

// ============================================================
// Next Best Action card with activity state
// ============================================================

function ActivitySession() {
  const activeActivity = useAppStore((s) => s.activeActivity);
  const tickActivity = useAppStore((s) => s.tickActivity);
  const completeActivity = useAppStore((s) => s.completeActivity);
  const cancelActivity = useAppStore((s) => s.cancelActivity);
  const [autoTick, setAutoTick] = useState(false);

  useEffect(() => {
    if (!activeActivity || activeActivity.completed) return;
    if (!autoTick) return;
    const id = setInterval(() => {
      tickActivity();
    }, 1500);
    return () => clearInterval(id);
  }, [activeActivity, autoTick, tickActivity]);

  if (!activeActivity) return null;

  const pct = Math.round((activeActivity.progressMinutes / activeActivity.durationMinutes) * 100);
  const remainingMin = activeActivity.durationMinutes - activeActivity.progressMinutes;
  const remainingSec = remainingMin * 60;

  return (
    <Dialog open onOpenChange={(o) => !o && cancelActivity()}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className={cn(
          "p-6 text-center relative",
          activeActivity.completed ? "bg-gradient-to-br from-primary/15 to-background" : "bg-gradient-to-br from-primary/5 to-background"
        )}>
          <button onClick={cancelActivity} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground" aria-label="Close">
            <X className="h-4 w-4" />
          </button>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: MOTION.duration.standard, ease: MOTION.easing.spring }}
            className="relative inline-flex mb-4"
          >
            <ProgressRing value={pct} size={120} strokeWidth={8} showLabel={false} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {activeActivity.completed ? (
                <CheckCircle2 className="h-10 w-10 text-primary" />
              ) : (
                <>
                  <div className="text-3xl font-semibold tabular-nums">
                    {activeActivity.progressMinutes}:{String((remainingSec % 60)).padStart(2, "0").slice(0, 2)}
                  </div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {activeActivity.completed ? "Done" : "min elapsed"}
                  </div>
                </>
              )}
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {activeActivity.completed ? (
              <motion.div key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="relative">
                  <ConfettiBurst trigger={true} />
                  <h2 className="text-2xl font-semibold tracking-tight">Nice work.</h2>
                  <p className="mt-1 text-muted-foreground text-pretty">
                    You showed up today. Your streak and progress have been updated.
                  </p>
                </div>
                <Button className="mt-5 shadow-premium-sm" onClick={completeActivity}>
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  Complete & save
                </Button>
              </motion.div>
            ) : (
              <motion.div key="active" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 className="text-xl font-semibold tracking-tight">{activeActivity.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {activeActivity.durationMinutes}-minute session · {pct}% complete
                </p>
                <div className="mt-5 flex items-center justify-center gap-2">
                  {!autoTick ? (
                    <Button onClick={() => setAutoTick(true)} className="shadow-premium-sm">
                      <Play className="h-4 w-4 mr-1.5" />
                      Start session
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={() => setAutoTick(false)}>
                      <Pause className="h-4 w-4 mr-1.5" />
                      Pause
                    </Button>
                  )}
                  <Button variant="ghost" onClick={completeActivity}>
                    Skip to end
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Daily Balance breakdown dialog
// ============================================================

function DailyBalanceDialog({ open, onOpenChange, total, breakdown }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  total: number;
  breakdown: { label: string; value: number; icon: LucideIcon; reason: string }[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Why this score?</DialogTitle>
          <DialogDescription>
            Daily Balance is a wellness signal, not a medical score. It combines movement, sleep, habits, and recovery into one number you can act on.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {breakdown.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.label} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{b.label}</span>
                    <span className="text-sm font-semibold tabular-nums">+{b.value}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{b.reason}</div>
                </div>
              </div>
            );
          })}
          <div className="pt-3 border-t border-border flex items-center justify-between">
            <span className="font-semibold">Total</span>
            <span className="text-2xl font-semibold tabular-nums">
              <AnimatedNumber value={total} />
            </span>
          </div>
          <div className="text-center text-xs text-muted-foreground">
            {total >= 80 ? "Good momentum — keep it going." : total >= 60 ? "Steady day. One small action lifts it." : "A rest day. Tomorrow is a fresh start."}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Sub-components
// ============================================================

function HabitMiniCard({ icon: Icon, label, value, sub, progress }: {
  icon: LucideIcon; label: string; value: string; sub: string; progress: number;
}) {
  return (
    <Card className="p-4 card-premium card-premium-hover">
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

function HabitRow({ habit, onToggle, celebrate }: { habit: Habit; onToggle: () => void; celebrate: boolean }) {
  const completed = habit.history[habit.history.length - 1];
  return (
    <Tactile>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 hover:bg-muted/40 transition-colors text-left"
      >
        <div className="relative">
          <motion.div
            className={cn(
              "h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
              completed ? "bg-primary border-primary text-primary-foreground" : "border-border"
            )}
            animate={completed ? { scale: [1, 1.15, 1] } : { scale: 1 }}
            transition={{ duration: 0.4, ease: MOTION.easing.spring }}
          >
            <AnimatePresence>
              {completed && (
                <motion.svg
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}
                  strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"
                >
                  <motion.path d="M20 6L9 17l-5-5" />
                </motion.svg>
              )}
            </AnimatePresence>
          </motion.div>
          {celebrate && <ConfettiBurst trigger={celebrate} />}
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
    </Tactile>
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

function computeDailyBalance(today: { steps: number; stepsGoal: number; sleepHours: number; sleepGoalHours: number; hydrationGlasses: number; hydrationGoal: number; stressLevel: number } | undefined, habits: Habit[]): number {
  if (!today) return 50;
  const stepScore = Math.min(1, today.steps / today.stepsGoal) * 25;
  const sleepScore = Math.min(1, today.sleepHours / today.sleepGoalHours) * 25;
  const hydrationScore = Math.min(1, today.hydrationGlasses / today.hydrationGoal) * 20;
  const activeHabits = habits.filter((h) => !h.paused);
  const habitDone = activeHabits.filter((h) => h.history[h.history.length - 1]).length;
  const habitScore = (activeHabits.length ? habitDone / activeHabits.length : 0) * 20;
  const stressPenalty = Math.max(0, (today.stressLevel - 50) / 100) * 10;
  const total = stepScore + sleepScore + hydrationScore + habitScore - stressPenalty;
  return Math.max(0, Math.min(100, Math.round(total + 30)));
}

function computeBalanceBreakdown(today: { steps: number; stepsGoal: number; sleepHours: number; sleepGoalHours: number; hydrationGlasses: number; hydrationGoal: number; stressLevel: number; stressResetsCompleted: number } | undefined, habits: Habit[]): { label: string; value: number; icon: LucideIcon; reason: string }[] {
  if (!today) return [];
  const activeHabits = habits.filter((h) => !h.paused);
  const habitDone = activeHabits.filter((h) => h.history[h.history.length - 1]).length;
  return [
    { label: "Movement", value: Math.round(Math.min(25, (today.steps / today.stepsGoal) * 25)), icon: Footprints, reason: `${formatSteps(today.steps)} of ${formatSteps(today.stepsGoal)} steps` },
    { label: "Sleep", value: Math.round(Math.min(25, (today.sleepHours / today.sleepGoalHours) * 25)), icon: Moon, reason: `${Math.floor(today.sleepHours)}h ${Math.round((today.sleepHours % 1) * 60)}m of ${today.sleepGoalHours}h` },
    { label: "Habits", value: Math.round((activeHabits.length ? habitDone / activeHabits.length : 0) * 20), icon: CheckCircle2, reason: `${habitDone} of ${activeHabits.length} completed today` },
    { label: "Recovery", value: Math.round(Math.max(0, 20 - Math.max(0, (today.stressLevel - 50) / 100) * 20 + today.stressResetsCompleted * 5)), icon: Brain, reason: `Stress ${today.stressLevel}/100 · ${today.stressResetsCompleted} reset today` },
  ];
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

function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
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
