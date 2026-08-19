"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  ArrowRight,
  HeartPulse,
  Moon,
  Brain,
  Activity,
  ShieldCheck,
  Watch,
  BarChart3,
  CheckCircle2,
  Calendar,
  Footprints,
  Droplets,
  type LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeIn, ScrollReveal, StaggerGroup, StaggerItem, ProgressRing, AnimatedNumber, MOTION } from "@/lib/motion";
import { cn } from "@/lib/utils";

type PreviewFocus = "sleep" | "movement" | "stress";

export function LandingView() {
  const setView = useAppStore((s) => s.setView);
  const track = useAppStore((s) => s.track);
  const [previewFocus, setPreviewFocus] = useState<PreviewFocus>("movement");

  const startOnboarding = () => {
    track("onboarding_started", {});
    setView("onboarding");
  };

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-30 glass border-b border-border/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-premium-sm">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <span className="font-semibold tracking-tight">Health-First</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
              className="hidden sm:inline-flex"
            >
              See how it works
            </Button>
            <Button size="sm" onClick={startOnboarding}>
              Get started
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative gradient-hero overflow-hidden">
        {/* Floating health signals */}
        <FloatingSignals />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-16 sm:pt-24 pb-12 sm:pb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Headline */}
            <div className="max-w-xl">
              <FadeIn>
                <Badge
                  variant="secondary"
                  className="mb-4 bg-primary/10 text-primary border-0 hover:bg-primary/15"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Personalized digital health coaching
                </Badge>
              </FadeIn>
              <FadeIn delay={0.05}>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-balance leading-[1.05]">
                  Know what to do.<br />
                  <span className="gradient-text">Know what works for you.</span>
                </h1>
              </FadeIn>
              <FadeIn delay={0.1}>
                <p className="mt-5 text-lg text-muted-foreground text-pretty leading-relaxed">
                  Your personalized digital health coach helps you turn small daily actions into lasting routines — without making health another job.
                </p>
              </FadeIn>
              <FadeIn delay={0.15}>
                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <Button size="lg" onClick={startOnboarding} className="text-base shadow-premium-md">
                    Start your health journey
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                    className="text-base"
                  >
                    See how it works
                  </Button>
                </div>
              </FadeIn>
              <FadeIn delay={0.2}>
                <p className="mt-4 text-xs text-muted-foreground">
                  Prototype demo · 5–10 minutes · No sign-up required
                </p>
              </FadeIn>
            </div>

            {/* Right: Interactive product preview */}
            <FadeIn delay={0.25}>
              <ProductPreview focus={previewFocus} onPick={setPreviewFocus} />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Differentiators */}
      <section id="how-it-works" className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <ScrollReveal>
            <div className="max-w-2xl mb-12">
              <Badge variant="secondary" className="mb-3">Why Health-First</Badge>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
                A coach, not another tracker.
              </h2>
              <p className="mt-3 text-muted-foreground text-lg text-pretty">
                Most health apps give you a spreadsheet. Health-First gives you a coach that remembers what matters to you, learns from your behavior, and adapts the plan when life gets in the way.
              </p>
            </div>
          </ScrollReveal>

          <StaggerGroup className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" stagger={MOTION.stagger.standard}>
            {DIFFERENTIATORS.map((d) => {
              const Icon = d.icon;
              return (
                <StaggerItem key={d.title}>
                  <Card className="p-6 h-full card-premium card-premium-hover border-beam">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-lg tracking-tight">{d.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed text-pretty">
                      {d.body}
                    </p>
                  </Card>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </div>
      </section>

      {/* Philosophy quote */}
      <section className="py-16 sm:py-20 bg-muted/40 border-y border-border">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <ScrollReveal>
            <Sparkles className="h-8 w-8 mx-auto text-primary mb-5" />
            <p className="text-2xl sm:text-3xl font-medium tracking-tight text-balance leading-snug">
              &ldquo;Help me become healthier without making health another job.&rdquo;
            </p>
            <p className="mt-4 text-muted-foreground text-sm">
              The voice of our primary persona, Raj. Everything we build answers to it.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
              Try the prototype now.
            </h2>
            <p className="mt-3 text-muted-foreground text-lg text-pretty">
              Walk through onboarding, meet your coach, complete a habit, and explore the privacy controls. No account required.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" onClick={startOnboarding} className="text-base shadow-premium-md">
                Start your health journey
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-primary flex items-center justify-center text-primary-foreground">
              <Sparkles className="h-3 w-3" />
            </div>
            <span>Health-First Inc. · Prototype</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setView("privacy")} className="hover:text-foreground transition-colors">
              Privacy
            </button>
            <button onClick={() => setView("safety")} className="hover:text-foreground transition-colors">
              Safety
            </button>
            <span>Not a medical device</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ============================================================
// Floating signals — subtle animated background dots
// ============================================================

function FloatingSignals() {
  const signals = [
    { icon: HeartPulse, top: "20%", left: "8%", delay: 0 },
    { icon: Moon, top: "65%", left: "5%", delay: 0.5 },
    { icon: Activity, top: "30%", left: "92%", delay: 1 },
    { icon: Droplets, top: "75%", left: "88%", delay: 1.5 },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden hidden md:block">
      {signals.map((s, i) => {
        const Icon = s.icon;
        return (
          <motion.div
            key={i}
            className="absolute h-10 w-10 rounded-xl glass border border-border/60 flex items-center justify-center text-primary/60"
            style={{ top: s.top, left: s.left }}
            animate={{
              y: [0, -10, 0],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: s.delay,
            }}
          >
            <Icon className="h-4 w-4" />
          </motion.div>
        );
      })}
    </div>
  );
}

// ============================================================
// Interactive product preview — changes based on selected focus
// ============================================================

const PREVIEW_OPTIONS: { id: PreviewFocus; label: string; icon: LucideIcon }[] = [
  { id: "movement", label: "Move more", icon: Footprints },
  { id: "sleep", label: "Improve sleep", icon: Moon },
  { id: "stress", label: "Reduce stress", icon: Brain },
];

function ProductPreview({ focus, onPick }: { focus: PreviewFocus; onPick: (f: PreviewFocus) => void }) {
  return (
    <div className="relative">
      {/* glow */}
      <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl rounded-3xl opacity-60" />

      <Card className="relative p-5 card-premium shadow-premium-lg border-beam overflow-hidden">
        {/* focus selector */}
        <div className="flex gap-1.5 mb-4 p-1 rounded-full bg-muted/60">
          {PREVIEW_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = focus === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => onPick(opt.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-full text-xs font-medium transition-all",
                  active
                    ? "bg-card text-primary shadow-premium-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{opt.label}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {focus === "movement" && <MovementPreview key="m" />}
          {focus === "sleep" && <SleepPreview key="s" />}
          {focus === "stress" && <StressPreview key="st" />}
        </AnimatePresence>
      </Card>
    </div>
  );
}

function MovementPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: MOTION.duration.standard, ease: MOTION.easing.out }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Daily Balance</div>
          <div className="text-3xl font-semibold tabular-nums">
            <AnimatedNumber value={78} />
          </div>
          <div className="text-xs text-primary">You're on track</div>
        </div>
        <ProgressRing value={78} size={64} />
      </div>

      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
        <div className="text-[10px] uppercase tracking-wide font-semibold text-primary mb-1">Next best step</div>
        <div className="text-sm font-medium">A 15-min walk after lunch brings you within 500 steps of your goal.</div>
        <Button size="sm" className="mt-2 text-xs">Start walk <ArrowRight className="h-3 w-3 ml-1" /></Button>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <MiniStat icon={Footprints} label="Steps" value="6,842" />
        <MiniStat icon={Moon} label="Sleep" value="7h 12m" />
        <MiniStat icon={Droplets} label="Water" value="5/8" />
      </div>
    </motion.div>
  );
}

function SleepPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: MOTION.duration.standard, ease: MOTION.easing.out }}
      className="space-y-3"
    >
      <div>
        <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Tonight's wind-down</div>
        <div className="text-lg font-semibold mt-0.5">Begin in 2h 15m</div>
      </div>

      <div className="space-y-1.5">
        <WindDownStep n={1} text="Dim lights to 30%" time="9:00 PM" />
        <WindDownStep n={2} text="Last caffeine cutoff passed" time="2:00 PM" done />
        <WindDownStep n={3} text="10-min body scan" time="10:30 PM" />
      </div>

      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
        <div className="text-[10px] uppercase tracking-wide font-semibold text-primary mb-1">Coach insight</div>
        <div className="text-sm">Your sleep improves by 42 min on days you stop caffeine before 2 PM.</div>
      </div>
    </motion.div>
  );
}

function StressPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: MOTION.duration.standard, ease: MOTION.easing.out }}
      className="space-y-3"
    >
      <div>
        <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Stress level</div>
        <div className="flex items-end gap-2">
          <div className="text-3xl font-semibold tabular-nums text-amber-600">
            <AnimatedNumber value={62} />
          </div>
          <div className="text-xs text-muted-foreground pb-2">Elevated</div>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
        <div className="text-[10px] uppercase tracking-wide font-semibold text-primary mb-1">5-minute reset</div>
        <div className="text-sm">Box breathing + a short walk. Resets your nervous system in 5 minutes.</div>
        <Button size="sm" className="mt-2 text-xs">Start 5-min reset <ArrowRight className="h-3 w-3 ml-1" /></Button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <MiniStat icon={Brain} label="Today's resets" value="1/1" />
        <MiniStat icon={Activity} label="Heart rate" value="68 bpm" />
      </div>
    </motion.div>
  );
}

function MiniStat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="p-2 rounded-lg bg-muted/60">
      <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
        <Icon className="h-3 w-3" />
        <span className="text-[10px] uppercase tracking-wide">{label}</span>
      </div>
      <div className="font-medium tabular-nums">{value}</div>
    </div>
  );
}

function WindDownStep({ n, text, time, done }: { n: number; text: string; time: string; done?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={cn(
        "h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0",
        done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
      )}>
        {done ? "✓" : n}
      </div>
      <span className="flex-1">{text}</span>
      <span className="text-xs text-muted-foreground tabular-nums">{time}</span>
    </div>
  );
}

