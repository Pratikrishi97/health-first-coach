"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { PLAN_STATUS_LABELS } from "@/lib/planning-engine";
import type { PlanHorizon, PlanStatus } from "@/lib/types";
import { MOTION } from "@/lib/motion";
import { ChevronRight, Home, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { QuarterView } from "./quarter-view";
import { MonthView } from "./month-view";
import { WeekView } from "./week-view";
import { TodayPlanView } from "./today-plan-view";

const HORIZONS: { id: PlanHorizon; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "quarter", label: "Quarter" },
];

export function PlanView() {
  const planHorizon = useAppStore((s) => s.planHorizon);
  const setPlanHorizon = useAppStore((s) => s.setPlanHorizon);
  const setView = useAppStore((s) => s.setView);
  const planHierarchy = useAppStore((s) => s.planHierarchy);

  if (!planHierarchy) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 text-center">
        <p className="text-muted-foreground">No plan hierarchy available.</p>
        <Button onClick={() => setView("home")} className="mt-4">Back to Home</Button>
      </div>
    );
  }

  const { quarter, currentMonth, currentWeek } = planHierarchy;

  // Breadcrumb: Q3 → September → Week 2 → Today
  const breadcrumb = [
    { label: quarter.quarterLabel, horizon: "quarter" as PlanHorizon },
    { label: `Month ${currentMonth.monthNumber}`, horizon: "month" as PlanHorizon },
    { label: currentWeek.weekLabel, horizon: "week" as PlanHorizon },
    { label: "Today", horizon: "today" as PlanHorizon },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-8">
      {/* Header */}
      <header className="mb-4">
        <Button variant="ghost" size="sm" onClick={() => setView("home")} className="-ml-2 mb-2">
          <ChevronRight className="h-4 w-4 rotate-180" />
          Home
        </Button>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-balance">
          My Plan
        </h1>
        <p className="mt-1 text-muted-foreground text-pretty">
          Long-term goals provide direction. Daily plans adapt to reality.
        </p>
      </header>

      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: MOTION.duration.standard, ease: MOTION.easing.out }}
        className="flex items-center gap-1.5 mb-4 text-xs overflow-x-auto no-scrollbar"
      >
        {breadcrumb.map((crumb, i) => {
          const isActive = planHorizon === crumb.horizon;
          const isLast = i === breadcrumb.length - 1;
          return (
            <div key={crumb.horizon} className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setPlanHorizon(crumb.horizon)}
                className={cn(
                  "px-2 py-1 rounded-md font-medium transition-colors whitespace-nowrap",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {crumb.label}
              </button>
              {!isLast && (
                <ChevronRight className="h-3 w-3 text-muted-foreground/60 shrink-0" />
              )}
            </div>
          );
        })}
      </motion.div>

      {/* Horizon tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-full bg-muted/60 sticky top-0 z-10">
        {HORIZONS.map((h) => {
          const active = planHorizon === h.id;
          return (
            <button
              key={h.id}
              onClick={() => setPlanHorizon(h.id)}
              className={cn(
                "flex-1 py-2 px-3 rounded-full text-sm font-medium transition-all relative",
                active
                  ? "bg-card text-primary shadow-premium-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {h.label}
              {active && (
                <motion.div
                  layoutId="plan-horizon-active"
                  className="absolute inset-0 rounded-full bg-primary/8 -z-10"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={planHorizon}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: MOTION.duration.standard, ease: MOTION.easing.out }}
        >
          {planHorizon === "today" && <TodayPlanView embedded />}
          {planHorizon === "week" && <WeekView />}
          {planHorizon === "month" && <MonthView />}
          {planHorizon === "quarter" && <QuarterView />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// Plan status badge — shared component
// ============================================================

export function PlanStatusBadge({ status, className }: { status: PlanStatus; className?: string }) {
  const info = PLAN_STATUS_LABELS[status];
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] capitalize",
        info.color === "primary" && "bg-primary/10 text-primary border-primary/30",
        info.color === "amber" && "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
        className
      )}
    >
      {info.label}
    </Badge>
  );
}

// ============================================================
// Plan health card — shared component
// ============================================================

export function PlanHealthCard({ status, summary }: { status: PlanStatus; summary: string }) {
  const info = PLAN_STATUS_LABELS[status];
  return (
    <Card className={cn(
      "p-4 card-premium mb-4",
      info.color === "primary" && "bg-gradient-to-br from-primary/8 to-background",
      info.color === "amber" && "bg-gradient-to-br from-amber-500/8 to-background"
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          "h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
          info.color === "primary" ? "bg-primary/10 text-primary" : "bg-amber-500/10 text-amber-600"
        )}>
          <div className="h-2.5 w-2.5 rounded-full bg-current" />
        </div>
        <div>
          <div className="text-sm font-semibold">{info.label}</div>
          <p className="text-xs text-muted-foreground mt-0.5 text-pretty">{summary}</p>
        </div>
      </div>
    </Card>
  );
}

// ============================================================
// Planning insights — shared component
// ============================================================

export function PlanningInsights({ scope }: { scope: "quarter" | "month" | "week" | "today" }) {
  const insights = useAppStore((s) => s.planningInsights);
  const filtered = insights.filter((i) => i.scope === scope);

  if (filtered.length === 0) {
    return (
      <Card className="p-4 card-premium text-center">
        <p className="text-sm text-muted-foreground">No insights yet for this horizon.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {filtered.map((insight) => (
        <motion.div
          key={insight.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: MOTION.duration.standard }}
        >
          <Card className={cn(
            "p-4 card-premium",
            insight.category === "recommendation" ? "bg-gradient-to-br from-primary/8 to-background border-primary/20" : ""
          )}>
            <div className="flex items-start gap-3">
              <div className={cn(
                "h-7 w-7 rounded-lg flex items-center justify-center shrink-0",
                insight.category === "recommendation" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              )}>
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {insight.category}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {insight.confidence} confidence
                  </Badge>
                </div>
                <div className="font-medium text-sm">{insight.title}</div>
                <p className="text-sm text-muted-foreground mt-1 text-pretty">{insight.body}</p>
                {insight.action && (
                  <Button size="sm" variant="outline" className="mt-2 text-xs">
                    {insight.action}
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
