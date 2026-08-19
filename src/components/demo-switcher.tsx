"use client";

import { useState } from "react";
import { Beaker, ChevronDown, X, Activity, RefreshCw, Trash2 } from "lucide-react";
import { useAppStore } from "@/lib/store";
import type { DemoScenario } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const SCENARIOS: { id: DemoScenario; label: string; description: string }[] = [
  {
    id: "new",
    label: "Scenario 1 — New user",
    description: "Fresh onboarding, empty state.",
  },
  {
    id: "successful",
    label: "Scenario 2 — Normal day",
    description: "High consistency, positive trends. The baseline experience.",
  },
  {
    id: "busy_day",
    label: "Scenario 3 — Busy workday",
    description: "Back-to-back meetings. Plan adapts — workout moved to 6:30 PM.",
  },
  {
    id: "travel_day",
    label: "Scenario 4 — Travel day",
    description: "On the move. Plan switches to portable bodyweight routine.",
  },
  {
    id: "poor_sleep",
    label: "Scenario 5 — Poor sleep",
    description: "Sleep 5h 12m. Plan becomes lighter. Recovery mode activates.",
  },
  {
    id: "struggling",
    label: "Scenario 6 — Repeated missed habits",
    description: "Two disrupted days. Recovery Mode + no-guilt engine.",
  },
  {
    id: "recovery",
    label: "Scenario 7 — Recovery mode",
    description: "Active recovery. Coach in Recovery mode — only recovery suggestions.",
  },
  {
    id: "safety",
    label: "Scenario 8 — Medical boundary",
    description: "Ask the coach: 'Should I change my medication?' See safe escalation.",
  },
];

export function DemoSwitcher() {
  const [open, setOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const loadDemo = useAppStore((s) => s.loadDemo);
  const currentScenario = useAppStore((s) => s.demoScenario);
  const profile = useAppStore((s) => s.profile);
  const setView = useAppStore((s) => s.setView);
  const events = useAppStore((s) => s.analyticsEvents);
  const resetAll = useAppStore((s) => s.resetAll);
  const clearData = useAppStore((s) => s.clearData);

  const handleScenario = (id: DemoScenario) => {
    if (id === "new") {
      resetAll();
    } else if (id === "safety") {
      // Use successful demo as base, then point the reviewer at the coach
      loadDemo("successful");
      setTimeout(() => setView("coach"), 50);
    } else {
      loadDemo(id);
    }
    setOpen(false);
  };

  return (
    <>
      {/* Floating demo control */}
      <div className="fixed z-40 bottom-20 md:bottom-4 right-4 flex flex-col items-end gap-2">
        <button
          onClick={() => setAnalyticsOpen(true)}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border border-border text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Open analytics debug view"
        >
          <Activity className="h-3 w-3" />
          {events.length} events
        </button>

        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all text-xs font-semibold"
          aria-label="Open demo mode"
        >
          <Beaker className="h-3.5 w-3.5" />
          Demo Mode
          {profile && (
            <Badge
              variant="secondary"
              className="bg-primary-foreground/20 text-primary-foreground border-0 px-1.5 py-0"
            >
              {currentScenario}
            </Badge>
          )}
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Demo Mode</DialogTitle>
            <DialogDescription>
              Pick a scenario to experience different product states. The coach, dashboard, and habits will adapt.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => handleScenario(s.id)}
                className={cn(
                  "w-full text-left p-3 rounded-lg border transition-all hover:border-primary/40 hover:bg-muted/50",
                  currentScenario === s.id && s.id !== "new" && "border-primary/60 bg-primary/5"
                )}
              >
                <div className="font-medium text-sm">{s.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.description}</div>
              </button>
            ))}

            <div className="pt-2 border-t mt-3 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  clearData();
                  setOpen(false);
                }}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Clear my data
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  resetAll();
                  setOpen(false);
                }}
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Reset app
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={analyticsOpen} onOpenChange={setAnalyticsOpen}>
        <DialogContent className="max-w-lg max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Analytics debug</DialogTitle>
            <DialogDescription>
              Internal instrumentation events fired by the prototype. In production these would be sent to the analytics pipeline.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[55vh] -mx-2 px-2">
            <ul className="space-y-1 text-xs">
              {[...events].reverse().map((e, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 py-1.5 border-b border-border/60 last:border-0"
                >
                  <span className="text-[10px] font-mono text-muted-foreground mt-0.5 shrink-0">
                    {new Date(e.timestamp).toLocaleTimeString()}
                  </span>
                  <div className="flex-1">
                    <span className="font-mono font-medium">{e.type}</span>
                    {e.properties && Object.keys(e.properties).length > 0 && (
                      <pre className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                        {JSON.stringify(e.properties)}
                      </pre>
                    )}
                  </div>
                </li>
              ))}
              {events.length === 0 && (
                <li className="text-muted-foreground text-center py-8">No events tracked yet.</li>
              )}
            </ul>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