const DIFFERENTIATORS = [
  {
    icon: Brain,
    title: "Adaptive coaching",
    body: "The plan changes based on behavior. If you miss morning workouts three times, the coach suggests a better time — not 'try harder.'",
  },
  {
    icon: Sparkles,
    title: "One next best action",
    body: "Instead of dumping every metric on you, the home screen surfaces one specific small action you can take in the next hour.",
  },
  {
    icon: Watch,
    title: "Connected health data",
    body: "Sync Apple Health, Fitbit, Garmin, or Oura. Your coach reads sleep, steps, and stress to make better recommendations.",
  },
  {
    icon: BarChart3,
    title: "Behavior-first analytics",
    body: "We measure consistency, not vanity metrics. Trends are presented as a story — 'You're becoming more consistent' — not a wall of charts.",
  },
  {
    icon: ShieldCheck,
    title: "Safety-first AI",
    body: "The coach never diagnoses or prescribes. Medical questions trigger an explicit escalation pathway to a qualified professional.",
  },
  {
    icon: Moon,
    title: "Context-aware nudging",
    body: "Right message, right moment, right intensity. Nudges adapt to your sleep, schedule, and what you've already done today.",
  },
  {
    icon: HeartPulse,
    title: "Hybrid escalation",
    body: "AI first, human support when appropriate. Connect with a coach for moments that need a human in the loop.",
  },
  {
    icon: Activity,
    title: "Unified health context",
    body: "Goals, habits, wearable data, and conversations all live in one place. The coach sees the whole picture.",
  },
  {
    icon: CheckCircle2,
    title: "Respects recovery",
    body: "Missed a day? The coach lowers the bar — it never shames. Consistency and recovery beat perfection.",
  },
];
