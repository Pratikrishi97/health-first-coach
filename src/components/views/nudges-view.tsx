"use client";

import {
  Bell,
  Sparkles,
  Clock,
  ChevronRight,
  Pause,
  Moon,
  Footprints,
  Droplets,
  Brain,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function NudgesView() {
  const nudges = useAppStore((s) => s.nudges);
  const dismissNudge = useAppStore((s) => s.dismissNudge);
  const setView = useAppStore((s) => s.setView);
  const nudgeFrequency = useAppStore((s) => s.nudgeFrequency);
  const setNudgeFrequency = useAppStore((s) => s.setNudgeFrequency);
  const preferredCoachingTime = useAppStore((s) => s.preferredCoachingTime);
  const setPreferredCoachingTime = useAppStore((s) => s.setPreferredCoachingTime);
  const weeklySummary = useAppStore((s) => s.weeklySummaryEnabled);
  const setWeeklySummary = useAppStore((s) => s.setWeeklySummaryEnabled);
  const progressUpdates = useAppStore((s) => s.progressUpdatesEnabled);
  const setProgressUpdates = useAppStore((s) => s.setProgressUpdatesEnabled);

  const activeNudges = nudges.filter((n) => !n.dismissed);
  const dismissed = nudges.filter((n) => n.dismissed);

  const pauseAll = () => {
    activeNudges.forEach((n) => dismissNudge(n.id));
    setNudgeFrequency("minimal");
    toast.success("All nudges paused. We'll only contact you for safety-critical updates.");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-8">
      <header className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => setView("profile")} className="-ml-2 mb-2">
          <ChevronRight className="h-4 w-4 rotate-180" />
          Profile
        </Button>
        <Badge variant="secondary" className="mb-2">
          <Bell className="h-3 w-3 mr-1" />
          Smart nudges
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Right message, right moment, right intensity.
        </h1>
        <p className="mt-2 text-muted-foreground text-pretty">
          Nudges adapt to your sleep, schedule, and what you&apos;ve already done today. No spam — ever.
        </p>
      </header>

      {/* Adaptive defaults */}
      <Section title="Adaptive defaults">
        <Card className="p-5 card-soft divide-y divide-border">
          <Row
            label="Nudge frequency"
            description="Adaptive defaults — never spam."
            control={
              <Select value={nudgeFrequency} onValueChange={(v) => setNudgeFrequency(v as "minimal" | "balanced" | "frequent")}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="frequent">Frequent</SelectItem>
                </SelectContent>
              </Select>
            }
          />
          <Row
            label="Preferred coaching time"
            description="When we send your most important nudges."
            control={
              <Select value={preferredCoachingTime} onValueChange={(v) => setPreferredCoachingTime(v as "morning" | "midday" | "evening")}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="midday">Midday</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                </SelectContent>
              </Select>
            }
          />
          <Row
            label="Weekly summary"
            description="A Sunday recap of your week."
            control={<Switch checked={weeklySummary} onCheckedChange={setWeeklySummary} />}
          />
          <Row
            label="Progress updates"
            description="Notify me when trends change meaningfully."
            control={<Switch checked={progressUpdates} onCheckedChange={setProgressUpdates} />}
          />
        </Card>
      </Section>

      {/* Pause all */}
      <Card className="p-4 mb-6 card-soft">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Pause className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm">Pause all nudges</div>
            <div className="text-xs text-muted-foreground">
              We&apos;ll only contact you for safety-critical updates.
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={pauseAll}>
            Pause all
          </Button>
        </div>
      </Card>

      {/* Active nudges */}
      <Section title={`Active nudges (${activeNudges.length})`}>
        {activeNudges.length === 0 ? (
          <Card className="p-8 text-center">
            <Bell className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <h3 className="font-medium mb-1">No active nudges</h3>
            <p className="text-sm text-muted-foreground">
              You&apos;re all caught up. We&apos;ll surface a nudge when context warrants one.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {activeNudges.map((nudge) => {
              const icon = inferIcon(nudge.id);
              const Icon = icon;
              return (
                <Card key={nudge.id} className="p-4 card-soft card-soft-hover">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px]">
                          <Clock className="h-2.5 w-2.5 mr-1" />
                          {nudge.time}
                        </Badge>
                      </div>
                      <h3 className="font-medium text-sm">{nudge.title}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5 text-pretty">{nudge.body}</p>
                      <div className="mt-2 text-[11px] text-muted-foreground/80 italic border-l-2 border-primary/30 pl-2">
                        Why now? {nudge.context}
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => dismissNudge(nudge.id)}>
                          Dismiss
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setView("coach")}>
                          Ask coach
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Section>

      {/* Dismissed */}
      {dismissed.length > 0 && (
        <Section title={`Dismissed (${dismissed.length})`}>
          <Card className="card-soft divide-y divide-border opacity-60">
            {dismissed.map((n) => (
              <div key={n.id} className="p-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{n.title}</div>
                  <div className="text-xs text-muted-foreground">{n.time}</div>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  Dismissed
                </Badge>
              </div>
            ))}
          </Card>
        </Section>
      )}
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Row({
  label,
  description,
  control,
}: {
  label: string;
  description: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <div>
        <Label className="text-sm font-medium">{label}</Label>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      {control}
    </div>
  );
}

function inferIcon(id: string) {
  if (id.includes("walk")) return Footprints;
  if (id.includes("sleep") || id.includes("lighter")) return Moon;
  if (id.includes("water")) return Droplets;
  if (id.includes("stress") || id.includes("recovery")) return Brain;
  return Sparkles;
}
