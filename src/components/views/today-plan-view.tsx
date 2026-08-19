"use client";

import { useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  Sun,
  Moon,
  Coffee,
  Sunset,
  Footprints,
  Brain,
  Salad,
  Calendar,
  CheckCircle2,
  SkipForward,
  Pencil,
  ArrowRight,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { PlanItem } from "@/lib/types";
import { FadeIn, StaggerGroup, StaggerItem, Tactile, MOTION } from "@/lib/motion";

const PERIOD_ICONS: Record<PlanItem["period"], LucideIcon> = {
  morning: Sun,
  lunch: Coffee,
  afternoon: Sunset,
  evening: Moon,
};

const CATEGORY_ICONS: Record<PlanItem["category"], LucideIcon> = {
  movement: Footprints,
  sleep: Moon,
  nutrition: Salad,
  stress: Brain,
  routines: Calendar,
};

export function TodayPlanView({ embedded }: { embedded?: boolean }) {
  const todayPlan = useAppStore((s) => s.todayPlan);
  const calendarEvents = useAppStore((s) => s.calendarEvents);
  const pendingAdaptation = useAppStore((s) => s.pendingAdaptation);
  const lifeContexts = useAppStore((s) => s.lifeContexts);
  const togglePlanItem = useAppStore((s) => s.togglePlanItem);
  const skipPlanItem = useAppStore((s) => s.skipPlanItem);
  const acceptPlanAdaptation = useAppStore((s) => s.acceptPlanAdaptation);
  const rejectPlanAdaptation = useAppStore((s) => s.rejectPlanAdaptation);
  const setView = useAppStore((s) => s.setView);

  const periods: PlanItem["period"][] = ["morning", "lunch", "afternoon", "evening"];
  const completedCount = todayPlan.filter((p) => p.completed).length;
  const totalCount = todayPlan.length;

  return (
    <div className={embedded ? "" : "mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-8"}>
      {!embedded && (
      <header className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => setView("home")} className="-ml-2 mb-2">
          <ChevronRight className="h-4 w-4 rotate-180" />
          Home
        </Button>
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">
            Today&apos;s plan · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-balance">
          The healthiest realistic version of today.
        </h1>
        <p className="mt-1 text-muted-foreground text-pretty">
          {completedCount}/{totalCount} complete · adapts to your life, sleep, and stress.
        </p>
      </header>
      )}

      {/* Life context summary */}
      {lifeContexts.length > 0 && (
        <FadeIn>
          <Card className="p-4 mb-4 card-premium bg-muted/40">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">
                Today looks like
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {lifeContexts.map((ctx) => (
                <Badge key={ctx.id} variant="secondary" className="text-xs">
                  {ctx.label}
                </Badge>
              ))}
              <button
                onClick={() => setView("life_context")}
                className="text-xs text-primary font-medium px-2 hover:underline"
              >
                + Add context
              </button>
            </div>
          </Card>
        </FadeIn>
      )}

      {/* Pending adaptation banner */}
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
                    {pendingAdaptation.changes.map((change, i) => (
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
                          <span className="text-muted-foreground"> — {change.why}</span>
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
                    <Button size="sm" variant="ghost" onClick={() => setView("coach")}>
                      Ask coach
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plan items by period */}
      <LayoutGroup>
        <div className="space-y-6">
          {periods.map((period) => {
            const items = todayPlan.filter((p) => p.period === period);
            if (items.length === 0) return null;
            const PeriodIcon = PERIOD_ICONS[period];
            return (
              <section key={period}>
                <div className="flex items-center gap-2 mb-3">
                  <PeriodIcon className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground capitalize">
                    {period}
                  </h2>
                </div>
                <div className="space-y-2">
                  <AnimatePresence>
                    {items.map((item) => (
                      <PlanItemCard
                        key={item.id}
                        item={item}
                        onToggle={() => togglePlanItem(item.id)}
                        onSkip={() => skipPlanItem(item.id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            );
          })}
        </div>
      </LayoutGroup>

      {/* Calendar context */}
      <FadeIn delay={0.2}>
        <section className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Your day · simulated calendar
              </h2>
            </div>
            <Badge variant="outline" className="text-[10px]">
              Demo
            </Badge>
          </div>
          <Card className="p-4 card-premium">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-3 top-2 bottom-2 w-px bg-border" />
              <div className="space-y-2">
                {calendarEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 relative">
                    <div className={cn(
                      "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 mt-0.5",
                      event.category === "free" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    )}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    </div>
                    <div className="flex-1 flex items-center justify-between gap-3 pb-1">
                      <div>
                        <div className="text-sm font-medium">{event.title}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {formatTime(event.time)}{event.endTime ? ` – ${formatTime(event.endTime)}` : ""} · {event.durationMin} min
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {event.category}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Coach recommendation overlay */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: MOTION.duration.standard, ease: MOTION.easing.spring }}
              className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-center gap-2"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
              <div className="text-xs text-pretty">
                <strong className="text-primary">Coach:</strong> Your usual 5:30 PM workout time conflicts with a late meeting. I moved it to 6:30 PM — that&apos;s when you&apos;re most consistent anyway.
              </div>
            </motion.div>
          </Card>
        </section>
      </FadeIn>
    </div>
  );
}

// ============================================================
// Plan item card with layout animation
// ============================================================

function PlanItemCard({
  item,
  onToggle,
  onSkip,
}: {
  item: PlanItem;
  onToggle: () => void;
  onSkip: () => void;
}) {
  const [modifyOpen, setModifyOpen] = useState(false);
  const Icon = CATEGORY_ICONS[item.category];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ duration: MOTION.duration.standard, ease: MOTION.easing.out }}
    >
      <Card className={cn(
        "p-4 card-premium overflow-hidden transition-colors",
        item.completed && "opacity-70",
        item.skipped && "opacity-50",
        item.adapted && "border-primary/30"
      )}>
        <div className="flex items-start gap-3">
          {/* Time */}
          <div className="text-center shrink-0">
            <div className="text-xs font-semibold tabular-nums">{formatTime(item.time)}</div>
            <div className="text-[10px] text-muted-foreground">{item.durationMin} min</div>
          </div>

          {/* Toggle */}
          <Tactile>
            <button
              onClick={onToggle}
              aria-label={item.completed ? "Mark as not done" : "Mark as done"}
              className={cn(
                "h-11 w-11 rounded-xl flex items-center justify-center shrink-0 transition-all",
                item.completed
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <motion.div
                animate={item.completed ? { scale: [1, 1.15, 1] } : { scale: 1 }}
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
                "font-semibold text-base",
                item.completed && "line-through text-muted-foreground"
              )}>
                {item.title}
              </h3>
              {item.adapted && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ ease: MOTION.easing.spring, duration: 0.4 }}
                >
                  <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
                    Adapted
                  </Badge>
                </motion.div>
              )}
              {item.skipped && (
                <Badge variant="outline" className="text-[10px]">
                  Skipped
                </Badge>
              )}
            </div>
            {item.description && (
              <p className="text-sm text-muted-foreground mt-0.5 text-pretty">{item.description}</p>
            )}
            {item.adapted && item.adaptationReason && (
              <div className="mt-2 text-[11px] text-primary/80 bg-primary/5 px-2 py-1 rounded inline-flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                {item.adaptationReason}
              </div>
            )}

            {/* Actions */}
            <div className="mt-3 flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={onSkip} className="text-xs h-7">
                <SkipForward className="h-3 w-3 mr-1" />
                Skip
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setModifyOpen(!modifyOpen)} className="text-xs h-7">
                <Pencil className="h-3 w-3 mr-1" />
                Modify
              </Button>
              {item.adapted && item.originalTitle && (
                <span className="text-[10px] text-muted-foreground">
                  Was: {item.originalTitle}
                </span>
              )}
            </div>

            {/* Modify panel */}
            <AnimatePresence>
              {modifyOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: MOTION.duration.fast }}
                  className="mt-2 pt-2 border-t border-border/60"
                >
                  <div className="text-xs text-muted-foreground mb-2">Adjust duration:</div>
                  <div className="flex gap-1.5">
                    {[5, 10, 15, 20, 30].map((d) => (
                      <button
                        key={d}
                        onClick={() => {
                          useAppStore.getState().modifyPlanItem(item.id, { durationMin: d });
                          setModifyOpen(false);
                        }}
                        className={cn(
                          "px-2.5 py-1 rounded-md text-xs font-medium border transition-colors",
                          item.durationMin === d
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border hover:border-primary/40"
                        )}
                      >
                        {d}m
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}
