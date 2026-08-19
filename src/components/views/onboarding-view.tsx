"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Heart,
  Moon,
  Activity,
  Salad,
  Brain,
  Calendar,
  Watch,
  CheckCircle2,
  Flag,
  Clock,
  Zap,
  Target,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import type {
  Goal,
  Challenge,
  CoachingStyle,
  WorkStyle,
  ActivityLevel,
  EatingPattern,
  DeviceProvider,
  UserProfile,
} from "@/lib/types";

// ============================================================
// Onboarding — 7 conversational steps
// ============================================================
// 0. Welcome
// 1. Primary goal (multi-select)
// 2. Current routine (sliders/cards)
// 3. Biggest challenge (single-select)
// 4. Coach preference (single-select)
// 5. Device connection (multi-toggle)
// 6. Personalized plan summary
// ============================================================

const TOTAL_STEPS = 7;

export function OnboardingView() {
  const step = useAppStore((s) => s.onboardingStep);
  const setStep = useAppStore((s) => s.setOnboardingStep);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const track = useAppStore((s) => s.track);

  // Local draft state
  const [name, setName] = useState("Raj");
  const [primaryGoal, setPrimaryGoal] = useState<Goal | null>(null);
  const [secondaryGoals, setSecondaryGoals] = useState<Goal[]>([]);
  const [sleepHours, setSleepHours] = useState(6.5);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("light");
  const [workStyle, setWorkStyle] = useState<WorkStyle>("desk");
  const [eatingPattern, setEatingPattern] = useState<EatingPattern>("late eater");
  const [exerciseFreq, setExerciseFreq] = useState("1-2x/week");
  const [stressLevel, setStressLevel] = useState(55);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [coachingStyle, setCoachingStyle] = useState<CoachingStyle>("encouraging");
  const [devices, setDevices] = useState<Record<DeviceProvider, boolean>>({
    apple_health: true,
    google_health: false,
    fitbit: false,
    garmin: false,
    oura: false,
  });

  const progressPct = ((step + 1) / TOTAL_STEPS) * 100;

  const canContinue = (): boolean => {
    if (step === 1) return primaryGoal !== null;
    if (step === 3) return challenge !== null;
    return true;
  };

  const next = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    } else {
      // Final step — complete onboarding
      const profile: UserProfile = {
        name: name.trim() || "Raj",
        age: 35,
        heightCm: 178,
        weightKg: 79.8,
        primaryGoal: primaryGoal ?? "routines",
        secondaryGoals,
        challenge: challenge ?? "consistency",
        workStyle,
        activityLevel,
        eatingPattern,
        exerciseFrequency: exerciseFreq,
        stressLevel,
        typicalSleepHours: sleepHours,
        coachingStyle,
        devices: (Object.keys(devices) as DeviceProvider[]).map((p) => ({
          provider: p,
          connected: devices[p],
          lastSyncedAt: devices[p] ? new Date().toISOString() : null,
        })),
        createdAt: new Date().toISOString(),
        onboardingComplete: true,
      };
      track("goal_selected", { goal: profile.primaryGoal });
      completeOnboarding(profile);
    }
  };

  const back = () => {
    if (step === 0) {
      useAppStore.getState().setView("landing");
    } else {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border glass">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 h-14 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={back} className="px-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <Progress value={progressPct} className="h-1.5" />
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">
            {step + 1} / {TOTAL_STEPS}
          </span>
        </div>
      </header>

      {/* Step content */}
      <main className="flex-1 flex items-start justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
            >
              {step === 0 && (
                <StepWelcome name={name} setName={setName} />
              )}

              {step === 1 && (
                <StepGoal
                  primaryGoal={primaryGoal}
                  setPrimaryGoal={setPrimaryGoal}
                  secondaryGoals={secondaryGoals}
                  setSecondaryGoals={setSecondaryGoals}
                />
              )}

              {step === 2 && (
                <StepRoutine
                  sleepHours={sleepHours}
                  setSleepHours={setSleepHours}
                  activityLevel={activityLevel}
                  setActivityLevel={setActivityLevel}
                  workStyle={workStyle}
                  setWorkStyle={setWorkStyle}
                  eatingPattern={eatingPattern}
                  setEatingPattern={setEatingPattern}
                  exerciseFreq={exerciseFreq}
                  setExerciseFreq={setExerciseFreq}
                  stressLevel={stressLevel}
                  setStressLevel={setStressLevel}
                />
              )}

              {step === 3 && (
                <StepChallenge challenge={challenge} setChallenge={setChallenge} />
              )}

              {step === 4 && (
                <StepPreference style={coachingStyle} setStyle={setCoachingStyle} />
              )}

              {step === 5 && (
                <StepDevices devices={devices} setDevices={setDevices} />
              )}

              {step === 6 && (
                <StepPlan
                  profile={{
                    name,
                    primaryGoal: primaryGoal ?? "routines",
                    secondaryGoals,
                    challenge: challenge ?? "consistency",
                    coachingStyle,
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer CTA */}
      <footer className="border-t border-border bg-background/80 backdrop-blur px-4 sm:px-6 py-4">
        <div className="mx-auto max-w-xl flex items-center gap-3">
          <Button variant="ghost" onClick={back} className="flex-1 sm:flex-none">
            Back
          </Button>
          <Button
            onClick={next}
            disabled={!canContinue()}
            className="flex-[2] sm:flex-1"
          >
            {step === 0 ? "Get started" : step === TOTAL_STEPS - 1 ? "Start my plan" : "Continue"}
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </footer>
    </div>
  );
}

// ============================================================
// Step components
// ============================================================

function StepWelcome({ name, setName }: { name: string; setName: (s: string) => void }) {
  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="h-16 w-16 mx-auto rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30 mb-6"
      >
        <Sparkles className="h-8 w-8" />
      </motion.div>
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
        Let&apos;s build a healthier routine that fits your life.
      </h1>
      <p className="mt-4 text-muted-foreground text-lg text-pretty">
        Take 3–5 minutes to tell us about you. We&apos;ll generate a personalized plan and introduce you to your coach.
      </p>

      <div className="mt-8 text-left">
        <label className="text-sm font-medium">First, what should we call you?</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="mt-2 w-full px-4 py-3 rounded-lg border border-input bg-background text-base focus:outline-none focus:ring-2 focus:ring-ring"
          autoFocus
        />
      </div>

      <div className="mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3 text-primary" /> No account
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3 text-primary" /> Privacy-first
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3 text-primary" /> Cancel anytime
        </span>
      </div>
    </div>
  );
}

const GOAL_OPTIONS: { id: Goal; label: string; icon: typeof Heart; description: string }[] = [
  { id: "fitness", label: "Improve fitness", icon: Activity, description: "Move more, build strength, feel stronger." },
  { id: "weight", label: "Lose weight", icon: Target, description: "Gradual, sustainable weight management." },
  { id: "sleep", label: "Sleep better", icon: Moon, description: "Wind down earlier, sleep more deeply." },
  { id: "stress", label: "Reduce stress", icon: Brain, description: "Daily resets, calmer nervous system." },
  { id: "nutrition", label: "Eat better", icon: Salad, description: "Protein, vegetables, less grazing." },
  { id: "routines", label: "Build healthier routines", icon: Calendar, description: "Stack small habits into a daily flow." },
];

function StepGoal({
  primaryGoal,
  setPrimaryGoal,
  secondaryGoals,
  setSecondaryGoals,
}: {
  primaryGoal: Goal | null;
  setPrimaryGoal: (g: Goal) => void;
  secondaryGoals: Goal[];
  setSecondaryGoals: (g: Goal[]) => void;
}) {
  const toggleSecondary = (g: Goal) => {
    if (g === primaryGoal) return;
    setSecondaryGoals(
      secondaryGoals.includes(g)
        ? secondaryGoals.filter((x) => x !== g)
        : [...secondaryGoals, g]
    );
  };

  return (
    <div>
      <Header
        eyebrow="Step 1"
        title="What matters most to you right now?"
        sub="Pick one primary goal. You can also add secondary goals — we'll prioritize them when coaching you."
      />
      <div className="mt-6 space-y-3">
        {GOAL_OPTIONS.map((opt) => {
          const isPrimary = primaryGoal === opt.id;
          const isSecondary = secondaryGoals.includes(opt.id);
          const Icon = opt.icon;
          return (
            <Card
              key={opt.id}
              className={cn(
                "p-4 cursor-pointer transition-all card-soft-hover",
                isPrimary ? "border-primary ring-2 ring-primary/30 bg-primary/5" : "hover:border-primary/40"
              )}
              onClick={() => setPrimaryGoal(opt.id)}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                    isPrimary ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{opt.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{opt.description}</div>
                </div>
                {isPrimary && (
                  <span className="text-[10px] uppercase tracking-wide font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
                    Primary
                  </span>
                )}
                {isSecondary && !isPrimary && (
                  <span className="text-[10px] uppercase tracking-wide font-semibold text-accent-foreground bg-accent/60 px-2 py-1 rounded-full">
                    Secondary
                  </span>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {primaryGoal && (
        <div className="mt-6">
          <div className="text-xs text-muted-foreground mb-2">
            Add secondary goals (optional)
          </div>
          <div className="flex flex-wrap gap-2">
            {GOAL_OPTIONS.filter((o) => o.id !== primaryGoal).map((opt) => {
              const selected = secondaryGoals.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  onClick={() => toggleSecondary(opt.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                    selected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:border-primary/40"
                  )}
                >
                  {selected && "✓ "}
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StepRoutine({
  sleepHours,
  setSleepHours,
  activityLevel,
  setActivityLevel,
  workStyle,
  setWorkStyle,
  eatingPattern,
  setEatingPattern,
  exerciseFreq,
  setExerciseFreq,
  stressLevel,
  setStressLevel,
}: {
  sleepHours: number;
  setSleepHours: (n: number) => void;
  activityLevel: ActivityLevel;
  setActivityLevel: (a: ActivityLevel) => void;
  workStyle: WorkStyle;
  setWorkStyle: (w: WorkStyle) => void;
  eatingPattern: EatingPattern;
  setEatingPattern: (e: EatingPattern) => void;
  exerciseFreq: string;
  setExerciseFreq: (s: string) => void;
  stressLevel: number;
  setStressLevel: (n: number) => void;
}) {
  return (
    <div>
      <Header
        eyebrow="Step 2"
        title="A quick snapshot of your routine."
        sub="No medical forms. Just a few taps so your coach knows where you're starting from."
      />

      <div className="mt-6 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Moon className="h-4 w-4 text-primary" /> Typical sleep
            </label>
            <span className="text-sm text-primary font-medium tabular-nums">
              {Math.floor(sleepHours)}h {Math.round((sleepHours % 1) * 60)}m
            </span>
          </div>
          <Slider
            value={[sleepHours]}
            onValueChange={(v) => setSleepHours(v[0])}
            min={4}
            max={10}
            step={0.5}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" /> Stress level
            </label>
            <span className="text-sm text-primary font-medium tabular-nums">{stressLevel}/100</span>
          </div>
          <Slider
            value={[stressLevel]}
            onValueChange={(v) => setStressLevel(v[0])}
            min={0}
            max={100}
            step={5}
          />
        </div>

        <Field label="Activity level">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(["sedentary", "light", "moderate", "active"] as ActivityLevel[]).map((a) => (
              <ChoiceChip key={a} label={capitalize(a)} selected={activityLevel === a} onClick={() => setActivityLevel(a)} />
            ))}
          </div>
        </Field>

        <Field label="Work style">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(
              [
                { id: "desk", label: "Desk-based" },
                { id: "on_feet", label: "On my feet" },
                { id: "remote", label: "Remote / hybrid" },
                { id: "mixed", label: "Mixed schedule" },
                { id: "shift", label: "Shift work" },
              ] as { id: WorkStyle; label: string }[]
            ).map((w) => (
              <ChoiceChip key={w.id} label={w.label} selected={workStyle === w.id} onClick={() => setWorkStyle(w.id)} />
            ))}
          </div>
        </Field>

        <Field label="Eating pattern">
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { id: "regular", label: "Regular meals" },
                { id: "skip_breakfast", label: "Skip breakfast" },
                { id: "late eater", label: "Late eater" },
                { id: "grazer", label: "Grazer" },
              ] as { id: EatingPattern; label: string }[]
            ).map((e) => (
              <ChoiceChip key={e.id} label={e.label} selected={eatingPattern === e.id} onClick={() => setEatingPattern(e.id)} />
            ))}
          </div>
        </Field>

        <Field label="Exercise frequency">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {["0-1x/week", "1-2x/week", "3-4x/week", "4-5x/week"].map((f) => (
              <ChoiceChip key={f} label={f} selected={exerciseFreq === f} onClick={() => setExerciseFreq(f)} />
            ))}
          </div>
        </Field>
      </div>
    </div>
  );
}

const CHALLENGES: { id: Challenge; label: string; icon: typeof Clock }[] = [
  { id: "motivation", label: "Motivation", icon: Sparkles },
  { id: "time", label: "Time", icon: Clock },
  { id: "consistency", label: "Consistency", icon: Calendar },
  { id: "food", label: "Food choices", icon: Salad },
  { id: "exercise", label: "Exercise", icon: Activity },
  { id: "sleep", label: "Sleep", icon: Moon },
  { id: "stress", label: "Stress", icon: Brain },
  { id: "knowledge", label: "Knowing what to do", icon: Target },
];

function StepChallenge({ challenge, setChallenge }: { challenge: Challenge | null; setChallenge: (c: Challenge) => void }) {
  return (
    <div>
      <Header
        eyebrow="Step 3"
        title="What's your biggest challenge right now?"
        sub="Be honest — this is what your coach will help you work through."
      />
      <div className="mt-6 grid grid-cols-2 gap-3">
        {CHALLENGES.map((c) => {
          const Icon = c.icon;
          const selected = challenge === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setChallenge(c.id)}
              className={cn(
                "flex items-center gap-3 p-4 rounded-xl border text-left transition-all card-soft-hover",
                selected ? "border-primary ring-2 ring-primary/30 bg-primary/5" : "hover:border-primary/40"
              )}
            >
              <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0", selected ? "bg-primary text-primary-foreground" : "bg-muted")}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">{c.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const STYLES: { id: CoachingStyle; label: string; description: string; example: string }[] = [
  { id: "gentle", label: "Gentle", description: "Soft suggestions, no pressure.", example: "Maybe we could try a short walk today." },
  { id: "encouraging", label: "Encouraging", description: "Warm, positive, supportive.", example: "You've got this — a 15-minute walk is a great win today." },
  { id: "direct", label: "Direct", description: "Clear, no-fluff, action-oriented.", example: "Skip the workout. Take a 15-minute walk instead." },
  { id: "data", label: "Data-driven", description: "Anchored in numbers and trends.", example: "Sleep: 5h 45m. Today: 15-min walk, lower intensity." },
];

function StepPreference({ style, setStyle }: { style: CoachingStyle; setStyle: (s: CoachingStyle) => void }) {
  return (
    <div>
      <Header
        eyebrow="Step 4"
        title="How would you like your coach to support you?"
        sub="This shapes the tone of every recommendation and conversation. You can change it later."
      />
      <div className="mt-6 space-y-3">
        {STYLES.map((s) => {
          const selected = style === s.id;
          return (
            <Card
              key={s.id}
              className={cn(
                "p-4 cursor-pointer transition-all card-soft-hover",
                selected ? "border-primary ring-2 ring-primary/30 bg-primary/5" : "hover:border-primary/40"
              )}
              onClick={() => setStyle(s.id)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="font-medium">{s.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{s.description}</div>
                  <div className="mt-2 text-sm italic text-muted-foreground border-l-2 border-primary/30 pl-3">
                    &ldquo;{s.example}&rdquo;
                  </div>
                </div>
                {selected && (
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

const DEVICES: { id: DeviceProvider; label: string; description: string }[] = [
  { id: "apple_health", label: "Apple Health", description: "iPhone & Apple Watch" },
  { id: "google_health", label: "Google Health Connect", description: "Android devices" },
  { id: "fitbit", label: "Fitbit", description: "Trackers & smartwatches" },
  { id: "garmin", label: "Garmin", description: "Wearables & fitness watches" },
  { id: "oura", label: "Oura", description: "Sleep & recovery ring" },
];

function StepDevices({
  devices,
  setDevices,
}: {
  devices: Record<DeviceProvider, boolean>;
  setDevices: (d: Record<DeviceProvider, boolean>) => void;
}) {
  const toggle = (id: DeviceProvider) => setDevices({ ...devices, [id]: !devices[id] });
  return (
    <div>
      <Header
        eyebrow="Step 5"
        title="Connect a device (optional)"
        sub="Syncing your wearable makes coaching more personalized. These are demo connections — no real data leaves your browser."
      />
      <div className="mt-6 space-y-3">
        {DEVICES.map((d) => {
          const on = devices[d.id];
          return (
            <Card key={d.id} className={cn("p-4 transition-all card-soft-hover", on && "border-primary/40 bg-primary/5")}>
              <div className="flex items-center gap-3">
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", on ? "bg-primary text-primary-foreground" : "bg-muted")}>
                  <Watch className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium flex items-center gap-2">
                    {d.label}
                    <span className="text-[10px] uppercase font-semibold tracking-wide text-amber-600 bg-amber-500/15 px-1.5 py-0.5 rounded">
                      Demo
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{d.description}</div>
                </div>
                <Button size="sm" variant={on ? "outline" : "default"} onClick={() => toggle(d.id)}>
                  {on ? "Connected" : "Connect"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
      <div className="mt-4 text-xs text-muted-foreground flex items-center gap-2">
        <Flag className="h-3.5 w-3.5" />
        You can connect or disconnect any device later from Profile → Connected devices.
      </div>
    </div>
  );
}

function StepPlan({
  profile,
}: {
  profile: {
    name: string;
    primaryGoal: Goal;
    secondaryGoals: Goal[];
    challenge: Challenge;
    coachingStyle: CoachingStyle;
  };
}) {
  const focuses = buildPlanFocuses(profile.primaryGoal, profile.secondaryGoals);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wide font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">
            <Sparkles className="h-3 w-3" /> Your personalized plan
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-balance">
            {profile.name}&apos;s Health-First plan
          </h1>
          <p className="mt-2 text-muted-foreground text-pretty">
            Your focus for the next 14 days. Your coach will adapt this based on how you do.
          </p>
        </div>

        <Card className="p-6 card-soft">
          <div className="space-y-4">
            {focuses.map((f, i) => {
              const Icon = f.icon === "move" ? Activity : f.icon === "sleep" ? Moon : f.icon === "eat" ? Salad : Brain;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.1 }}
                  className="flex items-start gap-3 pb-4 last:pb-0 border-b last:border-0 border-border"
                >
                  <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{f.label}</div>
                    <div className="text-sm text-muted-foreground mt-0.5">{f.description}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
            <div className="text-xs uppercase tracking-wide font-semibold text-primary mb-1">
              Your first win
            </div>
            <div className="font-semibold">10-minute walk today</div>
            <p className="text-sm text-muted-foreground mt-1">
              Small enough to start today. Tap &ldquo;Start my plan&rdquo; and your coach will check in.
            </p>
          </div>

          <div className="mt-4 text-xs text-muted-foreground flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Coaching tone: {STYLES.find((s) => s.id === profile.coachingStyle)?.label}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

function buildPlanFocuses(primary: Goal, secondary: Goal[]): { icon: "move" | "sleep" | "eat" | "stress"; label: string; description: string }[] {
  const all = [primary, ...secondary];
  const unique = Array.from(new Set(all));
  const map: Record<Goal, { icon: "move" | "sleep" | "eat" | "stress"; label: string; description: string }> = {
    fitness: { icon: "move", label: "Move more", description: "20 minutes of movement, 5 days/week" },
    weight: { icon: "eat", label: "Eat intentionally", description: "Add one protein + vegetable-rich meal each day" },
    sleep: { icon: "sleep", label: "Sleep better", description: "Aim for 7+ hours, wind down by 11 PM" },
    stress: { icon: "stress", label: "Stress reset", description: "5-minute reset on demanding workdays" },
    nutrition: { icon: "eat", label: "Eat intentionally", description: "Add one protein + vegetable-rich meal each day" },
    routines: { icon: "move", label: "Build a daily rhythm", description: "Anchor one habit to a transition point" },
  };
  return unique.slice(0, 4).map((g) => map[g]);
}

// ============================================================
// Shared sub-components
// ============================================================

function Header({ eyebrow, title, sub }: { eyebrow: string; title: string; sub: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide font-semibold text-primary mb-2">{eyebrow}</div>
      <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-balance">{title}</h2>
      <p className="mt-2 text-muted-foreground text-pretty">{sub}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium block mb-2">{label}</label>
      {children}
    </div>
  );
}

function ChoiceChip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-2 rounded-lg text-sm font-medium border transition-colors text-center",
        selected ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/40"
      )}
    >
      {label}
    </button>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
