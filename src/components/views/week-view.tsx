"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Footprints,
  Moon,
  Brain,
  Coffee,
  Sunset,
  Trees,
  Sparkles,
  CheckCircle2,
  SkipForward,
  ArrowRight,
  ArrowLeftRight,
  type LucideIcon,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FadeIn, StaggerGroup, StaggerItem, Tactile, MOTION } from "@/lib/motion";
import { PlanStatusBadge, PlanHealthCard, PlanningInsights } from "./plan-view";
import { cn } from "@/lib/utils";
import type { WeeklyDayPlan } from "@/lib/types";
import { toast } from "sonner";

const CATEGORY_ICONS: Record<WeeklyDayPlan["category"], LucideIcon> = {
  movement: Footprints,
  recovery: Moon,
  flexible: Coffee,
  rest: Moon,
  outdoor: Trees,
};

export function WeekView() {
  const planHierarchy = useAppStore((s) => s.planHierarchy);
  const completeWeeklyAction = useAppStore((s) => s.completeWeeklyAction);
  const skipWeeklyAction = useAppStore((s) => s.skipWeeklyAction);
  const rescheduleWeeklyAction = useAppStore((s) => s.rescheduleWeeklyAction);
  const setPlanHorizon = useAppStore((s) => s.setPlanHorizon);

  const [rescheduleFrom, setRescheduleFrom] = useState<string | null>(null);

  if (!planHierarchy) return null;

  const { currentWeek, quarter, currentMonth } = planHierarchy;
  const completedSessions = currentWeek.completedSessions;
  const targetSessions = currentWeek.targetSessions;
  const weekProgress = Math.round((completedSessions / targetSessions) * 100);

  const handleReschedule = (toDayId: string) => {
    if (!rescheduleFrom) return;
    rescheduleWeeklyAction(rescheduleFrom, toDayId);
    toast.success("Session moved — weekly target preserved.");
    setRescheduleFrom(null);
  };

  return (
    <div>
      {/* Week header */}
      <FadeIn>
        <Card className="p-6 mb-6 card-premium bg-gradient-to-br from-primary/10 to-background border-beam">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="text-xs uppercase tracking-wide font-semibold text-primary mb-1">
                {currentWeek.weekLabel}
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-balance text-pretty">
                {currentWeek.objective}
              </h2>
            </div>
            <PlanStatusBadge status={currentWeek.status} />
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs">
            <span className="text-muted-foreground">
              {completedSessions} of {targetSessions} sessions complete
            </span>
            {currentWeek.adaptedSessions > 0 && (
              <span className="text-amber-600">
                {currentWeek.adaptedSessions} adapted
              </span>
            )}
            {currentWeek.recoverySessions > 0 && (
              <span className="text-primary">
                {currentWeek.recoverySessions} recovery
              </span>
            )}
          </div>
          <Progress value={weekProgress} className="h-2 mt-3" />
        </Card>
      </FadeIn>

      {/* Plan health */}
      <FadeIn delay={0.05}>
        <PlanHealthCard
          status={currentWeek.status}
          summary={
            currentWeek.status === "at_risk"
              ? "Two sessions missed. Recovery Mode can preserve your monthly target."
              : currentWeek.status === "adapted"
              ? "Plan adapted to fit your real day. Still on track for the week."
              : "Week is progressing as planned."
          }
        />
      </FadeIn>

      {/* Day-by-day schedule */}
      <FadeIn delay={0.1}>
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                This week&apos;s schedule
              </h3>
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(currentWeek.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} — {new Date(currentWeek.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>
          <StaggerGroup className="space-y-2" stagger={MOTION.stagger.fast}>
            {currentWeek.days.map((day) => (
              <StaggerItem key={day.id}>
                <DayCard
                  day={day}
                  onComplete={() => completeWeeklyAction(day.id)}
                  onSkip={() => skipWeeklyAction(day.id)}
                  onReschedule={() => setRescheduleFrom(day.id)}
                />
              </StaggerItem>
            ))}
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
          <PlanningInsights scope="week" />
        </section>
      </FadeIn>

      {/* Navigation */}
      <FadeIn delay={0.2}>
        <div className="grid grid-cols-2 gap-2">
          <Card className="p-4 card-premium bg-muted/40">
            <button
              onClick={() => setPlanHorizon("month")}
              className="w-full flex items-center justify-between"
            >
              <div className="text-left">
                <div className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">
                  View month
                </div>
                <div className="text-sm font-medium">Month {currentMonth.monthNumber}</div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </Card>
          <Card className="p-4 card-premium bg-muted/40">
            <button
              onClick={() => setPlanHorizon("today")}
              className="w-full flex items-center justify-between"
            >
              <div className="text-left">
                <div className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">
                  View today
                </div>
                <div className="text-sm font-medium">Today&apos;s actions</div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </Card>
        </div>
      </FadeIn>

      {/* Reschedule dialog */}
      <RescheduleDialog
        open={!!rescheduleFrom}
        onOpenChange={(o) => !o && setRescheduleFrom(null)}
        fromDay={currentWeek.days.find((d) => d.id === rescheduleFrom)}
        toDays={currentWeek.days.filter((d) => d.id !== rescheduleFrom)}
        onSelect={handleReschedule}
      />
    </div>
  );
}

// ============================================================
// Day card
// ============================================================

function DayCard({
  day,
  onComplete,
  onSkip,
  onReschedule,
}: {
  day: WeeklyDayPlan;
  onComplete: () => void;
  onSkip: () => void;
  onReschedule: () => void;
}) {
  const Icon = CATEGORY_ICONS[day.category] ?? Footprints;
  const isToday = new Date(day.date).toDateString() === new Date().toDateString();

  return (
    <motion.div layout>
      <Card className={cn(
        "p-4 card-premium overflow-hidden",
        day.completed && "opacity-70",
        day.skipped && "opacity-50",
        day.adapted && "border-primary/30",
        isToday && "ring-2 ring-primary/20"
      )}>
        <div className="flex items-center gap-3">
          {/* Day name + date */}
          <div className="text-center shrink-0 w-14">
            <div className="text-xs font-semibold uppercase tracking-wide">{day.day.slice(0, 3)}</div>
            <div className="text-lg font-semibold tabular-nums">
              {new Date(day.date).getDate()}
            </div>
            {isToday && (
              <div className="text-[9px] text-primary font-semibold uppercase">Today</div>
            )}
          </div>

          {/* Toggle */}
          <Tactile>
            <button
              onClick={onComplete}
              aria-label={day.completed ? "Mark as not done" : "Mark as done"}
              className={cn(
                "h-11 w-11 rounded-xl flex items-center justify-center shrink-0 transition-all",
                day.completed
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <motion.div
                animate={day.completed ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                transition={{ duration: 0.4, ease: MOTION.easing.spring }}
              >
                <Icon className="h-5 w-5" />
              </motion.div>
            </button>
          </Tactile>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={cn(
                "font-semibold text-sm",
                day.completed && "line-through text-muted-foreground"
              )}>
                {day.title}
              </h3>
              {day.adapted && (
                <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
                  Adapted
                </Badge>
              )}
              {day.skipped && (
                <Badge variant="outline" className="text-[10px]">
                  Skipped
                </Badge>
              )}
              {day.movedTo && (
                <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-700 border-amber-500/30">
                  → {new Date(day.movedTo).toLocaleDateString("en-US", { weekday: "short" })}
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">{day.durationMin} minutes</div>
            {day.adapted && day.adaptationReason && (
              <div className="mt-1 text-[11px] text-primary/80 bg-primary/5 px-2 py-0.5 rounded inline-block">
                {day.adaptationReason}
              </div>
            )}
            {day.movedFrom && (
              <div className="mt-1 text-[11px] text-amber-700 dark:text-amber-400">
                ← Moved from {new Date(day.movedFrom).toLocaleDateString("en-US", { weekday: "long" })}
              </div>
            )}

            {/* Actions */}
            <div className="mt-2 flex items-center gap-1">
              {!day.completed && !day.skipped && (
                <>
                  <Button size="sm" variant="ghost" onClick={onSkip} className="text-xs h-7 px-2">
                    <SkipForward className="h-3 w-3 mr-1" />
                    Skip
                  </Button>
                  <Button size="sm" variant="ghost" onClick={onReschedule} className="text-xs h-7 px-2">
                    <ArrowLeftRight className="h-3 w-3 mr-1" />
                    Move
                  </Button>
                </>
              )}
              {day.originalTitle && (
                <span className="text-[10px] text-muted-foreground">
                  Was: {day.originalTitle}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// ============================================================
// Reschedule dialog
// ============================================================

function RescheduleDialog({
  open,
  onOpenChange,
  fromDay,
  toDays,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  fromDay?: WeeklyDayPlan;
  toDays: WeeklyDayPlan[];
  onSelect: (toDayId: string) => void;
}) {
  if (!fromDay) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Move session</DialogTitle>
          <DialogDescription>
            Move <strong>{fromDay.title}</strong> ({fromDay.day}) to another day. Your weekly target stays the same.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {toDays.map((day) => (
            <button
              key={day.id}
              onClick={() => onSelect(day.id)}
              className="w-full p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-left flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-medium">{day.day}</div>
                <div className="text-xs text-muted-foreground">
                  {day.title} · {day.durationMin} min
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
