"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Plane,
  Home as HomeIcon,
  Building2,
  BatteryLow,
  Brain,
  Clock,
  CalendarHeart,
  Moon,
  ChevronRight,
  Sparkles,
  X,
  Send,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn, StaggerGroup, StaggerItem, MOTION } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { LifeContextType } from "@/lib/types";
import { toast } from "sonner";

const CONTEXT_OPTIONS: { type: LifeContextType; label: string; icon: typeof Briefcase; description: string }[] = [
  { type: "busy", label: "Busy day", icon: Briefcase, description: "Back-to-back meetings, tight deadlines" },
  { type: "travel", label: "Travelling", icon: Plane, description: "On the move, away from usual setup" },
  { type: "wfh", label: "Working from home", icon: HomeIcon, description: "Home environment, flexible timing" },
  { type: "office", label: "At the office", icon: Building2, description: "In-office, commute involved" },
  { type: "low_energy", label: "Low energy", icon: BatteryLow, description: "Feeling drained, need to go easy" },
  { type: "high_stress", label: "High stress", icon: Brain, description: "Stress elevated, need resets" },
  { type: "more_time", label: "More free time", icon: Clock, description: "Unusual availability" },
  { type: "social", label: "Social event", icon: CalendarHeart, description: "Dinner, party, gathering" },
  { type: "poor_sleep", label: "Poor sleep", icon: Moon, description: "Didn't sleep well last night" },
];

export function LifeContextView() {
  const lifeContexts = useAppStore((s) => s.lifeContexts);
  const addLifeContext = useAppStore((s) => s.addLifeContext);
  const removeLifeContext = useAppStore((s) => s.removeLifeContext);
  const setView = useAppStore((s) => s.setView);

  const [note, setNote] = useState("");

  const handleAdd = (type: LifeContextType, label: string) => {
    addLifeContext(type, label);
    toast.success(`Added context: ${label}. Plan will adapt.`);
  };

  const handleNaturalLanguage = () => {
    if (!note.trim()) return;
    // Simple keyword detection for natural language
    const lower = note.toLowerCase();
    let detected: { type: LifeContextType; label: string } | null = null;
    if (/travel|flight|trip|away/.test(lower)) {
      detected = { type: "travel", label: "Travelling" };
    } else if (/busy|packed|back.to.back|deadline/.test(lower)) {
      detected = { type: "busy", label: "Busy day" };
    } else if (/tire|exhaust|drain|low energy/.test(lower)) {
      detected = { type: "low_energy", label: "Low energy" };
    } else if (/stress|anxious|overwhelm/.test(lower)) {
      detected = { type: "high_stress", label: "High stress" };
    } else if (/sleep|slept|tired/.test(lower)) {
      detected = { type: "poor_sleep", label: "Poor sleep" };
    } else if (/wedding|party|social|dinner|event/.test(lower)) {
      detected = { type: "social", label: "Social event" };
    } else if (/free|available|open/.test(lower)) {
      detected = { type: "more_time", label: "More free time" };
    }

    if (detected) {
      addLifeContext(detected.type, detected.label, note.trim());
      toast.success(`Got it — "${note.trim()}" — plan adapted for ${detected.label}.`);
      setNote("");
      setView("today_plan");
    } else {
      // Default to busy if we can't parse
      addLifeContext("busy", "Busy day", note.trim());
      toast.success(`Got it — plan adapted.`);
      setNote("");
      setView("today_plan");
    }
  };

  const today = new Date().toISOString().slice(0, 10);
  const todayContexts = lifeContexts.filter((c) => c.date === today);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-8">
      <header className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => setView("home")} className="-ml-2 mb-2">
          <ChevronRight className="h-4 w-4 rotate-180" />
          Home
        </Button>
        <Badge variant="secondary" className="mb-2">
          <Sparkles className="h-3 w-3 mr-1" />
          What does today look like?
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-balance">
          Tell me about your day. I&apos;ll adapt the plan.
        </h1>
        <p className="mt-1 text-muted-foreground text-pretty">
          Takes 3 seconds. Tap a chip or type naturally. The plan regenerates instantly.
        </p>
      </header>

      {/* Active contexts */}
      {todayContexts.length > 0 && (
        <FadeIn>
          <Card className="p-4 mb-4 card-premium bg-muted/40">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">
                Today
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {todayContexts.map((ctx) => (
                <motion.div
                  key={ctx.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ ease: MOTION.easing.spring, duration: 0.4 }}
                >
                  <Badge variant="secondary" className="text-xs pr-1.5">
                    {ctx.label}
                    {ctx.note && <span className="ml-1 text-muted-foreground">· {ctx.note}</span>}
                    <button
                      onClick={() => removeLifeContext(ctx.id)}
                      className="ml-1 hover:text-destructive"
                      aria-label="Remove"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                </motion.div>
              ))}
            </div>
          </Card>
        </FadeIn>
      )}

      {/* Quick chips */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          Quick context
        </h2>
        <StaggerGroup className="grid grid-cols-2 sm:grid-cols-3 gap-2" stagger={MOTION.stagger.fast}>
          {CONTEXT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isActive = todayContexts.some((c) => c.type === opt.type);
            return (
              <StaggerItem key={opt.type}>
                <Card
                  className={cn(
                    "p-3 card-premium cursor-pointer transition-all h-full",
                    isActive
                      ? "border-primary ring-2 ring-primary/30 bg-primary/5"
                      : "hover:border-primary/40 card-premium-hover"
                  )}
                  onClick={() => handleAdd(opt.type, opt.label)}
                >
                  <div className="flex items-start gap-2">
                    <div className={cn(
                      "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                      isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{opt.label}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{opt.description}</div>
                    </div>
                  </div>
                </Card>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </section>

      {/* Natural language */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          Or just tell me
        </h2>
        <Card className="p-4 card-premium">
          <div className="flex items-end gap-2">
            <div className="flex-1 rounded-xl border border-input bg-background focus-within:ring-2 focus-within:ring-ring overflow-hidden">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleNaturalLanguage();
                  }
                }}
                rows={2}
                placeholder="e.g. I'm travelling tomorrow. / I have a wedding this weekend. / Today was exhausting."
                className="w-full px-3 py-2.5 bg-transparent resize-none focus:outline-none text-sm"
              />
            </div>
            <Button
              onClick={handleNaturalLanguage}
              disabled={!note.trim()}
              size="icon"
              className="h-11 w-11 rounded-xl shrink-0 shadow-premium-sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="text-[11px] text-muted-foreground self-center mr-1">Try:</span>
            {["I'm travelling tomorrow", "I have a wedding this weekend", "Today was exhausting", "Big deadline Friday"].map((s) => (
              <button
                key={s}
                onClick={() => setNote(s)}
                className="text-[11px] px-2 py-0.5 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </Card>
      </section>

      {/* Coach note */}
      <FadeIn delay={0.2}>
        <Card className="p-4 card-premium bg-gradient-to-br from-primary/8 to-background">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="text-xs uppercase tracking-wide font-semibold text-primary mb-0.5">
                Coach
              </div>
              <p className="text-sm text-pretty">
                {todayContexts.length === 0
                  ? "Tap a chip or type naturally. I'll regenerate your plan around your real day — not the other way around."
                  : "I've adapted your plan based on what you told me. Tap below to see today's plan."}
              </p>
              {todayContexts.length > 0 && (
                <Button size="sm" variant="outline" className="mt-3" onClick={() => setView("today_plan")}>
                  View today&apos;s plan
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </Card>
      </FadeIn>
    </div>
  );
}
