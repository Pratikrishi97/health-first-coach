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
  Plane,
  type LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeIn, ScrollReveal, StaggerGroup, StaggerItem, ProgressRing, AnimatedNumber, MOTION } from "@/lib/motion";
import { cn } from "@/lib/utils";

type PreviewFocus = "normal" | "busy" | "travel" | "poor_sleep";

export function LandingView() {
  const setView = useAppStore((s) => s.setView);
  const track = useAppStore((s) => s.track);
  const [previewFocus, setPreviewFocus] = useState<PreviewFocus>("normal");

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
                  Adaptive health coaching
                </Badge>
              </FadeIn>
              <FadeIn delay={0.05}>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-balance leading-[1.05]">
                  Your health plan should fit your life.
                </h1>
              </FadeIn>
              <FadeIn delay={0.1}>
                <p className="mt-5 text-lg text-muted-foreground text-pretty leading-relaxed">
                  Health-First adapts your daily health plan around your energy, schedule, habits and real-world constraints — not the other way around.
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
              &ldquo;Your plan should fit your life — not the other way around.&rdquo;
            </p>
            <p className="mt-4 text-muted-foreground text-sm text-pretty">
              The core promise of Health-First. Don&apos;t make the user live for the health app. Make the health app understand the user&apos;s life.
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
  { id: "normal", label: "Normal day", icon: CheckCircle2 },
  { id: "busy", label: "Busy day", icon: Calendar },
  { id: "travel", label: "Travel day", icon: Plane },
  { id: "poor_sleep", label: "Poor sleep", icon: Moon },
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
          {focus === "normal" && <NormalDayPreview key="n" />}
          {focus === "busy" && <BusyDayPreview key="b" />}
          {focus === "travel" && <TravelDayPreview key="t" />}
          {focus === "poor_sleep" && <PoorSleepPreview key="ps" />}
        </AnimatePresence>
      </Card>
    </div>
  );
}

function NormalDayPreview() {
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
          <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Today&apos;s plan</div>
          <div className="text-lg font-semibold">A solid day ahead</div>
        </div>
        <ProgressRing value={78} size={56} strokeWidth={6} showLabel={false} label={<span className="text-xs font-semibold">78</span>} />
      </div>

      <div className="space-y-2">
        <PlanRow time="07:00" title="5-min mobility" duration="5 min" completed />
        <PlanRow time="12:30" title="20-min walk" duration="20 min" />
        <PlanRow time="18:30" title="30-min workout" duration="30 min" />
      </div>

      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
        <div className="text-[10px] uppercase tracking-wide font-semibold text-primary mb-1">Next best step</div>
        <div className="text-sm">A 15-min walk after lunch would close your movement gap.</div>
      </div>
    </motion.div>
  );
}

function BusyDayPreview() {
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
          <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Today&apos;s plan · adapted</div>
          <div className="text-lg font-semibold">Plan moved to fit your meetings</div>
        </div>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">Adapted</Badge>
      </div>

      <div className="space-y-2">
        <PlanRow time="07:00" title="5-min mobility" duration="5 min" completed />
        <PlanRow time="12:30" title="20-min walk" duration="20 min" />
        <PlanRow time="18:30" title="30-min workout → moved to 6:30 PM" duration="30 min" adapted original="5:30 PM" />
      </div>

      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
        <div className="text-[10px] uppercase tracking-wide font-semibold text-primary mb-1">Why this changed</div>
        <div className="text-sm">Your usual 5:30 PM slot conflicts with a late meeting. I moved it to 6:30 PM — that&apos;s when you&apos;re most consistent anyway.</div>
        <div className="mt-2 flex items-center gap-1.5">
          <Button size="sm" className="text-xs h-7">Accept plan</Button>
          <Button size="sm" variant="ghost" className="text-xs h-7">Use original</Button>
        </div>
      </div>
    </motion.div>
  );
}

function TravelDayPreview() {
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
          <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Today&apos;s plan · travel</div>
          <div className="text-lg font-semibold">Portable plan, no equipment needed</div>
        </div>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">Adapted</Badge>
      </div>

      <div className="space-y-2">
        <PlanRow time="07:00" title="5-min mobility" duration="5 min" />
        <PlanRow time="12:30" title="10-min walk" duration="10 min" adapted original="20-min walk" />
        <PlanRow time="18:30" title="10-min bodyweight" duration="10 min" adapted original="30-min workout" />
      </div>

      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
        <div className="text-[10px] uppercase tracking-wide font-semibold text-primary mb-1">Why this changed</div>
        <div className="text-sm">Travel day detected. Switched to equipment-free movement you can do anywhere — hotel room, airport, anywhere.</div>
      </div>
    </motion.div>
  );
}

