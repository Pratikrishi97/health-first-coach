"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2,
  Volume1,
  VolumeX,
  Eye,
  Heart,
  Bell,
  ChevronRight,
  Info,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { COACH_MODES } from "@/lib/adaptation-engine";
import type { CoachMode } from "@/lib/types";
import { MOTION } from "@/lib/motion";

const MODE_ICONS: Record<CoachMode, typeof Volume2> = {
  active: Volume2,
  quiet: Volume1,
  focus: Eye,
  recovery: Heart,
  off: VolumeX,
};

export function CoachModeSwitcher({ compact }: { compact?: boolean }) {
  const coachMode = useAppStore((s) => s.coachMode);
  const setCoachMode = useAppStore((s) => s.setCoachMode);
  const setView = useAppStore((s) => s.setView);

  if (compact) {
    const Icon = MODE_ICONS[coachMode];
    return (
      <button
        onClick={() => setView("nudges")}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <Icon className="h-3 w-3" />
        <span className="capitalize">{coachMode}</span>
      </button>
    );
  }

  return (
    <Card className="p-4 card-premium">
      <div className="flex items-center gap-2 mb-3">
        <Bell className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Coach mode</h3>
        <Badge variant="outline" className="text-[10px] capitalize ml-auto">
          {coachMode}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground mb-3 text-pretty">
        You control when the coach speaks. The coach knows when not to talk.
      </p>
      <div className="grid grid-cols-5 gap-1.5">
        {COACH_MODES.map((mode) => {
          const Icon = MODE_ICONS[mode.mode];
          const active = coachMode === mode.mode;
          return (
            <button
              key={mode.mode}
              onClick={() => setCoachMode(mode.mode)}
              className={cn(
                "flex flex-col items-center gap-1 py-2 rounded-lg border transition-all relative",
                active
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40"
              )}
              title={mode.description}
            >
              <Icon className="h-4 w-4" />
              <span className="text-[10px] font-medium capitalize">{mode.label}</span>
              {active && (
                <motion.div
                  layoutId="coach-mode-active"
                  className="absolute -bottom-0.5 left-2 right-2 h-0.5 bg-primary rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-muted-foreground mt-2.5 text-pretty">
        {COACH_MODES.find((m) => m.mode === coachMode)?.description}
      </p>
    </Card>
  );
}
