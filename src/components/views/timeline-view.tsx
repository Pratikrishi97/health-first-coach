"use client";

import {
  Footprints,
  Moon,
  Brain,
  Salad,
  Trophy,
  Watch,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal, StaggerGroup, StaggerItem, MOTION } from "@/lib/motion";
import type { TimelineEvent } from "@/lib/types";

const EVENT_ICONS: Record<NonNullable<TimelineEvent["icon"]>, LucideIcon> = {
  walk: Footprints,
  sleep: Moon,
  stress: Brain,
  eat: Salad,
  trophy: Trophy,
  device: Watch,
  plan: Calendar,
  check: CheckCircle2,
};

const EVENT_COLORS: Record<string, string> = {
  habit_started: "bg-primary/10 text-primary",
  streak: "bg-primary/10 text-primary",
  milestone: "bg-amber-500/10 text-amber-600",
  improvement: "bg-accent/10 text-accent-foreground",
  device_connected: "bg-muted text-foreground",
  plan_adapted: "bg-primary/10 text-primary",
  goal_completed: "bg-primary text-primary-foreground",
};

export function TimelineView() {
  const timeline = useAppStore((s) => s.timeline);
  const setView = useAppStore((s) => s.setView);

  // Group by week (just by relative date for prototype)
  const sorted = [...timeline].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-8">
      <header className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => setView("home")} className="-ml-2 mb-2">
          <ChevronRight className="h-4 w-4 rotate-180" />
          Home
        </Button>
        <Badge variant="secondary" className="mb-2">
          <Sparkles className="h-3 w-3 mr-1" />
          Your health journey
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-balance">
          A narrative of your progress.
        </h1>
        <p className="mt-2 text-muted-foreground text-pretty">
          Every win — small or large — adds up to a story. Here&apos;s yours so far.
        </p>
      </header>

      {/* Hero stat */}
      <ScrollReveal>
        <Card className="p-5 mb-6 card-premium bg-gradient-to-br from-primary/10 to-background">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-premium-sm">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <div className="text-3xl font-semibold tabular-nums">{timeline.length} milestones</div>
              <p className="text-sm text-muted-foreground">Across your last 21 days with Health-First.</p>
            </div>
          </div>
        </Card>
      </ScrollReveal>

      {/* Timeline */}
      <StaggerGroup className="relative" stagger={MOTION.stagger.fast}>
        {/* Vertical line */}
        <div className="absolute left-5 top-2 bottom-2 w-px bg-border" aria-hidden />

        {sorted.map((event) => {
          const Icon = EVENT_ICONS[event.icon ?? "check"];
          const colorClass = EVENT_COLORS[event.type] ?? "bg-muted text-foreground";
          return (
            <StaggerItem key={event.id} className="relative pl-12 pb-6">
              <motion.div
                className={cnAbsoluteLeft(colorClass)}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: MOTION.duration.standard, ease: MOTION.easing.spring }}
                style={{ left: 0 }}
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </motion.div>

              <Card className="p-4 card-premium card-premium-hover">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-muted-foreground mb-1">
                      {new Date(event.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                    </div>
                    <h3 className="font-semibold text-sm">{event.title}</h3>
                    {event.description && (
                      <p className="text-sm text-muted-foreground mt-1 text-pretty">{event.description}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-[10px] capitalize shrink-0">
                    {event.type.replace(/_/g, " ")}
                  </Badge>
                </div>
              </Card>
            </StaggerItem>
          );
        })}
      </StaggerGroup>

      {/* Footer */}
      <Card className="p-5 card-premium bg-gradient-to-br from-primary/10 to-background text-center">
        <Sparkles className="h-6 w-6 mx-auto text-primary mb-2" />
        <p className="text-sm text-muted-foreground text-pretty">
          Your timeline will grow as you continue. Every completed habit, every adapted plan, every streak — recorded here.
        </p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => setView("home")}>
          Back to today
        </Button>
      </Card>
    </div>
  );
}

// helper to return the absolute-positioned wrapper class
function cnAbsoluteLeft(_colorClass: string) {
  return "absolute";
}