function PoorSleepPreview() {
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
          <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Today&apos;s plan · recovery</div>
          <div className="text-lg font-semibold">Today got disrupted. Let&apos;s adjust.</div>
        </div>
        <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/30">Recovery</Badge>
      </div>

      <div className="space-y-2">
        <PlanRow time="07:00" title="10-min mobility" duration="10 min" adapted original="5-min mobility" />
        <PlanRow time="12:30" title="15-min walk" duration="15 min" adapted original="20-min walk" />
        <PlanRow time="18:30" title="15-min walk" duration="15 min" adapted original="30-min workout" />
      </div>

      <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/30">
        <div className="text-[10px] uppercase tracking-wide font-semibold text-amber-700 mb-1">Why this changed</div>
        <div className="text-sm">Your sleep was 5h 12m last night. Today&apos;s plan is gentler — small actions still count. Your progress is not reset.</div>
        <div className="mt-2 text-[11px] text-muted-foreground">
          Confidence: <span className="font-medium">high</span> · Data: sleep, stress, recent activity
        </div>
      </div>
    </motion.div>
  );
}

function PlanRow({ time, title, duration, completed, adapted, original }: {
  time: string; title: string; duration: string; completed?: boolean; adapted?: boolean; original?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 text-sm">
      <div className="text-[11px] text-muted-foreground tabular-nums w-12 shrink-0">{time}</div>
      <div className={cn(
        "h-2 w-2 rounded-full shrink-0",
        completed ? "bg-primary" : "bg-muted-foreground/40"
      )} />
      <div className={cn("flex-1 truncate", completed && "text-muted-foreground line-through")}>
        {title}
      </div>
      {adapted && (
        <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
          Adapted
        </Badge>
      )}
      <span className="text-[11px] text-muted-foreground shrink-0">{duration}</span>
    </div>
  );
}

const DIFFERENTIATORS = [
  {
    icon: Calendar,
    title: "Life-aware adaptive plan",
    body: "The plan adapts to your real day — sleep, schedule, travel, energy. Busy day? Workout moves to 6:30 PM. Travel? Switches to portable bodyweight. Poor sleep? Becomes lighter. Not 'try harder' — try smarter.",
  },
  {
    icon: HeartPulse,
    title: "Recovery Mode, no guilt",
    body: "Two disrupted days? Instead of 'streak broken,' the coach resets today to something achievable and tells you: 'Your progress is not reset.' Recovery consistency replaces streak pressure.",
  },
  {
    icon: Brain,
    title: "'Why?' health interpreter",
    body: "Every recommendation comes with the reasoning, data used, and confidence behind it. Tap 'Why this?' to see exactly what informed the suggestion. Never accept blindly.",
  },
  {
    icon: Sparkles,
    title: "Friction autopilot",
    body: "If your wearable shows low activity, we don't ask 'did you exercise?' We ask 'did today get busy?' — and adapt. Less logging, more living.",
  },
  {
    icon: Watch,
    title: "Controlled coach, not omnipresent",
    body: "Active, Quiet, Focus, Recovery, or Off. The coach knows when not to talk — it only surfaces high-value, high-confidence interventions. You're in control.",
  },
  {
    icon: ShieldCheck,
    title: "Safety-first AI",
    body: "The coach never diagnoses or prescribes. Medical questions trigger an explicit escalation pathway to a qualified professional.",
  },
  {
    icon: BarChart3,
    title: "Behavior-first analytics",
    body: "We measure consistency, not vanity metrics. Trends are presented as a story — 'You're becoming more consistent' — not a wall of charts.",
  },
  {
    icon: Activity,
    title: "Unified health context",
    body: "Goals, habits, wearable data, life context, and conversations all live in one place. The coach sees the whole picture.",
  },
  {
    icon: CheckCircle2,
    title: "Respects recovery",
    body: "Missed a day? The coach lowers the bar — it never shames. Consistency and recovery beat perfection.",
  },
];
