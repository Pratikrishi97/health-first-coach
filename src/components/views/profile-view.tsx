"use client";

import {
  User,
  ShieldCheck,
  Watch,
  Bell,
  Trash2,
  Download,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Heart,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import type { AppView } from "@/lib/types";

export function ProfileView() {
  const profile = useAppStore((s) => s.profile);
  const setView = useAppStore((s) => s.setView);
  const largeTextMode = useAppStore((s) => s.largeTextMode);
  const setLargeTextMode = useAppStore((s) => s.setLargeTextMode);
  const weeklySummary = useAppStore((s) => s.weeklySummaryEnabled);
  const setWeeklySummary = useAppStore((s) => s.setWeeklySummaryEnabled);
  const progressUpdates = useAppStore((s) => s.progressUpdatesEnabled);
  const setProgressUpdates = useAppStore((s) => s.setProgressUpdatesEnabled);
  const nudgeFrequency = useAppStore((s) => s.nudgeFrequency);
  const setNudgeFrequency = useAppStore((s) => s.setNudgeFrequency);
  const preferredCoachingTime = useAppStore((s) => s.preferredCoachingTime);
  const setPreferredCoachingTime = useAppStore((s) => s.setPreferredCoachingTime);
  const clearData = useAppStore((s) => s.clearData);

  if (!profile) return null;

  const handleDownload = () => {
    const data = {
      profile,
      habits: useAppStore.getState().habits,
      metrics: useAppStore.getState().metrics,
      coachConversation: useAppStore.getState().coachConversation,
      insights: useAppStore.getState().insights,
      nudges: useAppStore.getState().nudges,
      analyticsEvents: useAppStore.getState().analyticsEvents,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `health-first-${profile.name.toLowerCase().replace(/\s+/g, "-")}-data.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Your data has been downloaded.");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-8">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your goals, coaching style, devices, and data.
        </p>
      </header>

      {/* Profile card */}
      <Card className="p-5 mb-6 card-soft">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-primary/15 text-primary flex items-center justify-center font-semibold text-xl">
            {profile.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-lg">{profile.name}</h2>
            <p className="text-sm text-muted-foreground">
              {profile.age} years · {profile.heightCm}cm · {profile.weightKg}kg
            </p>
          </div>
          <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
            Prototype
          </Badge>
        </div>
      </Card>

      {/* Your goals */}
      <Section title="Your goals" icon={Sparkles}>
        <Card className="p-5 card-soft">
          <div className="space-y-3">
            <Row label="Primary goal" value={formatGoal(profile.primaryGoal)} />
            {profile.secondaryGoals.length > 0 && (
              <Row
                label="Secondary goals"
                value={profile.secondaryGoals.map(formatGoal).join(", ")}
              />
            )}
            <Row label="Biggest challenge" value={formatChallenge(profile.challenge)} />
            <Row label="Coaching style" value={capitalize(profile.coachingStyle)} />
          </div>
        </Card>
      </Section>

      {/* Coaching preferences */}
      <Section title="Coaching preferences" icon={User}>
        <Card className="p-5 card-soft divide-y divide-border">
          <div className="flex items-center justify-between pb-4">
            <div>
              <Label className="text-sm font-medium">Preferred coaching time</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                When the coach should send your most important nudges.
              </p>
            </div>
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
          </div>

          <div className="flex items-center justify-between py-4">
            <div>
              <Label className="text-sm font-medium">Nudge frequency</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Adaptive defaults — never spam.</p>
            </div>
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
          </div>

          <div className="flex items-center justify-between py-4">
            <div>
              <Label className="text-sm font-medium">Weekly summary</Label>
              <p className="text-xs text-muted-foreground mt-0.5">A Sunday recap of your week.</p>
            </div>
            <Switch checked={weeklySummary} onCheckedChange={setWeeklySummary} />
          </div>

          <div className="flex items-center justify-between pt-4">
            <div>
              <Label className="text-sm font-medium">Progress updates</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Notify me when trends change.</p>
            </div>
            <Switch checked={progressUpdates} onCheckedChange={setProgressUpdates} />
          </div>
        </Card>
      </Section>

      {/* Accessibility */}
      <Section title="Accessibility" icon={Heart}>
        <Card className="p-5 card-soft">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Larger text mode</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Increases base font size throughout the app.
              </p>
            </div>
            <Switch checked={largeTextMode} onCheckedChange={setLargeTextMode} />
          </div>
        </Card>
      </Section>

      {/* Navigation list */}
      <Section title="Account" icon={ChevronRight}>
        <Card className="card-soft divide-y divide-border">
          <NavRow icon={Watch} label="Connected devices" onClick={() => setView("devices")} />
          <NavRow icon={ShieldCheck} label="Privacy & data" onClick={() => setView("privacy")} />
          <NavRow icon={AlertTriangle} label="Safety boundaries" onClick={() => setView("safety")} />
          <NavRow icon={Bell} label="Notifications" onClick={() => setView("nudges")} />
        </Card>
      </Section>

      {/* Your data */}
      <Section title="Your data" icon={ShieldCheck}>
        <Card className="p-5 card-soft">
          <p className="text-sm text-muted-foreground mb-4 text-pretty">
            Your health information belongs to you. Health-First stores:
          </p>
          <ul className="space-y-2 text-sm mb-4">
            {[
              "Goals, coaching style, and preferences",
              "Habit activity and completion logs",
              "Wellness metrics (steps, sleep, hydration, stress)",
              "Connected device data (mock in this prototype)",
              "Coach conversation history",
              "Analytics events (anonymized for product improvement)",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleDownload} className="flex-1">
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Download my data
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="flex-1 text-destructive hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  Delete my account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete all your data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your profile, habits, metrics, and conversation history from this device. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      clearData();
                      toast.success("Your data has been deleted.");
                      setTimeout(() => setView("landing"), 500);
                    }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, delete everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Card>
      </Section>

      <p className="text-center text-xs text-muted-foreground mt-8">
        Health-First Coach · Prototype · Not a medical device
      </p>
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================

function Section({ title, icon: Icon, children }: { title: string; icon: typeof User; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}

function NavRow({ icon: Icon, label, onClick }: { icon: typeof User; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-4 hover:bg-muted/40 transition-colors text-left"
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="flex-1 text-sm font-medium">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}

function formatGoal(g: string): string {
  const map: Record<string, string> = {
    fitness: "Improve fitness",
    weight: "Lose weight",
    sleep: "Sleep better",
    stress: "Reduce stress",
    nutrition: "Eat better",
    routines: "Build healthier routines",
  };
  return map[g] ?? g;
}

function formatChallenge(c: string): string {
  const map: Record<string, string> = {
    motivation: "Motivation",
    time: "Time",
    consistency: "Consistency",
    food: "Food choices",
    exercise: "Exercise",
    sleep: "Sleep",
    stress: "Stress",
    knowledge: "Knowing what to do",
  };
  return map[c] ?? c;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
